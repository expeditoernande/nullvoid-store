"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div className="glow-red flex flex-col gap-4 -mx-3 px-3">
      <h3 className="text-[12px] uppercase tracking-[0.24em]">
        Assine nossa newsletter
      </h3>
      <p className="max-w-[46ch] text-[11px] leading-relaxed text-muted">
        Receba as novidades, as campanhas da Sale e os cupons antes de todo mundo.
      </p>

      {done ? (
        <p className="border border-accent bg-[linear-gradient(140deg,rgba(255,43,31,0.2),rgba(143,16,12,0.05))] px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-accent">
          Inscrito com sucesso. Até a próxima leva.
        </p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!email.includes("@")) return;
            setDone(true);
            setEmail("");
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Seu e-mail
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com.br"
            className="h-11 flex-1 border border-line bg-transparent px-3.5 text-[12px] text-fg outline-none transition-colors placeholder:text-[#6b6b6b] focus:border-accent"
          />
          <button
            type="submit"
            className="btn-accent h-11 shrink-0 px-6 text-[10px] uppercase tracking-[0.18em]"
          >
            Assinar
          </button>
        </form>
      )}
    </div>
  );
}