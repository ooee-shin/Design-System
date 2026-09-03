# Chip

제거 가능한 선택값이나 필터 항목을 Border가 있는 작은 Container로 표시한다. 실제 구현은 `packages/ui/src/chip.tsx`, 검수 화면은 `/components/chip`이다.

## Anatomy

1. Container
2. Leading element: 선택 요소. 현재 확인된 유형은 Icon
3. Label: Label type에서 필수
4. Close action: 필수. Remix `RiCloseLine` 사용

## Properties

- Label type: `children` 문자열을 표시하며 Leading element는 선택
- Icon-only type: `children` 없이 `leadingElement`와 `ariaLabel` 필수
- `onRemove`: 필수 삭제 callback
- `removeLabel`: 닫기 버튼의 접근 가능한 이름이며 필수

현재 Border, `oe-chip-default` 높이 token 24px, `text-oe-label` token 13px/16px와 Rounded 8px만 구현한다. Size, Color, Selected, Disabled와 Chip 전체 Click은 확인되지 않아 추가하지 않는다.

## Behavior

- Close action을 누르면 `onRemove`를 실행한다.
- Chip 전체는 버튼이 아니며 Close action만 상호작용한다.
- MultiCombobox Container 타입은 선택 결과와 개별 삭제에 이 Chip을 사용한다.
