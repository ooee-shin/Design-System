/**
 * 송장 상세 (유형: web, 프로젝트: 자동 송장 API)
 *
 * 요구사항 원문: 「2-3페이지 알아서」. 비슷한 서비스: 「cj 송장 조회」.
 *
 * 이 회차에 함께 만드는 화면: 대시보드(/invoice-dashboard)·송장 조회(/invoice-lookup)·송장 상세(이 화면).
 *
 * 요청에 없어 처리하는 쪽이 정한 것: 송장 한 건의 배송 정보 요약, 배송 이력 목록, 송장 조회로 돌아가는 링크,
 * 예시 데이터. 화면은 송장 하나만 보이며 주소로 송장을 가리지 않는다.
 *
 * 비워 둔 자리: 실제 API 호출, 송장 재발급·취소 같은 조작.
 */
import { Badge, Button } from "@ooee/ui"
import { RiArrowLeftLine } from "@remixicon/react"

const INFO: { label: string; value: string }[] = [
  { label: "택배사", value: "CJ대한통운" },
  { label: "보내는 분", value: "블루키 물류센터" },
  { label: "받는 분", value: "김서연" },
  { label: "받는 주소", value: "서울특별시 강남구 테헤란로 000" },
  { label: "발급 시각", value: "오늘 09:42" },
]

const HISTORY: { time: string; place: string; message: string }[] = [
  { time: "오늘 14:20", place: "서울 강남 배송점", message: "배송 출발" },
  { time: "오늘 11:05", place: "서울 허브터미널", message: "간선 상차" },
  { time: "오늘 09:58", place: "블루키 물류센터", message: "집하 완료" },
  { time: "오늘 09:42", place: "자동 송장 API", message: "송장 발급" },
]

export default function InvoiceDetailPage() {
  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-8 py-4">
          <p className="text-base font-semibold text-oe-foreground-primary">자동 송장 API</p>
          <nav aria-label="주 메뉴" className="flex gap-[6px]">
            <Button variant="ghost" tone="neutral" controlSize="regular" render={<a href="/invoice-dashboard" />} nativeButton={false} role="link">
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
            <h1 className="text-2xl font-semibold text-oe-foreground-primary">송장 상세</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-oe-foreground-tertiary">
              <span className="tabular-nums">612345678901</span>
              <Badge tone="info">배송 중</Badge>
            </p>
          </div>
          <Button
            variant="outline"
            tone="neutral"
            controlSize="large"
            leadingIcon={<RiArrowLeftLine aria-hidden="true" />}
            render={<a href="/invoice-lookup" />}
            nativeButton={false}
            role="link"
          >
            송장 조회로 돌아가기
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <section aria-labelledby="info-title" className="rounded-lg border border-oe-border-primary bg-oe-background-primary">
            <div className="border-b border-oe-border-secondary px-5 py-4">
              <h2 id="info-title" className="text-lg font-semibold text-oe-foreground-primary">
                배송 정보
              </h2>
            </div>
            <dl className="flex flex-col">
              {INFO.map((item) => (
                <div key={item.label} className="flex gap-4 border-t border-oe-border-secondary px-5 py-3 text-sm first:border-t-0">
                  <dt className="w-24 shrink-0 text-oe-foreground-tertiary">{item.label}</dt>
                  <dd className="text-oe-foreground-primary">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="history-title" className="rounded-lg border border-oe-border-primary bg-oe-background-primary">
            <div className="border-b border-oe-border-secondary px-5 py-4">
              <h2 id="history-title" className="text-lg font-semibold text-oe-foreground-primary">
                배송 이력
              </h2>
            </div>
            <ol className="flex flex-col">
              {HISTORY.map((item) => (
                <li key={item.time} className="flex gap-4 border-t border-oe-border-secondary px-5 py-3 text-sm first:border-t-0">
                  <span className="w-24 shrink-0 tabular-nums text-oe-foreground-tertiary">{item.time}</span>
                  <span className="text-oe-foreground-primary">
                    {item.message}
                    <span className="ml-2 text-oe-foreground-tertiary">{item.place}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  )
}
