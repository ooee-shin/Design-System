import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages 는 정적 파일만 내보낸다. 서버가 없어도 서는 화면이라 `out/` 에 떨궈 올린다.
  output: "export",
  // 정적 내보내기에는 이미지 최적화 서버가 없다. 켜 두면 빌드가 그 자리에서 멈춘다.
  images: { unoptimized: true },
  // 개발 표시는 화면 왼쪽 아래에 고정으로 떠서 하단 내비게이션의 마지막 항목을 덮는다. 폰에서
  // 눌러 보면 항목이 아니라 그 표시가 눌린다. 검수하는 화면을 가리므로 끈다.
  devIndicators: false,
  // 개발 서버의 리소스는 기본으로 맥 자신만 받아 갈 수 있다. 같은 공유기에 붙은 폰에서 화면을
  // 눌러 보려면 그 주소를 여기에 적어야 한다. 적지 않으면 HTML 은 내려오고 자바스크립트만 막혀서,
  // 화면은 보이는데 아무것도 눌리지 않는 상태가 된다. 공유기가 주소를 다시 내어 줄 수 있으므로
  // 대역을 함께 적는다. 이 설정은 `next dev` 에서만 쓰이며 빌드한 결과에는 들어가지 않는다.
  allowedDevOrigins: ["127.0.0.1", "192.168.0.22", "192.168.0.*"],
};

export default nextConfig;
