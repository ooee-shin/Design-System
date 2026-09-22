import { readLlmsTxt } from "@/lib/llms";

// `seed-design.io/llms.txt` 처럼 **주소 하나로 그대로 내려받을 수 있어야** 한다. AI 가 이 저장소를
// 처음 읽을 때 무엇을 어디서 볼지 이 한 장으로 정하기 때문이다. 그래서 마크다운으로 꾸미지 않고
// 원본 글자를 그대로 낸다.
//
// 빌드할 때 한 번 읽는다. 전달본에서도 저장소 파일에 기대지 않고 서 있어야 하기 때문이다.
//
// 배포하는 `out/llms.txt` 는 빌드 끝에 `scripts/docs/mirror-llms-links.mjs` 가 웹판으로 바꾼다. 원본의
// `http://localhost:3000` 을 배포 주소로 바꾸고, 사이트에 싣지 않는 자리(시스템 문서 밖)의 링크를 글자로
// 풀고, 머리에 「이 사이트에는 시스템 문서만 실린다」는 한 줄을 더한다. 링크로 닿는 시스템 문서는 사이트의
// 같은 경로에 싣는다. 여기서 바꾸지 않는 것은 `next dev` 에서는 localhost 가 맞는 주소이고 저장소 안의
// 링크가 모두 열리기 때문이다. 그 명령은 이 route 가 낸 글자가 원본과 같은지부터 보므로, 다른 출력이 이
// 파일을 덮으면 빌드가 멈춘다.
export const dynamic = "force-static";

export function GET() {
  return new Response(readLlmsTxt(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
