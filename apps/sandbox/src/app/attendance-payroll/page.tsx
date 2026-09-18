"use client";

/**
 * 이 화면은 **웹 태블릿 앱**이다. 1194×834 가로(iPad Pro 11)를 기준 폭으로 본다. 브라우저에서 열면 그
 * 폭의 틀이 화면 가운데에 선다. 손가락으로 쓰는 화면이므로 Control 은 Large 이상을 쓴다.
 *
 * 요청:
 * 근태·급여 정산. 점주와 본사 담당자가 기간을 골라 직원별 근무 시간과 시급을 확인하는 태블릿 화면이다.
 *
 * 맨 위는 화면 제목 「근태·급여 정산」과 그 아래 한 줄 설명 「기간을 골라 직원별 근무 시간과 급여를
 * 확인합니다」다.
 *
 * 그 아래는 필터 줄이다. 왼쪽부터 기간(하나 선택: 이번 달·지난 달·직접 입력, 기본값 이번 달), 매장(하나
 * 선택: 전체·강남점·홍대점·부산 서면점, 기본값 강남점), 그리고 오른쪽 끝에 「내보내기」 버튼이 선다.
 *
 * 그 아래는 요약 줄이며 총 근무 시간과 급여 합계를 나란히 보여 준다(보기 값으로 채운다).
 *
 * 그 아래는 표다. 칸은 왼쪽부터 직원, 시급, 근무 시간, 급여, 상태다. 시급과 급여는 원 단위로 천 단위
 * 쉼표를 찍는다. 상태는 색이 있는 배지로 보여 준다(확정·대기·보류). 다섯 줄을 보기 값으로 채운다.
 *
 * 표 아래는 페이지 이동이며 「1 / 3」과 이전·다음 버튼이다.
 *
 * 표의 한 줄을 누르면 그 직원의 날짜별 근무 기록이 열린다는 것만 정하고, 그 내용과 여는 방식은 정하지
 * 않았다. 내보내기를 눌렀을 때의 동작도 정하지 않았다. 시급을 누가 정하고 어디서 가져오는지도 정하지
 * 않았다.
 *
 * 비워 둔 자리
 * - 표 행 전체를 눌렀을 때 여는 날짜별 근무 기록의 내용과 여는 방식(패널·모달·새 화면 등). 목적지가
 *   정해지지 않았으므로 직원명 `<a href="#">` 링크를 두고, 그 클릭 영역을 행 전체로 넓혀 연결한다.
 *   `docs/system/`에 표 행 클릭 패턴이 정의돼 있지 않아 직접 고른 방법이다(보고 참고).
 * - 「내보내기」를 눌렀을 때의 실제 동작(파일 형식, 저장 위치 등)
 * - 시급의 출처와 결정 주체
 * - 기간 「직접 입력」을 골랐을 때 나타나는 날짜 범위 입력 UI
 * - 이전·다음을 눌렀을 때 실제 페이지 전환 동작
 */

import { Badge, Button, Field, Select } from "@ooee/ui";

type PayrollStatus = "확정" | "대기" | "보류";

type PayrollRecord = {
  id: string;
  name: string;
  hourlyWage: number;
  hours: number;
  pay: number;
  status: PayrollStatus;
};

const STATUS_TONE: Record<PayrollStatus, "success" | "warning" | "danger"> = {
  확정: "success",
  대기: "warning",
  보류: "danger",
};

const periodOptions = [
  { value: "this-month", label: "이번 달" },
  { value: "last-month", label: "지난 달" },
  { value: "custom", label: "직접 입력" },
];

const storeOptions = [
  { value: "all", label: "전체" },
  { value: "gangnam", label: "강남점" },
  { value: "hongdae", label: "홍대점" },
  { value: "seomyeon", label: "부산 서면점" },
];

const payrollRecords: PayrollRecord[] = [
  { id: "kim-minjun", name: "김민준", hourlyWage: 10500, hours: 172, pay: 1806000, status: "확정" },
  { id: "lee-seoyeon", name: "이서연", hourlyWage: 9860, hours: 160, pay: 1577600, status: "확정" },
  { id: "park-doyoon", name: "박도윤", hourlyWage: 11200, hours: 96, pay: 1075200, status: "대기" },
  { id: "choi-jiwoo", name: "최지우", hourlyWage: 9860, hours: 148, pay: 1459280, status: "대기" },
  { id: "jung-haeun", name: "정하은", hourlyWage: 10030, hours: 64, pay: 641920, status: "보류" },
];

const TOTAL_HOURS = 1920;
const TOTAL_PAY = 19680000;

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export default function AttendancePayrollSettlementPage() {
  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1194px] flex-col border-oe-border-secondary bg-oe-background-primary sm:border-x">
        <main className="flex flex-1 flex-col gap-6 px-oe-padding-wide py-8">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-oe-foreground-primary">근태·급여 정산</h1>
            <p className="text-sm text-oe-foreground-secondary">
              기간을 골라 직원별 근무 시간과 급여를 확인합니다
            </p>
          </header>

          <section className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <Field label="기간" className="w-56">
                <Select controlSize="xlarge" defaultValue="this-month" options={periodOptions} />
              </Field>
              <Field label="매장" className="w-56">
                <Select controlSize="xlarge" defaultValue="gangnam" options={storeOptions} />
              </Field>
            </div>
            <Button controlSize="xlarge" tone="neutral" variant="outline">
              내보내기
            </Button>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-oe-border-secondary bg-oe-background-primary p-4">
              <p className="text-sm text-oe-foreground-tertiary">총 근무 시간</p>
              <p className="mt-1 text-2xl font-semibold text-oe-foreground-primary">
                {TOTAL_HOURS.toLocaleString("ko-KR")}시간
              </p>
            </div>
            <div className="rounded-lg border border-oe-border-secondary bg-oe-background-primary p-4">
              <p className="text-sm text-oe-foreground-tertiary">급여 합계</p>
              <p className="mt-1 text-2xl font-semibold text-oe-foreground-primary">{formatWon(TOTAL_PAY)}</p>
            </div>
          </section>

          <section className="overflow-x-auto rounded-lg border border-oe-border-secondary">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-oe-background-secondary text-left text-oe-foreground-secondary">
                  <th scope="col" className="px-4 py-3 font-medium">
                    직원
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    시급
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    근무 시간
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    급여
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="relative border-t border-oe-border-secondary transition-colors hover:bg-oe-interaction-hover-subtle"
                  >
                    <td className="px-4 py-3">
                      <a
                        href="#"
                        className="rounded-sm font-medium text-oe-foreground-primary underline-offset-4 outline-none after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary"
                      >
                        {record.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-oe-foreground-secondary">{formatWon(record.hourlyWage)}</td>
                    <td className="px-4 py-3 text-oe-foreground-secondary">{record.hours}시간</td>
                    <td className="px-4 py-3 font-medium text-oe-foreground-primary">{formatWon(record.pay)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[record.status]} variant="tonal">
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <nav aria-label="표 페이지 이동" className="flex items-center justify-center gap-3">
            <Button controlSize="xlarge" tone="neutral" variant="outline">
              이전
            </Button>
            <span className="text-sm text-oe-foreground-secondary">1 / 3</span>
            <Button controlSize="xlarge" tone="neutral" variant="outline">
              다음
            </Button>
          </nav>
        </main>
      </div>
    </div>
  );
}
