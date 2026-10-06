"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Product, ProductMock } from "@/lib/catalog";
import { brand } from "@/lib/catalog";

export type CartItem = {
  handle: string
  name: string
  price: number
  mock: ProductMock
  size: string | null
  qty: number
}

type CartValue = {
  items: CartItem[]
  count: number
  subtotal: number
  discount: number
  totalPix: number
  missingForFreeShipping: number
  freeShippingProgress: number
  add: (product: Product, size: string | null, qty?: number) => void
  setQty: (handle: string, size: string | null, qty: number) => void
  remove: (handle: string, size: string | null) => void
  clear: () => void
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  quickView: Product | null
  setQuickView: (product: Product | null) => void
  lastAdded: string | null
}

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = "nullvoid-cart-v1";

const sameLine = (a: CartItem, handle: string, size: string | null) =>
  a.handle === handle && a.size === size;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    let parsed: CartItem[] | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const value = JSON.parse(raw) as CartItem[];
        if (Array.isArray(value)) parsed = value;
      }
    } catch {
      // ignore malformed storage
    }
    if (!parsed) {
      hydrated.current = true;
      return;
    }
    // defer past hydration so the server markup and first client render match
    const timer = window.setTimeout(() => {
      setItems(parsed);
      hydrated.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable
    }
  }, [items]);

  const overlayOpen = cartOpen || searchOpen || menuOpen || quickView !== null;

  useEffect(() => {
    if (!overlayOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [overlayOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setCartOpen(false);
      setSearchOpen(false);
      setMenuOpen(false);
      setQuickView(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const add = useCallback((product: Product, size: string | null, qty = 1) => {
    setItems((current) => {
      const index = current.findIndex((item) => sameLine(item, product.handle, size));
      if (index === -1) {
        return [
          ...current,
          {
            handle: product.handle,
            name: product.name,
            price: product.price,
            mock: product.mock,
            size,
            qty,
          },
        ];
      }
      return current.map((item, i) =>
        i === index ? { ...item, qty: item.qty + qty } : item
      );
    });
    setLastAdded(product.handle);
    window.setTimeout(() => setLastAdded(null), 1600);
  }, []);

  const setQty = useCallback((handle: string, size: string | null, qty: number) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((item) => !sameLine(item, handle, size))
        : current.map((item) =>
            sameLine(item, handle, size) ? { ...item, qty: Math.min(qty, 99) } : item
          )
    );
  }, []);

  const remove = useCallback((handle: string, size: string | null) => {
    setItems((current) => current.filter((item) => !sameLine(item, handle, size)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartValue>(() => {
    const count = items.reduce((total, item) => total + item.qty, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.qty, 0);
    const discount = subtotal * brand.pixDiscount;
    const totalPix = subtotal - discount;
    const missingForFreeShipping = Math.max(0, brand.freeShippingFrom - subtotal);
    const freeShippingProgress = Math.min(
      1,
      subtotal / brand.freeShippingFrom
    );

    return {
      items,
      count,
      subtotal,
      discount,
      totalPix,
      missingForFreeShipping,
      freeShippingProgress,
      add,
      setQty,
      remove,
      clear,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      menuOpen,
      setMenuOpen,
      quickView,
      setQuickView,
      lastAdded,
    };
  }, [
    items,
    add,
    setQty,
    remove,
    clear,
    cartOpen,
    searchOpen,
    menuOpen,
    quickView,
    lastAdded,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de CartProvider");
  return context;
}