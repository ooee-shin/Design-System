# Message Bubble

`packages/ui/src/message-bubble.tsx`

대화 화면에서 메시지 하나를 발신·수신 방향에 맞춘 말풍선으로 표시한다. 작성자, 시간, 전달 상태, 읽지 않은 수와 메시지 action 을 함께 소유한다.

## 역할과 경계

- `MessageBubble` 은 메시지 **하나**의 표시다. 대화 전체의 순서, 날짜 구분선, 읽지 않은 메시지의 경계(unread boundary)와 읽음 처리 action 은 conversation-level 동작이므로 대화 화면이 그린다. 컴포넌트는 그 결과를 `unreadMessageCount` 와 `unreadRecipientCount` 로 받아 Bubble 옆에 숫자로만 표시한다.
- `TypingIndicator` 는 같은 파일이 내보내는 별도 컴포넌트다. 기존 메시지의 상태가 아니라 상대방이 새 메시지를 작성 중인 thread 상태이므로 `MessageBubble` 의 Property 로 두지 않는다.
- 파일은 `MessageBubble` 의 Content 에 넣지 않고 말풍선 바깥의 독립된 `MessageFileAttachment` 로 표시한다. 메시지 입력은 `MessageComposer` 가 담당한다. 둘은 아직 `초안` 이며 이 문서는 그 규칙을 소유하지 않는다.
- 화면에 보이는 문구와 접근 가능한 이름은 모두 Property 로 받는다. 컴포넌트는 언어를 갖지 않으므로 어느 locale 에서나 같은 코드로 쓴다.
- 모서리는 [interaction.md](../interaction.md)의 「공통 Control Radius」를 따르지 않는다. 컨트롤과 나란히 놓이는 요소가 아니므로 자기 값 16px 을 쓴다.
- 전달 상태에서 `sent` 와 `delivered` 를 구분하지 않고 `sent` 하나만 쓴다. 상대가 읽었는지는 `unreadRecipientCount` 가 말한다.

## Anatomy

1. Avatar (Optional): 작성자 initials 를 담은 32px 원이다. Incoming 에서만 그린다
2. Author: Bubble 위의 작성자 이름이다. Incoming 에서만 그린다
3. Bubble: Content 를 담는 채움 면이다
4. Content: 메시지 본문(`children`)이다
5. Sidecar (Optional): Bubble 옆 바깥 아래의 자리다. 읽지 않은 수, 모두 읽음 icon, 전송 실패 표시와 Action bar 가 이 한 자리를 나눠 쓴다
6. Metadata row: Bubble 아래의 한 줄이다. Outgoing 의 Sender label (Optional), 시간, 전달 상태와 전송 실패 action 이 놓인다
7. Action bar (Optional): hover 또는 keyboard focus 에서 Sidecar 자리에 나타나는 복사·삭제 button 이다

```
Message Bubble
├─ Avatar (Optional)
├─ Author
├─ Bubble
│  └─ Content
├─ Sidecar (Optional)
│  ├─ Unread count · Read icon · Failed mark
│  └─ Action bar (Optional)
└─ Metadata row
   ├─ Sender label (Optional)
   ├─ Time
   ├─ Delivery state
   └─ Failed actions (Optional)
```

Incoming 은 왼쪽에서 Avatar → Author → Bubble 순으로 시작하고 Sidecar 를 Bubble 오른쪽에 둔다. Outgoing 은 오른쪽에서 Bubble 만으로 시작하고 Sidecar 를 Bubble 왼쪽에 둔다.

## Properties

