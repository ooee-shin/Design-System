/**
 * 자동 송장 API 대시보드 (유형: web, 프로젝트: 자동 송장 API)
 *
 * 요구사항 원문: 「2-3페이지 알아서」. 비슷한 서비스: 「cj 송장 조회」.
 *
 * 이 회차에 함께 만드는 화면: 대시보드(이 화면)·송장 조회(/invoice-lookup)·송장 상세(/invoice-detail).
 *
 * 요청에 없어 처리하는 쪽이 정한 것: 오늘 발급·배송 중·배송 완료·예외 건수 요약, 최근 발급 송장 표,
 * 송장 조회 버튼, 예시 데이터.
 *
 * 비워 둔 자리: 실제 API 호출, 기간 필터, 예외 건 처리 흐름.
 */
import { Badge, Button } from "@ooee/ui"
import { RiSearchLine } from "@remixicon/react"

type Status = "배송 준비" | "배송 중" | "배송 완료" | "예외"

const STATUS_TONE = {
  "배송 준비": "neutral",
  "배송 중": "info",
  "배송 완료": "success",
  예외: "danger",
} as const

const SUMMARY: { label: string; value: number }[] = [
  { label: "오늘 발급", value: 128 },
  { label: "배송 중", value: 74 },
  { label: "배송 완료", value: 46 },
  { label: "예외", value: 3 },
]

const RECENT: { number: string; receiver: string; carrier: string; status: Status; issuedAt: string }[] = [
  { number: "612345678901", receiver: "김서연", carrier: "CJ대한통운", status: "배송 중", issuedAt: "09:42" },
  { number: "612345678902", receiver: "이도윤", carrier: "CJ대한통운", status: "배송 준비", issuedAt: "09:38" },
  { number: "612345678903", receiver: "박지호", carrier: "CJ대한통운", status: "예외", issuedAt: "09:15" },
  { number: "612345678904", receiver: "최하은", carrier: "CJ대한통운", status: "배송 완료", issuedAt: "08:57" },
  { number: "612345678905", receiver: "정민준", carrier: "CJ대한통운", status: "배송 중", issuedAt: "08:31" },
]

const TEXT_LINK =
  "rounded-sm underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary"

export default function InvoiceDashboardPage() {
  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-8 py-4">
          <p className="text-base font-semibold text-oe-foreground-primary">자동 송장 API</p>
          <nav aria-label="주 메뉴" className="flex gap-[6px]">
            <Button variant="tonal" tone="neutral" controlSize="regular" render={<a href="/invoice-dashboard" />} nativeButton={false} role="link">
              대시보드
            </Button>
            <Button variant="ghost" tone="neutral" controlSize="regular" render={<a href="/invoice-lookup" />} nativeButton={false} role="link">
              송장 조회
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-8 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-oe-foreground-primary">자동 송장 API 대시보드</h1>
            <p className="mt-1 text-sm text-oe-foreground-tertiary">오늘 발급한 송장과 배송 현황을 한눈에 봅니다.</p>
          </div>
          <Button
            variant="fill"
            controlSize="large"
            leadingIcon={<RiSearchLine aria-hidden="true" />}
            render={<a href="/invoice-lookup" />}
            nativeButton={false}
            role="link"
          >
            송장 조회
          </Button>
        </div>

        <section aria-labelledby="summary-title">
          <h2 id="summary-title" className="sr-only">
            오늘 현황
          </h2>
          <ul className="grid grid-cols-4 gap-4">
            {SUMMARY.map((item) => (
              <li key={item.label} className="rounded-lg border border-oe-border-primary bg-oe-background-primary p-5">
                <p className="text-sm text-oe-foreground-tertiary">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-oe-foreground-primary">
                  {item.value}
                  <span className="ml-1 text-base font-normal text-oe-foreground-tertiary">건</span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="recent-title" className="rounded-lg border border-oe-border-primary bg-oe-background-primary">
          <div className="border-b border-oe-border-secondary px-5 py-4">
            <h2 id="recent-title" className="text-lg font-semibold text-oe-foreground-primary">
              최근 발급 송장
            </h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-oe-foreground-tertiary">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">송장번호</th>
                <th scope="col" className="px-5 py-3 font-medium">받는 분</th>
                <th scope="col" className="px-5 py-3 font-medium">택배사</th>
                <th scope="col" className="px-5 py-3 font-medium">상태</th>
                <th scope="col" className="px-5 py-3 font-medium">발급 시각</th>
              </tr>
            </thead>
            <tbody>
              {RECENT.map((row) => (
                <tr key={row.number} className="border-t border-oe-border-secondary text-oe-foreground-primary">
                  <td className="px-5 py-3 tabular-nums">
                    <a href="/invoice-detail" className={TEXT_LINK}>
                      {row.number}
                    </a>
                  </td>
                  <td className="px-5 py-3">{row.receiver}</td>
                  <td className="px-5 py-3">{row.carrier}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-oe-foreground-tertiary">{row.issuedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}
