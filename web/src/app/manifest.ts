import type { MetadataRoute } from "next";

/**
 * ホーム画面に追加したときのアプリの情報（Web App Manifest）。`/manifest.webmanifest` で配る。
 * 色は globals.css の背景（--background）と合わせる（docs/features/pwa.md）。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "me-note",
    short_name: "me-note",
    description: "生活の記録をまとめて管理する",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5fa",
    theme_color: "#f5f5fa",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