- `direction`: `incoming | outgoing`. 필수다. Incoming 은 상대가 보낸 메시지, Outgoing 은 현재 사용자가 보낸 메시지다
- `author`, `initials`, `time`: 필수 문자열이다. `author` 는 Incoming 의 Author 에, `initials` 는 Avatar 에 쓰고, `time` 은 Metadata row 에 그대로 표시한다. 시각의 형식은 화면이 정해서 넘긴다
- `children`: Content 다
- `deliveryState`: `sending | sent | read | failed`. 넘기지 않으면 전달 상태를 그리지 않는다. Outgoing 에 쓴다
- `deliveryCopy`: `Record<MessageDeliveryState, string>`. 네 상태의 표시 문구이자 접근 가능한 이름이다. `deliveryState` 를 넘겨도 이것이 없으면 전달 상태를 그리지 않는다
- `unreadRecipientCount`: `number`. Outgoing 에서 아직 읽지 않은 참여자 수다. 1 이상이면 Sidecar 에 숫자로, `0` 이면 `read` 와 함께 모두 읽음 icon 으로 표시한다. 넘기면(`0` 포함) Metadata row 에는 전달 상태(icon 과 `failed` 문구)를 그리지 않는다
- `unreadRecipientLabel`: 그 숫자의 접근 가능한 이름이다. 「아직 읽지 않은 참여자 3명」처럼 수를 담은 문장으로 넘긴다
- `unreadMessageCount`: `number`. Incoming 에서 현재 사용자가 아직 읽지 않은 새 메시지 수다. 1 이상이면 Sidecar 에 숫자로 표시하며 최신 Incoming 하나에만 넘긴다
- `unreadMessageLabel`: 그 숫자의 접근 가능한 이름이다
- `deleted`: `false | true`, 기본값 `false`. 삭제된 메시지다
- `deletedLabel`: 삭제 안내 문구다. `deleted` 와 함께 넘긴다
- `showDeletedContent`: `false | true`, 기본값은 방향에 따른다. Outgoing 은 `true` 로 원문을 보존하고 Incoming 은 `false` 로 원문을 숨긴다
- `showAvatar`: `false | true`, 기본값 `true`. Incoming 에서만 뜻을 가진다
- `grouped`: `false | true`, 기본값 `false`. 같은 발신자의 연속 메시지 가운데 첫 메시지가 아닌 것이다. Avatar 와 Author 를 생략하고 Content 만 정렬한다
- `showTime`: `false | true`, 기본값은 `grouped` 의 반대다. Metadata row 전체의 표시 여부다. 연속 메시지의 첫 메시지는 `false` 로 감추고, 마지막 메시지는 `grouped` 여도 `true` 로 켠다
- `outgoingSenderLabel`: Outgoing 의 Sender label 이다. 다중 관리자 화면에서 「소속팀 이름」 꼴로 넘기며 컴포넌트가 뒤에 `·` 와 시간을 이어 붙인다
- `outgoingSenderDescription`: Sender label 앞의 Info trigger 가 여는 설명이다. 넘길 때만 trigger 를 그리며 trigger 의 접근 가능한 이름으로도 쓴다
- `actions`: `{ copyLabel, deleteLabel, onCopy?, onDelete? }`. hover·focus 에 나타나는 Action bar 다. Incoming 은 복사만, Outgoing 은 복사와 삭제를 그린다
- `failedActions`: `{ retryLabel, deleteLabel, onRetry?, onDelete? }`. `failed` 인 Outgoing 의 Metadata row 가 보일 때 hover 없이 항상 보이는 재전송·삭제 button 이다

### TypingIndicator

- `initials`: Avatar 의 initials 다
- `label`: `role="status"` 의 접근 가능한 이름이다. 「○○님이 작성 중입니다」처럼 문장으로 넘긴다
- `showAvatar`: 기본값 `true`
- `className`: Bubble 열을 감싸는 바깥 요소에 붙는다. 색·모양 규칙은 바꾸지 않는 자리다

## 색

- Incoming Bubble: 배경 `oe-background-secondary`, 글자 `oe-foreground-primary`
- Outgoing Bubble: 배경 `oe-background-bold-primary`, 글자 `oe-foreground-inverse`
- Avatar: 배경 `oe-background-secondary`, initials `oe-foreground-secondary`
- Author: `oe-foreground-primary`
- Metadata row: `oe-foreground-tertiary`. Sender label 만 `oe-foreground-secondary` 다
- Sidecar 의 숫자와 모두 읽음 icon: `oe-foreground-tertiary`
- 전송 실패: Metadata row 의 문구는 `oe-danger-foreground-primary`, Sidecar 의 `!` 는 `oe-danger-foreground-primary` 원 위의 `oe-foreground-inverse`
- Action bar: 배경 `oe-background-primary`, 경계 `oe-border-secondary`. icon 은 `oe-foreground-tertiary` 이고 hover 에서 `oe-foreground-primary` 로 올라간다. 삭제 icon 의 hover 는 `oe-danger-background-primary` 위의 `oe-danger-foreground-primary` 다
- Deleted Incoming: 배경 `oe-background-secondary`, 글자 `oe-foreground-secondary`
- Deleted Outgoing: 배경 `oe-background-bold-primary`, 원문 `oe-foreground-inverse-secondary`, 안내 문구 `oe-foreground-inverse`
- Typing indicator: 배경 `oe-background-secondary`, 점 `oe-foreground-tertiary`
- Focus ring: 2px `oe-focus-ring`

