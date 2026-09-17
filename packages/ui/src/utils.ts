import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * 뒤에 오는 클래스가 앞의 것을 덮도록 합치되, 서로 다른 것을 정하는 클래스는 함께 남긴다.
 *
 * `oe` token 으로 만든 클래스는 tailwind-merge 가 모르는 이름이라 `text-` 로 시작하는 것들을
 * 모두 한 무리로 본다. 그대로 두면 `text-oe-label`(글자 크기)과 `text-oe-...`(글자 색)가 같은
 * 무리에 들어가 뒤엣것만 남는다. 실제로 Chip 의 고른 상태에서 글자 크기가 13px 에서 16px 로
 * 튀었다. 글자 크기를 정하는 이름을 따로 알려 주어 색과 갈라 둔다.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["oe-label"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
