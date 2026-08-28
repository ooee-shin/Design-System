# Foundation catalog

Foundation 화면의 1차 목적은 사용법 문서가 아니라 현재 repository가 보유한 기반 자산을 사실대로 표시하는 것이다.

## 표시 상태

- `Token`: ooee가 이름과 Light/Dark 또는 고정값을 소유하는 공용 token
- `Primitive`: Tailwind 또는 현재 theme이 제공하며 실제 자산에서 사용하는 기반 scale
- `Current value`: 코드에서 사용하지만 아직 공용 token으로 등록하지 않은 값
- `Asset`: font나 icon처럼 이름 있는 자산

현재 값이 반복된다는 이유만으로 Foundation 화면에서 자동으로 oe token으로 승격하지 않는다. 카탈로그는 먼저 실제 상태를 드러내고, 여러 자산에서 공통 의미가 확인될 때 별도의 결정으로 승격한다.

## 현재 경로

- `/foundations/color`: Neutral, Brand, Accent, Status semantic token
- `/foundations/typography`: 언어별 font family token과 type primitive
- `/foundations/icon`: icon source와 현재 등록 사용 자산
- `/foundations/spacing`: 실제 사용 spacing primitive와 예외값
- `/foundations/radius`: theme radius primitive
- `/foundations/effects`: border, focus, interaction token과 shadow primitive
- `/foundations/motion`: 현재 duration과 transition 값

Layout과 breakpoint는 PC/TB/MB 검수 control이 존재하지만 별도의 공용 layout token 정의가 없으므로 이번 카탈로그에는 토큰인 것처럼 추가하지 않았다.

## Radius 적용 원칙

모양의 공통 어휘는 `Square`, `Rounded`, `Circle(Pill)`이며 각 컴포넌트가 `shape` Property로 소유한다. 선택 단위는 시스템 전체가 아니라 서비스와 컴포넌트의 조합이다. 한 서비스는 컴포넌트마다 하나의 모양을 고르는 것을 권장하며, 서비스가 Rounded 방향이어도 모든 컴포넌트가 Rounded일 필요는 없다.

같은 컴포넌트를 한 서비스 안에서 인스턴스마다 섞어 쓰는 것은 권장하지 않는다. 강제 규칙이 아니므로 필요하면 예외를 둘 수 있다. 공통 어휘로 설명되지 않는 값은 Checkbox의 `Ghost`나 Input의 밑줄형처럼 컴포넌트 고유 값으로 두고, 모양 어휘의 예외임을 해당 Component 문서에 밝힌다.
