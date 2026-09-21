"use client";

import { useState, type ReactNode } from "react";

import { Calendar } from "@ooee/ui";
import { OnThisPage } from "@/components/component-detail-navigation";
import { GuidelineTitle } from "@/components/guideline-title";

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

type Mode = "single" | "range" | "multiple";

export function CalendarWorkbench() {
  const [mode, setMode] = useState<Mode>("single");
  const [showOutsideDays, setShowOutsideDays] = useState(true);
  const [blockWeekend, setBlockWeekend] = useState(false);
  const [blockPast, setBlockPast] = useState(false);

  // 주말은 0(일)과 6(토)이다. 지난 날은 고정한 달의 중간을 기준으로 삼아 화면이 날마다 달라지지 않게 한다.
  const disabled = [
    ...(blockWeekend ? [{ dayOfWeek: [0, 6] }] : []),
    ...(blockPast ? [{ before: DAY }] : []),
  ];
  const shared = {
    defaultMonth: MONTH,
    showOutsideDays,
    disabled: disabled.length ? disabled : undefined,
  };

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <Section
          id="playground"
          title="🚩 Playground"
          description="확정된 고르는 방식과 고를 수 없는 날을 조합하여 실제 동작에서 확인합니다."
        >
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[1000px]:grid-cols-[minmax(18rem,1fr)_minmax(20rem,0.8fr)]">
            <div className="flex min-h-52 h-full items-start justify-center rounded-xl bg-oe-background-primary p-5">
              {/* `mode` 마다 고른 값의 꼴이 달라 타입이 갈린다. 갈래를 나눠 넘긴다. */}
              {mode === "single" ? (
                <Calendar mode="single" {...shared} />
              ) : mode === "range" ? (
                <Calendar mode="range" {...shared} />
              ) : (
                <Calendar mode="multiple" {...shared} />
              )}
            </div>
            <div className="space-y-4">
              <ControlSection title="Selection">
                <ControlGroup label="Mode">
                  {(["single", "range", "multiple"] as const).map((value) => (
                    <ControlButton
                      key={value}
                      active={mode === value}
                      onClick={() => setMode(value)}
                    >
                      {capitalize(value)}
                    </ControlButton>
                  ))}
                </ControlGroup>
              </ControlSection>
              <ControlSection title="Days">
                <BooleanControl
                  label="Show outside days"
                  value={showOutsideDays}
                  onChange={setShowOutsideDays}
                />
                <BooleanControl
                  label="Block weekend"
                  value={blockWeekend}
                  onChange={setBlockWeekend}
                />
                <BooleanControl
                  label="Block past days"
                  value={blockPast}
                  onChange={setBlockPast}
                />
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section
          id="anatomy"
          title="Anatomy"
          description="달 이름과 좌우 이동이 한 줄에 서고, 그 아래에 요일 머리와 날짜 격자가 섭니다."
        >
          <PropertyGroup
            label="Caption"
            description="달 이름과 좌우 이동 단추가 한 줄에 섭니다."
          >
            <Calendar mode="single" defaultMonth={MONTH} selected={DAY} />
          </PropertyGroup>
          <PropertyGroup
            label="Weekdays · Week"
            description="요일 머리 아래로 한 주가 일곱 칸씩 섭니다. 주는 월요일에 시작합니다."
          >
            <Calendar mode="single" defaultMonth={MONTH} />
          </PropertyGroup>
        </Section>

        <Section
          id="state"
          title="State"
          description="고른 날은 Brand 배경, 기간의 안쪽은 옅은 배경으로 이어진 띠가 됩니다. 오늘은 안쪽 테두리로 표시해 고른 날과 겹쳐도 둘이 함께 읽힙니다."
        >
          <PropertyGroup label="Selected" description="하루를 고른 모습입니다.">
            <Calendar mode="single" defaultMonth={MONTH} selected={DAY} />
          </PropertyGroup>
          <PropertyGroup
            label="Range"
            description="기간의 안쪽은 모서리를 깎지 않아 이어진 띠로 읽힙니다."
          >
            <Calendar mode="range" defaultMonth={MONTH} selected={RANGE} />
          </PropertyGroup>
          <PropertyGroup
            label="Disabled"
            description="고를 수 없는 날은 감추지 않고 흐리게 두어 자리를 지킵니다."
          >
            <Calendar
              mode="single"
              defaultMonth={MONTH}
              disabled={{ dayOfWeek: [0, 6] }}
            />
          </PropertyGroup>
          <PropertyGroup
            label="Outside days"
            description="바깥 달의 날짜를 지우면 격자가 흔들려 주가 어긋나 보입니다."
          >
            <Calendar
              mode="single"
              defaultMonth={MONTH}
              showOutsideDays={false}
            />
          </PropertyGroup>
        </Section>

        <Section
          id="guidelines"
          title="Guidelines"
          description="확정한 사용 범위입니다. 자세한 근거는 컴포넌트 문서가 갖습니다."
        >
          <div className="col-span-full space-y-4">
            <div>
              <GuidelineTitle>주는 월요일에 시작한다</GuidelineTitle>
              <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">
                근무표와 급여가 월~일 기준으로 서므로 그 기준을 따릅니다.
                `react-day-picker` 의 기본값인 일요일 시작을 바꾼 자리입니다.
              </p>
            </div>
            <div>
              <GuidelineTitle>기간은 달력 하나로 고른다</GuidelineTitle>
              <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">
                시작일과 종료일을 달력 둘로 나누면 서로의 값을 몰라 종료일이
                시작일보다 앞선 상태를 사람이 직접 막아야 합니다.
              </p>
            </div>
            <div>
              <GuidelineTitle>고를 수 없는 날은 감추지 않는다</GuidelineTitle>
              <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">
                감추면 그 자리가 비어 격자가 흔들리고 주가 어긋나 보입니다.
                흐리게 두고 자리를 지킵니다.
              </p>
            </div>
            <div>
              <GuidelineTitle>
                날짜를 입력받는 자리는 Input Button 이다
              </GuidelineTitle>
              <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">
                Calendar 는 격자만 소유합니다. Popup 으로 띄울지 화면 안에
                펼칠지는 쓰는 쪽이 정하며, 둘을 잇는 것은 화면 코드입니다.
              </p>
            </div>
          </div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="calendar" />
    </div>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"
    >
      <h3 className="text-xl font-semibold text-oe-foreground-primary">
        {title}
      </h3>
      <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">
        {description}
      </p>
      <div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div>
    </section>
  );
}

function PropertyGroup({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-28 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4">
      <div>
        <p className="text-xs font-medium text-oe-foreground-primary">
          {label}
        </p>
        {description ? (
          <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function ControlSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-t border-oe-border-secondary pt-3 first:border-t-0 first:pt-0">
      <h4 className="text-sm font-semibold text-oe-foreground-primary">
        {title}
      </h4>
      {children}
    </section>
  );
}

function ControlButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${active ? "border-oe-foreground-primary bg-oe-background-bold-primary text-oe-foreground-inverse" : "border-oe-border-secondary bg-oe-background-primary text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}
    >
      {children}
    </button>
  );
}

function BooleanControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-medium text-oe-foreground-tertiary">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring/40 ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
