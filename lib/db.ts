import { Pool } from "pg";
import type {
  Address,
  Customer,
  OrderTotals,
  PaymentMethod,
  ResolvedLine,
  ShippingOption,
} from "@/lib/checkout";

export type OrderStatus = "awaiting_payment" | "paid" | "cancelled";

export type StoredOrder = {
  code: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customer: Customer;
  address: Address;
  shipping: ShippingOption;
  subtotal: number;
  discount: number;
  shippingPrice: number;
  total: number;
  installments: number;
  pixCode: string | null;
  createdAt: string;
  items: ResolvedLine[];
};

export type NewOrder = {
  code: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customer: Customer;
  address: Address;
  shipping: ShippingOption;
  totals: OrderTotals;
  items: ResolvedLine[];
  pixCode: string | null;
};

export type StorageKind = "postgres" | "arquivo local" | "memória";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS nv_orders (
  code text PRIMARY KEY,
  status text NOT NULL,
  payment_method text NOT NULL,
  customer jsonb NOT NULL,
  address jsonb NOT NULL,
  shipping jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  shipping_price numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  installments numeric(10,2) NOT NULL DEFAULT 0,
  pix_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS nv_order_items (
  id bigserial PRIMARY KEY,
  code text NOT NULL REFERENCES nv_orders(code) ON DELETE CASCADE,
  handle text NOT NULL,
  name text NOT NULL,
  size text,
  qty integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS nv_order_items_code_idx ON nv_order_items (code);
`;

const ORDER_COLUMNS = `code, status, payment_method, customer, address, shipping, subtotal::float8,
  discount::float8, shipping_price::float8, total::float8, installments::float8,
  pix_code, created_at`;

type Global = typeof globalThis & {
  __nvPool?: Pool;
  __nvSchema?: Promise<void>;
};

const scope = globalThis as Global;
const memory = new Map<string, StoredOrder>();
const onVercel = Boolean(process.env.VERCEL);

function connectionString() {
  const value = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  return value && value.trim() ? value.trim() : null;
}

export function databaseConfigured() {
  return connectionString() !== null;
}

export function storageKind(): StorageKind {
  if (databaseConfigured()) return "postgres";
  if (!onVercel) return "arquivo local";
  return "memória";
}

function getPool() {
  if (!scope.__nvPool) {
    const connection = connectionString();
    if (!connection) throw new Error("POSTGRES_URL não configurada");
    const local = /localhost|127\.0\.0\.1|::1/.test(connection);
    scope.__nvPool = new Pool({
      connectionString: connection,
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000,
      ssl: local ? undefined : { rejectUnauthorized: false },
    });
    scope.__nvPool.on("error", (error) => {
      console.error("[db] erro de pool:", error.message);
    });
  }
  return scope.__nvPool;
}

async function ensureSchema() {
  if (!scope.__nvSchema) {
    scope.__nvSchema = (async () => {
      await getPool().query(SCHEMA_SQL);
    })().catch((error) => {
      scope.__nvSchema = undefined;
      throw error;
    });
  }
  return scope.__nvSchema;
}

function toStoredOrder(row: Record<string, unknown>, items: ResolvedLine[]): StoredOrder {
  return {
    code: String(row.code),
    status: String(row.status) as OrderStatus,
    paymentMethod: String(row.payment_method) as PaymentMethod,
    customer: row.customer as Customer,
    address: row.address as Address,
    shipping: row.shipping as ShippingOption,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    shippingPrice: Number(row.shipping_price),
    total: Number(row.total),
    installments: Number(row.installments),
    pixCode: (row.pix_code as string | null) ?? null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    items,
  };
}

/* ---------- postgres ---------- */

async function insertInPostgres(order: StoredOrder) {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO nv_orders (code, status, payment_method, customer, address, shipping,
         subtotal, discount, shipping_price, total, installments, pix_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        order.code,
        order.status,
        order.paymentMethod,
        JSON.stringify(order.customer),
        JSON.stringify(order.address),
        JSON.stringify(order.shipping),
        order.subtotal,
        order.discount,
        order.shippingPrice,
        order.total,
        order.installments,
        order.pixCode,
      ]
    );
    for (const item of order.items) {
      await client.query(
        `INSERT INTO nv_order_items (code, handle, name, size, qty, unit_price, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [order.code, item.handle, item.name, item.size, item.qty, item.unitPrice, item.total]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function readFromPostgres(code: string) {
  await ensureSchema();
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT ${ORDER_COLUMNS} FROM nv_orders WHERE code = $1 LIMIT 1`,
    [code]
  );
  if (rows.length === 0) return null;
  const { rows: itemRows } = await pool.query(
    `SELECT handle, name, size, qty, unit_price::float8, total::float8
     FROM nv_order_items WHERE code = $1 ORDER BY id`,
    [code]
  );
  const items: ResolvedLine[] = itemRows.map((item) => ({
    handle: String(item.handle),
    name: String(item.name),
    size: (item.size as string | null) ?? null,
    qty: Number(item.qty),
    unitPrice: Number(item.unit_price),
    total: Number(item.total),
  }));
  return toStoredOrder(rows[0], items);
}

async function updateInPostgres(code: string, status: OrderStatus, pixCode?: string | null) {
  await ensureSchema();
  await getPool().query(
    `UPDATE nv_orders SET status = $2, pix_code = COALESCE($3, pix_code) WHERE code = $1`,
    [code, status, pixCode ?? null]
  );
}

/* ---------- local file (dev only) ---------- */

const filePath =
  process.env.NULLVOID_ORDERS_FILE ??
  `${process.cwd()}${process.platform === "win32" ? "\\" : "/"}.nullvoid-orders.json`;

let fileQueue: Promise<unknown> = Promise.resolve();

function withFileLock<T>(task: () => Promise<T>) {
  const run = fileQueue.then(task, task);
  fileQueue = run.catch(() => undefined);
  return run;
}

async function readFile() {
  if (onVercel) return {};
  try {
    const { readFile } = await import("fs/promises");
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, StoredOrder>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeFile(data: Record<string, StoredOrder>) {
  if (onVercel) return;
  try {
    const { writeFile } = await import("fs/promises");
    const entries = Object.entries(data);
    if (entries.length > 200) entries.splice(0, entries.length - 200);
    await writeFile(filePath, JSON.stringify(Object.fromEntries(entries), null, 2), "utf8");
  } catch (error) {
    console.error("[db] não consegui gravar o arquivo local:", (error as Error).message);
  }
}

/* ---------- public api ---------- */

export async function createOrder(input: NewOrder): Promise<StoredOrder> {
  const order: StoredOrder = {
    code: input.code,
    status: input.status,
    paymentMethod: input.paymentMethod,
    customer: input.customer,
    address: input.address,
    shipping: input.shipping,
    subtotal: input.totals.subtotal,
    discount: input.totals.discount,
    shippingPrice: input.totals.shipping,
    total: input.totals.total,
    installments: input.totals.installments,
    pixCode: input.pixCode,
    createdAt: new Date().toISOString(),
    items: input.items,
  };

  if (databaseConfigured()) {
    try {
      await insertInPostgres(order);
      return order;
    } catch (error) {
      console.error("[db] createOrder no Postgres falhou, usando fallback:", (error as Error).message);
    }
  }

  if (!onVercel) {
    await withFileLock(async () => {
      const data = await readFile();
      data[order.code] = order;
      await writeFile(data);
    });
    return order;
  }

  memory.set(order.code, order);
  return order;
}

export async function getOrder(code: string): Promise<StoredOrder | null> {
  if (databaseConfigured()) {
    try {
      return await readFromPostgres(code);
    } catch (error) {
      console.error("[db] getOrder no Postgres falhou, usando fallback:", (error as Error).message);
    }
  }

  if (!onVercel) {
    return withFileLock(async () => (await readFile())[code] ?? null);
  }

  return memory.get(code) ?? null;
}

export async function updateOrderStatus(
  code: string,
  status: OrderStatus,
  pixCode?: string | null
): Promise<StoredOrder | null> {
  if (databaseConfigured()) {
    try {
      await updateInPostgres(code, status, pixCode);
    } catch (error) {
      console.error("[db] updateOrderStatus no Postgres falhou, usando fallback:", (error as Error).message);
    }
  }

  if (!onVercel) {
    return withFileLock(async () => {
      const data = await readFile();
      const current = data[code];
      if (!current) return null;
      const next = { ...current, status, pixCode: pixCode ?? current.pixCode };
      data[code] = next;
      await writeFile(data);
      return next;
    });
  }

  const current = memory.get(code);
  if (!current) return null;
  const next = { ...current, status, pixCode: pixCode ?? current.pixCode };
  memory.set(code, next);
  return next;
}

export async function pingDatabase() {
  if (!databaseConfigured()) return { ok: false, reason: "sem POSTGRES_URL" };
  try {
    await ensureSchema();
    await getPool().query("SELECT 1");
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: (error as Error).message };
  }
}