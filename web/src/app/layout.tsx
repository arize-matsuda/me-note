import type { Metadata, Viewport } from "next";
import { Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

// 日本語の文字は、Google Fonts が文字の範囲ごとに分けたファイルを、使う分だけ読み込む
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "me-note",
  description: "生活の記録をまとめて管理する",
  // iPhone でホーム画面に追加したときの名前と、画面上部（時刻などの表示）の見た目。
  // "default" にすると、画面上部は本文と重ならない
  appleWebApp: {
    title: "me-note",
    statusBarStyle: "default",
  },
};

// iPhone の画面下の余白（safe-area-inset-bottom）を使えるようにする。下のバーの位置の調整に使う
export const viewport: Viewport = {
  viewportFit: "cover",
  // ブラウザやホーム画面から開いたときの、画面上部の色。アプリの背景（--background）と合わせる
  themeColor: "#f5f5fa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${notoSansJp.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
