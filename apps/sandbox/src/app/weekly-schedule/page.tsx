"use client";

/*
 * 요청
 *
 * 스케줄 관리. 웹 태블릿 1194×834 가로 화면이다. 매장 관리자가 한 주의 근무표를 짜고 인건비를 미리 보는 자리다. 화면 위에는 매장 고르기와 주 고르기(예: 2026.09.21 ~ 09.27), 그리고 그 주의 합계가 한 줄로 선다 — 총 근무 시간, 가산이 붙은 시간, 예상 인건비 셋이다. 본문은 근무표다. 가로는 요일(월~일)이고 세로는 직원이다. 맨 왼쪽 칸에 직원 이름·고용형태(정직원·알바)·시급을 함께 보인다. 요일 머리에는 날짜를 함께 적고, 공휴일과 일요일은 다른 바탕색으로 구분하며 공휴일은 이름(예: 추석)을 함께 보인다. 각 칸에는 그 직원이 그날 일하는 시각(예: 09:00~18:00)과 시간 수를 보이고, 가산이 붙으면 배수 배지를 함께 단다. 쉬는 날은 빈 칸으로 둔다. 표 아래에 가산 규칙을 설명하는 줄을 둔다 — 연장근로 1.5배, 야간근로 1.5배, 휴일근로 8시간 이내 1.5배와 초과분 2배이고 근거는 근로기준법 제56조다. 이 배수는 상수로 두고 화면에서 그 값을 읽어 쓴다. 예상 인건비는 시급 곱하기 시간에 가산을 반영해 실제로 계산한다. 직원·근무·공휴일은 가짜 데이터를 화면에 박아 둔다. 5인 미만 사업장은 가산수당 의무가 없고 주말이 법정 휴일인지는 취업규칙이 정하는데, 그 두 가지를 이 화면이 다루지 않는다는 것을 판단이 필요한 것에 적어라.
 *
 * 정하지 않아 비워 둔 자리
 *
 * - 매장 목록과 주 목록. 매장·주를 바꾸면 불러올 근무표. 지금은 한 매장의 2026.09.21 ~ 09.27 근무만 박아 두었고
 *   매장을 바꿔도 표는 그대로다. 주를 바꾸면 요일 머리의 날짜와 공휴일만 바뀌고 근무는 비어 있다.
 * - 근무표를 짜는 동작(칸을 눌러 근무를 넣고 고치는 것)과 저장.
 * - 휴게시간 공제, 자정을 넘는 근무, 5인 미만 사업장, 취업규칙이 정하는 휴일.
 */

import { useState } from "react";

import { Badge, Field, Select } from "@ooee/ui";

import { cn } from "@/lib/utils";

/** 근로기준법 제56조의 가산 배수. 표 아래 설명 줄과 인건비 계산이 이 값을 함께 읽는다. */
const PREMIUM_RATES = {
  overtime: 1.5,
  night: 1.5,
  holiday: 1.5,
  holidayOver8h: 2,
} as const;

type PremiumKind = keyof typeof PREMIUM_RATES;

const PREMIUM_BADGE_LABELS: Record<PremiumKind, string> = {
  overtime: "연장",
  night: "야간",
  holiday: "휴일",
  holidayOver8h: "휴일",
};

const PREMIUM_ORDER: PremiumKind[] = ["overtime", "night", "holiday", "holidayOver8h"];

/** 하루 8시간을 넘으면 연장근로다(제50조·제53조). */
const DAILY_LIMIT_MINUTES = 8 * 60;
/** 한 주 40시간을 넘으면 연장근로다(제50조·제53조). */
const WEEKLY_LIMIT_MINUTES = 40 * 60;
/** 휴일근로는 8시간까지와 그 초과분의 배수가 다르다(제56조 제2항). */
const HOLIDAY_LIMIT_MINUTES = 8 * 60;
/** 22:00부터 다음 날 06:00까지가 야간근로다(제56조 제3항). */
const NIGHT_START_MINUTE = 22 * 60;
const NIGHT_END_MINUTE = 6 * 60;

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

