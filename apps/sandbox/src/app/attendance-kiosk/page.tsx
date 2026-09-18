/**
 * 출퇴근 찍기. 매장 입구에 세워 두는 태블릿 화면이며, 직원이 자기 이름을 눌러 출근·퇴근을 찍는다.
 *
 * 맨 위는 머리글이다. 왼쪽에 매장 이름 「강남점」, 오른쪽에 오늘 날짜와 지금 시각이 선다(보기 값으로 채운다).
 *
 * 본문은 두 덩이다.
 *
 * 첫째 덩이는 「근무 중」이고 지금 출근해 있는 직원들이다. 직원마다 한 칸이며 그 안에 이름, 출근 시각, 지금까지
 * 일한 시간, 그리고 폭을 채우는 「퇴근하기」 버튼이 있다. 세 명을 보기 값으로 채운다.
 *
 * 둘째 덩이는 「대기 중」이고 아직 출근하지 않은 직원들이다. 직원마다 한 칸이며 이름과 폭을 채우는 「출근하기」
 * 버튼이 있다. 네 명을 보기 값으로 채운다.
 *
 * 각 덩이의 제목 옆에는 인원 수를 적는다(예: 「근무 중 3명」).
 *
 * 직원 칸은 손가락으로 누르는 자리이므로 넉넉히 둔다. 버튼을 눌렀을 때의 동작은 정하지 않았다. 직원 목록을
 * 어디서 가져오는지도 정하지 않았다.
 *
 * 정하지 않아 비워 둔 자리
 * - 「퇴근하기」·「출근하기」 버튼을 눌렀을 때 실제로 벌어지는 동작(서버 반영, 확인 절차 등)
 * - 직원 목록을 가져오는 곳(로그인 세션, 매장 설정 등)
 * - 직원 칸 전체를 눌러도 되는지, 버튼만 누르는 자리인지. 본문이 동작을 「버튼」에만 붙여 버튼만 조작
 *   요소로 두었다.
 */
import { Button } from "@ooee/ui";

type WorkingEmployee = {
  name: string;
  checkInTime: string;
  workedDuration: string;
};

const WORKING_EMPLOYEES: WorkingEmployee[] = [
  { name: "김민서", checkInTime: "09:02", workedDuration: "5시간 12분" },
  { name: "박도윤", checkInTime: "10:15", workedDuration: "3시간 59분" },
  { name: "이서준", checkInTime: "13:00", workedDuration: "1시간 14분" },
];

const WAITING_EMPLOYEES: string[] = ["최유나", "정하윤", "강지호", "오세아"];

export default function AttendanceKioskPage() {
  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1194px] flex-col border-oe-border-secondary bg-oe-background-primary lg:border-x">
        <header className="flex items-start justify-between gap-6 border-b border-oe-border-secondary px-oe-padding-default py-6 md:px-oe-padding-wide">
          <h1 className="text-3xl font-semibold text-oe-foreground-primary">강남점</h1>
          <div className="text-right">
            <p className="text-base font-medium text-oe-foreground-secondary">2026년 9월 17일 (목)</p>
            <p className="text-2xl font-semibold text-oe-foreground-primary">14:32</p>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-10 px-oe-padding-default py-8 md:px-oe-padding-wide">
          <section>
            <h2 className="text-xl font-semibold text-oe-foreground-primary">
              근무 중 <span className="font-normal text-oe-foreground-secondary">{WORKING_EMPLOYEES.length}명</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WORKING_EMPLOYEES.map((employee) => (
                <div
                  key={employee.name}
                  className="flex flex-col gap-5 rounded-lg border border-oe-border-secondary bg-oe-background-primary p-6"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-semibold text-oe-foreground-primary">{employee.name}</p>
                    <p className="text-sm text-oe-foreground-secondary">출근 {employee.checkInTime}</p>
                    <p className="text-sm text-oe-foreground-tertiary">{employee.workedDuration} 경과</p>
                  </div>
                  <Button
                    variant="fill"
                    tone="brand"
                    controlSize="xlarge"
                    layout="fill"
                    aria-label={`${employee.name} 퇴근하기`}
                  >
                    퇴근하기
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oe-foreground-primary">
              대기 중 <span className="font-normal text-oe-foreground-secondary">{WAITING_EMPLOYEES.length}명</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WAITING_EMPLOYEES.map((name) => (
                <div
                  key={name}
                  className="flex flex-col gap-5 rounded-lg border border-oe-border-secondary bg-oe-background-primary p-6"
                >
                  <p className="text-lg font-semibold text-oe-foreground-primary">{name}</p>
                  <Button variant="fill" tone="brand" controlSize="xlarge" layout="fill" aria-label={`${name} 출근하기`}>
                    출근하기
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
