"use client";

/**
 * 요구사항 원문:
 * 법인카드 사용내역을 관리하는 테이블입니다.
 * 사용일시, 사용처, 이름, 금액, 부가세, 총합이 있고.
 * 사용처만 수정이 가능합니다.
 * 사용자와 상호작용 전에는 일반 테이블처럼 보이는 요구사항을 지켜야합니다. hover, focus 상태에서만 input을 노출합니다.
 *
 * 정하지 않아 비워 둔 자리:
 * - 예시 사용내역 데이터(사용일시·사용처·이름·금액·부가세)는 요청에 없어 지어냈다.
 * - 금액·부가세·총합의 표기(천 단위 구분, 「원」, 오른쪽 정렬)는 요청에 없어 정했다.
 * - 총합은 금액과 부가세의 합으로 계산했다. 요청은 계산식을 말하지 않았다.
 * - 사용처 수정 결과를 저장하는 동작(서버 반영)은 없다.
 */

import { useState, type ChangeEvent } from "react";
import { Input } from "@ooee/ui";

type UsageRow = {
  id: string;
  usedAt: string;
  merchant: string;
  name: string;
  amount: number;
  vat: number;
};

const AMOUNT_FORMAT = new Intl.NumberFormat("ko-KR");

const INITIAL_ROWS: UsageRow[] = [
  { id: "usage-1", usedAt: "2026-09-01 09:24", merchant: "스타벅스 강남역점", name: "김도윤", amount: 18500, vat: 1850 },
  { id: "usage-2", usedAt: "2026-09-03 12:41", merchant: "OO상사", name: "이서연", amount: 320000, vat: 32000 },
  { id: "usage-3", usedAt: "2026-09-08 19:02", merchant: "교보문고 광화문점", name: "박지훈", amount: 54000, vat: 5400 },
  { id: "usage-4", usedAt: "2026-09-12 08:15", merchant: "SRT 수서역", name: "김도윤", amount: 43500, vat: 4350 },
  { id: "usage-5", usedAt: "2026-09-19 13:50", merchant: "이마트 역삼점", name: "최유나", amount: 96200, vat: 9620 },
  { id: "usage-6", usedAt: "2026-09-24 18:30", merchant: "OO식당", name: "박지훈", amount: 128000, vat: 12800 },
];

function formatWon(value: number) {
  return `${AMOUNT_FORMAT.format(value)}원`;
}

export default function Page() {
  const [rows, setRows] = useState(INITIAL_ROWS);

  const handleMerchantChange = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const nextMerchant = event.target.value;
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, merchant: nextMerchant } : row)));
  };

  return (
    <main className="min-h-dvh bg-oe-background-primary px-oe-padding-default py-8 md:px-oe-padding-wide">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-oe-foreground-primary">법인카드 사용내역</h1>
          <p className="text-sm text-oe-foreground-secondary">사용처 칸에 마우스를 올리거나 포커스하면 값을 고칠 수 있습니다.</p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-oe-border-secondary">
                <th scope="col" className="px-3 py-2 text-left font-medium text-oe-foreground-secondary">
                  사용일시
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-oe-foreground-secondary">
                  사용처
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-oe-foreground-secondary">
                  이름
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-oe-foreground-secondary">
                  금액
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-oe-foreground-secondary">
                  부가세
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-oe-foreground-secondary">
                  총합
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-oe-border-secondary last:border-b-0">
                  <td className="px-3 py-2 text-oe-foreground-secondary tabular-nums">{row.usedAt}</td>
                  <td className="group px-1 py-1">
                    <Input
                      aria-label={`${row.usedAt} 사용내역 사용처`}
                      value={row.merchant}
                      onChange={(event) => handleMerchantChange(row.id, event)}
                      controlSize="small"
                      containerClassName="border-transparent bg-transparent transition-colors group-hover:border-oe-border-secondary group-hover:bg-oe-background-primary group-focus-within:border-oe-border-secondary group-focus-within:bg-oe-background-primary"
                    />
                  </td>
                  <td className="px-3 py-2 text-oe-foreground-primary">{row.name}</td>
                  <td className="px-3 py-2 text-right text-oe-foreground-primary tabular-nums">{formatWon(row.amount)}</td>
                  <td className="px-3 py-2 text-right text-oe-foreground-primary tabular-nums">{formatWon(row.vat)}</td>
                  <td className="px-3 py-2 text-right font-medium text-oe-foreground-primary tabular-nums">
                    {formatWon(row.amount + row.vat)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