Bubble 의 배경·글자·경계는 Tailwind class 가 아니라 `packages/ui/src/styles.css` 의 `.oe-message-bubble-incoming` 과 `.oe-message-bubble-outgoing` 이 칠한다. 두 class 는 `--oe-message-incoming-background`·`--oe-message-incoming-foreground`·`--oe-message-incoming-border` 와 같은 꼴의 `--oe-message-outgoing-*` 변수를 먼저 읽고, 없으면 위 token 을 쓴다. 채팅방마다 다른 브랜드 색을 쓰는 화면은 이 변수만 덮어쓴다. 경계의 기본값은 투명이다.

## 방향과 grouping

- Incoming 은 왼쪽에서 Avatar → Author → Bubble 순으로 시작하고, Outgoing 은 오른쪽에서 Bubble 만으로 시작한다. Metadata row 도 각 방향의 시작 변에 맞춘다.
- Outgoing 은 방향만으로 현재 사용자의 메시지임을 알 수 있으므로 Author 와 Avatar 를 그리지 않는다. `author` 와 `initials` 는 받지만 화면에 쓰지 않으며, 「나」 나 사용자 이름을 반복 표시하지 않는다.
- Author 는 Bubble 위에 두고, 시간과 전달 상태는 Bubble 채움에 넣지 않고 아래 Metadata row 에 둔다.
- 같은 발신자의 연속 메시지가 분 단위까지 같은 시각이면 첫 메시지에만 Author·Avatar 를, 마지막 메시지에만 Metadata row 를 둔다. 첫 메시지는 `showTime={false}`, 중간은 `grouped`, 마지막은 `grouped showTime` 으로 넘긴다. `grouped` Incoming 은 Avatar 자리만큼 44px 들여 Content 의 왼쪽 시작점을 맞춘다.
- Bubble 과 Sidecar 를 담는 열은 담는 폭의 82% 를 넘지 않으며 `sm` 이상에서는 72% 다. Bubble 은 그 안에서 Sidecar 를 뺀 폭이다.
- 루트 요소는 `data-direction` 을 갖는다. 대화 화면은 메시지 목록에 `oe-conversation-stack` class 를 붙여 마지막이 아닌 Outgoing 아래에 20px 을 더 띄운다. Sender label 이 있는 Metadata row 가 다음 메시지와 붙지 않게 하려는 것이다.
- Metadata row 는 Sender label 과 Info trigger 의 유무와 관계없이 같은 최소 높이 20px 을 유지해 1:1 과 다중 관리자 화면을 오갈 때 메시지 간격이 움직이지 않는다. Info trigger 의 click 영역에 자체 여백이 있으므로 trigger 와 Sender label 사이에는 gap 을 두지 않는다.

## 전달 상태와 읽지 않은 수

- `sending` 은 시계, `sent` 는 체크 하나, `read` 는 체크 두 개 icon 이다. `failed` 는 icon 없이 `deliveryCopy.failed` 문구를 danger 색으로 남긴다. 어느 상태든 접근 가능한 이름은 `deliveryCopy` 의 문구다.
- `unreadRecipientCount` 를 넘기지 않은 Outgoing 은 전달 상태를 Metadata row 의 시간 옆 12px icon 으로 그린다. 1:1 대화가 여기에 해당한다.
- 그룹 대화의 Outgoing 은 `unreadRecipientCount` 를 항상 넘긴다(모두 읽었으면 `0`). 그러면 전달 상태 표시는 Sidecar 가 담당하고 Metadata row 에는 전달 상태(icon 과 `failed` 문구)를 두지 않는다. 아직 읽지 않은 참여자가 있으면 Sidecar 에 그 수를 숫자로 표시하고, `read` 이고 `0` 이면 같은 자리에 체크 두 개 icon 을 표시한다. 모두 읽으면 숫자는 사라진다.
- 전송 실패는 Sidecar 자리에 `oe-danger-foreground-primary` 원 위의 `!` 를 표시한다. `unreadRecipientCount` 를 넘기지 않은 Outgoing 은 Metadata row 의 `deliveryCopy.failed` 문구도 함께 남긴다.
- Outgoing 의 Sidecar 는 Bubble 의 바깥 왼쪽 아래, Incoming 의 Sidecar 는 바깥 오른쪽 아래다. Outgoing 의 숫자는 읽지 않은 상대의 수, Incoming 의 숫자는 현재 사용자의 미확인 메시지 수로 뜻이 다르다.
- `unreadMessageCount` 는 unread boundary 뒤의 최신 Incoming 하나에만 넘긴다. 이전에 읽은 메시지에는 넘기지 않는다.

