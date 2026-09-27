"use client";

/**
 * 그늘 지도 러닝 — 요청 원문 (그대로):
 *
 * 그늘 지도 러닝. ## 컨셉 "지금 이 시간, 가장 시원하게 뛸 수 있는 코스"를 추천하는 러닝 앱. 시간대별 해 위치에 건물·가로수 그림자를 겹쳐서, 코스별 그늘 비율과 체감 더위를 보여준다. ## 배경 - 타깃: 서울 거주 25~39세 직장인 러너. 주 2~3회 5~10km를 뛰고, 주로 퇴근 후나 이른 아침에 뛴다 - 문제: 여름(6~9월)에 한낮을 피해도 해 질 녘 서향 길이나 그늘 없는 하천변은 여전히 덥다. 기존 러닝 앱은 거리와 고도만 알려주고, 코스가 얼마나 그늘진지는 알려주지 않는다 - 팀 제약: 디자이너 1명, 개발자 2명, 3개월 안에 MVP. 첫 출시는 서울 1~2개 구로 한정 - 참고할 수 있는 데이터(실제 사용 가능 여부도 검토할 것): - 태양 고도·방위각 계산(위경도와 시각으로 계산 가능) - 건물 높이: 국토교통부 건물통합정보, V-World 3D 건물 데이터 - 가로수: 서울 열린데이터광장 가로수 위치 정보 - 날씨: 기상청 단기예보 API(기온, 습도, 자외선, 구름) ## 요청 1. 사용자 여정 - 앱을 여는 순간부터 러닝을 마치고 기록을 확인할 때까지를 단계별로 쓴다 - 대표 시나리오 2개: ① 퇴근 후 저녁 7시 집 근처 러닝 ② 주말 아침 8시 새 코스 탐색 2. 핵심 기능 (MVP / 이후로 구분) - 기능마다 "사용자가 얻는 것"을 한 줄로 쓴다 - 그늘 비율 계산 방식을 기획자가 이해할 수 있는 수준으로 설명한다 (어떤 데이터를 어떻게 겹치는지, 정확도의 한계는 무엇인지) 3. 화면 구성 - MVP에 필요한 화면 목록과 각 화면의 목적 - 메인 화면에 반드시 있어야 할 정보와 빼도 되는 정보 - "그늘 비율"과 "체감 더위"를 한눈에 이해시키는 시각 표현 아이디어 3가지 4. 차별화와 리텐션 - Strava, 나이키 런클럽, 런데이와 비교해 이 앱만의 가치 - 여름이 끝나면 쓸 이유가 사라지는 문제를 어떻게 풀지 (예: 겨울에는 햇볕이 드는 코스, 바람을 피하는 코스로 뒤집기) 5. 수익 모델 가설 2~3개 6. 리스크와 검증 - 가장 큰 리스크 3개 (데이터 정확도, 계산 비용, 수요 등) - 각 리스크를 개발 전에 싸게 검증하는 방법 ## 출력 형식 - 한국어, 제목과 표 위주, 문장은 짧게 - 확인되지 않은 수치나 데이터 가용성은 "추측" 또는 "확인 필요"로 표시 - 마지막에 "다음 2주 동안 할 일" 체크리스트 5개 이내
 *
 * 지어냄(부르는 쪽이 정함): 화면은 요청의 기획 문서 전체가 아니라 「화면 구성」의 메인 화면 하나로 읽음. 시간 선택, 코스 3개 카드(코스 이름·거리·그늘 비율 막대·체감 더위 배지), 러닝 시작 버튼, 예시 데이터는 지어냄.
 *
 * 개선 회차 요구(1회차 결과에 대한 기획자 사유): 러닝 시작은 그늘이 가장 많은 코스로 시작하는 버튼 하나로 두었고 코스를 골라 시작하는 흐름·지도·코스 상세도 만들어줘. 이 회차에 함께 만드는 화면: /shade-course-map (지도에서 코스 고르기), /shade-course-detail (코스 상세). 메인의 코스 카드는 /shade-course-detail 로, 「지도로 코스 고르기」는 /shade-course-map 으로 링크.
 * 지어냄: 「지도로 코스 고르기」 버튼 문구와 위치, 카드 제목을 상세 링크로 둔 것. 코스 상세는 코스별로 나뉘지 않고 한 장이라 모든 카드가 같은 상세로 간다.
 *
 * 비워 둔 자리: 기록 화면 링크, 실제 그늘·기온 계산, 러닝 시작 뒤의 동작.
 */

