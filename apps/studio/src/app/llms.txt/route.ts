import { readLlmsTxt } from "@/lib/llms";

// `seed-design.io/llms.txt` 처럼 **주소 하나로 그대로 내려받을 수 있어야** 한다. AI 가 이 저장소를
// 처음 읽을 때 무엇을 어디서 볼지 이 한 장으로 정하기 때문이다. 그래서 마크다운으로 꾸미지 않고
// 원본 글자를 그대로 낸다.
//
// 빌드할 때 한 번 읽는다. 전달본에서도 저장소 파일에 기대지 않고 서 있어야 하기 때문이다.
export const dynamic = "force-static";

export function GET() {
  return new Response(readLlmsTxt(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
