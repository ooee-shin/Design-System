// 조건을 골라 목록을 거르는 일을 화면 안에서 하므로 클라이언트에서 그린다.
"use client";

/**
 * 관리자 웹의 점주의 소리 목록이다. 조건을 목록 왼쪽에 세로로 세우는 안이다.
 *
 * 위에 가로로 늘어놓는 안과 담기는 것도 거르는 규칙도 같고 조건을 보여 주는 방식만 다르다.
 *
 * 세로로 세우면 자리가 남는다. 그 자리를 세 가지로 쓴다. 축을 접었다 펴서 조건이 늘어도 패널이
 * 길어지지 않게 하고, 값마다 몇 건이 걸리는지 미리 보여 주며, 한 축에서 값을 여러 개 고를 수
 * 있게 한다. 셋 다 조건을 한 줄로 늘어놓는 안에서는 자리가 없어 못 하던 것이다.
 */

import { useState } from "react";

import { RiArrowDownSLine, RiCalendarLine, RiCloseLine, RiResetLeftLine, RiSearchLine, RiSideBarLine } from "@remixicon/react";

import { Button, CheckboxField, Chip, Input, InputButton } from "@ooee/ui";

import { AdminLayout } from "@/components/candidates/admin-layout";
import { Collapsible, CollapsibleContent } from "@/components/candidates/collapsible";
import { PageHeader } from "@/components/candidates/page-header";
import { ScrollArea } from "@/components/candidates/scroll-area";

import {
  CATEGORY_OPTIONS,
  CUSTOM,
  EMPTY_FILTER,
  PAGE_DESCRIPTION,
  PAGE_PATH,
  PERIOD_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  REGIONS,
  STORES,
  regionOf,
  storesIn,
  SUPERVISOR_OPTIONS,
  countsFor,
  isFiltered,
  toggleValue,
  type Filter,
  type FilterAxis,
} from "./voice-data";
import { VoiceList } from "./voice-list";

/**
 * 패널 안에서 축 하나가 서는 자리다. 이름과 고른 개수가 접힌 채로도 보이므로, 무엇이 걸려 있는지
 * 알려고 다시 펼칠 일이 없다.
 */
