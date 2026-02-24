// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "ScaleCards",
        short_name: "ScaleCards",
        description:
            "Unit-based data visualizations that make big numbers tangible. Each dot tells a story.",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a14",
        theme_color: "#6366f1",
        icons: [
            {
                src: "/icon.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
