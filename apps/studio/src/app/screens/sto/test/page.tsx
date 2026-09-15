import { MobileWebView, ScreenExitLink, ScreenPlaceholder } from "@/components/screens/screen-chrome";

/**
 * STO 는 사장님용 앱이다. 웹에서 접근하면 모바일 뷰가 화면 가운데에 선다.
 *
 * 화면을 무엇으로 채울지는 아직 정하지 않았다. 위아래에 무엇이 서는지, 하단 내비게이션을 쓰는지,
 * 넓은 화면에서 좌우를 어떻게 확장하는지가 모두 남아 있다. 자리를 미리 채우면 그것이 결정처럼
 * 굳으므로 지금은 세로 구조를 잡는 껍데기만 둔다.
 */
export default function StoScreenPage() {
  return (
    <>
      <MobileWebView label="STO 사장님용 앱 화면">
        <ScreenPlaceholder name="Content" className="m-4 flex-1" />
      </MobileWebView>

      <ScreenExitLink backTo="/screens/sto" label="STO" />
    </>
  );
}
