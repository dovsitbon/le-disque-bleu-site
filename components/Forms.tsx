"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import site from "@/data/site.json";
import { useCart, useLocale } from "@/components/providers";
import { CheckIcon, MinusIcon, PhoneIcon, PlusIcon, WhatsAppIcon } from "@/components/icons";
import { ITEMS, type ItemId } from "@/lib/carte";
import { formatDay, formatTime, isoDay, price } from "@/lib/format";
import { pickupTimes, resaTimes, type Service } from "@/lib/hours";
import { fill } from "@/lib/i18n";
import { pagePath } from "@/lib/pages";
import { AREAS, EVENT_TYPES, isEmail, isPhone, orderText, orderTotal, pickupDays, privatText, resaMaxDay, resaText, waLink, type Area, type EventType, type Order, type Privat, type Resa } from "@/lib/requests";

// Les trois formulaires du site : table, commande à emporter, privatisation.
// Chacun envoie à /api/demande (e-mail au restaurant + confirmation au client). Si l'e-mail n'est pas encore branché,
// le message de fin demande au client de confirmer par téléphone.

type Errors = Record<string, string>;
type Done = { notified: boolean; text: string } | null;

function useNow() {
  // L'heure du navigateur n'est connue qu'après hydratation : les listes d'heures se remplissent à ce moment-là
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- horloge du navigateur
    setNow(new Date());
  }, []);
  return now;
}

async function send(kind: "resa" | "order" | "privat", lang: string, data: unknown, website: string) {
  const res = await fetch("/api/demande", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, lang, data, website }) });
  if (!res.ok) throw new Error("send");
  return (await res.json()) as { ok: boolean; notified: boolean };
}

