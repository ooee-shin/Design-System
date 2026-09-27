"use client";

/**
 * 그늘 코스 지도 — 요청 원문 (그대로):
 *
 * 그늘 코스 지도. 그늘 지도 러닝 앱에서 지도 위에 코스 3개를 겹쳐 보여 주고 코스를 골라 상세로 가거나 그 코스로 러닝을 시작하는 화면. 지도에는 시간대별 그림자가 겹쳐 보이고 코스마다 그늘 비율과 체감 더위를 알려준다. 그늘 비율과 체감 더위를 한눈에 이해시키는 시각 표현. 타깃은 서울 거주 25~39세 직장인 러너.
 *
 * 지어냄(부르는 쪽이 정함): 지도는 실제 지도가 아니라 예시 도식(코스 선과 그림자 영역), 시간 선택 칩 4개(오후 6·7·8시, 내일 오전 8시), 코스 3개(서울숲 순환·뚝섬 한강공원 강변·청계천 상류 왕복)를 고르는 목록, 선택한 코스 요약 카드(그늘 비율 막대·체감 더위 배지), 「코스 상세 보기」 링크(/shade-course-detail), 「이 코스로 러닝 시작」 버튼, 뒤로가기 링크(/shade-map-running), 예시 데이터 전부. 이 회차에 함께 만드는 화면: /shade-map-running, /shade-course-detail.
 *
 * 비워 둔 자리: 실제 지도·그림자 계산, 러닝 시작 뒤의 동작, 현재 위치.
 */

import { useState } from "react";
import { AppHeader, Badge, Button, Chip } from "@ooee/ui";
import { RiArrowLeftLine, RiPlayFill } from "@remixicon/react";

const TIMES = ["오후 6시", "오후 7시", "오후 8시", "내일 오전 8시"] as const;

type Course = {
  name: string;
  distance: string;
  /** 지도 도식 위의 코스 선 */
  path: string;
  /** 시간대(TIMES 순서)별 그늘 비율, % */
  shade: number[];
  /** 시간대별 체감 기온, ℃ */
  feels: number[];
};

const COURSES: Course[] = [
  { name: "서울숲 순환 코스", distance: "7.5km", path: "M40 60 L120 40 L200 70 L250 130 L170 170 L70 140 Z", shade: [70, 78, 85, 82], feels: [29, 27, 25, 23] },
  { name: "뚝섬 한강공원 강변 코스", distance: "8.2km", path: "M30 190 L110 180 L190 200 L270 185", shade: [22, 34, 55, 30], feels: [32, 30, 27, 26] },
  { name: "청계천 상류 왕복 코스", distance: "6.1km", path: "M60 20 L90 90 L150 110 L230 100 L300 60", shade: [48, 52, 64, 58], feels: [30, 28, 26, 24] },
];

function heatLevel(feels: number): { label: string; tone: "success" | "warning" | "danger" } {
  if (feels <= 27) return { label: "쾌적", tone: "success" };
  if (feels <= 29) return { label: "보통", tone: "warning" };
  return { label: "더움", tone: "danger" };
}

