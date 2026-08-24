# MessageBubble Candidate

상태: `Candidate`

`MessageBubble`은 VibePrompt Inbox split view Experiment에서 추출한 첫 컴포넌트 자산이다. `/components/message-bubble`은 현재 Chat Workbench로 확장되어 통합 대화, 레이아웃, 콘텐츠, 전달 상태, 날짜, 첨부, 입력, 언어와 테마를 함께 검수한다.

실제 MessageBubble, MessageComposer와 MessageFileAttachment 구현은 `packages/ui`가 소유한다. Studio의 Chat Workbench는 예시 흐름과 검수 control만 소유한다.

최상단 통합 예시는 확정한 요소를 실제 대화 흐름에서 함께 확인하는 용도다. 날짜 구분선은 calendar leading icon과 텍스트만 표시하며, 누르면 layer Date Picker가 열린다. 이 선택은 Studio에서 날짜별 표시를 검수하기 위한 control이며 실제 메시지 날짜를 수정하는 제품 기능이 아니다.

Workbench의 모드·언어는 전체 Studio 검수 콘텐츠에 영향을 주는 전역 control이다. Chat 내부에 중복 구현하지 않고 sticky Studio header의 공통 `라이트/다크`, `KO/EN` 설정을 사용한다. 채팅 테마처럼 Chat 자체의 독립 변형을 비교하는 control만 Workbench 내부에 유지한다.

## 현재 API

- 방향: `incoming | outgoing`
- 작성자, initials, 시간과 콘텐츠
- avatar 표시 여부
- 전달 상태: `sending | sent | read | failed`
- 아직 읽지 않은 참여자 수: `unreadRecipientCount` (1명 이상은 숫자, 0명은 표시하지 않음)
- 현재 사용자가 아직 읽지 않은 새 메시지 수: `unreadMessageCount` (Incoming의 최신 메시지에 사용)
- 전달 상태의 locale별 접근 가능한 label
- hover/focus 시 노출되는 복사·삭제 action과 callback
- Incoming 메시지 action: 복사 icon만 제공
- Outgoing 메시지 action: 복사·삭제 icon 제공
- 전송 실패는 `전송 실패` metadata 오른쪽에 재전송·삭제 action만 항상 노출하고 hover/focus contextual action은 제공하지 않음
- 삭제 상태: `deleted`, locale별 `deletedLabel`, 발신 원문 노출을 제어하는 `showDeletedContent`

`TypingIndicator`는 기존 메시지의 상태가 아니라 상대방이 새 메시지를 작성 중인 thread 상태이므로 별도 컴포넌트로 둔다.

읽음 처리는 개별 bubble의 delivery state와 구분되는 conversation-level 동작이다. Workbench의 `Read handling` 영역에서 자동 방식과 수동 방식을 비교하며, 아직 `MessageBubble` API로 승격하지 않는다.

## 레이아웃 규칙

