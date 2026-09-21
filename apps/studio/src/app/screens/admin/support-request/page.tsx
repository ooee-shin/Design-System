/**
 * 관리자 웹의 지원요청 목록이다.
 *
 * 앞의 관리자 목록이 표 한 장으로 뷰포트를 채우는 안이라면, 이 화면은 **왼쪽에 목록, 오른쪽에
 * 상세**를 함께 두는 안이다. 사장님 앱에서 목록과 상세가 두 장으로 나뉘어 있는 것을 PC 의 넓은
 * 폭에서 한 화면에 펼친다. 목록에서 한 건을 고르면 오른쪽이 그 건으로 바뀌므로, 건을 오갈 때마다
 * 목록으로 돌아갔다 다시 들어오지 않는다.
 *
 * 두 자리에 무엇이 서는지는 아직 정하지 않았다. 자리를 미리 채우면 그것이 결정처럼 굳으므로 지금은
 * 폭만 잡아 둔다.
 */

import { AdminLayout } from "@/components/candidates/admin-layout";
import { PageHeader } from "@/components/candidates/page-header";
import { ScreenPlaceholder } from "@/components/screens/screen-chrome";

// 좌측 내비게이션의 이름을 그대로 따른다. 점주의 소리가 「파트너 & 고객센터」 아래에 있는 것과
// 달리 지원요청관리는 운영관리 바로 아래에 선다.
const PAGE_PATH = ["운영관리", "지원요청관리"];

export default function AdminSupportRequestScreenPage() {
  return (
    <AdminLayout>
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader path={PAGE_PATH} title="지원요청관리" />
        {/* 왼쪽 폭은 400px 로 잡아 둔다. 옮겨 오는 것이 사장님 앱의 목록이라 그 앱의 폭(390px)에
            맞춰 두면 한 줄에 담기던 것이 그대로 담긴다. 오른쪽 상세가 남은 폭을 전부 쓴다. */}
        <div className="flex min-h-0 flex-1 gap-3 p-6">
          <ScreenPlaceholder name="List" className="w-[400px] shrink-0" />
          <ScreenPlaceholder name="Detail" className="flex-1" />
        </div>
      </div>
    </AdminLayout>
  );
}