function FilterSection({
  label,
  count = 0,
  onClear,
  defaultOpen = false,
  children,
}: {
  label: string;
  count?: number;
  onClear?: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => setOpen((previous) => !previous);
  const arrow = (
    <RiArrowDownSLine
      className={`size-oe-icon-small shrink-0 text-oe-foreground-tertiary transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    />
  );

  return (
    // 축을 가르는 선은 좌우 16px 을 남기고 긋는다. 패널 폭을 끝까지 가로지르면 선이 벽에
    // 닿아 답답하고, 패널 오른쪽의 세로선과 만나 격자처럼 보인다.
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="relative after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-oe-border-tertiary last:after:hidden"
    >
      <div className="flex items-center gap-1.5 px-5 py-2.5">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          // 펼친 축이 지금 보고 있는 것이므로 제목도 그쪽이 진하다. 접힌 축은 한 단계 물러나
          // 패널을 훑을 때 펼쳐진 자리가 먼저 읽힌다.
          className={`flex flex-1 items-center justify-between gap-2 rounded-md py-1 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-oe-focus-ring ${open ? "text-oe-foreground-primary" : "text-oe-foreground-tertiary"}`}
        >
          {label}
          {count > 0 ? null : arrow}
        </button>
        {/* 고른 값이 있으면 몇 개인지와 그 축만 지우는 길이 함께 선다. 접힌 채로도 보이므로
            무엇이 걸려 있는지 확인하려고 다시 펼칠 일이 없다. */}
        {count > 0 ? (
          <>
            {/* 칩 전체가 이 축의 조건을 지우는 버튼이다. 안에 따로 버튼을 두면 20px 높이
                안에서 누를 곳이 아이콘만 한 크기로 줄어든다. */}
            <Chip
              controlSize="compact"
              onClick={onClear}
              ariaLabel={`${label} 조건 ${count}개 지우기`}
              trailingElement={<RiCloseLine />}
              trailingTone="tertiary"
            >
              {String(count)}
            </Chip>
            <button type="button" onClick={toggle} aria-label={`${label} ${open ? "접기" : "펼치기"}`} className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
              {arrow}
            </button>
          </>
        ) : null}
      </div>
      {/* 펼치고 접을 때 높이가 미끄러진다. Base UI 가 펼친 높이를 `--collapsible-panel-height`
          로 넘겨 주므로, 열릴 때 그 값까지 늘리고 닫힐 때 0으로 되돌린다. */}
      <CollapsibleContent
        // 높이를 미끄러뜨리는 동안에만 넘치는 것을 자른다. 다 펴진 뒤에도 자르면 안쪽 칸의 포커스
        // 링이 이 영역의 위아래 경계에서 잘린다. 링은 칸 바깥으로 번지기 때문이다.
        className="h-[var(--collapsible-panel-height)] opacity-100 transition-[height,opacity] duration-200 ease-out not-data-open:overflow-hidden data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0 motion-reduce:transition-none"
      >
        <div className="px-5 pb-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * 지역을 먼저 고르고 그 안에서 점포를 고른다.
 *
 * 점포는 실제로 천 곳을 넘어 한 목록에 늘어놓을 수 없다. 왼쪽에서 지역을 옮겨 다니고 오른쪽에서
 * 그 지역의 점포를 고르며, 맨 위의 「전체」가 그 지역 전부를 함께 켜고 끈다. 얼개는 Combobox 의
 * 2단계 예시에서 가져왔다.
 *
 * 고르는 것은 지역이 아니라 점포다. 왼쪽을 옮겨 다녀도 앞서 고른 점포는 그대로 남는다.
 */
function StorePicker({
  chosen,
  counts,
  onChange,
}: {
  chosen: string[];
  counts: Record<string, number>;
  onChange: (next: string[]) => void;
}) {
  const [activeRegion, setActiveRegion] = useState(REGIONS[0]);
  const [query, setQuery] = useState("");
  const keyword = query.trim();
  // 점포명을 치면 지역을 가리지 않고 전부에서 찾는다. 천 곳 가운데 이름만 아는 한 곳을 찾을 때
  // 그것이 어느 지역인지까지 알아야 한다면 검색이 하는 일이 없다. 대신 결과마다 지역을 붙인다.
  const stores = keyword ? STORES.filter((item) => item.name.includes(keyword)).map((item) => item.name) : storesIn(activeRegion);
  const picked = stores.filter((name) => chosen.includes(name));
  const all = stores.length > 0 && picked.length === stores.length;

  return (
    <div className="flex flex-col gap-2">
      <Input
        variant="filled"
        controlSize="small"
        aria-label="점포 찾기"
        placeholder="점포명으로 찾기"
        leadingElement={<RiSearchLine />}
        clearable
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
      />

    {/* 안에서 쓰는 쌓임 순서가 바깥과 겨루지 않도록 이 상자에서 새로 시작한다. 고른 지역이
        세로선 위로 올라오려고 쓰는 값이 화면 전체의 순서에 끼어들면, 위에 붙어 있는 머리 줄을
        덮는다. */}
    <div className="isolate grid grid-cols-[minmax(4.5rem,0.7fr)_minmax(0,1.3fr)] overflow-hidden rounded-oe-control border border-oe-border-secondary">
      {/* 왼쪽은 지역이다. 두 칸을 가르는 세로선은 이 칸이 갖는다. */}
      <div className={`relative flex max-h-60 flex-col overflow-y-auto bg-oe-background-secondary${keyword ? " opacity-50" : ""} [scrollbar-width:none] after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-px after:bg-oe-border-secondary [&::-webkit-scrollbar]:hidden`}>
        {REGIONS.map((region) => (
          <button
            key={region}
            type="button"
            onClick={() => setActiveRegion(region)}
            // 줄이 칸을 가로로 꽉 채운다. 안쪽으로 들이면 고른 줄의 면이 칸 안에 뜬 조각처럼
            // 보이고, 채우면 그 줄이 곧 그 칸의 한 단이 된다. 포커스 링은 안쪽에 그려 칸
            // 경계를 넘지 않게 한다.
            className={`flex min-h-9 shrink-0 items-center gap-1 pr-2 pl-3 text-left text-oe-label outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-inset ${
              activeRegion === region
                ? // 고른 줄은 오른쪽 칸과 같은 흰 바닥이 되고 두 칸을 가르는 세로선 위로 올라와
                  // 그 선을 덮는다. 고른 지역이 오른쪽에 펼쳐진 점포와 이어져 보이는 것이 두 칸
                  // 으로 나눈 이유다. 브랜드 색은 쓰지 않는다. 여기서 고르는 것은 조건이 아니라
                  // 오른쪽에 무엇을 띄울지이고, 브랜드 색은 걸린 조건을 말하는 자리에 남겨 둔다.
                  "relative z-20 bg-oe-background-primary font-medium text-oe-foreground-primary"
                : "text-oe-foreground-secondary hover:bg-oe-interaction-hover-subtle"
            }`}
          >
            <span className="min-w-0 flex-1 truncate">{region}</span>
            <RiArrowDownSLine className="size-4 shrink-0 -rotate-90 text-oe-foreground-tertiary" aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* 오른쪽은 고른 지역의 점포다. */}
      <div className="flex max-h-60 flex-col overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CheckboxField
          layout="fill"
          isParent
          label="전체"
          className="shrink-0 rounded-none px-3"
          checked={all}
          indeterminate={picked.length > 0 && !all}
          onCheckedChange={(checked) =>
            onChange(checked ? Array.from(new Set([...chosen, ...stores])) : chosen.filter((name) => !stores.includes(name)))
          }
        />
        {stores.length === 0 ? (
          <p className="px-3 py-2 text-sm text-oe-foreground-tertiary">데이터가 없습니다.</p>
        ) : null}
        {stores.map((name) => (
          <CheckboxField
            key={name}
            layout="fill"
            label={name}
            rightDescription={keyword ? regionOf(name) : undefined}
            className="shrink-0 rounded-none px-3 [&_[data-slot=checkbox-trailing]]:ml-auto"
            checked={chosen.includes(name)}
            onCheckedChange={() => onChange(toggleValue(chosen, name))}
            trailingElement={<span className="text-xs tabular-nums text-oe-foreground-tertiary">{counts[name] ?? 0}</span>}
          />
        ))}
      </div>
    </div>
    </div>
  );
}

export default function Page() {
  // 고르는 동안에는 `draft` 에만 쌓이고, 조회를 눌러야 `filter` 로 넘어가 목록이 다시 선다.
  // 한 번 고를 때마다 서버에 묻지 않고 다 고른 뒤 한 번에 묻는다.
  //
  // **값 옆의 건수는 조회한 조건을 기준으로 센다.** 아직 묻지 않은 조건까지 반영하면 화면에
  // 서 있는 목록과 건수가 서로 다른 것을 말하게 된다.
  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
  const [draft, setDraft] = useState<Filter>(EMPTY_FILTER);
  const dirty = JSON.stringify(draft) !== JSON.stringify(filter);
  const [panelOpen, setPanelOpen] = useState(true);
  // 담당자는 다섯이 넘어가면 눈으로 훑기 어려워진다. 고른 조건이 아니라 목록을 찾는 도구이므로
  // 필터 값에 담지 않고 이 화면만 들고 있다.
  const [supervisorQuery, setSupervisorQuery] = useState("");
  const edit = (patch: Partial<Filter>) => setDraft((previous) => ({ ...previous, ...patch }));

  /** 한 축의 값 목록이다. 값마다 몇 건이 걸리는지 오른쪽 끝에 붙는다. */
  const valueList = (
    axis: FilterAxis,
    options: { value: string; label: string; description?: string }[],
    // 값이 많은 축은 상자에 높이를 준다. 다 뿌리면 그 축 하나가 패널을 차지해서 아래 축들이
    // 화면 밖으로 밀려난다.
    scroll = false,
  ) => {
    const counts = countsFor(axis, filter);
    return (
      // 한 축의 값들을 상자로 묶는다. 축을 가르는 선이 패널 폭을 가로지르므로, 그 사이에 놓인
      // 값들이 어디까지 한 묶음인지 따로 말해 주어야 한다. 모서리는 바로 위 검색 칸과 같은
      // 컨트롤 값을 써서, 둘이 한 묶음으로 읽히게 한다.
      //
      // 값 사이에는 선을 두지 않는다. 체크박스가 이미 줄마다 앞에 서서 어디서 한 줄이 시작하는지
      // 말하고 있어, 선을 더하면 같은 것을 두 번 말하면서 패널의 선만 늘어난다.
      <div className={`flex flex-col overflow-hidden rounded-oe-control border border-oe-border-secondary${scroll ? " max-h-60 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : ""}`}>
        {options.length === 0 ? (
          <p className="px-3 py-2.5 text-sm text-oe-foreground-tertiary">데이터가 없습니다.</p>
        ) : null}
        {options.map((option) => (
          <CheckboxField
            key={option.value}
            layout="fill"
            // 건수를 오른쪽 끝으로 미는 임시 처리다. `CheckboxField` 는 `layout="fill"` 이어도
            // `trailingElement` 가 있으면 라벨 영역에 `flex-1` 을 주지 않아 건수가 라벨 길이를
            // 따라다닌다. 확인한 뒤 컴포넌트 쪽에서 고친다.
            className="rounded-none px-3 [&_[data-slot=checkbox-trailing]]:ml-auto"
            label={option.label}
            // 이름만으로 누구인지 갈리지 않을 때가 있어 팀을 옆에 붙인다.
            rightDescription={option.description}
            checked={draft[axis].includes(option.value)}
            onCheckedChange={() => edit({ [axis]: toggleValue(draft[axis], option.value) })}
            trailingElement={
              <span className="text-xs tabular-nums text-oe-foreground-tertiary">{counts[option.value] ?? 0}</span>
            }
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          path={PAGE_PATH}
          title="점주의 소리"
          description={PAGE_DESCRIPTION}
          actions={
            // 조건 패널을 여닫는 길이다. 목록 위가 아니라 화면 머리에 두어, 표 위 줄은 결과를
            // 다루는 것들만 남긴다.
            <Button
              variant="outline"
              tone="neutral"
              leadingIcon={<RiSideBarLine />}
              aria-expanded={panelOpen}
              onClick={() => setPanelOpen((previous) => !previous)}
            >
              필터
            </Button>
          }
        />

        <div className="flex min-h-0 flex-1">
          {/* 조건은 본문 위에 얹힌 상자가 아니라 본문 옆의 한 칸이다. 그래서 페이지 헤더가
              아래에 선을 긋듯이 이 자리도 오른쪽에 선을 긋고, 그 선까지가 조건의 영역이다.
              상자를 두르지 않는 이유는 그 안에서 축을 다시 선으로 나누기 때문이다. 선이 두
              겹이 되면 무엇이 묶여 있는지 오히려 읽히지 않는다.

              폭을 고정하므로 조건이 늘어도 아래로만 길어지고 목록 폭은 그대로다. 패널이 길어
              지면 이 자리만 스크롤되고 목록은 제자리를 지킨다. */}
          {/* 접을 때 사라지는 것이 아니라 폭이 줄어든다. 갑자기 없어지면 옆의 목록이 한 번에
              넓어져서 어디를 보고 있었는지 놓친다. 안쪽 내용은 폭을 고정해 두어, 줄어드는 동안
              글자가 찌그러지지 않고 왼쪽으로 밀려 나간다. 닫힌 동안에는 `inert` 로 포커스가
              들어가지 않게 막는다. */}
          <aside
            inert={!panelOpen}
            className={`shrink-0 overflow-hidden transition-[width,opacity] duration-200 ease-out motion-reduce:transition-none ${
              panelOpen ? "w-[18.25rem] border-r border-oe-border-secondary opacity-100" : "w-0 opacity-0"
            }`}
          >
            <div className="flex h-full w-[18.25rem] flex-col">
              {/* 스크롤 막대를 콘텐츠 위에 겹쳐 그린다. 막대가 자리를 차지하면 축을 가르는
                  선이 그 앞에서 멈추고 오른쪽 여백만 넓어지며, 필요할 때만 생기게 두면 축을
                  펼치고 접을 때마다 안쪽 폭이 흔들린다. */}
              <ScrollArea className="min-h-0 flex-1" viewportClassName="pb-4">
              {/* 스크롤해도 맨 위에 남는다. 조건을 여럿 펼쳐 아래로 내려간 상태에서도 지금
                  무엇이 걸려 있는지 되돌릴 길이 손에 닿아야 한다.

                  초기화는 되돌릴 것이 있을 때만 서므로, 줄 높이를 미리 잡아 두어야 버튼이
                  생기고 사라질 때 아래 조건들이 밀려 올라가거나 내려가지 않는다. */}
              <div className="sticky top-0 z-10 bg-oe-background-primary px-5 pt-4">
              <div className="flex h-9 items-center justify-between">
                <h2 className="text-base font-semibold text-oe-foreground-primary">필터</h2>
                {/* 조회는 이 줄에 둔다. 스크롤해도 남는 자리라 조건을 고치는 내내 눈에 들어오고,
                    고친 것이 있을 때만 눌려서 아직 묻지 않은 것이 있다는 것도 함께 말한다.
                    바닥에 두면 축을 고르는 동안에는 시야 밖이다.

                    초기화는 되돌릴 것이 있을 때만 선다. 아무것도 고르지 않은 화면에 서 있으면
                    무엇을 되돌리는 것인지 읽는 사람이 먼저 헤아려야 한다. */}
                <span className="-mr-1 flex items-center gap-1">
                  {isFiltered(draft) ? (
                    <Button
                      variant="ghost"
                      tone="neutral"
                      controlSize="xsmall"
                      leadingIcon={<RiResetLeftLine />}
                      onClick={() => {
                        setDraft(EMPTY_FILTER);
                        setFilter(EMPTY_FILTER);
                      }}
                    >
                      초기화
                    </Button>
                  ) : null}
                  <Button
                    controlSize="small"
                    disabled={!dirty}
                    onClick={() => setFilter(draft)}
                  >
                    조회
                  </Button>
                </span>
              </div>
              </div>

              <FilterSection label="등록일" defaultOpen>
                {/* 기간 묶음은 칩 줄이 차지한 만큼만 넓다. 그래야 아래 트리거가 그 폭을 채워
                    칩 줄과 오른쪽 끝이 맞는다. 칩은 글자 폭만큼만 차지하므로 반대로 칩을 늘려
                    맞추면 「직접 선택」이 말줄임된다. */}
                <div className="flex w-fit flex-col">
                  {/* 넷뿐이라 접지 않고 한 줄에 펼쳐 둔다. 기간은 목록을 읽는 내내 바탕이 되는
                      조건이라 지금 어느 폭으로 보고 있는지가 늘 보여야 하고, 줄이 넘어가면
                      어디까지가 기간인지 한눈에 들어오지 않는다. 넷을 더한 폭이 236px 이라
                      240px 안에 선다. */}
                  <div className="flex gap-1">
                    {PERIOD_OPTIONS.map((option) => (
                      <Chip
                        key={option.value}
                        shape="rounded"
                        controlSize="small"
                        active={draft.period === option.value}
                        onClick={() => edit({ period: option.value })}
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </div>
                  {/* 직접 고를 때만 두 칸이 선다. 날짜를 고르는 공용 컴포넌트가 아직 없어
                      브라우저가 주는 달력을 그대로 쓴다. */}
                  {/* 직접 고를 때만 선다. 칩을 눌러 나타나고 사라지는 자리이므로 축을 펼칠
                      때와 같은 방식으로 높이가 미끄러진다. 시작일과 종료일을 한 칸에서 함께
                      받으므로 트리거도 하나이고, 폭이 위의 칩 줄과 그대로 맞는다.

                      **누르면 열릴 달력은 아직 없다.** 날짜를 고르는 공용 컴포넌트를 만들 차례가
                      되면 이 자리가 그 첫 소비자가 된다. 지금은 값이 어떻게 보이고 어느 자리에
                      서는지만 정해 둔다. */}
                  <Collapsible open={draft.period === CUSTOM}>
                    <CollapsibleContent // 높이를 미끄러뜨리는 동안에만 넘치는 것을 자른다. 다 펴진 뒤에도 자르면 안쪽 칸의 포커스
        // 링이 이 영역의 위아래 경계에서 잘린다. 링은 칸 바깥으로 번지기 때문이다.
        className="h-[var(--collapsible-panel-height)] opacity-100 transition-[height,opacity] duration-200 ease-out not-data-open:overflow-hidden data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0 motion-reduce:transition-none">
                      <div className="pt-2">
                        <InputButton
                          controlSize="small"
                          className="w-full"
                          aria-label="기간"
                          placeholder="시작일 ~ 종료일"
                          value={draft.from && draft.to ? `${draft.from} ~ ${draft.to}` : ""}
                          leadingElement={<RiCalendarLine />}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </FilterSection>

              <FilterSection label="처리상태" count={draft.status.length} onClear={() => edit({ status: [] })} defaultOpen>
                {valueList("status", STATUS_OPTIONS)}
              </FilterSection>

              <FilterSection label="카테고리" count={draft.category.length} onClear={() => edit({ category: [] })}>
                {valueList("category", CATEGORY_OPTIONS)}
              </FilterSection>

              <FilterSection label="점포" count={draft.store.length} onClear={() => edit({ store: [] })}>
                <StorePicker
                  chosen={draft.store}
                  counts={countsFor("store", filter)}
                  onChange={(next) => edit({ store: next })}
                />
              </FilterSection>

              <FilterSection label="담당SV" count={draft.sv.length} onClear={() => edit({ sv: [] })}>
                <div className="flex flex-col gap-2">
                  {/* 이름과 팀 어느 쪽으로도 찾는다. 「2팀」을 치면 그 팀만 남는다. */}
                  <Input
                    variant="filled"
                    controlSize="small"
                    aria-label="담당자 찾기"
                    placeholder="이름이나 팀으로 찾기"
                    leadingElement={<RiSearchLine />}
                    clearable
                    value={supervisorQuery}
                    onChange={(event) => setSupervisorQuery(event.target.value)}
                    onClear={() => setSupervisorQuery("")}
                  />
                  {valueList(
                    "sv",
                    // 이름과 팀 어느 쪽으로도 찾는다. 「2팀」을 치면 그 팀 사람들이 남는다.
                    SUPERVISOR_OPTIONS.filter((option) => {
                      const keyword = supervisorQuery.trim();
                      return option.label.includes(keyword) || option.description.includes(keyword);
                    }),
                  )}
                </div>
              </FilterSection>

              <FilterSection label="유입 경로" count={draft.source.length} onClear={() => edit({ source: [] })}>
                {valueList("source", SOURCE_OPTIONS)}
              </FilterSection>
              </ScrollArea>

            </div>
          </aside>

          {/* 아래를 넉넉히 비운다. 목록이 화면 밑변에 닿으면 더 볼 것이 남았는지 아닌지
              읽히지 않는다. */}
          <div className="flex min-w-0 flex-1 items-start overflow-auto px-6 pt-6 pb-16">
            <VoiceList filter={filter} onFilterChange={edit} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