const STORES = [
  { value: "gangnam-station", label: "강남역점" },
  { value: "yeoksam", label: "역삼점" },
  { value: "seolleung", label: "선릉점" },
];

const WEEK_STARTS = ["2026-09-14", "2026-09-21", "2026-09-28"];
const DEFAULT_WEEK_START = "2026-09-21";

const HOLIDAYS: Record<string, string> = {
  "2026-09-24": "추석 연휴",
  "2026-09-25": "추석",
  "2026-09-26": "추석 연휴",
  "2026-10-03": "개천절",
};

type EmploymentType = "정직원" | "알바";

/** 하루 안의 분. `end` 는 24:00 인 1440 까지 쓴다. */
type Shift = { start: number; end: number };

type Employee = {
  id: string;
  name: string;
  employmentType: EmploymentType;
  hourlyWage: number;
  /** 날짜(`YYYY-MM-DD`)별 근무. 없는 날은 쉬는 날이다. */
  shifts: Record<string, Shift>;
};

const at = (hour: number, minute = 0) => hour * 60 + minute;

const EMPLOYEES: Employee[] = [
  {
    id: "kim-seoyeon",
    name: "김서연",
    employmentType: "정직원",
    hourlyWage: 15000,
    shifts: {
      "2026-09-21": { start: at(9), end: at(18) },
      "2026-09-22": { start: at(9), end: at(18) },
      "2026-09-23": { start: at(9), end: at(18) },
      "2026-09-25": { start: at(10), end: at(20) },
    },
  },
  {
    id: "lee-junho",
    name: "이준호",
    employmentType: "정직원",
    hourlyWage: 13500,
    shifts: {
      "2026-09-21": { start: at(15), end: at(24) },
      "2026-09-22": { start: at(15), end: at(24) },
      "2026-09-26": { start: at(16), end: at(24) },
      "2026-09-27": { start: at(16), end: at(24) },
    },
  },
  {
    id: "park-jimin",
    name: "박지민",
    employmentType: "알바",
    hourlyWage: 10320,
    shifts: {
      "2026-09-21": { start: at(18), end: at(22) },
      "2026-09-22": { start: at(18), end: at(22) },
      "2026-09-23": { start: at(18), end: at(22) },
      "2026-09-24": { start: at(10), end: at(18) },
    },
  },
  {
    id: "choi-yuna",
    name: "최유나",
    employmentType: "알바",
    hourlyWage: 10500,
    shifts: {
      "2026-09-21": { start: at(10), end: at(15) },
      "2026-09-22": { start: at(10), end: at(15) },
      "2026-09-23": { start: at(10), end: at(15) },
      "2026-09-26": { start: at(10), end: at(16) },
      "2026-09-27": { start: at(10), end: at(16) },
    },
  },
  {
    id: "jung-haneul",
    name: "정하늘",
    employmentType: "알바",
    hourlyWage: 11000,
    shifts: {
      "2026-09-23": { start: at(15), end: at(22) },
      "2026-09-25": { start: at(10), end: at(18) },
      "2026-09-26": { start: at(10), end: at(18) },
    },
  },
  {
    id: "han-doyun",
    name: "한도윤",
    employmentType: "알바",
    hourlyWage: 10320,
    shifts: {
      "2026-09-21": { start: at(5), end: at(13) },
      "2026-09-22": { start: at(5), end: at(13) },
      "2026-09-23": { start: at(5), end: at(13) },
      "2026-09-27": { start: at(7), end: at(13) },
    },
  },
];

type Day = {
  iso: string;
  weekday: (typeof WEEKDAYS)[number];
  dateLabel: string;
  holidayName?: string;
  /** 공휴일이거나 일요일이다. 휴일근로 가산과 다른 바탕색이 이 값을 따른다. */
  isHoliday: boolean;
};

function parseIsoDate(iso: string) {
  const [year, month, date] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date));
}

const pad = (value: number) => String(value).padStart(2, "0");

