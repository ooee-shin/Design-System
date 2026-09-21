/**
 * 관리자 웹의 지원요청 목록이다.
 *
 * 관리자 레이아웃과 화면 머리까지만 세운 껍데기다. 목록에 무엇이 서는지는 아직 정하지 않았다.
 * 점주의 소리 목록과 같은 틀로 갈지, 채팅을 가진 채널이라 다른 열이 서야 하는지가 남아 있다.
 * 자리를 미리 채우면 그것이 결정처럼 굳으므로 지금은 본문을 비워 둔다.
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
        <ScreenPlaceholder name="Content" className="m-6 flex-1" />
      </div>
    </AdminLayout>
  );
}