## 메시지 action

- Action bar 는 기본 상태에서 시각적으로 숨기고(`opacity: 0`, pointer 무시) 루트의 hover 또는 내부 keyboard focus(`focus-within`)에서 나타난다.
- Action bar 는 그림자 없이 Bubble 바깥의 Sidecar 자리에 놓이고 Bubble 하단선에 맞춘다. Content 영역과 배경색을 침범하지 않는다. 읽지 않은 수 숫자와 같은 자리에 겹쳐 나타나며 그동안 숫자를 가린다.
- Incoming 은 상대가 보낸 콘텐츠이므로 복사만 제공하고 삭제를 제공하지 않는다. `actions.deleteLabel` 과 `onDelete` 를 넘겨도 Incoming 에는 그리지 않는다.
- Outgoing 은 복사와 삭제를 제공한다.
- 전송 실패는 사용자가 해결해야 하는 오류이므로 재전송·삭제 action 을 hover 에 숨기지 않는다. 두 action 은 `deliveryCopy.failed` 문구 바로 오른쪽에 항상 보이며 모바일에서도 같은 자리에서 발견된다. 실패한 메시지에는 hover·focus Action bar 를 그리지 않는다.
- 삭제된 메시지에는 Sidecar 를 만들지 않으므로 어떤 action 도 노출하지 않는다.
- 각 action button 은 Tooltip 으로 이름을 보이고 같은 문구를 `aria-label` 로 갖는다. Tooltip 은 button 아래 가운데에 열리며 viewport 에 부딪히면 flip·shift 한다.

## 삭제 상태

- `deleted` 는 Bubble 안 첫 줄에 Info icon 과 `deletedLabel` 을 두고, 원문의 표시는 `showDeletedContent` 가 정한다.
- Incoming 은 기본값으로 원문을 숨기고 안내 문구만 남긴다.
- Outgoing 은 발신 방향을 알 수 있도록 Outgoing 배경을 유지하고 원문을 `oe-foreground-inverse-secondary` 로 보존한다. 별도 opacity 를 얹지 않으며 `showDeletedContent={false}` 로 원문을 숨길 수 있다.
- 점선 경계를 쓰지 않고 추가 action 도 노출하지 않는다.

## 다중 관리자의 Sender label

- 1:1 대화의 Outgoing 은 발신자를 표시하지 않는다.
- 여러 관리자가 같은 사용자와 채팅하는 관리자 화면에서는 Metadata row 의 시간 왼쪽에 `outgoingSenderLabel` 을 「소속팀 이름 · 시간」 꼴로 표시한다.
- `outgoingSenderDescription` 을 함께 넘기면 Sender label 앞에 12px Info icon 의 trigger 를 두고, 누르면 그 설명을 Popover 로 보인다. Popover 는 `top-end` 에 열리며 viewport 와 clipping boundary 에 부딪히면 flip·shift 한다. 설명이 없으면 trigger 도 없다.
- **이 이름은 관리자 사이의 구분을 위한 내부 정보다.** 사용자 화면이나 사용자에게 전달되는 메시지 payload 에는 절대 노출하지 않는다.

## Behavior

- Avatar 와 모든 icon 은 `aria-hidden` 이다. 뜻은 문구 Property 가 담당한다. 숫자는 `unreadRecipientLabel`·`unreadMessageLabel`, 전달 상태는 `deliveryCopy`, action 은 각 label 이다.
- 전달 상태 icon 은 `aria-label` 과 `title` 을 함께 갖고 `sr-only` 문구를 담아 hover 와 screen reader 모두에서 읽힌다.
- Action bar 의 button 은 `focus-visible` 에서 2px `oe-focus-ring` 을 갖고, Tab 으로 들어오면 bar 가 나타난다.
- `TypingIndicator` 는 `role="status"` 와 `label` 을 갖는다. 점 세 개는 160ms 간격으로 pulse 하며 `prefers-reduced-motion` 에서는 멈춘다.

## Guidelines

### Outgoing 에는 작성자와 avatar 를 두지 않기

- 방향만으로 현재 사용자의 메시지임이 읽히므로 Author 와 Avatar 를 두지 않는다. 컴포넌트가 이미 그리지 않으며, 화면이 바깥에 따로 그려 반복하지도 않는다.
- Incoming 은 `showAvatar` 로 Avatar 를 끌 수 있다. 참여자가 둘뿐인 1:1 대화처럼 얼굴을 구분할 이유가 없는 자리가 여기에 해당한다.

