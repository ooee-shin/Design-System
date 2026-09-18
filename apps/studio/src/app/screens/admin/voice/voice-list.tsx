"use client";

/**
 * 점주의 소리 목록의 결과 영역이다. 표와 그 위아래 줄을 갖는다.
 *
 * 필터를 어디에 세울지 두 안을 보고 있으므로, 안이 달라도 같아야 하는 이쪽을 한 곳에 두었다.
 * 「전환된 건 표시」만 여기에 있는데, 목록에 무엇까지 담을지 정하는 조작이라 빠진 건수를 말하는
 * 글 바로 옆이 그 자리이기 때문이다.
 */

import { useMemo, useState } from "react";

import { RiAttachmentLine, RiCornerDownRightLine, RiDownloadLine, RiSearchLine } from "@remixicon/react";

import { Badge, Button, Checkbox, CheckboxField, Input, Select } from "@ooee/ui";

import { Pagination } from "@/components/candidates/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/candidates/table";

import { STATUS, STATUS_COLOR, SUMMARY_STATUS, OVERDUE_DAYS, VOICES, elapsedLabel, inflow, isOverdue, inTimeRate, inflowLabel, matches, previousPeriodName, statusOf, teamOf, type Filter } from "./voice-data";

const PAGE_SIZES = [10, 25, 50, 100].map((size) => ({ value: String(size), label: String(size) }));

