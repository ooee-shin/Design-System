"use client";

/**
 * 그늘 코스 상세 — 요청 원문 (그대로):
 *
 * 그늘 코스 상세. 그늘 지도 러닝 앱에서 코스 하나의 상세를 보여 주고 이 코스로 러닝을 시작하는 화면. 코스별 그늘 비율과 체감 더위를 시간대별로 알려준다. 그늘 비율과 체감 더위를 한눈에 이해시키는 시각 표현. 타깃은 서울 거주 25~39세 직장인 러너.
 *
 * 지어냄(부르는 쪽이 정함): 코스는 서울숲 순환 코스 하나(7.5km, 성동구 성수동), 코스 요약(거리·예상 시간·오르막), 시간대별(오후 6·7·8시, 내일 오전 8시) 그늘 비율 막대와 체감 더위 배지 표, 구간별 그늘 안내 3구간, 「이 코스로 러닝 시작」 버튼, 뒤로가기 링크(/shade-course-map), 지도로 돌아가기, 예시 데이터 전부. 이 회차에 함께 만드는 화면: /shade-map-running, /shade-course-map.
 *
 * 비워 둔 자리: 코스별 상세 분기(모든 코스가 이 한 장으로 옴), 실제 그늘 계산, 러닝 시작 뒤의 동작.
 */

import { AppHeader, Badge, Button } from "@ooee/ui";
import { RiArrowLeftLine, RiMapPinLine, RiPlayFill } from "@remixicon/react";

const SUMMARY = [
  { label: "거리", value: "7.5km" },
  { label: "예상 시간", value: "약 45분" },
  { label: "오르막", value: "38m" },
] as const;

const TIME_ROWS = [
  { time: "오후 6시", shade: 70, feels: 29 },
  { time: "오후 7시", shade: 78, feels: 27 },
  { time: "오후 8시", shade: 85, feels: 25 },
  { time: "내일 오전 8시", shade: 82, feels: 23 },
] as const;

const SECTIONS = [
  { name: "서울숲 입구 ~ 가로수길", distance: "0~2.5km", shade: "그늘 많음", note: "왕벚나무 가로수가 이어져요" },
  { name: "숲 안쪽 순환로", distance: "2.5~5.5km", shade: "그늘 많음", note: "나무 그늘이 거의 끊기지 않아요" },
  { name: "한강 쪽 진입로", distance: "5.5~7.5km", shade: "그늘 적음", note: "서쪽이 트여 해 질 녘엔 햇볕이 들어요" },
] as const;

function heatLevel(feels: number): { label: string; tone: "success" | "warning" | "danger" } {
  if (feels <= 27) return { label: "쾌적", tone: "success" };
  if (feels <= 29) return { label: "보통", tone: "warning" };
  return { label: "더움", tone: "danger" };
}

export default function ShadeCourseDetailPage() {
  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col border-oe-border-secondary bg-oe-background-primary sm:border-x">
        <AppHeader
          title="그늘 코스 상세"
          titleAlign="start"
          leadingElement={
            <Button
              render={<a href="/shade-course-map" />}
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
          <section aria-labelledby="course-heading" className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="course-heading" className="text-base font-semibold text-oe-foreground-primary">
                서울숲 순환 코스
              </h2>
              <p className="text-xs text-oe-foreground-tertiary">성동구 성수동 · 예시 데이터</p>
            </div>
            <dl className="grid grid-cols-3 gap-3 rounded-xl border border-oe-border-secondary p-4">
              {SUMMARY.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <dt className="text-xs text-oe-foreground-tertiary">{item.label}</dt>
                  <dd className="text-sm font-semibold text-oe-foreground-primary">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="time-heading" className="flex flex-col gap-3">
            <h2 id="time-heading" className="text-base font-semibold text-oe-foreground-primary">
              시간대별 그늘과 체감 더위
            </h2>
            <ul className="flex flex-col gap-3">
              {TIME_ROWS.map((row) => {
                const heat = heatLevel(row.feels);
                return (
                  <li
                    key={row.time}
                    className="flex flex-col gap-2 rounded-xl border border-oe-border-secondary bg-oe-background-primary p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-oe-foreground-primary">{row.time}</h3>
                      <span className="flex items-center gap-2 text-xs text-oe-foreground-secondary">
                        체감 {row.feels}℃
                        <Badge tone={heat.tone}>{heat.label}</Badge>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        role="meter"
                        aria-label={`${row.time} 그늘 비율`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={row.shade}
                        className="h-2 flex-1 overflow-hidden rounded-full bg-oe-background-secondary"
                      >
                        <div className="h-full rounded-full bg-oe-background-bold-primary" style={{ width: `${row.shade}%` }} />
                      </div>
                      <span className="w-10 text-right text-sm font-semibold text-oe-foreground-primary">{row.shade}%</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="section-heading" className="flex flex-col gap-3">
            <h2 id="section-heading" className="text-base font-semibold text-oe-foreground-primary">
              구간별 그늘 안내
            </h2>
            <ol className="flex flex-col gap-3">
              {SECTIONS.map((section) => (
                <li key={section.name} className="flex flex-col gap-1 rounded-xl border border-oe-border-secondary p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-oe-foreground-primary">{section.name}</h3>
                    <Badge tone={section.shade === "그늘 많음" ? "success" : "warning"}>{section.shade}</Badge>
                  </div>
                  <p className="text-xs text-oe-foreground-tertiary">{section.distance}</p>
                  <p className="text-xs text-oe-foreground-secondary">{section.note}</p>
                </li>
              ))}
            </ol>
          </section>

          <Button
            render={<a href="/shade-course-map" />}
            nativeButton={false}
            role="link"
            variant="outline"
            tone="neutral"
            layout="fill"
            controlSize="large"
            leadingIcon={<RiMapPinLine aria-hidden="true" />}
          >
            지도로 돌아가기
          </Button>
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