function weekDays(weekStart: string): Day[] {
  const monday = parseIsoDate(weekStart);
  return WEEKDAYS.map((weekday, index) => {
    const day = new Date(monday);
    day.setUTCDate(monday.getUTCDate() + index);
    const iso = `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`;
    const holidayName = HOLIDAYS[iso];
    return {
      iso,
      weekday,
      dateLabel: `${pad(day.getUTCMonth() + 1)}.${pad(day.getUTCDate())}`,
      holidayName,
      isHoliday: Boolean(holidayName) || weekday === "일",
    };
  });
}

function weekLabel(weekStart: string) {
  const days = weekDays(weekStart);
  return `${weekStart.slice(0, 4)}.${days[0].dateLabel} ~ ${days[6].dateLabel}`;
}

const WEEK_OPTIONS = WEEK_STARTS.map((value) => ({ value, label: weekLabel(value) }));

type ShiftCost = {
  minutes: number;
  premiumMinutes: number;
  pay: number;
  premiums: PremiumKind[];
};

const isNightMinute = (minute: number) => minute >= NIGHT_START_MINUTE || minute < NIGHT_END_MINUTE;

/**
 * 한 직원의 한 주 근무를 1분씩 나눠 배수를 매긴다. 평일은 하루 8시간 또는 한 주 40시간을 넘은 분이 연장근로,
 * 휴일은 그날 8시간까지와 그 초과분이 서로 다른 휴일근로다. 휴일근로에는 연장근로를 겹치지 않고, 야간근로는
 * 어느 쪽에나 더한다.
 */
function costWeek(employee: Employee, days: Day[]) {
  const costs = new Map<string, ShiftCost>();
  let weeklyRegularMinutes = 0;

  for (const day of days) {
    const shift = employee.shifts[day.iso];
    if (!shift) continue;

    const premiums = new Set<PremiumKind>();
    let premiumMinutes = 0;
    let weightedMinutes = 0;

    for (let minute = shift.start, worked = 0; minute < shift.end; minute += 1, worked += 1) {
      let rate = 1;
      if (day.isHoliday) {
        const kind = worked < HOLIDAY_LIMIT_MINUTES ? "holiday" : "holidayOver8h";
        rate += PREMIUM_RATES[kind] - 1;
        premiums.add(kind);
      } else if (worked >= DAILY_LIMIT_MINUTES || weeklyRegularMinutes >= WEEKLY_LIMIT_MINUTES) {
        rate += PREMIUM_RATES.overtime - 1;
        premiums.add("overtime");
      } else {
        weeklyRegularMinutes += 1;
      }
      if (isNightMinute(minute)) {
        rate += PREMIUM_RATES.night - 1;
        premiums.add("night");
      }
      if (rate > 1) premiumMinutes += 1;
      weightedMinutes += rate;
    }

    costs.set(day.iso, {
      minutes: shift.end - shift.start,
      premiumMinutes,
      pay: (employee.hourlyWage * weightedMinutes) / 60,
      premiums: PREMIUM_ORDER.filter((kind) => premiums.has(kind)),
    });
  }

  return costs;
}

const numberFormat = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 });

const formatHours = (minutes: number) => `${numberFormat.format(minutes / 60)}시간`;
const formatWon = (amount: number) => `${numberFormat.format(Math.round(amount))}원`;
const formatRate = (rate: number) => `${numberFormat.format(rate)}배`;
const formatTime = (minute: number) => `${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`;

const PREMIUM_RULES = [
  `연장근로 ${formatRate(PREMIUM_RATES.overtime)}`,
  `야간근로 ${formatRate(PREMIUM_RATES.night)}`,
  `휴일근로 ${formatHours(HOLIDAY_LIMIT_MINUTES)} 이내 ${formatRate(PREMIUM_RATES.holiday)}, 초과분 ${formatRate(PREMIUM_RATES.holidayOver8h)}`,
  "근거 근로기준법 제56조",
].join(" · ");

