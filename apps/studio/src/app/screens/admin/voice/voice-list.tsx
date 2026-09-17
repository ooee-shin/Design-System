"use client";

/**
 * 점주의 소리 목록의 결과 영역이다. 표와 그 위아래 줄을 갖는다.
 *
 * 필터를 어디에 세울지 두 안을 보고 있으므로, 안이 달라도 같아야 하는 이쪽을 한 곳에 두었다.
 * 「전환된 건 표시」만 여기에 있는데, 목록에 무엇까지 담을지 정하는 조작이라 빠진 건수를 말하는
 * 글 바로 옆이 그 자리이기 때문이다.
 */

import { useMemo, useState } from "react";

import { RiDownloadLine, RiSearchLine } from "@remixicon/react";

import { Badge, Button, Input, Select } from "@ooee/ui";

import { Pagination } from "@/components/candidates/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/candidates/table";

import { SOURCE, STATUS, VOICES, matches, teamOf, type Filter } from "./voice-data";

const PAGE_SIZES = [10, 25, 50, 100].map((size) => ({ value: String(size), label: String(size) }));

export function VoiceList({
  filter,
  onFilterChange,
  leading,
  trailing,
}: {
  filter: Filter;
  onFilterChange: (patch: Partial<Filter>) => void;
  /** 건수 줄 맨 앞에 설 것. 조건 패널을 여닫는 버튼처럼 그 안을 쓰는 화면만 갖는 조작이다. */
  leading?: React.ReactNode;
  /** 건수 줄 오른쪽, 엑셀 다운로드 앞에 설 것. */
  trailing?: React.ReactNode;
}) {
  const rows = useMemo(() => VOICES.filter((voice) => matches(voice, filter)), [filter]);
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
  const [pageInput, setPageInput] = useState("");
  const jumpToTypedPage = () => {
    if (pageInput) goTo(Number(pageInput));
    setPageInput("");
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* 표 위 줄이다. 왼쪽은 조건을 건 결과가 몇 건인지 말하고, 오른쪽은 그 목록을 다루는
          조작이 선다. 검색은 왼쪽 패널의 조건들과 달리 목록의 범위를 정하는 것이 아니라 그
          안에서 한 건을 집어내는 자리라 결과 바로 위에 둔다. */}
      <div className="flex flex-wrap items-center gap-3 rounded-t-lg border border-b-0 border-oe-border-secondary bg-oe-background-primary px-4 py-3">
        {leading}
        {/* 조건을 건 결과가 몇 건인지 말한다. 표 아래의 「1–10」 은 그중 지금 어디를 보고
            있는지를 말하므로 둘이 겹치지 않는다. */}
        <span className="text-sm font-semibold text-oe-foreground-primary tabular-nums">
          전체 {rows.length}건
        </span>
        {/* 치고 누르는 것은 오른쪽에 모은다. 표 아래 줄도 왼쪽이 상태, 오른쪽이 조작이라
            위아래가 같은 규칙으로 읽힌다. */}
        <span className="flex flex-1 items-center justify-end gap-2">
          {trailing}
          <Input
            controlSize="small"
            layout="fixed"
            fixedWidth="16rem"
            aria-label="점포명·제목 검색"
            placeholder="점포명이나 제목으로 찾기"
            leadingElement={<RiSearchLine />}
            clearable
            value={filter.keyword}
            onChange={(event) => onFilterChange({ keyword: event.target.value })}
            onClear={() => onFilterChange({ keyword: "" })}
          />
          <Button variant="outline" tone="custom" color="excel" controlSize="small" leadingIcon={<RiDownloadLine />}>
            엑셀 다운로드
          </Button>
        </span>
      </div>

      <div className="overflow-hidden rounded-b-lg border border-oe-border-secondary bg-oe-background-primary">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>NO</TableHeaderCell>
              <TableHeaderCell>점포명</TableHeaderCell>
              <TableHeaderCell>담당SV</TableHeaderCell>
              <TableHeaderCell>카테고리</TableHeaderCell>
              <TableHeaderCell align="start">제목</TableHeaderCell>
              <TableHeaderCell>첨부</TableHeaderCell>
              <TableHeaderCell>처리상태</TableHeaderCell>
              <TableHeaderCell>유입 경로</TableHeaderCell>
              <TableHeaderCell>등록일</TableHeaderCell>
              <TableHeaderCell>답변일</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((voice) => (
              <TableRow key={voice.no} interactive muted={Boolean(voice.movedTo)}>
                <TableCell className="tabular-nums">{voice.no}</TableCell>
                <TableCell>{voice.store}</TableCell>
                <TableCell>
                  {voice.sv}
                  <span className="block text-xs text-oe-foreground-tertiary">{teamOf(voice.sv)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outlined">{voice.category}</Badge>
                </TableCell>
                {/* 제목만 길이가 제각각이라 왼쪽에 붙이고, 이 열이 남는 폭을 가져간다. */}
                <TableCell align="start" className="w-full max-w-0 truncate">
                  {voice.title}
                  {voice.movedTo ? (
                    <span className="ml-1.5 text-xs text-oe-foreground-tertiary">→ 지원요청 {voice.movedTo}</span>
                  ) : null}
                </TableCell>
                <TableCell>{voice.attached ? "Y" : "N"}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1">
                    <Badge tone={STATUS[voice.status].tone}>{STATUS[voice.status].label}</Badge>
                    {voice.movedTo ? <Badge tone="warning">전환</Badge> : null}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-oe-foreground-tertiary">{SOURCE[voice.source]}</TableCell>
                <TableCell className="tabular-nums">{voice.createdAt}</TableCell>
                <TableCell className="tabular-nums">{voice.answeredAt ?? "-"}</TableCell>
              </TableRow>
            ))}
            {shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-10 text-oe-foreground-tertiary">
                  조건에 맞는 건이 없습니다.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        {/* 표 아래 한 줄을 좌우로 가른다. 왼쪽은 지금 무엇을 얼마씩 보고 있는지 말하는 자리이고
          오른쪽은 어디로 갈지 누르는 자리다. 양 끝에 서면 선을 따로 두지 않아도 둘이 갈린다. */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-oe-border-secondary px-4 py-3 text-sm text-oe-foreground-secondary">
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
    </div>
  );
}
