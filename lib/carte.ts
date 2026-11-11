import carte from "@/data/carte.json";

export type Tag = "house" | "monday" | "board" | "share" | "noalcohol" | "afternoon";
export type Item = { price: number | null; orderable: boolean; tags: Tag[]; photo?: string };
export type ItemId = keyof typeof carte.items;
export type CategoryId = "midi" | "plats" | "burgers" | "salades" | "desserts" | "cocktails" | "boissons";

export const ITEMS = carte.items as unknown as Record<ItemId, Item>;
export const isItem = (v: unknown): v is ItemId => typeof v === "string" && v in ITEMS;

/** Onglets de la carte (data/carte.json). */
export const categories = () => carte.categories as { id: CategoryId; items: ItemId[] }[];

/** Prix d'un plat ; null tant qu'il n'est pas renseigné. */
export const unitPrice = (id: ItemId) => ITEMS[id].price;