export function VoiceList({
  filter,
  onFilterChange,
  afterCount,
}: {
  filter: Filter;
  onFilterChange: (patch: Partial<Filter>) => void;
  /** 건수 바로 뒤에 설 것. 조건 패널을 여닫는 버튼처럼 그 안을 쓰는 화면만 갖는 조작이다. */
  afterCount?: React.ReactNode;
}) {
  // 정렬은 조건이 아니라 걸러 낸 목록을 보는 방식이라 조회를 거치지 않고 곧바로 반영된다.
  // 기본은 등록일 최신순이다. 목록을 열었을 때 먼저 봐야 하는 것은 방금 들어온 건이다.
  const [sort, setSort] = useState<{ key: "createdAt" | "answeredAt"; direction: "asc" | "desc" }>({
    key: "createdAt",
    direction: "desc",
  });
  const rows = useMemo(() => {
    const found = VOICES.filter((voice) => matches(voice, filter));
    return found.sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      // 답변이 아직 없는 건은 방향과 상관없이 뒤로 보낸다. 빈 값을 가장 이른 날짜로 치면 답변일
      // 오름차순에서 미답변이 목록 앞을 채워, 답변이 언제 나갔는지 보려고 건 정렬이 뜻을 잃는다.
      if (!left || !right) return left ? -1 : right ? 1 : 0;
      return sort.direction === "asc" ? left.localeCompare(right) : right.localeCompare(left);
    });
  }, [filter, sort]);
  // 표 위 요약은 걸어 둔 조건을 그대로 따른다. 조건과 다른 범위를 세면 한 화면에 서로 다른 것을
  // 말하는 숫자가 둘 생긴다. 기본으로 열리는 기간이 한 달이므로 처음 보이는 값도 한 달 기준이다.
  //
  // 상태 셋은 전환된 건을 빼고 센다. 그 셋의 합이 목록의 전체 건수와 같아야 읽는 사람이 숫자를
  // 다시 세어 보지 않는다.
  const answerable = rows.filter((voice) => !voice.movedTo);
  // 접수 상태로 기한을 넘긴 건이다. 표에서는 그 줄의 경과가 빨갛게 서지만 보고 있는 페이지의
  // 줄만 보이므로, 지금 조건에 몇 건이 밀려 있는지는 여기서 말한다.
  const overdueCount = rows.filter(isOverdue).length;
  // 소수점 한 자리까지 적는다. 분모가 수십 건이라 정수로 끊으면 한 건이 판정될 때마다 값이 몇
  // 퍼센트씩 뛰어, 어제와 오늘을 견줄 수 없다.
  const answerRate = inTimeRate(rows);
  // 전환 건수는 목록에 담았는지와 무관하게 그 조건에 해당하는 전부를 센다. 담지 않은 동안 0으로
  // 말하면, 빠져 있는 건이 몇 건인지 알 길이 없어 「전환 건 포함」을 켜 볼 이유도 알 수 없다.
  const movedInScope = VOICES.filter((voice) => matches(voice, { ...filter, showMoved: true }) && voice.movedTo).length;
  // 들어온 양은 직전 같은 길이 구간과 견줘야 뜻이 생긴다. 20건이 많은지 적은지는 그 자체로
  // 알 수 없고, 지난 구간이 10건이었다는 것을 알 때 비로소 읽힌다.
  const { now: inflowNow, before: inflowBefore } = inflow(filter);
  const inflowDelta = inflowNow === null || inflowBefore === null ? null : inflowNow - inflowBefore;
  const summaryCount: Record<string, number> = {
    recv: answerable.filter((voice) => voice.status === "recv").length,
    prog: answerable.filter((voice) => voice.status === "prog").length,
    done: answerable.filter((voice) => voice.status === "done").length,
    moved: movedInScope,
  };
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const lastPage = Math.max(1, Math.ceil(rows.length / pageSize));
  // 조건이 바뀌어 줄 수가 줄면 보고 있던 페이지가 사라진다. 그때는 마지막 페이지로 당겨 붙인다.
  const current = Math.min(page, lastPage);
  const start = (current - 1) * pageSize;
  const shown = rows.slice(start, start + pageSize);
  const goTo = (next: number) => setPage(Math.min(Math.max(next, 1), lastPage));

  // 친 숫자는 옮긴 뒤 비운다. 남겨 두면 페이지를 다른 방법으로 옮겼을 때 이 칸의 숫자와 실제
  // 페이지가 어긋나 보인다. 비어 있으면 자리 표시가 지금 페이지를 말한다.
  // 같은 열을 다시 누르면 방향만 뒤집고, 다른 열을 누르면 그 열의 최신순부터 보여 준다. 날짜
  // 열에서 먼저 찾는 것은 대개 가장 최근 건이다.
  const changeSort = (key: "createdAt" | "answeredAt") => {
    setSort((previous) =>
      previous.key === key
        ? { key, direction: previous.direction === "desc" ? "asc" : "desc" }
        : { key, direction: "desc" },
    );
    // 정렬이 바뀌면 같은 페이지 번호가 전혀 다른 줄을 가리키므로 첫 페이지로 돌아간다.
    setPage(1);
  };

  // 고른 줄이다. 일괄 처리를 붙일 자리가 아직 없어 지금은 고른 것만 보인다.
  //
  // 지금 목록이 어떤 목록인지를 선택과 함께 들고 있다가, 조건이나 정렬이 바뀌어 다른 목록이 되면
  // 고른 것을 비운 것으로 읽는다. 목록에서 사라진 줄이 선택으로 남으면, 나중에 일괄 처리를
  // 붙였을 때 화면에 보이지 않는 건까지 함께 처리된다.
  const listKey = JSON.stringify([filter, sort]);
  const [selection, setSelection] = useState<{ key: string; numbers: number[] }>({ key: listKey, numbers: [] });
  const picked = selection.key === listKey ? selection.numbers : [];
  const changePicked = (next: (previous: number[]) => number[]) =>
    setSelection({ key: listKey, numbers: next(picked) });
  // 전환된 건은 고를 수 없다. 고르는 열은 엑셀로 내려받을 건을 정하는 자리인데, 전환된 건은
  // 지원요청에서 처리하며 이 채널의 통계에서도 빠지기 때문이다. 머리줄의 전체 선택도 그 건을
  // 빼고 세야 모두 골랐는지가 맞는다.
  const pageNumbers = shown.filter((voice) => !voice.movedTo).map((voice) => voice.no);
  const pickedHere = pageNumbers.filter((no) => picked.includes(no));
  // 머리줄의 체크박스는 보고 있는 페이지를 켜고 끈다. 걸러 낸 전부를 다루면 화면에 없는 줄까지
  // 함께 켜져서, 무엇이 고른 상태인지 그 화면에서 확인할 수 없다.
  const allHere = pageNumbers.length > 0 && pickedHere.length === pageNumbers.length;

  const [pageInput, setPageInput] = useState("");
  const jumpToTypedPage = () => {
    if (pageInput) goTo(Number(pageInput));
    setPageInput("");
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* 표 위의 요약이다. 목록과 성격이 다른 통계 값이라 테두리로 한 번 묶는다. 이제 이 자리에
          덩어리가 둘이므로 카드가 구분할 대상을 갖는다.

          왼쪽은 지금 목록이 상태별로 어떻게 나뉘는지이고, 오른쪽은 그 목록이 이전 구간보다 늘었는지
          줄었는지다. 앞은 지금의 모습이고 뒤는 변화라 성격이 갈리므로 세로선으로 끊고 양 끝에
          둔다. */}
      {/* 카드는 목록과 같은 폭을 갖고, 두 묶음이 그 폭을 반씩 나눈다. 상태 넷이 왼쪽 절반을,
          유입·답변률·지연이 오른쪽 절반을 쓰며 각 묶음 안에서는 값들이 균등하게 나눠 갖는다.
          남는 폭이 한자리에 몰리지 않고 값 사이로 고르게 퍼져서, 빈 덩어리도 건너뛸 자리도
          생기지 않는다. 막대는 왼쪽 절반을 채우므로 상태 넷이 선 만큼만 길다. */}
      {/* 값들을 위로 맞춘다. 가운데로 두면 아래에 부가 설명이 붙은 값만 위로 올라가서, 이름과
          숫자가 서는 줄이 값마다 어긋난다. */}
      <div className="mb-4 rounded-oe-control border border-oe-border-secondary px-4 py-3">
        <div className="flex items-start gap-x-6">
        {/* 상태 넷과 그 아래 막대다. 넷을 더하면 유입 건수가 된다. 이름과 건수를 먼저 읽고
            막대에서 몫을 확인하는 차례이며, 막대를 위에 두면 무엇을 쪼갠 몫인지 모른 채 색면을
            먼저 보게 된다.

            숫자에 색을 입히지 않고 이름 앞의 점과 막대만 색을 갖는다. 색이 숫자에 붙으면 화면이
            어느 값이 문제인지를 먼저 말하는데, 몇 건부터 문제인지 정한 기준이 아직 없다. */}
        <div className="flex flex-1 flex-col gap-2">
          {/* 넷이 같은 폭을 갖는다. 글자 수를 따르면 이름이 긴 「지원요청 전환」만 넓어져서 칸
              사이 간격이 제각각으로 보이고, 위 막대의 조각과 아래 이름이 서로 다른 리듬으로
              읽힌다. 가장 긴 이름이 폭을 정하고 나머지가 그 폭을 함께 쓴다.

              칸마다 최소 폭 72px 을 둔다. 건수가 네 자리가 되면 「9,999건」이 69px 이라, 최소 폭이
              없으면 그날 카드 전체가 넓어지고 옆의 유입·답변률까지 자리를 옮긴다. */}
          <div className="grid grid-cols-4 gap-x-6">
            {SUMMARY_STATUS.map((key) => (
              <div key={key} className="flex min-w-18 flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-xs text-oe-foreground-tertiary">
                  <span className={`size-1.5 shrink-0 rounded-full ${STATUS_COLOR[key]}`} aria-hidden="true" />
                  {/* 처리상태 열이 쓰는 이름을 그대로 쓴다. 「전환」 한 낱말로 줄이면 지원요청으로
                      보낸 건인지 지원요청에서 온 건인지 방향이 보이지 않는다. */}
                  {STATUS[key].label}
                </span>
                {/* 단위는 숫자보다 작다. 값마다 되풀이되는 글자라 숫자와 같은 크기로 두면 네 칸을
                    훑을 때 「건」이 숫자만큼 자리를 차지해 정작 견줄 숫자가 늦게 읽힌다. */}
                <span className="text-xl font-semibold text-oe-foreground-primary">
                  {summaryCount[key].toLocaleString("ko-KR")}
                  <span className="ml-0.5 text-sm font-medium">건</span>
                </span>
              </div>
            ))}
          </div>

          {/* 넷의 몫을 한 막대에 담는다. 숫자만으로는 12와 3의 차이를 크기로 느끼지 못하고, 조각의
              길이가 그 일을 한다. 값이 0인 상태는 조각을 두지 않는다. 폭 0인 면은 보이지 않으면서
              조각 사이 간격만 하나 더 만든다.

              조각 사이를 2px 띄워 바닥색이 비치게 한다. 붙여 두면 색이 비슷한 두 조각의 경계가
              어디인지 읽히지 않는다. 막대의 양 끝만 둥글고 조각끼리 닿는 면은 각지다. */}
          <div
            className="flex h-2 gap-0.5 overflow-hidden rounded-full"
            role="img"
            aria-label={SUMMARY_STATUS.map((key) => `${STATUS[key].label} ${summaryCount[key]}건`).join(", ")}
          >
            {SUMMARY_STATUS.filter((key) => summaryCount[key] > 0).map((key) => (
              <span
                key={key}
                className={STATUS_COLOR[key]}
                style={{ flexGrow: summaryCount[key] }}
                title={`${STATUS[key].label} ${summaryCount[key]}건`}
              />
            ))}
          </div>
        </div>

        {/* 선은 높이를 고정하지 않고 카드 안쪽 높이를 그대로 채운다. 값을 한 줄 더 두거나 막대를
            걷어내도 선만 짧게 남는 일이 없다. */}
        <span className="w-px self-stretch bg-oe-border-secondary" aria-hidden="true" />

        {/* 두 칸도 서로 같은 폭을 갖는다. 아래에 설명이 붙은 유입만 넓으면 그 옆 답변률의
            이름과 숫자가 다른 리듬으로 읽히고, 값의 자릿수가 바뀔 때 둘 중 하나만 움직인다. */}
        <div className="grid flex-1 grid-cols-3 gap-x-6 gap-y-0.5">
          {/* 들어온 양과 그 변화다. 뒤의 상태 넷을 더하면 이 숫자가 되며, 전환된 건도 등록은 된
              건이라 유입에 든다. */}
          <div className="flex min-w-18 flex-col gap-0.5">
            {/* 권한이 정한 범위가 이 값의 이름이 된다. 관리자는 전부를 세므로 「유입」이고, SV 와
              팀장은 자기 범위만 세므로 그 숫자가 곧 맡은 일의 양이라 「나의 업무」다. */}
          <span className="text-xs text-oe-foreground-tertiary">{inflowLabel(filter.role)}</span>
            <span className="text-xl font-semibold text-oe-foreground-primary">
              {inflowNow === null ? "-" : inflowNow.toLocaleString("ko-KR")}
              <span className="ml-0.5 text-sm font-medium">건</span>
            </span>
              {/* 늘었다는 사실에 색을 입히지 않는다. 몇 건부터, 또는 몇 배부터 위험인지 정한 기준이
                  없어서 색을 입히면 늘어난 모든 구간이 경고가 된다. 방향 표시만으로 늘고 줄은 것은
                  읽히고, 기준이 정해지면 그때 색과 아이콘을 함께 붙인다.

                  견줄 구간을 만들 수 없는 때가 있다. 기간을 직접 선택하면서 한쪽만 채운 동안이
                  그렇고, 그때는 이 표시가 서지 않는다. */}
          </div>

          {/* 기한 안에 답변이 나간 비율이다. 판정이 끝난 건만 세므로 아직 기한이 남은 미답변 건은
              값을 깎지 않는다. 기준일은 지연과 같은 값이라 둘이 같은 약속을 말한다. 전환된 건은
              답변을 지원요청에서 하므로 세지 않는다. */}
          <div className="flex min-w-18 flex-col gap-0.5">
            <span
              className="text-xs text-oe-foreground-tertiary"
              title={`접수 후 ${OVERDUE_DAYS}일 안에 답변한 비율. 기한이 남은 미답변 건은 세지 않습니다.`}
            >
              기한 내 답변률
            </span>
            <span className="text-xl font-semibold text-oe-foreground-primary">
              {answerRate === null ? "-" : answerRate.toFixed(1)}
              <span className="ml-0.5 text-sm font-medium">%</span>
            </span>
          </div>

          {/* 기한을 넘긴 건은 값에 색을 입힌다. 이 화면의 다른 숫자에 색을 쓰지 않은 이유가 몇부터
              문제인지 정한 것이 없다는 것이었는데, 이 값은 그 기준 자체다. 표에서 빨갛게 서는 경과와
              같은 기준을 쓰므로 둘이 같은 것을 말한다. 넘긴 건이 없으면 색도 없다. 0건에 빨강을
              두면 색이 값을 말하는 것이 아니라 그 자리의 배경이 된다. */}
          {/* 지연은 읽고 끝나는 값이 아니라 그 건들을 보러 가는 길이다. 눌러서 목록을 그 건들만
              남기고, 다시 누르면 되돌린다. 왼쪽 패널에 축으로 두지 않은 까닭은 고를 값이 없고
              켜고 끄는 것뿐이며, 그 숫자를 본 자리에서 바로 거르는 것이 이 조건을 쓰는 유일한
              길이기 때문이다. 조회를 거치지 않는 것도 목록 위 줄의 조작들과 같다.

              정의를 라벨에 다 담으면 어느 쪽으로 써도 길어진다. 접수 기준이면 「접수 5일 초과」,
              미답변으로 넓히면 「미답변 5일 초과」다. 두 글자로 줄이고 기준은 포인터를 얹을 때
              말한다. 같은 건의 경과가 표에서 빨갛게 서 있어 화면 안에서 뜻이 이어진다. */}
          <button
            type="button"
            // 지연을 켜면 답변 여부도 미답변으로 함께 맞춘다. 지연은 접수 상태의 건이므로 답변이
            // 나가지 않은 건에 속하는데, 그 축이 비어 있으면 왼쪽 패널은 아무 조건도 걸리지 않은
            // 모습이라 목록이 왜 줄었는지 패널에서 읽히지 않는다. 끌 때는 함께 되돌린다.
            onClick={() =>
              onFilterChange(
                filter.overdueOnly ? { overdueOnly: false, answered: [] } : { overdueOnly: true, answered: ["no"] },
              )
            }
            aria-pressed={filter.overdueOnly}
            title={`접수 상태로 ${OVERDUE_DAYS}일을 넘긴 건${filter.overdueOnly ? "만 보고 있습니다. 다시 누르면 조건을 풉니다." : "만 봅니다."}`}
            className={`flex min-w-18 cursor-pointer flex-col items-start gap-0.5 rounded-oe-control px-2 py-1 text-left outline-none transition-colors -mx-2 -my-1 focus-visible:ring-2 focus-visible:ring-oe-focus-ring ${
              filter.overdueOnly ? "bg-oe-danger-background-primary" : "hover:bg-oe-interaction-hover-subtle"
            }`}
          >
            <span className="text-xs text-oe-foreground-tertiary">지연</span>
            <span
              className={`text-xl font-semibold ${
                overdueCount > 0 ? "text-oe-danger-foreground-secondary" : "text-oe-foreground-primary"
              }`}
            >
              {overdueCount.toLocaleString("ko-KR")}
              <span className="ml-0.5 text-sm font-medium">건</span>
            </span>
          </button>

          {/* 견준 결과는 세 칸 아래에 한 줄로 깔린다. 유입 칸 안에 두면 이 문장이 그 칸의 폭을
              정하게 되어, 조건을 걸어 건수나 견줄 구간 이름이 바뀔 때마다 카드 전체의 폭이
              움직인다. 세 칸에 걸쳐 두면 문장이 길어져도 칸 폭은 그대로다.

              자리는 유입 칸 아래 그대로이므로 무엇을 견준 값인지는 위치가 말한다. 지난 구간의
              건수는 적지 않는다. 늘고 줄은 양이 이미 건수로 적혀 있어서 둘을 함께 두면 같은 자리에
              건수가 두 번 선다. */}
          {inflowDelta === null ? null : (
            <span className="col-span-3 text-xs text-oe-foreground-tertiary">
              {previousPeriodName(filter)} 대비{" "}
              {inflowDelta === 0 ? "같음" : `${Math.abs(inflowDelta).toLocaleString("ko-KR")}건 ${inflowDelta > 0 ? "▲" : "▼"}`}
            </span>
          )}
        </div>
        </div>
      </div>

      {/* 표 위 줄이다. 왼쪽은 조건을 건 결과가 몇 건인지 말하고, 오른쪽은 그 목록을 다루는
          조작이 선다. 검색은 왼쪽 패널의 조건들과 달리 목록의 범위를 정하는 것이 아니라 그
          안에서 한 건을 집어내는 자리라 결과 바로 위에 둔다.

          이 줄과 표와 아래 페이지 줄을 테두리로 묶지 않는다. 카드는 한 화면에 여러 덩어리가
          있을 때 그 경계를 말하는 것인데, 목록 영역에 있는 덩어리는 이것 하나뿐이라 테두리가
          구분할 대상이 없다. 좌우 여백도 두지 않아 이 줄의 양 끝이 표를 두른 선과 맞는다.

          줄 높이는 필터 패널의 머리줄과 같은 36px 을 최소로 잡는다. 두 줄이 같은 높이로 같은
          자리에서 시작하면 「필터·조회」와 「전체 N건·엑셀 다운로드」가 한 선에 놓인다. 좁아져
          줄이 넘어갈 때만 늘어난다. */}
      <div className="mb-3 flex min-h-9 flex-wrap items-center gap-1">
        {/* 조건을 건 결과가 몇 건인지 말한다. 표 아래의 「1–10」 은 그중 지금 어디를 보고
            있는지를 말하므로 둘이 겹치지 않는다. */}
        {/* 조건을 걸 때마다 바뀌는 것은 숫자 하나뿐이다. 그 숫자만 브랜드 색으로 두면 눈이
            「전체」와 「건」을 다시 읽지 않고 바뀐 값에 바로 닿는다. */}
        <span className="text-lg font-semibold text-oe-foreground-primary">
          {/* 이 숫자에는 자릿수 고정 폭을 쓰지 않는다. 줄마다 세로로 맞출 이웃이 없는 한 번뿐인
              값이라, 숫자가 자기 글자 폭만큼 차지해도 어긋나 보일 자리가 없다. */}
          전체 <span className="text-oe-brand-foreground-primary">{rows.length}</span>건
        </span>
        {/* 조건 패널을 여닫는 조작이 건수 바로 뒤에 선다. 그 숫자가 어떤 조건으로 나온 것인지
            되짚는 길이라 인과가 붙어 읽히고, 앞에 선 것이 건수 하나뿐이라 자리도 자릿수만큼만
            움직인다. 오른쪽 끝에 두면 자리는 고정되지만 결과를 다루는 묶음 뒤에 화면의 틀을
            다루는 것이 붙어 성격이 섞인다.

            전환된 건이 몇 건 섞였는지는 적지 않는다. 담았다는 사실은 체크박스의 켜짐이 이미
            말하고, 건수 옆의 글이 조건에 따라 생기고 사라지면 그 자리가 흔들린다. */}
        {afterCount}
        {/* 치고 누르는 것은 오른쪽에 모은다. 표 아래 줄도 왼쪽이 상태, 오른쪽이 조작이라
            위아래가 같은 규칙으로 읽힌다. */}
        <span className="flex flex-1 items-center justify-end gap-1.5">
          {/* 지원요청으로 옮겨진 건은 기본적으로 목록에서 빠진다. 여기서 더 볼 것이 없는 건이
              쌓여 목록을 채우기 때문이다. 대신 이 자리에서 함께 담아 볼 수 있게 두었다.

              왼쪽 패널의 조건들과 달리 조회를 거치지 않는다. 무엇을 조건으로 고를지가 아니라
              걸러 낸 목록에 전환된 건까지 담을지 정하는 조작이라 층이 다르다. */}
          {/* 「보기」가 아니라 「포함」인 것은 전환된 건만 골라 보는 조작이 아니라 목록에 함께
              담는 조작이기 때문이다. 「지원요청」을 떼어도 뜻이 남는 것은 처리상태 열에 「지원요청
              전환」이 서 있어 이 목록에서 전환 건이 무엇인지 화면이 이미 말해 주기 때문이다. */}
          <CheckboxField
            label="전환 건 포함"
            checked={filter.showMoved}
            onCheckedChange={(checked) => onFilterChange({ showMoved: checked === true })}
          />
          {/* 제목만 찾는다. 점포는 왼쪽 패널에 전용 축이 있어 그쪽에서 고르고, 검색은 목록 안에서
              한 건을 제목으로 집어내는 자리다. */}
          <Input
            variant="filled"
            controlSize="small"
            layout="fixed"
            fixedWidth="16rem"
            aria-label="제목 검색"
            placeholder="제목 검색"
            leadingElement={<RiSearchLine />}
            clearable
            value={filter.keyword}
            onChange={(event) => onFilterChange({ keyword: event.target.value })}
            onClear={() => onFilterChange({ keyword: "" })}
          />
          <Button variant="fill" tone="custom" color="excel" controlSize="small" leadingIcon={<RiDownloadLine />}>
            엑셀 다운로드
          </Button>
        </span>
      </div>

      {/* 표만 선으로 한 번 두른다. 위아래 줄까지 함께 묶으면 목록 영역에 덩어리가 하나뿐인데도
          경계가 생기는데, 표는 안에서 줄과 칸을 선으로 나누므로 그 선들이 어디까지의 것인지
          말해 주는 바깥 선이 필요하다. 모서리는 필터 패널의 상자와 같은 `oe-control` 값을
          쓴다. */}
      <div className="overflow-hidden rounded-oe-control border border-oe-border-secondary">
        <Table>
          <TableHead>
            <TableRow>
              {/* 폭은 그 열에 들어올 수 있는 가장 긴 값을 기준으로 정한다. 제목도 폭을
                  갖는다. 열이 여덟이라 폭을 두지 않으면 남는 자리가 60px 남짓이고, 정작 무슨
                  건인지 말하는 열이 가장 좁아진다.

                  아홉 열을 더한 값은 1044px 이며 1600px 창의 목록 영역 안에 든다. 합이 영역보다
                  넓으면 마지막 열이 잘려서 오른쪽에 여백이 없는 것처럼 보인다. 표는 영역 폭을
                  채우므로 남는 자리는 열들이 비율대로 나눠 갖는다. */}
              {/* 무슨 건인지 말하는 카테고리와 제목이 앞에 서고, 누가 올렸는지 말하는 점포명과
                  담당SV가 그 뒤를 잇는다. 목록을 훑는 사람이 찾는 것은 어느 점포의 건인지가
                  아니라 무슨 건인지다. 카테고리를 제목 앞에 두는 것은 값이 여섯뿐이라 제목을
                  읽기 전에 종류가 먼저 잡히고, 폭이 고정된 짧은 값들이 왼쪽에 모여 표의 왼쪽
                  축이 흔들리지 않기 때문이다. */}
              {/* 고르는 열은 맨 앞에 둔다. 폭은 체크박스 20px 에 칸 여백만 더한 값이다. */}
              <TableHeaderCell width={44}>
                <Checkbox
                  aria-label="이 페이지 전체 선택"
                  checked={allHere}
                  indeterminate={pickedHere.length > 0 && !allHere}
                  onCheckedChange={(checked) =>
                    changePicked((previous) =>
                      checked
                        ? Array.from(new Set([...previous, ...pageNumbers]))
                        : previous.filter((no) => !pageNumbers.includes(no)),
                    )
                  }
                />
              </TableHeaderCell>
              <TableHeaderCell width={52}>NO</TableHeaderCell>
              <TableHeaderCell align="start" width={128}>카테고리</TableHeaderCell>
              {/* 첨부는 열을 두지 않고 제목 뒤의 아이콘으로 알린다. 그만큼 제목이 넓다. */}
              <TableHeaderCell align="start" width={264}>제목</TableHeaderCell>
              <TableHeaderCell align="start" width={124}>점포명</TableHeaderCell>
              <TableHeaderCell align="start" width={72}>담당SV</TableHeaderCell>
              <TableHeaderCell width={104}>처리상태</TableHeaderCell>
              {/* 날짜 두 열은 날짜 글자 폭에 칸 여백만 더해 둔다. 등록일은 지원요청에서
                  전환되어 들어온 건을 알리는 표시 자리를 날짜 뒤에 함께 가지므로 그만큼 넓다. */}
              <TableHeaderCell
                width={148}
                sort={sort.key === "createdAt" ? sort.direction : null}
                onSort={() => changeSort("createdAt")}
              >
                등록일
              </TableHeaderCell>
              <TableHeaderCell
                width={108}
                sort={sort.key === "answeredAt" ? sort.direction : null}
                onSort={() => changeSort("answeredAt")}
              >
                답변일
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((voice) => (
              <TableRow key={voice.no} interactive muted={Boolean(voice.movedTo)} selected={picked.includes(voice.no)}>
                {/* 줄을 누르면 상세로 가므로, 고르는 칸에서는 그 길로 번지지 않게 막는다. */}
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    aria-label={`${voice.no}번 선택`}
                    disabled={Boolean(voice.movedTo)}
                    checked={picked.includes(voice.no)}
                    onCheckedChange={(checked) =>
                      changePicked((previous) =>
                        checked ? [...previous, voice.no] : previous.filter((no) => no !== voice.no),
                      )
                    }
                  />
                </TableCell>
                <TableCell className="tabular-nums">{voice.no}</TableCell>
                {/* 운영자가 설정하는 값이라 badge로 묶지 않고 값만 글자로 둔다. badge는
                    덧붙는 표시인데 이 열은 모든 줄에 값이 있어, 열 전체를 두르면 정작 구별해야
                    하는 처리상태의 tone 이 함께 묻힌다. */}
                <TableCell align="start" className="truncate">{voice.category}</TableCell>
                {/* 제목만 길이가 제각각이라 왼쪽에 붙인다. */}
                <TableCell align="start">
                  {/* 제목 뒤에 붙는 표시들은 제목이 길어 말줄임될 때도 남아야 하므로, 말줄임은
                      제목 글자에만 걸고 뒤의 표시들은 줄이지 않는다. */}
                  <span className="flex items-center gap-1">
                    {/* 한 줄에서 무슨 건인지 말하는 값은 제목 하나뿐이라, 나머지 열과 같은 무게로
                        두면 번호와 날짜 사이에 묻힌다. 무게만 한 단계 올려 제목 열이 먼저 읽히게
                        한다.

                        밑줄은 줄에 포인터를 얹었을 때만 선다. 항상 두면 열 전체에 선이 반복되어
                        눈에 띄게 하려던 효과가 사라지고, 누르는 단위가 제목 글자인 것처럼 읽힌다.
                        실제로 누르는 것은 줄 전체다.

                        전환된 건은 그 밑줄을 두지 않는다. 그 줄에서 이어서 볼 것은 옮겨 간 지원
                        요청이고 밑줄이 서는 것도 그 번호 하나여야 한다. 둘이 함께 서면 포인터를
                        얹었을 때 어느 쪽으로 가는 길인지 갈리지 않는다. */}
                    <span
                      className={`min-w-0 truncate font-medium underline-offset-2${voice.movedTo ? "" : " group-hover:underline"}`}
                    >
                      {voice.title}
                    </span>
                    {/* 첨부는 있는 건에만 붙는다. 없는 건이 대부분이라 자리를 비워 두면 제목 뒤에
                        빈 칸만 늘어난다. 등록일의 전환 표시와 달리 이 열은 왼쪽 정렬이라, 표시가
                        붙고 말고에 따라 앞의 글자가 움직이지도 않는다. */}
                    {voice.attached ? (
                      <RiAttachmentLine
                        className="size-oe-icon-small shrink-0 text-oe-foreground-tertiary"
                        role="img"
                        aria-label="첨부 있음"
                      />
                    ) : null}
                    {/* 이 건이 어느 지원요청으로 갔는지 말한다. 앞에 구분점을 두지 않는다.
                        화살표가 이미 제목과 이 표시를 갈라 놓는다.

                        밑줄은 제목과 같이 줄에 포인터를 얹었을 때만 서고, 지원요청 번호에만 그어
                        그 지원요청으로 가는 길임을 밝힌다. 화살표는 가리키는 방향을 말하는 기호이고
                        누르는 대상이 아니라 밑줄 밖에 남긴다.

                        포인터를 얹으면 글자도 한 단계 진해진다. 밑줄은 글자색을 그대로 따르므로,
                        옅은 글자 아래에 선만 생기면 선이 글자보다 또렷해 보여 둘의 무게가 어긋난다. */}
                    {voice.movedTo ? (
                      <span className="shrink-0 text-xs text-oe-foreground-tertiary">
                        →{" "}
                        <span className="underline-offset-2 group-hover:text-oe-foreground-secondary group-hover:underline">
                          지원요청 {voice.movedTo}
                        </span>
                      </span>
                    ) : null}
                  </span>
                </TableCell>
                {/* 글자 수가 제각각인 값은 왼쪽에 붙인다. 가운데로 두면 줄마다 시작점이
                    달라져 눈이 매번 글자 앞을 다시 찾는다. */}
                <TableCell align="start" className="truncate">{voice.store}</TableCell>
                <TableCell align="start">
                  {voice.sv}
                  <span className="block text-xs text-oe-foreground-tertiary">{teamOf(voice.sv)}</span>
                </TableCell>
                {/* 전환된 건은 처리상태 자리를 전환이 대신한다. 접수 옆에 전환 표시를 더하면
                    badge 가 둘이 되는데, 담당자가 이 칸에서 알아야 하는 것은 「여기서 처리할 일이
                    아니다」 하나다. */}
                <TableCell>
                  <Badge tone={statusOf(voice).tone}>{statusOf(voice).label}</Badge>
                </TableCell>
                {/* 날짜와 시각을 두 줄로 나눈다. 한 줄로 두면 이 두 열만 146px 을 쓰고 정작
                    무슨 건인지 말하는 제목이 그만큼 좁아진다. */}
                <TableCell className="tabular-nums">
                  {/* 어떻게 들어온 건인지는 열을 따로 두지 않고 등록일 뒤의 표시 하나로 말한다.
                      값이 둘뿐이고 그중 하나가 대부분이라, 열로 두면 같은 글자가 모든 줄에
                      반복되면서 제목이 쓸 폭만 가져간다.

                      표시가 없는 줄도 자리는 남겨 둔다. 있는 줄만 자리를 차지하면 그 줄의 날짜만
                      옆으로 밀려서, 줄마다 날짜 시작점이 달라진다. */}
                  <span className="inline-flex items-center gap-1">
                    {/* 오른쪽 표시 자리와 같은 자리를 왼쪽에도 비워 둔다. 한쪽만 자리를 가지면
                        날짜가 그만큼 왼쪽으로 밀려서, 칸 가운데에 서는 아래 줄의 시각과 중심이
                        어긋난다. */}
                    <span aria-hidden="true" className="size-oe-icon-small shrink-0" />
                    {voice.createdAt.slice(0, 10)}
                    <span className="inline-flex size-oe-icon-small shrink-0 items-center justify-center text-oe-foreground-tertiary">
                      {voice.source === "request_transfer" ? (
                        <RiCornerDownRightLine className="size-oe-icon-small" role="img" aria-label="지원요청에서 전환된 건" />
                      ) : null}
                    </span>
                  </span>
                  {/* 아랫줄은 시각과 경과다. 날짜만 보면 며칠 지난 건인지 세어 봐야 하는데, 미답변
                      건을 훑을 때 필요한 것은 그 셈의 결과다.

                      경과는 아직 손에 남은 건에만 붙는다. 처리완료와 전환된 건은 여기서 더 할 일이
                      없어 며칠이 지났는지가 판단에 쓰이지 않고, 모든 줄에 경과가 서 있으면 정작
                      오래 묵은 미처리 건이 그 안에 묻힌다. 시각은 어느 줄에나 남는다. */}
                  <span className="block h-4 text-xs text-oe-foreground-tertiary">
                    {voice.createdAt.slice(11)}
                    {/* 접수 상태로 닷새를 넘긴 건은 경과의 색만 danger 로 바뀐다. 글자 두께는
                        건드리지 않는다. 색과 두께를 함께 바꾸면 같은 것을 두 번 말하면서 그 줄만
                        글자 폭이 달라져 옆 줄과 어긋난다.

                        색이 아니라 날수가 정보이고 색은 그 날수를 먼저 찾게 하는 표시이므로, 색을
                        못 가리는 사람에게도 같은 것이 읽힌다. 시각과 날짜는 색을 그대로 둔다. */}
                    {voice.movedTo || voice.status === "done" ? null : (
                      <>
                        {" · "}
                        <span className={isOverdue(voice) ? "text-oe-danger-foreground-secondary" : undefined}>
                          {elapsedLabel(voice.createdAt)}
                        </span>
                      </>
                    )}
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">
                  {voice.answeredAt ? (
                    <>
                      {voice.answeredAt.slice(0, 10)}
                      <span className="block text-xs text-oe-foreground-tertiary">{voice.answeredAt.slice(11)}</span>
                    </>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
            {shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-oe-foreground-tertiary">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {/* 표 아래 한 줄을 좌우로 가른다. 왼쪽은 지금 무엇을 얼마씩 보고 있는지 말하는 자리이고
          오른쪽은 어디로 갈지 누르는 자리다. 양 끝에 서면 선을 따로 두지 않아도 둘이 갈린다.
          표를 두른 선이 이 줄의 위쪽을 이미 긋고 있으므로 따로 선을 두지 않는다. */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-sm text-oe-foreground-secondary">
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              {rows.length === 0 ? "0건" : `${start + 1}–${start + shown.length}번째`}
            </span>

            {/* 보고 있는 범위와 한 페이지에 둘 줄 수는 성격이 다르다. 앞은 지금 상태를 말하고
                뒤는 고치는 것이므로, 옅은 선으로 한 번 끊어 둔다. */}
            <span className="h-4 w-px bg-oe-border-secondary" aria-hidden="true" />

            <span className="flex items-center gap-1.5">
              페이지당
              <Select
                ariaLabel="페이지당 표시 개수"
                controlSize="small"
                layout="fixed"
                fixedWidth="4.75rem"
                options={PAGE_SIZES}
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value ?? 10));
                  setPage(1);
                }}
              />
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* 지금 어디에 있는지는 글로 말한다. 번호를 늘어놓으면 보이는 칸 수가 페이지마다
                달라져 옆의 버튼이 움직인다. 글도 자릿수가 늘면 밀어내므로 최소 폭을 잡아 둔다. */}
            <span className="min-w-20 text-right tabular-nums">
              {current} / {lastPage} 페이지
            </span>

            <Pagination page={current} lastPage={lastPage} onChange={goTo} />

            {/* 페이지가 많아지면 번호를 눌러 옮기는 것보다 쳐서 가는 편이 빠르다. 숫자만 받고,
                엔터를 치거나 칸을 벗어날 때 옮긴다. 비워 두면 지금 페이지가 자리 표시로 보인다. */}
            <span className="flex items-center gap-1.5">
              <Input
                controlSize="small"
                layout="fixed"
                fixedWidth="3.5rem"
                textAlign="right"
                aria-label="페이지 바로 이동"
                inputMode="numeric"
                placeholder={String(current)}
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") jumpToTypedPage();
                }}
                onBlur={jumpToTypedPage}
              />
              페이지로 이동
            </span>
          </div>
      </div>
    </div>
  );
}
