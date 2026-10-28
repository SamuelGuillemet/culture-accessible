export function withBaseForPublicMedia(url, base) {
  if (typeof url !== "string" || (!url.startsWith("/") && !url.startsWith("../"))) {
    return url;
  }

  const path = url.replace(/^(?:\.\.\/)+|^\/+/, "");
  const prefix = base === "/" ? "/" : `${base.replace(/\/+$/, "")}/`;
  return `${prefix}${path}`;
}
