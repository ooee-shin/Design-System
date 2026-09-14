import { redirect } from "next/navigation";

import { screenRoots } from "@/components/screens/screen-registry";

/**
 * 세 작업 목록은 화면 아래 탭으로 이어져 있다. 그 위에 목록을 고르는 화면을 한 겹 더 두면 같은
 * 선택을 두 번 하게 되므로, `/screens` 는 첫 목록으로 보낸다.
 */
export default function ScreensIndexPage() {
  redirect(`/screens/${screenRoots[0].key}`);
}
