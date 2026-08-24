import {
  RiArchiveLine, RiArrowLeftLine, RiArrowRightLine, RiAttachmentLine, RiBarChartBoxLine, RiCalendarLine,
  RiCheckDoubleLine, RiCheckLine, RiDashboardLine, RiDeleteBinLine, RiDownloadLine, RiExternalLinkLine,
  RiFileCopyLine, RiFileTextLine, RiFilterLine, RiFolderLine, RiInformationLine, RiMoonLine, RiMoreLine,
  RiPulseLine, RiRestartLine, RiRocketLine, RiSearchLine, RiSendPlane2Line, RiServerLine, RiShareForwardLine,
  RiShieldUserLine, RiSpeedUpLine, RiSunLine, RiTimeLine,
} from "@remixicon/react";

import { CatalogGrid, CatalogCard, CatalogTable, FoundationCatalog, FoundationSection } from "@/components/foundations/foundation-catalog";
import { FoundationPageShell } from "@/components/foundations/foundation-page-shell";

const icons = [
  ["RiArchiveLine", RiArchiveLine], ["RiArrowLeftLine", RiArrowLeftLine], ["RiArrowRightLine", RiArrowRightLine], ["RiAttachmentLine", RiAttachmentLine],
  ["RiBarChartBoxLine", RiBarChartBoxLine], ["RiCalendarLine", RiCalendarLine], ["RiCheckDoubleLine", RiCheckDoubleLine], ["RiCheckLine", RiCheckLine],
  ["RiDashboardLine", RiDashboardLine], ["RiDeleteBinLine", RiDeleteBinLine], ["RiDownloadLine", RiDownloadLine], ["RiExternalLinkLine", RiExternalLinkLine],
  ["RiFileCopyLine", RiFileCopyLine], ["RiFileTextLine", RiFileTextLine], ["RiFilterLine", RiFilterLine], ["RiFolderLine", RiFolderLine],
  ["RiInformationLine", RiInformationLine], ["RiMoonLine", RiMoonLine], ["RiMoreLine", RiMoreLine], ["RiPulseLine", RiPulseLine],
  ["RiRestartLine", RiRestartLine], ["RiRocketLine", RiRocketLine], ["RiSearchLine", RiSearchLine], ["RiSendPlane2Line", RiSendPlane2Line],
  ["RiServerLine", RiServerLine], ["RiShareForwardLine", RiShareForwardLine], ["RiShieldUserLine", RiShieldUserLine], ["RiSpeedUpLine", RiSpeedUpLine],
  ["RiSunLine", RiSunLine], ["RiTimeLine", RiTimeLine],
] as const;

export default function IconFoundationPage() {
  return <FoundationPageShell title="Icon" description="현재 공용 자산에서 실제 사용하는 Remix Icon과 등록된 공급원 정보를 표시합니다."><FoundationCatalog><FoundationSection title="Source" description="공용 아이콘 공급원 우선순위입니다."><CatalogTable rows={[
    { name: "Primary", kind: "Asset", value: "Remix Icon / @remixicon/react 4.9.0", preview: <RiInformationLine className="size-5" /> },
    { name: "Secondary", kind: "Asset", value: "Google Material Symbols / no current usage", preview: "—" },
  ]} /></FoundationSection><FoundationSection title="Registered usage" description="현재 UI와 패턴 코드에서 실제로 참조하는 Line icon 자산입니다."><CatalogGrid>{icons.map(([name, Icon]) => <CatalogCard key={name} name={name} kind="Asset" value="Remix Line"><Icon className="size-6 text-oe-foreground-primary" aria-hidden="true" /></CatalogCard>)}</CatalogGrid></FoundationSection></FoundationCatalog></FoundationPageShell>;
}
