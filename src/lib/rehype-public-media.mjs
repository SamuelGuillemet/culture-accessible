import { withBaseForPublicMedia } from "./public-media-url.js";

const mediaElements = ["audio", "img", "source", "track", "video"];

export default function publicMediaPlugin(base = "/") {
  return {
    name: "public-media-base",
    element: {
      filter: mediaElements,
      visit(node, context) {
        for (const attribute of ["src", "poster"]) {
          const value = node.properties[attribute];
          if (typeof value === "string") {
            context.setProperty(node, attribute, withBaseForPublicMedia(value, base));
          }
        }
      },
    },
  };
}