import { useState } from "react";
import { AppHeader, Badge, Button, Chip } from "@ooee/ui";
import { RiMapPinLine, RiPlayFill } from "@remixicon/react";

const TIMES = ["오후 6시", "오후 7시", "오후 8시", "내일 오전 8시"] as const;

type Course = {
  name: string;
  area: string;
  distance: string;
  /** 시간대(TIMES 순서)별 그늘 비율, % */
  shade: number[];
  /** 시간대별 체감 기온, ℃ */
  feels: number[];
};

const COURSES: Course[] = [
  { name: "서울숲 순환 코스", area: "성동구 성수동", distance: "7.5km", shade: [70, 78, 85, 82], feels: [29, 27, 25, 23] },
  { name: "뚝섬 한강공원 강변 코스", area: "성동구 뚝섬", distance: "8.2km", shade: [22, 34, 55, 30], feels: [32, 30, 27, 26] },
  { name: "청계천 상류 왕복 코스", area: "성동구 왕십리", distance: "6.1km", shade: [48, 52, 64, 58], feels: [30, 28, 26, 24] },
];

function heatLevel(feels: number): { label: string; tone: "success" | "warning" | "danger" } {
  if (feels <= 27) return { label: "쾌적", tone: "success" };
  if (feels <= 29) return { label: "보통", tone: "warning" };
  return { label: "더움", tone: "danger" };
}

export default function ShadeMapRunningPage() {
  const [timeIndex, setTimeIndex] = useState(1);

  const ranked = COURSES.map((course) => ({
    ...course,
    shadeNow: course.shade[timeIndex],
    feelsNow: course.feels[timeIndex],
  })).sort((a, b) => b.shadeNow - a.shadeNow);
  const best = ranked[0];

  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col border-oe-border-secondary bg-oe-background-primary sm:border-x">
        <AppHeader title="그늘 지도 러닝" titleAlign="start" />

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
            <p className="text-xs text-oe-foreground-tertiary">성동구 기준 · 예시 데이터</p>
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
            지도로 코스 고르기
          </Button>

          <section aria-labelledby="course-heading" className="flex flex-col gap-3">
            <h2 id="course-heading" className="text-base font-semibold text-oe-foreground-primary">
              {TIMES[timeIndex]}, 그늘이 많은 순
            </h2>
            <ul className="flex flex-col gap-3">
              {ranked.map((course, rank) => {
                const heat = heatLevel(course.feelsNow);
                return (
                  <li
                    key={course.name}
                    className="flex flex-col gap-3 rounded-xl border border-oe-border-secondary bg-oe-background-primary p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-col gap-1">
                        <h3 className="text-sm font-semibold text-oe-foreground-primary">
                          <a
                            href="/shade-course-detail"
                            className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary"
                          >
                            {course.name}
                          </a>
                        </h3>
                        <p className="text-xs text-oe-foreground-tertiary">
                          {course.area} · {course.distance}
                        </p>
                      </div>
                      {rank === 0 ? (
                        <Badge tone="brand" variant="fill">
                          추천
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline justify-between text-xs text-oe-foreground-secondary">
                        <span>그늘 비율</span>
                        <span className="text-sm font-semibold text-oe-foreground-primary">{course.shadeNow}%</span>
                      </div>
                      <div
                        role="meter"
                        aria-label={`${course.name} 그늘 비율`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={course.shadeNow}
                        className="h-2 w-full overflow-hidden rounded-full bg-oe-background-secondary"
                      >
                        <div
                          className="h-full rounded-full bg-oe-background-bold-primary"
                          style={{ width: `${course.shadeNow}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-oe-foreground-secondary">
                      <span>체감 더위</span>
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-oe-foreground-primary">{course.feelsNow}℃</span>
                        <Badge tone={heat.tone}>{heat.label}</Badge>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </main>

        <div className="sticky bottom-0 border-t border-oe-border-secondary bg-oe-background-primary px-oe-padding-default py-3">
          <Button
            type="button"
            layout="fill"
            controlSize="xlarge"
            leadingIcon={<RiPlayFill aria-hidden="true" />}
          >
            러닝 시작
          </Button>
          <p className="mt-2 text-xs text-oe-foreground-tertiary">{best.name}로 시작해요</p>
        </div>
      </div>
    </div>
  );
}