### Sender label 은 다중 관리자 화면에서만 넘기기

- `outgoingSenderLabel` 과 `outgoingSenderDescription` 은 여러 관리자가 같은 사용자를 상대하는 관리자 화면에서만 넘긴다. 1:1 대화와 사용자 화면에는 넘기지 않는다.
- 이 값은 사용자에게 가는 payload 에 담지 않는다.

### 전달 상태는 Outgoing 에만 넘기기

- `deliveryState`·`deliveryCopy`·`failedActions`·`unreadRecipientCount` 는 현재 사용자가 보낸 메시지의 상태다. Incoming 에는 넘기지 않는다.
- Incoming 이 갖는 숫자는 `unreadMessageCount` 하나다.

### 읽음 처리는 대화 단위로 두기

- 대화의 읽음 상태와 읽음 처리 action 은 메시지마다 반복하지 않고 현재 대화의 마지막 메시지 아래에만 둔다.
- 수동 읽음 처리 action 은 hover action 이 아니며 읽지 않은 상태에서 항상 보인다. 그 안의 Info icon 은 hover 에서 답장으로도 읽음 처리된다는 것을 안내하고, tooltip 은 `top-end` 에 두며 부딪히면 flip·shift 한다.
- 수동 방식은 명시적인 읽음 처리 또는 답장 완료에 대화를 읽음으로 바꾸고, 자동 방식은 대화를 확인한 시점에 읽음으로 처리한다.
- 수동 방식의 미확인 메시지는 개별 Bubble 에 badge 를 반복하지 않고, 마지막으로 읽은 메시지와 새 메시지 사이에 unread boundary 와 개수를 둔다. boundary 뒤의 최신 Incoming 하나에만 `unreadMessageCount` 를 넘겨 같은 개수를 Sidecar 에 보인다.
- 읽음 처리 또는 답장 뒤에는 unread boundary, 읽음 처리 action 과 Sidecar 의 숫자가 함께 사라진다.

### 파일은 말풍선 바깥에 두기

- 파일은 Content 에 넣지 않고 Bubble 아래 같은 방향에 `MessageFileAttachment` 로 둔다. Incoming 에서는 Avatar 자리만큼 들여 Content 의 시작점에 맞춘다.

### 모든 action 을 상시 펼치지 않기

- Desktop 에서는 hover·focus 의 contextual action 만 쓴다. 전송 실패의 재전송·삭제만 항상 보이는 예외다.

## Specification

| 자리 | 값 |
| --- | --- |
| Bubble 모서리 | 16px |
| Bubble 안쪽 여백 | 좌우 14px, 위아래 8px |
| Bubble 과 Sidecar 를 담는 열의 최대 폭 | 82%, `sm` 이상 72% |
| Content 글자 | 14px, line-height 1.625 |
| Avatar | 32px 원, initials 11px Medium |
| Avatar 와 본문 열 사이 | 12px |
| `grouped` Incoming 들여쓰기 | 44px |
| Author | `text-oe-label` 13px/16px Semibold |
| Metadata row | 12px, 최소 높이 20px, Bubble 과 4px |
| 전달 상태 icon | 12px |
| Sidecar | 최소 32×32px, Bubble 과 6px |
| Sidecar 의 모두 읽음 icon·실패 표시 | 14px |
| Action bar | 모서리 8px, 안쪽 여백 2px, 1px 경계 |
| Action button | 26px(icon 14px + 여백 6px), 모서리 6px |
| Info trigger | 20px, icon 12px |
| Sender description Popover | 최대 폭 288px, `top-end`, 6px 띄움 |
| Typing indicator | 높이 40px, 좌우 16px, 모서리 16px, 점 6px 셋, 간격 4px |
| `oe-conversation-stack` 의 Outgoing 아래 간격 | 20px |

## 현재 정의하지 않은 항목

- **Mobile 의 contextual action 방식을 정하지 않았다.** Desktop 은 hover·focus 이며, 전송 실패 action 만 어느 기기에서나 항상 보인다.
- **브랜드 채팅 테마의 값을 정하지 않았다.** `--oe-message-*` 변수 자리만 두고 기본값은 위 「색」의 token 이다.
- **말줄임을 두지 않았다.** 긴 메시지는 그대로 줄바꿈된다.
