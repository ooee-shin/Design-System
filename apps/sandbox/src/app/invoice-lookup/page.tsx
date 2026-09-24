"use client"

/**
 * 송장 조회 (유형: web, 프로젝트: 자동 송장 API)
 *
 * 요구사항 원문: 「2-3페이지 알아서」. 비슷한 서비스: 「cj 송장 조회」.
 *
 * 이 회차에 함께 만드는 화면: 대시보드(/invoice-dashboard)·송장 조회(이 화면)·송장 상세(/invoice-detail).
 *
 * 요청에 없어 처리하는 쪽이 정한 것: 송장번호 한 칸으로 찾는 조회 폼, 조회 결과 표, 결과 없음 안내, 예시 데이터.
 *
 * 비워 둔 자리: 실제 API 호출(예시 데이터에서 걸러 보인다), 여러 송장 한 번에 조회, 택배사 고르기.
 */
import { useState } from "react"
import { Badge, Button, Field, Input } from "@ooee/ui"
import { RiSearchLine } from "@remixicon/react"

type Status = "배송 준비" | "배송 중" | "배송 완료" | "예외"

const STATUS_TONE = {
  "배송 준비": "neutral",
  "배송 중": "info",
  "배송 완료": "success",
  예외: "danger",
} as const

const INVOICES: { number: string; receiver: string; carrier: string; status: Status; updatedAt: string }[] = [
  { number: "612345678901", receiver: "김서연", carrier: "CJ대한통운", status: "배송 중", updatedAt: "오늘 09:42" },
  { number: "612345678902", receiver: "이도윤", carrier: "CJ대한통운", status: "배송 준비", updatedAt: "오늘 09:38" },
  { number: "612345678903", receiver: "박지호", carrier: "CJ대한통운", status: "예외", updatedAt: "오늘 09:15" },
  { number: "612345678904", receiver: "최하은", carrier: "CJ대한통운", status: "배송 완료", updatedAt: "오늘 08:57" },
]

const TEXT_LINK =
  "rounded-sm underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary"

export default function InvoiceLookupPage() {
  const [draft, setDraft] = useState("")
  const [query, setQuery] = useState<string | null>(null)

  const results = query === null ? [] : INVOICES.filter((invoice) => invoice.number.includes(query))

  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-8 py-4">
          <p className="text-base font-semibold text-oe-foreground-primary">자동 송장 API</p>
          <nav aria-label="주 메뉴" className="flex gap-[6px]">
            <Button variant="ghost" tone="neutral" controlSize="regular" render={<a href="/invoice-dashboard" />} nativeButton={false} role="link">
              대시보드
            </Button>
            <Button variant="tonal" tone="neutral" controlSize="regular" render={<a href="/invoice-lookup" />} nativeButton={false} role="link">
              송장 조회
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-8 py-8">
        <div>
          <h1 className="text-2xl font-semibold text-oe-foreground-primary">송장 조회</h1>
          <p className="mt-1 text-sm text-oe-foreground-tertiary">송장번호를 입력해 배송 상태를 확인합니다.</p>
        </div>

        <form
          className="flex items-end gap-[6px] rounded-lg border border-oe-border-primary bg-oe-background-primary p-5"
          onSubmit={(event) => {
            event.preventDefault()
            setQuery(draft.trim())
          }}
        >
          <div className="max-w-[480px] flex-1">
            <Field label="송장번호" required>
              <Input
                controlSize="large"
                inputMode="numeric"
                placeholder="송장번호 12자리 입력"
                maxLength={12}
                value={draft}
                onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
              />
            </Field>
          </div>
          <Button type="submit" variant="fill" controlSize="large" leadingIcon={<RiSearchLine aria-hidden="true" />}>
            조회
          </Button>
        </form>

        <section aria-labelledby="result-title" aria-live="polite" className="rounded-lg border border-oe-border-primary bg-oe-background-primary">
          <div className="border-b border-oe-border-secondary px-5 py-4">
            <h2 id="result-title" className="text-lg font-semibold text-oe-foreground-primary">
              조회 결과
            </h2>
          </div>
          {query === null ? (
            <p className="px-5 py-10 text-sm text-oe-foreground-tertiary">송장번호를 입력하고 조회를 누르세요.</p>
          ) : results.length === 0 ? (
            <p className="px-5 py-10 text-sm text-oe-foreground-tertiary">일치하는 송장이 없습니다.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-oe-foreground-tertiary">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">송장번호</th>
                  <th scope="col" className="px-5 py-3 font-medium">받는 분</th>
                  <th scope="col" className="px-5 py-3 font-medium">택배사</th>
                  <th scope="col" className="px-5 py-3 font-medium">상태</th>
                  <th scope="col" className="px-5 py-3 font-medium">최근 갱신</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
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
                    <td className="px-5 py-3 text-oe-foreground-tertiary">{row.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  )
}
