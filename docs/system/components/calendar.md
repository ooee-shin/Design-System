# Calendar

`packages/ui/src/calendar.tsx`

날짜를 고르는 격자다. 동작은 `react-day-picker`를 기반으로 하며 시각 표현은 oe semantic token을 사용한다.

## 역할과 경계

- Calendar는 **날짜를 고르는 격자만** 소유한다. 어디에 얹힐지는 쓰는 쪽이 정한다.
- Popup으로 띄울지 화면 안에 펼쳐 둘지는 Calendar가 정하지 않는다. Popup이 필요하면 `Popover` 안에 넣는다.
- 날짜를 **입력받는 자리**는 `InputButton`이다. `input-button.md`의 「역할과 경계」가 정한 대로 Input Button은 여는 화면을 소유하지 않으므로, 그 둘을 잇는 것은 화면 코드다.
- 시각(時刻)은 다루지 않는다. 날짜만 고른다.
- 월 길이, 윤년, 주 시작 요일, 키보드 이동, 스크린리더 안내는 `react-day-picker`가 갖는다. 이 컴포넌트는 그 위에 색과 크기만 얹는다.

## Anatomy

1. Caption: 달 이름과 좌우 이동 단추
2. Weekdays: 요일 머리
3. Week: 한 주의 날짜 일곱
4. Day: 날짜 한 칸

## Properties

`react-day-picker`의 `DayPicker` Property를 그대로 받는다. 이 저장소가 기본값을 바꾼 것은 셋이다.

### mode

- `single`: 하루를 고른다.
- `range`: 기간을 고른다. 범위의 안쪽은 모서리를 깎지 않아 이어진 띠로 읽힌다.
- `multiple`: 여러 날을 따로 고른다.

### locale

한국어(`date-fns/locale`의 `ko`)가 기본값이다. 달 이름이 「2026년 9월」, 요일이 「월화수목금토일」로 선다.

### weekStartsOn

**월요일(`1`)이 기본값이다.** `react-day-picker`의 기본값은 일요일이지만, 근무표와 급여가 월~일 기준으로 서므로 그 기준을 따른다. 주간 스케줄 화면이 같은 기준이다.

## 크기

날짜 한 칸은 공통 Control Height의 `regular`(36px)다. `interaction.md`의 「Control Height」를 따르며, 달력만의 크기 단계를 따로 두지 않는다. 좌우 이동 단추는 `small`(32px)이다.

## 상태

- **고른 날**: 배경 `oe-brand-background-bold-primary`, 글자 `oe-foreground-inverse`.
- **범위의 안쪽**: 배경 `oe-interaction-hover-subtle`. 양 끝만 고른 날의 색을 갖는다.
- **오늘**: 안쪽 테두리 `oe-border-primary`. 밑줄이 아니라 테두리로 표시해 고른 날과 겹쳐도 둘이 함께 읽힌다.
- **바깥 달의 날짜**: 글자 `oe-foreground-subtle`. 자리를 지우면 격자가 흔들려 주가 어긋나 보이므로 남긴다.
- **고를 수 없는 날**: 글자 `oe-foreground-disabled`.

## Guidelines

- **기간을 고르는 자리에는 `mode="range"`를 쓴다.** 시작일과 종료일을 Calendar 둘로 나누지 않는다. 두 달력이 서로의 값을 모르면 종료일이 시작일보다 앞선 상태를 사람이 직접 막아야 한다.
- **고를 수 없는 날은 감추지 않고 흐리게 둔다.** 감추면 그 자리가 비어 격자가 흔들린다.
- **Popup으로 띄울 때 바깥을 눌러 닫는 것은 `Popover`가 갖는다.** Calendar가 자기를 닫지 않는다.

## 현재 정의하지 않은 항목

- **시각 고르기.** 날짜와 시각을 함께 받는 자리가 생기면 그때 정한다.
- **달·해 단위로 건너뛰기.** `react-day-picker`의 `captionLayout="dropdown"`으로 열 수 있으나 쓰임이 없어 두지 않았다.
- **두 달을 나란히 보이기.** 기간을 고르는 자리에서 흔한 모양이지만, 1194×834 가로 화면에 두 달이 들어가는지 확인하지 않았다.
- **공휴일 표시.** 주간 스케줄 화면은 공휴일을 자기 자료로 갖는다. Calendar가 공휴일을 알아야 하는지는 정하지 않았다.

## 출처

shadcn의 Calendar 구조를 가져왔다. 그대로 둔 것은 `react-day-picker`를 쓴다는 것과 `getDefaultClassNames()` 위에 클래스를 겹쳐 쓰는 방식이다. 바꾼 것은 넷이다 — 아이콘을 Remix로, 색을 `oe-*` semantic token으로, 칸 크기를 공통 Control Height로, 로캘과 주 시작 요일을 한국 기준으로.