export default function ShadeCourseMapPage() {
  const [timeIndex, setTimeIndex] = useState(1);
  const [courseIndex, setCourseIndex] = useState(0);

  const course = COURSES[courseIndex];
  const shadeNow = course.shade[timeIndex];
  const feelsNow = course.feels[timeIndex];
  const heat = heatLevel(feelsNow);

  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col border-oe-border-secondary bg-oe-background-primary sm:border-x">
        <AppHeader
          title="그늘 코스 지도"
          titleAlign="start"
          leadingElement={
            <Button
              render={<a href="/shade-map-running" />}
              nativeButton={false}
              role="link"
              aria-label="뒤로"
              variant="ghost"
              tone="neutral"
              leadingIcon={<RiArrowLeftLine aria-hidden="true" />}
            />
          }
        />

        <main className="flex flex-1 flex-col gap-5 px-oe-padding-default pb-4 pt-2">
          <section aria-labelledby="time-heading" className="flex flex-col gap-2">
            <h2 id="time-heading" className="text-base font-semibold text-oe-foreground-primary">
              언제 뛰시나요?
            </h2>
            <div className="flex flex-wrap gap-[6px]">
              {TIMES.map((time, index) => (
                <Chip
                  key={time}
                  shape="rounded"
                  controlSize="small"
                  active={index === timeIndex}
                  onClick={() => setTimeIndex(index)}
                >
                  {time}
                </Chip>
              ))}
            </div>
          </section>

          <section aria-labelledby="map-heading" className="flex flex-col gap-2">
            <h2 id="map-heading" className="text-base font-semibold text-oe-foreground-primary">
              지도에서 코스 보기
            </h2>
            <div className="overflow-hidden rounded-xl border border-oe-border-secondary bg-oe-background-secondary">
              <svg
                viewBox="0 0 330 220"
                role="img"
                aria-label={`${course.name}의 코스 선과 ${TIMES[timeIndex]} 그림자 영역을 보여 주는 예시 도식`}
                className="block h-auto w-full"
              >
                <g className="text-oe-foreground-tertiary" fill="currentColor" fillOpacity={0.12 + shadeNow / 250}>
                  <polygon points="20,30 100,20 120,80 30,90" />
                  <polygon points="200,20 300,30 290,90 210,80" />
                  <polygon points="40,150 130,140 140,175 50,185" />
                  <polygon points="210,140 300,130 310,170 220,180" />
                </g>
                {COURSES.map((item, index) =>
                  index === courseIndex ? null : (
                    <path
                      key={item.name}
                      d={item.path}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinejoin="round"
                      className="text-oe-foreground-placeholder"
                    />
                  ),
                )}
                <path
                  d={course.path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={5}
                  strokeLinejoin="round"
                  className="text-oe-brand-foreground-primary"
                />
              </svg>
            </div>
            <p className="text-xs text-oe-foreground-tertiary">짙은 영역이 그림자예요 · 예시 도식</p>
          </section>

          <section aria-labelledby="course-heading" className="flex flex-col gap-2">
            <h2 id="course-heading" className="text-base font-semibold text-oe-foreground-primary">
              코스 고르기
            </h2>
            <div className="flex flex-wrap gap-[6px]">
              {COURSES.map((item, index) => (
                <Chip
                  key={item.name}
                  shape="rounded"
                  controlSize="small"
                  active={index === courseIndex}
                  onClick={() => setCourseIndex(index)}
                >
                  {item.name}
                </Chip>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="summary-heading"
            className="flex flex-col gap-3 rounded-xl border border-oe-border-secondary bg-oe-background-primary p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-1">
                <h3 id="summary-heading" className="text-sm font-semibold text-oe-foreground-primary">
                  {course.name}
                </h3>
                <p className="text-xs text-oe-foreground-tertiary">
                  {TIMES[timeIndex]} · {course.distance}
                </p>
              </div>
              <a
                href="/shade-course-detail"
                className="shrink-0 rounded-sm text-xs font-medium text-oe-brand-foreground-primary outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary"
              >
                코스 상세 보기
              </a>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between text-xs text-oe-foreground-secondary">
                <span>그늘 비율</span>
                <span className="text-sm font-semibold text-oe-foreground-primary">{shadeNow}%</span>
              </div>
              <div
                role="meter"
                aria-label={`${course.name} 그늘 비율`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={shadeNow}
                className="h-2 w-full overflow-hidden rounded-full bg-oe-background-secondary"
              >
                <div className="h-full rounded-full bg-oe-background-bold-primary" style={{ width: `${shadeNow}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-oe-foreground-secondary">
              <span>체감 더위</span>
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-oe-foreground-primary">{feelsNow}℃</span>
                <Badge tone={heat.tone}>{heat.label}</Badge>
              </span>
            </div>
          </section>
        </main>

        <div className="sticky bottom-0 border-t border-oe-border-secondary bg-oe-background-primary px-oe-padding-default py-3">
          <Button type="button" layout="fill" controlSize="xlarge" leadingIcon={<RiPlayFill aria-hidden="true" />}>
            이 코스로 러닝 시작
          </Button>
        </div>
      </div>
    </div>
  );
}
