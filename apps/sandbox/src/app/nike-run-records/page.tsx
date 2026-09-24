/**
 * 나이키 런 러닝 기록 목록 (요청 #108)
 *
 * 요청 원문: 키로수 저장 및 위치정보 페이지 약관 팝업 등등 4-5개 정도 (비슷한 화면: 나이키 런)
 * 이 화면은 「등등」에 해당하는 한 장으로, 저장한 거리가 쌓이는 자리로 읽었다. 유형: web.
 *
 * 지어냄: 누적 거리 요약, 최근 기록 표(날짜·거리·시간·평균 페이스), 이번 주 최고 기록 배지, 예시 기록 세 줄.
 *
 * 비워 둔 자리: 기록 상세로 가는 이동. 표의 줄은 누르지 않는다.
 */

import { Badge } from "@ooee/ui";

const RECORDS = [
  { date: "2026-09-24", distance: "5.20 km", time: "00:28:34", pace: `5'29"/km`, best: true },
  { date: "2026-09-22", distance: "3.80 km", time: "00:21:40", pace: `5'42"/km`, best: false },
  { date: "2026-09-19", distance: "4.50 km", time: "00:26:15", pace: `5'50"/km`, best: false },
];

const LINK_CLASS =
  "rounded-sm text-sm text-oe-brand-foreground-primary underline outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary";

export default function NikeRunRecordsPage() {
  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between px-6">
          <span className="text-base font-semibold text-oe-foreground-primary">나이키 런</span>
          <a href="/nike-run-save" className={LINK_CLASS}>
            러닝 기록 저장
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-[960px] flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-oe-foreground-primary">러닝 기록</h1>
          <p className="text-sm text-oe-foreground-secondary">저장한 런을 최근 순서로 보여 줘요.</p>
        </div>

        <section aria-label="누적 요약" className="flex flex-col gap-1 rounded-oe-control border border-oe-border-secondary bg-oe-background-primary p-6">
          <span className="text-xs text-oe-foreground-tertiary">누적 거리</span>
          <span className="text-2xl font-semibold tabular-nums text-oe-foreground-primary">13.50 km</span>
        </section>

        <div className="overflow-x-auto rounded-oe-control border border-oe-border-secondary bg-oe-background-primary">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">최근 러닝 기록</caption>
            <thead>
              <tr className="border-b border-oe-border-secondary text-oe-foreground-tertiary">
                <th scope="col" className="px-4 py-3 font-medium">날짜</th>
                <th scope="col" className="px-4 py-3 font-medium">거리</th>
                <th scope="col" className="px-4 py-3 font-medium">시간</th>
                <th scope="col" className="px-4 py-3 font-medium">평균 페이스</th>
              </tr>
            </thead>
            <tbody>
              {RECORDS.map((record) => (
                <tr key={record.date} className="border-b border-oe-border-secondary last:border-b-0 text-oe-foreground-primary">
                  <td className="px-4 py-3 tabular-nums">{record.date}</td>
                  <td className="px-4 py-3 tabular-nums">
                    <span className="inline-flex items-center gap-2">
                      {record.distance}
                      {record.best ? <Badge tone="brand" variant="tonal">이번 주 최고</Badge> : null}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{record.time}</td>
                  <td className="px-4 py-3 tabular-nums">{record.pace}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
