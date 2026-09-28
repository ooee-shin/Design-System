# 새 컴포넌트를 만들 때

`@ooee/ui`에 없는 컴포넌트가 필요할 때 무엇을 어디에 만드는지다. **확정된 20종을 고치는 것은 이 문서가 다루지 않는다** — 그쪽은 [working-context.md](working-context.md)에 근거와 함께 적고 넘긴다.

만들기 전에 먼저 묻는다. **확정된 컴포넌트로 되는 일이면 그것을 쓴다.** 하네스는 없는 컴포넌트를 「미확정 자산 후보」로 보고하고 멈추므로, 그 보고를 받았을 때가 이 문서를 여는 때다.

## 다섯 자리를 모두 채운다

하나라도 빠지면 만들어도 보이지 않거나 쓸 수 없다.

| # | 어디 | 빠뜨리면 |
| --- | --- | --- |
| 1 | `packages/ui/src/<name>.tsx` | — |
| 2 | `packages/ui/src/index.ts` export | 화면이 import하지 못한다 |
| 3 | `docs/system/components/<name>.md` | **하네스가 이 문서를 읽고 컴포넌트를 고른다.** 없으면 만들어도 쓰지 않는다 |
| 4 | `component-registry.ts` + `docs/system/README.md`의 Component 표 | Studio 목록에 서지 않는다. `ComponentKey` 유니온에도 이름을 더한다. title 알파벳 자리에 넣는다(시험이 잰다) |
| 5 | Studio Playground | Playground가 변형의 정본이다 |

`llms.txt`의 확정 목록도 함께 고친다 — 테스트가 `component-registry`와 대조한다.

## shadcn에서 출발한다

맨바닥에서 만들지 않는다. 문서를 저장소에 두지 않고 **만들 때 registry에서 받는다.**

```bash
curl -s https://ui.shadcn.com/r/styles/new-york/<name>.json
```

소스가 JSON으로 온다. 복사본을 저장소에 두면 반드시 낡는다.

**그대로 붙여넣지 않는다.** 이 저장소의 스택으로 옮겨 쓴다.

| shadcn | 여기 |
| --- | --- |
| `lucide-react` | `@remixicon/react` |
| shadcn 토큰 (`bg-background`) | `oe-*` semantic token |
| `@/lib/utils`, `@/registry/…` | `./utils`, `./<component>` |
| Radix | `@base-ui/react` (있으면) |
| 자체 크기 단계 | `interaction.md`의 공통 Control Height |

**무엇을 그대로 두고 무엇을 바꿨는지 컴포넌트 머리말에 적는다.** `button.tsx`·`badge.tsx`·`calendar.tsx`가 그 꼴이다.

> shadcn base-nova 의 Button 구조를 가져왔다. 그대로 둔 것은 … 바꾼 것은 넷이다. …

라이브러리를 새로 들이는 것은 되돌리기 어렵다. **Base UI에 같은 것이 있는지 먼저 확인한다** — Calendar를 만들 때 `date-fns`를 peer로 요구하길래 확인했더니 optional peer일 뿐 달력 모듈이 없었다.

## Playground는 기존 양식을 그대로 따른다

**이것을 빠뜨려서 한 번 다시 만들었다.** 만들기 전에 같은 계열 컴포넌트의 workbench를 열어 읽는다. `input-workbench.tsx`가 가장 완전하다.

양식을 이루는 정의는 각 workbench 파일 아래쪽에 **같은 내용으로 복사되어 있다.** 공용 모듈이 아니므로 그대로 가져온다.

```
Section          제목 · 설명 · 2열 그리드를 두른 카드
ControlSection   조작 묶음. 위에 가는 구분선
ControlGroup     묶음 안의 한 축. legend 가 축 이름
ControlButton    알약 단추. active 면 검은 배경
BooleanControl   토글. 오른쪽에 스위치
PropertyGroup    Anatomy·State 를 담는 카드
```

바깥 구조도 같아야 한다. **「On this page」는 오른쪽 열이다.**

```tsx
<div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
  <div className="min-w-0 space-y-5">
    <Section id="playground" title="🚩 Playground" description="…">
      {/* 굵은 테두리를 두른 회색 상자. 왼쪽 흰 카드에 미리보기, 오른쪽에 조작 */}
      <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[1000px]:grid-cols-[…]">
        …
      </div>
    </Section>
    …
  </div>
  <OnThisPage items={sections} componentKey="<name>" />
</div>
```

**Playground의 조작은 실제로 동작하는 것만 둔다.** 누르면 미리보기가 바뀌어야 한다.

## 미리보기는 오늘에 기대지 않는다

날짜나 시각을 쓰는 컴포넌트는 고정한 값을 쓴다. 오늘에 기대면 화면이 날마다 달라져 검수할 수 없다.

## 만든 뒤

- `pnpm check`를 통과시킨다. registry 테스트가 개수를 세므로 그 숫자도 함께 고친다
- 상태는 `확정`으로 둔다(`2026-09-21` 결정). 디자인 검수를 먼저 받지 않는다
