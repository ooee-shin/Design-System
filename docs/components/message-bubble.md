# MessageBubble Candidate

상태: `Candidate`

`MessageBubble`은 VibePrompt Inbox split view Experiment에서 추출한 첫 컴포넌트 자산이다. `/components/message-bubble` Workbench에서 레이아웃, 콘텐츠, 전달 상태, 언어와 테마를 검수한다.

## 현재 API

- 방향: `incoming | outgoing`
- 작성자, initials, 시간과 콘텐츠
- avatar 표시 여부
- 전달 상태: `sending | sent | read | failed`
- 아직 읽지 않은 참여자 수: `unreadRecipientCount` (1명 이상은 숫자, 0명은 표시하지 않음)
- 전달 상태의 locale별 접근 가능한 label
- hover/focus 시 노출되는 복사·삭제 action과 callback
- 일반 메시지 action: 복사·삭제 icon
- 전송 실패도 일반 메시지와 동일하게 hover/focus 시 복사·삭제 action 노출
- 삭제 상태: `deleted`, locale별 `deletedLabel`, 발신 원문 노출을 제어하는 `showDeletedContent`

`TypingIndicator`는 기존 메시지의 상태가 아니라 상대방이 새 메시지를 작성 중인 thread 상태이므로 별도 컴포넌트로 둔다.

## 레이아웃 규칙

- 작성자와 시간, 전달 상태는 bubble fill에 포함하지 않고 bubble 위의 metadata row에 둔다.
- Incoming은 avatar를 표시할 수 있지만 Outgoing은 현재 사용자의 메시지이므로 avatar를 표시하지 않는다.
- 메시지 action은 기본 상태에서 시각적으로 숨기고 bubble hover 또는 내부 keyboard focus 시 노출한다.
- action은 그림자 없이 bubble 바깥쪽에 배치하고 bubble 하단선에 정렬해 콘텐츠 영역과 배경색을 침범하지 않는다.
- 일반 메시지는 hover/focus 시 복사·삭제 icon만 제공한다.
- 전송 실패 action bar는 일반 메시지와 같은 스타일과 노출 규칙을 사용한다.
- 전송 실패는 metadata에 icon 없이 텍스트를 남기고, 숫자/모두 읽음 icon과 같은 sidecar 자리에 danger foreground의 원형 fill `!`를 표시한다.
- 그룹 대화의 읽음 표시는 아직 읽지 않은 참여자 수를 숫자로 표시하며 모두 읽으면 사라진다.
- 읽지 않은 참여자 수는 metadata row가 아니라 Outgoing bubble의 바깥 왼쪽 하단에 배치한다.
- 이 제품에서는 `sent`와 `delivered`를 구분하지 않고 `sent` 하나만 사용한다. 아직 읽지 않은 참여자 수가 있으면 bubble 옆 숫자로 표시한다.
- `read`는 모두 읽은 상태이며 숫자를 제거하고 같은 sidecar 자리에 체크 두 개 icon을 표시한다. 시간 옆 metadata에는 두지 않는다.
- hover/focus action은 읽지 않은 참여자 숫자와 같은 sidecar 영역에 겹쳐 나타나며 숫자를 가린다.
- 모든 action을 상시 말풍선 아래에 펼치지 않는다. Desktop에서는 contextual action, Mobile 방식은 추후 별도 검수한다.
- Incoming 삭제 상태는 안내 문구만 표시하고 원문을 숨긴다.
- Outgoing 삭제 상태는 발신 방향을 식별할 수 있도록 기존 Outgoing background를 유지하고 원문은 `oe-foreground-inverse-secondary`로 보존한다. 별도 opacity를 중첩하지 않으며 `showDeletedContent={false}`로 원문을 숨길 수 있다.
- 삭제 상태에 점선 border를 사용하지 않으며 추가 action도 노출하지 않는다.

## 현재 토큰 연결

- Incoming: `oe-background-secondary`, Neutral foreground hierarchy
- Outgoing: `oe-background-bold-primary`, `oe-foreground-inverse`
- Outgoing metadata: `oe-foreground-inverse-secondary`
- Failed: `oe-danger-foreground-primary`
- Delete action hover: `oe-danger-background-primary`, `oe-danger-foreground-primary`
- Deleted incoming: `oe-background-secondary`, `oe-foreground-secondary`
- Deleted outgoing: `oe-background-bold-primary`, `oe-foreground-inverse-secondary`
- Typing indicator: `oe-background-secondary`, `oe-foreground-tertiary`

## 아직 검수할 항목

- bubble radius와 tail 유무
- 연속 메시지 grouping과 avatar/name 생략 규칙
- 연속 메시지에서 metadata와 상태 표시를 생략하거나 묶는 기준
- 삭제 확인 방식과 복사 완료 feedback
- 이미지, 파일, 링크와 긴 URL
- RTL 및 폭이 매우 좁은 화면
- 브랜드 theme 확장

Workbench의 상태는 실제 서버 전송 로직이 아니라 시각·API 검수를 위한 데모다. 두 번째 독립 화면에서 재사용하기 전에는 Provisional이나 Stable로 승격하지 않는다.
