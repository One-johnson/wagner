import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wagner Tool Management",
    short_name: "Wagner Tools",
    description:
      "Tool inventory and checkout management for Wagner Vehicle Management Limited",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#09090b",
    theme_color: "#1e3a5f",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/wagner-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/wagner-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/wagner-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