function Field({ label, error, optional, children, className = "" }: { label: string; error?: string; optional?: string; children: (p: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
        {optional && <span className="font-normal text-muted"> ({optional})</span>}
      </label>
      {children({ id, ...(error ? { "aria-invalid": true as const, "aria-describedby": `${id}-e` } : {}) })}
      {error && (
        <p id={`${id}-e`} className="mt-1.5 text-[0.875rem] text-red">
          {error}
        </p>
      )}
    </div>
  );
}

function Chips<T extends string>({ legend, name, options, value, onChange, error }: { legend: string; name: string; options: readonly (readonly [T, string])[]; value: T | ""; onChange: (v: T) => void; error?: string }) {
  return (
    <fieldset>
      <legend className="label">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, label]) => (
          <label key={v} className={`chip ${value === v ? "chip-on" : ""}`}>
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="sr-only" />
            {label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-[0.875rem] text-red">{error}</p>}
    </fieldset>
  );
}

/** Champ piège pour les robots : invisible, jamais rempli par un humain. */
function Trap({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="absolute -start-[9999px]" aria-hidden="true">
      <label>
        Site web
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

function ContactFields({ v, set, errors, messagePh }: { v: { name: string; phone: string; email: string; message: string }; set: (k: "name" | "phone" | "email" | "message", val: string) => void; errors: Errors; messagePh: string }) {
  const { d } = useLocale();
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={d.form.name} error={errors.name}>
          {(p) => <input {...p} className="field" name="name" autoComplete="name" required value={v.name} onChange={(e) => set("name", e.target.value)} />}
        </Field>
        <Field label={d.form.phone} error={errors.phone}>
          {(p) => <input {...p} className="field" name="tel" type="tel" inputMode="tel" autoComplete="tel" required value={v.phone} onChange={(e) => set("phone", e.target.value)} />}
        </Field>
      </div>
      <Field label={d.form.email} optional={d.form.optional} error={errors.email}>
        {(p) => <input {...p} className="field" name="email" type="email" autoComplete="email" spellCheck={false} value={v.email} onChange={(e) => set("email", e.target.value)} />}
      </Field>
      <Field label={d.form.message} optional={d.form.optional}>
        {(p) => <textarea {...p} className="field" name="message" rows={3} placeholder={messagePh} value={v.message} onChange={(e) => set("message", e.target.value)} />}
      </Field>
    </>
  );
}

function contactErrors(v: { name: string; phone: string; email: string }, e: Errors, d: ReturnType<typeof useLocale>["d"]) {
  if (!v.name.trim()) e.name = d.form.errors.name;
  if (!isPhone(v.phone)) e.phone = d.form.errors.phone;
  if (v.email.trim() && !isEmail(v.email)) e.email = d.form.errors.email;
}

function Submit({ busy, label, failed }: { busy: boolean; label: string; failed: boolean }) {
  const { d } = useLocale();
  return (
    <div>
      {failed && (
        <p role="alert" className="mb-4 border-s-2 border-red ps-3 text-red">
          {d.form.failed}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" className="btn" disabled={busy}>
          {busy ? d.form.sending : label}
        </button>
        <a href={`tel:${site.phoneIntl}`} className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] hover:underline">
          <PhoneIcon className="h-4 w-4" />
          {d.form.orCall} {site.phone}
        </a>
      </div>
      <p className="mt-4 text-[0.875rem] text-muted">{d.form.privacy}</p>
    </div>
  );
}

function Thanks({ title, text, recap, onAgain }: { title: string; text: string; recap: string; onAgain: () => void }) {
  const { d } = useLocale();
  const wa = waLink(recap);
  return (
    <div role="status" className="fade-in border border-line bg-paper p-6 md:p-9">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue text-cream">
        <CheckIcon className="h-5 w-5" />
      </span>
      <h2 className="display mt-5 text-[1.875rem]">{title}</h2>
      <p className="mt-3 max-w-xl text-muted">{text}</p>
      <pre className="mt-6 border-t border-line pt-5 font-[family-name:var(--font-body)] text-[0.9375rem] leading-relaxed whitespace-pre-wrap">{recap}</pre>
      <div className="mt-7 flex flex-wrap gap-3">
        <a href={`tel:${site.phoneIntl}`} className="btn">
          <PhoneIcon className="h-5 w-5" />
          {d.nav.call} {site.phone}
        </a>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-line">
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>
        )}
        <button type="button" className="btn-line" onClick={onAgain}>
          {d.form.again}
        </button>
      </div>
    </div>
  );
}

function focusFirstError(form: HTMLFormElement) {
  requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
}

/* ——— Réservation de table ——— */
export function ResaForm() {
  const { lang, d } = useLocale();
  const now = useNow();
  const blank = { day: "", service: "lunch" as Service, time: "", guests: "2", area: "any" as Area, occasion: "", name: "", phone: "", email: "", message: "" };
  const [v, setV] = useState(blank);
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<Done>(null);
  const set = <K extends keyof typeof blank>(k: K, val: (typeof blank)[K]) => setV((p) => ({ ...p, [k]: val }));

  const today = now ? isoDay(now) : "";
  const times = useMemo(() => (now && v.day ? resaTimes(v.day, v.service, now) : []), [now, v.day, v.service]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const er: Errors = {};
    if (!v.day) er.day = d.form.errors.date;
    if (!times.includes(v.time)) er.time = d.form.errors.time;
    const guests = Number(v.guests);
    if (!guests || guests < 1) er.guests = d.form.errors.guests;
    else if (guests > site.resa.maxGuests) er.guests = d.resa.big;
    contactErrors(v, er, d);
    setErrors(er);
    if (Object.keys(er).length) return focusFirstError(e.currentTarget);
    const data: Resa = { ...v, guests };
    setBusy(true);
    setFailed(false);
    try {
      const r = await send("resa", lang, data, trap);
      setDone({ notified: r.notified, text: resaText(data, lang, d) });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <Thanks
        title={d.resa.doneTitle}
        text={done.notified ? d.resa.done : d.resa.doneNoMail}
        recap={done.text}
        onAgain={() => {
          setDone(null);
          setV(blank);
        }}
      />
    );

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-6">
      <Trap value={trap} onChange={setTrap} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={d.form.date} error={errors.day}>
          {(p) => <input {...p} className="field" type="date" name="date" required min={today} max={now ? resaMaxDay(now) : undefined} value={v.day} onChange={(e) => setV((x) => ({ ...x, day: e.target.value, time: "" }))} />}
        </Field>
        <Field label={d.form.guests} error={errors.guests}>
          {(p) => <input {...p} className="field" type="number" name="guests" inputMode="numeric" min={1} max={99} required value={v.guests} onChange={(e) => set("guests", e.target.value)} />}
        </Field>
      </div>
      {Number(v.guests) > site.resa.maxGuests && (
        <p className="border-s-2 border-brass ps-3 text-[0.9375rem]">
          {d.resa.big}{" "}
          <Link href={`${pagePath("privatiser", lang)}#demande`} className="link-line font-medium">
            {d.events.privat.cta}
          </Link>
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Chips legend={d.resa.service} name="service" options={[["lunch", d.resa.services.lunch], ["dinner", d.resa.services.dinner]] as const} value={v.service} onChange={(s) => setV((x) => ({ ...x, service: s, time: "" }))} />
        <Field label={d.form.time} error={errors.time}>
          {(p) => (
            <select {...p} className="field" name="time" required value={v.time} onChange={(e) => set("time", e.target.value)} disabled={!v.day}>
              <option value="">{v.day && !times.length ? d.form.noTime : d.form.chooseTime}</option>
              {times.map((t) => (
                <option key={t} value={t}>
                  {formatTime(t, lang)}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <Chips legend={d.resa.area} name="area" options={AREAS.map((a) => [a, d.resa.areas[a]] as const)} value={v.area} onChange={(a) => set("area", a)} />
      <Field label={d.resa.occasion} optional={d.form.optional}>
        {(p) => <input {...p} className="field" name="occasion" placeholder={d.resa.occasionPh} value={v.occasion} onChange={(e) => set("occasion", e.target.value)} />}
      </Field>
      <ContactFields v={v} set={set} errors={errors} messagePh={d.resa.messagePh} />
      <Submit busy={busy} label={d.resa.submit} failed={failed} />
    </form>
  );
}

/* ——— Commande à emporter ——— */
export function OrderForm() {
  const { lang, d } = useLocale();
  const { cart, add, clear, ready } = useCart();
  const now = useNow();
  const blank = { day: "", time: "", name: "", phone: "", email: "", message: "" };
  const [v, setV] = useState(blank);
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<Done>(null);
  const set = <K extends keyof typeof blank>(k: K, val: string) => setV((p) => ({ ...p, [k]: val }));

  const lines = useMemo(() => (Object.entries(cart) as [ItemId, number][]).filter(([id, q]) => q > 0 && ITEMS[id]?.orderable).map(([item, qty]) => ({ item, qty })), [cart]);
  const days = useMemo(() => (now ? pickupDays(now) : []), [now]);
  const day = v.day || days[0] || "";
  const times = useMemo(() => (now && day ? pickupTimes(day, now) : []), [now, day]);
  const { sum, partial } = orderTotal(lines);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const er: Errors = {};
    if (!lines.length) er.cart = d.form.errors.cart;
    if (!times.includes(v.time)) er.time = d.form.errors.time;
    contactErrors(v, er, d);
    setErrors(er);
    if (Object.keys(er).length) return focusFirstError(e.currentTarget);
    const data: Order = { ...v, day, lines };
    setBusy(true);
    setFailed(false);
    try {
      const r = await send("order", lang, data, trap);
      setDone({ notified: r.notified, text: orderText(data, lang, d) });
      clear();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <Thanks
        title={d.order.doneTitle}
        text={done.notified ? d.order.done : d.order.doneNoMail}
        recap={done.text}
        onAgain={() => {
          setDone(null);
          setV(blank);
        }}
      />
    );

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-6">
      <Trap value={trap} onChange={setTrap} />
      <section aria-labelledby="panier-titre" className="border border-line bg-paper p-5 md:p-7">
        <h2 id="panier-titre" className="display text-[1.5rem]">
          {d.order.cart}
        </h2>
        {ready && !lines.length ? (
          <div className="mt-4">
            <p className={errors.cart ? "text-red" : "text-muted"} role={errors.cart ? "alert" : undefined}>
              {d.order.empty}
            </p>
            <Link href={pagePath("carte", lang)} className="btn mt-5">
              {d.order.toMenu}
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-3 divide-y divide-line">
              {lines.map((l) => {
                const p = ITEMS[l.item].price;
                const name = d.products[l.item].name;
                return (
                  <li key={l.item} className="flex items-center gap-3 py-3">
                    <span className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-[1.0625rem]">{name}</span>
                    {p !== null && <span className="text-[0.9375rem] text-muted tabular-nums">{price(p * l.qty, lang)}</span>}
                    <span className="flex shrink-0 items-center">
                      <button type="button" onClick={() => add(l.item, -1)} className="flex h-11 w-10 items-center justify-center text-blue" aria-label={fill(d.carte.removeAria, { name })}>
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center font-medium tabular-nums">{l.qty}</span>
                      <button type="button" onClick={() => add(l.item, 1)} className="flex h-11 w-10 items-center justify-center text-blue" aria-label={fill(d.carte.addAria, { name })}>
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <Link href={pagePath("carte", lang)} className="link-line inline-flex min-h-11 items-center text-[0.9375rem] font-medium">
                {d.order.addMore}
              </Link>
              {lines.length > 0 && (
                <p className="text-[0.9375rem]">
                  {d.order.total} : <span className="font-medium">{sum > 0 ? `${price(sum, lang)}${partial ? " +" : ""}` : d.carte.priceOnSite.toLowerCase()}</span>
                </p>
              )}
            </div>
          </>
        )}
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={d.order.pickupDay}>
          {(p) => (
            <select {...p} className="field" name="day" value={day} onChange={(e) => setV((x) => ({ ...x, day: e.target.value, time: "" }))}>
              {days.map((x) => (
                <option key={x} value={x}>
                  {formatDay(x, lang)}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label={d.order.pickupTime} error={errors.time}>
          {(p) => (
            <select {...p} className="field" name="time" required value={v.time} onChange={(e) => set("time", e.target.value)}>
              <option value="">{now && !times.length ? d.form.noTime : d.form.chooseTime}</option>
              {times.map((t) => (
                <option key={t} value={t}>
                  {formatTime(t, lang)}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <ContactFields v={v} set={set} errors={errors} messagePh={d.order.messagePh} />
      <p className="text-[0.9375rem] text-muted">{d.form.payOnSite}</p>
      <Submit busy={busy} label={d.order.submit} failed={failed} />
    </form>
  );
}

/* ——— Privatisation / soirée ——— */
export function PrivatForm() {
  const { lang, d } = useLocale();
  const now = useNow();
  const blank = { day: "", type: "" as EventType | "", guests: "", budget: "", name: "", phone: "", email: "", message: "" };
  const [v, setV] = useState(blank);
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<Done>(null);
  const set = <K extends keyof typeof blank>(k: K, val: (typeof blank)[K]) => setV((p) => ({ ...p, [k]: val }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const er: Errors = {};
    if (!v.day) er.day = d.form.errors.date;
    if (!v.type) er.type = d.form.errors.type;
    const guests = Number(v.guests);
    if (!guests || guests < 1) er.guests = d.form.errors.guests;
    contactErrors(v, er, d);
    setErrors(er);
    if (Object.keys(er).length) return focusFirstError(e.currentTarget);
    const data: Privat = { ...v, type: v.type as EventType, guests };
    setBusy(true);
    setFailed(false);
    try {
      const r = await send("privat", lang, data, trap);
      setDone({ notified: r.notified, text: privatText(data, lang, d) });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <Thanks
        title={d.privat.doneTitle}
        text={done.notified ? d.privat.done : d.privat.doneNoMail}
        recap={done.text}
        onAgain={() => {
          setDone(null);
          setV(blank);
        }}
      />
    );

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-6">
      <Trap value={trap} onChange={setTrap} />
      <Chips legend={d.privat.type} name="type" options={EVENT_TYPES.map((t) => [t, d.privat.types[t]] as const)} value={v.type} onChange={(t) => set("type", t)} error={errors.type} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label={d.form.date} error={errors.day}>
          {(p) => <input {...p} className="field" type="date" name="date" required min={now ? isoDay(now) : undefined} value={v.day} onChange={(e) => set("day", e.target.value)} />}
        </Field>
        <Field label={d.form.guests} error={errors.guests}>
          {(p) => <input {...p} className="field" type="number" name="guests" inputMode="numeric" min={1} max={500} required value={v.guests} onChange={(e) => set("guests", e.target.value)} />}
        </Field>
        <Field label={d.privat.budget} optional={d.form.optional}>
          {(p) => <input {...p} className="field" name="budget" placeholder={d.privat.budgetPh} value={v.budget} onChange={(e) => set("budget", e.target.value)} />}
        </Field>
      </div>
      <ContactFields v={v} set={set} errors={errors} messagePh={d.privat.messagePh} />
      <Submit busy={busy} label={d.privat.submit} failed={failed} />
    </form>
  );
}