- 작성자는 bubble 위의 metadata row에 두고, 시간과 전달 상태는 bubble fill에 포함하지 않은 채 그룹 마지막 메시지 아래에 둔다. Incoming은 왼쪽, Outgoing은 오른쪽으로 각 말풍선 시작 방향에 맞춘다.
- Outgoing은 방향만으로 현재 사용자의 메시지임을 식별할 수 있으므로 `나` 또는 사용자 이름을 반복 표시하지 않는다.
- 1:1 대화의 Outgoing은 발신자 표시를 생략한다. 여러 관리자가 동일한 사용자와 채팅하는 관리자 화면에서는 그룹 마지막 시간 왼쪽에 관리자 icon과 `소속팀 이름 · 시간` 형식의 `outgoingSenderLabel`을 표시한다. 이 이름은 관리자 간 구분을 위한 내부 전용 정보이며 사용자 화면이나 사용자에게 전달되는 메시지 payload에는 절대 노출하지 않는다.
- Outgoing metadata row는 다중 관리자 icon과 발신자 정보의 표시 여부와 관계없이 같은 최소 높이를 유지해 1:1/다중 전환 시 메시지 간격이 움직이지 않게 한다. Icon button의 클릭 영역 자체에 여백이 있으므로 발신자 정보와 icon column 사이에는 추가 gap을 두지 않는다.
- 같은 발신자의 연속 메시지가 분 단위까지 같은 시각이면 첫 메시지에만 작성자·avatar를 표시하고, 마지막 메시지에만 시간·전달 상태를 표시한다. 중간 항목은 `grouped`로 콘텐츠만 정렬한다.
- Incoming은 avatar를 표시할 수 있지만 Outgoing은 현재 사용자의 메시지이므로 avatar를 표시하지 않는다.
- 메시지 action은 기본 상태에서 시각적으로 숨기고 bubble hover 또는 내부 keyboard focus 시 노출한다.
- action은 그림자 없이 bubble 바깥쪽에 배치하고 bubble 하단선에 정렬해 콘텐츠 영역과 배경색을 침범하지 않는다.
- Incoming 메시지는 상대방이 보낸 콘텐츠이므로 삭제 action을 제공하지 않고 복사만 허용한다.
- Outgoing 메시지는 hover/focus 시 복사·삭제 action을 제공한다.
- 전송 실패는 사용자가 해결해야 하는 오류 상태이므로 재전송·삭제 action을 hover에 숨기지 않는다. 두 action은 `전송 실패` metadata 바로 오른쪽에 항상 표시하며 모바일에서도 동일하게 발견할 수 있어야 한다. 실패 메시지에는 별도의 bubble hover/focus contextual action bar를 표시하지 않는다.
- 전송 실패는 metadata에 icon 없이 텍스트를 남기고, 숫자/모두 읽음 icon과 같은 sidecar 자리에 danger foreground의 원형 fill `!`를 표시한다.
- 그룹 대화의 읽음 표시는 아직 읽지 않은 참여자 수를 숫자로 표시하며 모두 읽으면 사라진다.
- 읽지 않은 참여자 수는 metadata row가 아니라 Outgoing bubble의 바깥 왼쪽 하단에 배치한다.
- 읽지 않은 새 메시지 수는 Incoming bubble의 바깥 오른쪽 하단에 배치한다. Outgoing의 숫자는 읽지 않은 상대 수, Incoming의 숫자는 현재 사용자의 미확인 메시지 수로 의미를 분리한다.
- 이 제품에서는 `sent`와 `delivered`를 구분하지 않고 `sent` 하나만 사용한다. 아직 읽지 않은 참여자 수가 있으면 bubble 옆 숫자로 표시한다.
- `read`는 모두 읽은 상태이며 숫자를 제거하고 같은 sidecar 자리에 체크 두 개 icon을 표시한다. 시간 옆 metadata에는 두지 않는다.
- hover/focus action은 읽지 않은 참여자 숫자와 같은 sidecar 영역에 겹쳐 나타나며 숫자를 가린다.
- 모든 action을 상시 말풍선 아래에 펼치지 않는다. Desktop에서는 contextual action, Mobile 방식은 추후 별도 검수한다.
- Incoming 삭제 상태는 안내 문구만 표시하고 원문을 숨긴다.
- Outgoing 삭제 상태는 발신 방향을 식별할 수 있도록 기존 Outgoing background를 유지하고 원문은 `oe-foreground-inverse-secondary`로 보존한다. 별도 opacity를 중첩하지 않으며 `showDeletedContent={false}`로 원문을 숨길 수 있다.
- 삭제 상태에 점선 border를 사용하지 않으며 추가 action도 노출하지 않는다.
- 대화의 읽음 상태와 읽음 처리 action은 각 메시지마다 반복하지 않고 현재 대화의 마지막 메시지 아래에만 표시한다.
- 수동 읽음 처리 action은 hover action이 아니며, 읽지 않은 상태에서 항상 보여야 한다.
- 읽음 처리 action 안의 info icon은 hover 시 답장으로도 읽음 처리할 수 있음을 안내한다.
- info tooltip은 기본 `top-end`에 배치하고 viewport 및 clipping boundary 충돌 시 flip/shift하여 화면 밖으로 잘리지 않게 한다.
- 수동 방식에서는 명시적인 읽음 처리 또는 답장 완료 시 대화를 읽음으로 바꾼다.
- 자동 방식에서는 대화를 확인한 시점에 읽음으로 처리한다.
- 수동 방식의 미확인 메시지는 개별 bubble에 badge를 반복하지 않고, 마지막으로 읽은 메시지와 새 메시지 사이에 unread boundary와 개수를 표시한다.
- unread boundary 뒤의 최신 Incoming bubble에도 같은 미확인 개수를 sidecar 숫자로 표시하며, 이전에 읽은 bubble에는 표시하지 않는다.
- 읽음 처리 또는 답장 후 unread boundary와 읽음 처리 action은 함께 사라진다.

## 현재 토큰 연결

- Incoming: `oe-background-secondary`, Neutral foreground hierarchy
- Outgoing: `oe-background-bold-primary`, `oe-foreground-inverse`
- Outgoing metadata: `oe-foreground-inverse-secondary`
- Failed: `oe-danger-foreground-primary`
- Delete action hover: `oe-danger-background-primary`, `oe-danger-foreground-primary`
- Deleted incoming: `oe-background-secondary`, `oe-foreground-secondary`
- Deleted outgoing: `oe-background-bold-primary`, `oe-foreground-inverse-secondary`
- Typing indicator: `oe-background-secondary`, `oe-foreground-tertiary`

## 파일 첨부 사례

파일은 `MessageBubble` 콘텐츠에 포함하지 않고 말풍선 바깥의 독립된 `MessageFileAttachment`로 표시한다. 카드에는 그림자를 사용하지 않고 중립 border로 경계를 구분한다. 현재 Workbench는 전송 완료 파일을 다루며 이미지, 업로드 중, 취소, 실패는 추후 검수 범위로 남긴다.

## 아직 검수할 항목

- bubble radius와 tail 유무
- 연속 메시지 grouping과 avatar/name 생략 규칙
- 연속 메시지에서 metadata와 상태 표시를 생략하거나 묶는 기준
- 삭제 확인 방식과 복사 완료 feedback
- 이미지, 링크와 긴 URL
- 첨부 업로드 중, 취소, 실패
- RTL 및 폭이 매우 좁은 화면
- 브랜드 theme 확장

Workbench의 상태는 실제 서버 전송 로직이 아니라 시각·API 검수를 위한 데모다. 두 번째 독립 화면에서 재사용하기 전에는 Provisional이나 Stable로 승격하지 않는다.
