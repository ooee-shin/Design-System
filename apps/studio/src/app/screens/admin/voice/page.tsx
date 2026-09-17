// 조건을 골라 목록을 거르는 일을 화면 안에서 하므로 클라이언트에서 그린다.
"use client";

/**
 * 관리자 웹의 점주의 소리 목록이다. 조건을 목록 위에 가로로 늘어놓는 안이다.
 *
 * 이 화면의 일은 둘이다. 어떤 건이 들어와 있는지 보이는 것과, 그중 실무 처리가 필요한 건을
 * 골라낼 수 있게 하는 것이다. 뒤쪽이 이 화면을 다시 만드는 이유다. 지금은 잘못 들어온 실무
 * 건을 지원요청으로 옮길 수단이 없어 답변으로 종결하거나 실무진이 다시 등록하고 있다.
 *
 * 조건을 어디에 세울지는 좌측에 세우는 안과 함께 보고 정한다. 목록에 담기는 것과 거르는 규칙은
 * `voice-data.ts`, 결과 쪽은 `voice-list.tsx` 가 갖고 이 파일은 조건을 보여 주는 방식만 갖는다.
 */

import { useState } from "react";

import { RiCloseLine } from "@remixicon/react";

import { Button, Input, MultiSelect, Select } from "@ooee/ui";

import { AdminLayout } from "@/components/candidates/admin-layout";
import { PageHeader } from "@/components/candidates/page-header";

import {
  CATEGORY_OPTIONS,
  CUSTOM,
  EMPTY_FILTER,
  PAGE_DESCRIPTION,
  PAGE_PATH,
  PERIOD_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  SUPERVISOR_OPTIONS,
  isFiltered,
  type Filter,
} from "./voice-data";
import { VoiceList } from "./voice-list";

export default function Page() {
  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
  const edit = (patch: Partial<Filter>) => setFilter((previous) => ({ ...previous, ...patch }));

  return (
    <AdminLayout>
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader path={PAGE_PATH} title="점주의 소리" description={PAGE_DESCRIPTION} />

        <div className="flex flex-1 flex-col gap-3 overflow-auto p-6">
          {/* 조건은 한 줄로 선다. 고르는 즉시 목록이 다시 서므로 검색 버튼을 두지 않는다.
              누를 것이 하나 줄고, 무엇을 고르면 몇 건이 남는지 바로 보인다.

              조건 위에 이름표를 따로 두지 않는다. 고르지 않은 상태의 값이 그 자리가 무엇을
              거르는지 이미 말하고, 고른 뒤에는 값 자체가 어느 축인지 알려 준다. 「물류 관련」이
              카테고리라는 것을 알려고 이름표를 읽어야 하는 사람은 없다. */}
          <div className="flex flex-wrap items-center gap-2">
            <Select ariaLabel="등록일" layout="fixed" fixedWidth="9rem" options={PERIOD_OPTIONS} value={filter.period} onValueChange={(value) => edit({ period: value ?? "12m" })} />
            {/* 직접 고를 때만 두 칸이 선다. 날짜를 고르는 공용 컴포넌트가 아직 없어 브라우저가
                주는 달력을 그대로 쓴다. */}
            {filter.period === CUSTOM ? (
              <span className="flex items-center gap-1.5">
                <Input type="date" layout="fixed" fixedWidth="9.5rem" aria-label="시작일" value={filter.from} onChange={(event) => edit({ from: event.target.value })} />
                <span className="text-sm text-oe-foreground-tertiary">~</span>
                <Input type="date" layout="fixed" fixedWidth="9.5rem" aria-label="종료일" value={filter.to} onChange={(event) => edit({ to: event.target.value })} />
              </span>
            ) : null}
            {/* 한 축에서 값을 여러 개 고를 수 있다. 고르지 않았을 때 보이는 글이 그 자리가
                무엇을 거르는지 말한다. */}
            <MultiSelect ariaLabel="처리상태" layout="fixed" fixedWidth="9rem" placeholder="전체 상태" options={STATUS_OPTIONS} value={filter.status} onValueChange={(value) => edit({ status: value })} />
            <MultiSelect ariaLabel="카테고리" layout="fixed" fixedWidth="11rem" placeholder="전체 카테고리" options={CATEGORY_OPTIONS} value={filter.category} onValueChange={(value) => edit({ category: value })} />
            <MultiSelect ariaLabel="담당SV" layout="fixed" fixedWidth="9.5rem" placeholder="전체 담당SV" options={SUPERVISOR_OPTIONS} value={filter.sv} onValueChange={(value) => edit({ sv: value })} />
            <MultiSelect ariaLabel="유입 경로" layout="fixed" fixedWidth="11rem" placeholder="전체 유입 경로" options={SOURCE_OPTIONS} value={filter.source} onValueChange={(value) => edit({ source: value })} />
            {/* 되돌릴 것이 있을 때만 선다. 아무것도 고르지 않은 화면에 초기화 버튼이 서 있으면
                무엇을 되돌리는 것인지 읽는 사람이 먼저 헤아려야 한다. */}
            {isFiltered(filter) ? (
              <Button
                variant="ghost"
                tone="neutral"
                leadingIcon={<RiCloseLine />}
                onClick={() => setFilter((previous) => ({ ...EMPTY_FILTER, showMoved: previous.showMoved }))}
              >
                초기화
              </Button>
            ) : null}
          </div>

          <VoiceList filter={filter} onFilterChange={edit} />
        </div>
      </div>
    </AdminLayout>
  );
}
