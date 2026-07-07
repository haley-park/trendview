import "./globals.css";

export const metadata = {
  title: "TrendView — 데일리 트렌드 뷰어",
  description:
    "유튜브·쇼츠·릴스·틱톡·X·스레드·샤오홍슈 인기 콘텐츠와 AI 영상 소식을 한 곳에서. Daily trends across YouTube, TikTok, Reels, X, Threads and RedNote.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
