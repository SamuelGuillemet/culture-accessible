const mediaElements = ["audio", "img", "source", "track", "video"];

export default function publicMediaPlugin(base = "/") {
  const prefix = base === "/" ? "/" : `${base.replace(/\/+$/, "")}/`;

  return {
    name: "public-media-base",
    element: {
      filter: mediaElements,
      visit(node, context) {
        for (const attribute of ["src", "poster"]) {
          const value = node.properties[attribute];
          if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
            context.setProperty(node, attribute, `${prefix}${value.slice(1)}`);
          }
        }
      },
    },
  };
}