export default function WeeklySchedulePage() {
  const [weekStart, setWeekStart] = useState(DEFAULT_WEEK_START);

  const days = weekDays(weekStart);
  const rows = EMPLOYEES.map((employee) => ({ employee, costs: costWeek(employee, days) }));
  const allCosts = rows.flatMap((row) => [...row.costs.values()]);
  const totalMinutes = allCosts.reduce((sum, cost) => sum + cost.minutes, 0);
  const premiumMinutes = allCosts.reduce((sum, cost) => sum + cost.premiumMinutes, 0);
  const totalPay = allCosts.reduce((sum, cost) => sum + cost.pay, 0);

  const summary = [
    { label: "총 근무 시간", value: formatHours(totalMinutes) },
    { label: "가산이 붙은 시간", value: formatHours(premiumMinutes) },
    { label: "예상 인건비", value: formatWon(totalPay) },
  ];

  return (
    <main className="flex min-h-dvh flex-col gap-6 bg-oe-background-primary px-oe-padding-default py-8 break-keep">
      <h1 className="text-2xl font-semibold text-oe-foreground-primary">스케줄 관리</h1>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex gap-3">
          <Field label="매장" className="w-44">
            <Select controlSize="large" options={STORES} defaultValue={STORES[0].value} />
          </Field>
          <Field label="주" className="w-56">
            <Select
              controlSize="large"
              options={WEEK_OPTIONS}
              value={weekStart}
              onValueChange={(value) => {
                if (value) setWeekStart(value);
              }}
            />
          </Field>
        </div>

        <dl aria-live="polite" className="flex gap-8">
          {summary.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <dt className="text-sm text-oe-foreground-secondary">{item.label}</dt>
              <dd className="text-xl font-semibold tabular-nums text-oe-foreground-primary">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="overflow-x-auto rounded-lg border border-oe-border-primary">
        <table className="w-full min-w-[960px] table-fixed divide-y divide-oe-border-secondary text-left">
          <caption className="sr-only">{weekLabel(weekStart)} 근무표</caption>
          <colgroup>
            <col className="w-40" />
            {days.map((day) => (
              <col key={day.iso} />
            ))}
          </colgroup>
          <thead>
            <tr className="divide-x divide-oe-border-secondary">
              <th scope="col" className="px-3 py-2 align-top text-sm font-medium text-oe-foreground-secondary">
                직원
              </th>
              {days.map((day) => (
                <th
                  key={day.iso}
                  scope="col"
                  className={cn("px-3 py-2 align-top font-normal", day.isHoliday && "bg-oe-background-secondary")}
                >
                  <span className="block text-sm font-medium text-oe-foreground-primary">
                    {day.weekday} <span className="tabular-nums text-oe-foreground-secondary">{day.dateLabel}</span>
                  </span>
                  {day.holidayName ? (
                    <span className="block text-xs text-oe-foreground-secondary">{day.holidayName}</span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-oe-border-secondary">
            {rows.map(({ employee, costs }) => (
              <tr key={employee.id} className="divide-x divide-oe-border-secondary">
                <th scope="row" className="px-3 py-3 align-top font-normal">
                  <span className="block text-sm font-medium text-oe-foreground-primary">{employee.name}</span>
                  <span className="block text-xs text-oe-foreground-tertiary">
                    {employee.employmentType} · 시급 {formatWon(employee.hourlyWage)}
                  </span>
                </th>
                {days.map((day) => {
                  const shift = employee.shifts[day.iso];
                  const cost = costs.get(day.iso);
                  return (
                    <td
                      key={day.iso}
                      className={cn("px-3 py-3 align-top", day.isHoliday && "bg-oe-background-secondary")}
                    >
                      {shift && cost ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm tabular-nums text-oe-foreground-primary">
                            {formatTime(shift.start)}~{formatTime(shift.end)}
                          </span>
                          <span className="text-xs tabular-nums text-oe-foreground-secondary">
                            {formatHours(cost.minutes)}
                          </span>
                          {cost.premiums.length > 0 ? (
                            <span className="flex flex-wrap gap-1">
                              {cost.premiums.map((kind) => (
                                <Badge key={kind} tone="warning" variant="outlined">
                                  {PREMIUM_BADGE_LABELS[kind]} {formatRate(PREMIUM_RATES[kind])}
                                </Badge>
                              ))}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="sr-only">쉬는 날</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-oe-foreground-secondary">
        <span className="font-medium text-oe-foreground-primary">가산 규칙</span> <span>{PREMIUM_RULES}</span>
      </p>
    </main>
  );
}
