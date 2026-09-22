import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * 생성 화면이 `@ooee/ui` 에서 가져다 쓴 컴포넌트의 이름. sandbox 첫 화면의 카드가 「쓴 컴포넌트」 칩으로
 * 보인다. 빌드 때 화면 코드를 읽어 세므로 배포본에는 그 결과만 들어간다.
 *
 * 화면 위에서 어느 자리가 어느 컴포넌트인지는 화면마다 뜨는 「컴포넌트 보기」가 DOM 으로 보여 준다.
 * 여기는 코드가 무엇을 가져왔는지다 — 가져오고 쓰지 않은 것도 들어간다.
 */
export function uiImportsOf(key: string, appDir = path.join(process.cwd(), "src", "app")): string[] {
  let source: string;
  try {
    source = readFileSync(path.join(appDir, key, "page.tsx"), "utf8");
  } catch {
    return [];
  }
  // 타입(`type ButtonProps`)·변형 함수(`buttonVariants`)·상수(`BADGE_COLORS`)는 컴포넌트가 아니다.
  // 파스칼 표기의 값만 남기고, 값으로 가져온 타입 이름(`…Props`·`…Option`)은 이름 끝으로 거른다.
  const names = [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*"@ooee\/ui"/g)].flatMap((match) =>
    match[1]
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part && !/^type\s/.test(part))
      .map((part) => part.split(/\s+as\s+/)[0])
      .filter((name) => /^[A-Z][a-z]/.test(name) && !/(Props|Option|OptionGroup|Variant|Tone|Size|Color)s?$/.test(name)),
  );
  return [...new Set(names)].sort();
}
