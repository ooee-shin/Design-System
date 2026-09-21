"use client";

import { useState, type ReactNode } from "react";

import { Calendar } from "@ooee/ui";
import { OnThisPage } from "@/components/component-detail-navigation";
import { GuidelineTitle } from "@/components/guideline-title";
import { PlaygroundChoice as Choice } from "@/components/playground-element-control";

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "state", label: "State" },
  { id: "guidelines", label: "Guidelines" },
];

// 오늘에 기대면 화면이 날마다 달라져 검수할 수 없다. 고정한 달을 쓴다.
const MONTH = new Date(2026, 8, 1);
const DAY = new Date(2026, 8, 16);
const RANGE = { from: new Date(2026, 8, 14), to: new Date(2026, 8, 18) };

const MODES = [
  { value: "single", label: "하루" },
  { value: "range", label: "기간" },
  { value: "multiple", label: "여러 날" },
] as const;

type Mode = (typeof MODES)[number]["value"];

function Panel({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 id={`${id}-title`} className="text-base font-semibold text-oe-foreground-primary">
          {title}
        </h3>
        <p className="text-sm leading-6 text-oe-foreground-secondary">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function CalendarWorkbench() {
  const [mode, setMode] = useState<Mode>("single");
  const [blockWeekend, setBlockWeekend] = useState(false);

  // 주말을 고를 수 없게 하는 조건이다. 0 이 일요일, 6 이 토요일이다.
  const disabled = blockWeekend ? { dayOfWeek: [0, 6] } : undefined;

  return (
    <div className="flex flex-col gap-10">
      <OnThisPage items={sections} componentKey="calendar" />

      <Panel
        id="playground"
        title="Playground"
        description="고르는 방식과 고를 수 없는 날을 조합해 봅니다. 날짜를 직접 눌러 동작을 확인합니다."
      >
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-[12rem] flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-oe-foreground-tertiary">고르는 방식</p>
              <div className="flex flex-wrap gap-1.5">
                {MODES.map((item) => (
                  <Choice key={item.value} active={mode === item.value} onClick={() => setMode(item.value)}>
                    {item.label}
                  </Choice>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-oe-foreground-tertiary">주말을 고를 수 없게</p>
              <div className="flex flex-wrap gap-1.5">
                <Choice active={!blockWeekend} onClick={() => setBlockWeekend(false)}>
                  끔
                </Choice>
                <Choice active={blockWeekend} onClick={() => setBlockWeekend(true)}>
                  켬
                </Choice>
              </div>
            </div>
          </div>

          {/* `mode` 마다 고른 값의 꼴이 달라 타입이 갈린다. 갈래를 나눠 넘긴다. */}
          {mode === "single" ? (
            <Calendar mode="single" defaultMonth={MONTH} disabled={disabled} />
          ) : mode === "range" ? (
            <Calendar mode="range" defaultMonth={MONTH} disabled={disabled} />
          ) : (
            <Calendar mode="multiple" defaultMonth={MONTH} disabled={disabled} />
          )}
        </div>
      </Panel>

      <Panel id="anatomy" title="Anatomy" description="달 이름과 좌우 이동이 한 줄에 서고, 그 아래에 요일 머리와 날짜 격자가 섭니다.">
        <Calendar mode="single" defaultMonth={MONTH} selected={DAY} />
      </Panel>

      <Panel
        id="state"
        title="State"
        description="고른 날은 Brand 배경, 기간의 안쪽은 옅은 배경으로 이어진 띠가 됩니다. 오늘은 안쪽 테두리로 표시해 고른 날과 겹쳐도 둘이 함께 읽힙니다."
      >
        <div className="flex flex-wrap items-start gap-4">
          {[
            { label: "하루를 고른 모습", node: <Calendar mode="single" defaultMonth={MONTH} selected={DAY} /> },
            { label: "기간을 고른 모습", node: <Calendar mode="range" defaultMonth={MONTH} selected={RANGE} /> },
            { label: "주말을 고를 수 없는 모습", node: <Calendar mode="single" defaultMonth={MONTH} disabled={{ dayOfWeek: [0, 6] }} /> },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-2">
              <p className="text-sm text-oe-foreground-secondary">{item.label}</p>
              {item.node}
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="guidelines" title="Guidelines" description="확정한 사용 범위입니다. 자세한 근거는 컴포넌트 문서가 갖습니다.">
        <div className="flex flex-col gap-3">
          <GuidelineTitle>주는 월요일에 시작한다</GuidelineTitle>
          <p className="text-sm leading-6 text-oe-foreground-secondary">
            근무표와 급여가 월~일 기준으로 서므로 그 기준을 따릅니다. `react-day-picker` 의 기본값인 일요일 시작을 바꾼 자리입니다.
          </p>

          <GuidelineTitle>기간은 달력 하나로 고른다</GuidelineTitle>
          <p className="text-sm leading-6 text-oe-foreground-secondary">
            시작일과 종료일을 달력 둘로 나누면 서로의 값을 몰라 종료일이 시작일보다 앞선 상태를 사람이 직접 막아야 합니다.
          </p>

          <GuidelineTitle>고를 수 없는 날은 감추지 않는다</GuidelineTitle>
          <p className="text-sm leading-6 text-oe-foreground-secondary">감추면 그 자리가 비어 격자가 흔들리고 주가 어긋나 보입니다. 흐리게 두고 자리를 지킵니다.</p>

          <GuidelineTitle>날짜를 입력받는 자리는 Input Button 이다</GuidelineTitle>
          <p className="text-sm leading-6 text-oe-foreground-secondary">
            Calendar 는 격자만 소유합니다. Popup 으로 띄울지 화면 안에 펼칠지는 쓰는 쪽이 정하며, 둘을 잇는 것은 화면 코드입니다.
          </p>
        </div>
      </Panel>
    </div>
  );
}
