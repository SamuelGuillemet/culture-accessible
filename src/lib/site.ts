export const SITE_NAME = "Culture accessible";

export const LINKS = {
  instagram: "https://www.instagram.com/culture_accessible/",
  listen: "https://linktr.ee/CultureAccessible",
  contactForm:
    "https://docs.google.com/forms/d/e/1FAIpQLScUTGkLmSRDfh_ZZI5uMgOmUX1bH0WiWno5FIcE69XBmXRZNw/viewform",
} as const;

export const NAV = [
  { label: "Accueil", path: "" },
  { label: "Podcasts", path: "podcasts/" },
  { label: "Ressources", path: "ressources/" },
  { label: "Contact", path: "contact/" },
] as const;

/** URL interne qui respecte le préfixe de déploiement (GitHub Pages). */
export function href(path = ""): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  return `${base}/${path}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", { dateStyle: "long", timeZone: "UTC" });
}

/** 3725 -> "1 h 02 min 05 s" */
export function formatTimestamp(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h} h ${pad(m)} min ${pad(s)} s`;
  if (m > 0) return `${m} min ${pad(s)} s`;
  return `${s} s`;
}
