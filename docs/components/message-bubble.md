# MessageBubble Candidate

상태: `Candidate`

`MessageBubble`은 VibePrompt Inbox split view Experiment에서 추출한 첫 컴포넌트 자산이다. `/components/message-bubble` Workbench에서 레이아웃, 콘텐츠, 전달 상태, 언어와 테마를 검수한다.

## 현재 API

- 방향: `incoming | outgoing`
- 작성자, initials, 시간과 콘텐츠
- avatar 표시 여부
- 전달 상태: `sending | sent | delivered | read | failed`
- 전달 상태의 locale별 접근 가능한 label

`TypingIndicator`는 기존 메시지의 상태가 아니라 상대방이 새 메시지를 작성 중인 thread 상태이므로 별도 컴포넌트로 둔다.

## 현재 토큰 연결

- Incoming: `oe-background-secondary`, Neutral foreground hierarchy
- Outgoing: `oe-background-bold-primary`, `oe-foreground-inverse`
- Outgoing metadata: `oe-foreground-inverse-secondary`
- Failed: `oe-danger-foreground-primary`
- Typing indicator: `oe-background-secondary`, `oe-foreground-tertiary`

## 아직 검수할 항목

- bubble radius와 tail 유무
- 연속 메시지 grouping과 avatar/name 생략 규칙
- 상태 표시의 위치, icon과 노출 기준
- failed 재시도 action
- 이미지, 파일, 링크와 긴 URL
- RTL 및 폭이 매우 좁은 화면
- 브랜드 theme 확장

Workbench의 상태는 실제 서버 전송 로직이 아니라 시각·API 검수를 위한 데모다. 두 번째 독립 화면에서 재사용하기 전에는 Provisional이나 Stable로 승격하지 않는다.
