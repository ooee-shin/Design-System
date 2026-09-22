/**
 * 관리자웹의 실제 메뉴 이름이다. 사용자가 준 화면 지도의 1번부터 8번까지, 즉 좌측 레일에 쌓이는
 * GNB 항목만 옮겼다. 유틸리티로 분류된 9번 이후는 레일에 뜨지 않으므로 넣지 않았다.
 *
 * **이름만 가져왔고 경로는 만들지 않았다.** 링크는 블록이 쓰던 `#` 그대로이며, 화면을 만들 때
 * 하나씩 실제 경로로 바꾼다.
 *
 * 원본에서 옮기지 않은 것이 셋이다. 계약관리의 「공통 서식 허브」는 메뉴가 아니라 라우트 전용으로
 * 적혀 있어 뺐고, 앱관리의 「점주 앱에 뿌리는 콘텐츠 6종」과 커뮤니티의 「사내 게시판 3종」은 메뉴
 * 이름이 아니라 그 묶음을 설명하는 문장이라 그 아래 항목만 남겼다.
 */
import {
  RiBookLine,
  RiCalendarLine,
  RiChat3Line,
  RiCustomerServiceLine,
  RiDatabase2Line,
  RiDraftLine,
  RiFileListLine,
  RiFlagLine,
  RiFolderChartLine,
  RiHeadphoneLine,
  RiLineChartLine,
  RiListUnordered,
  RiMap2Line,
  RiMegaphoneLine,
  RiQuestionAnswerLine,
  RiQuestionLine,
  RiQuestionnaireLine,
  RiRunLine,
  RiShieldCheckLine,
  RiStore2Line,
  RiStoreLine,
  RiTaskLine,
  RiTimeLine,
  RiTruckLine,
  RiUserAddLine,
  RiUserSettingsLine,
  RiUserUnfollowLine,
  RiWindowLine,
} from "@remixicon/react"

import type { NavGroup } from "@/components/candidates/app-sidebar"

export const ADMIN_MENU: NavGroup[] = [
    {
      title: "가맹영업",
      items: [
        { title: "신규가맹문의", icon: RiUserAddLine },
        { title: "가맹상담관리", icon: RiChat3Line },
        { title: "제외문의", icon: RiUserUnfollowLine },
        { title: "상권탐색", icon: RiMap2Line },
      ],
    },
    {
      title: "계약관리",
      items: [
        {
          title: "계약대상",
          icon: RiFileListLine,
          items: [
            { title: "신규" },
            { title: "재계약" },
            { title: "양도양수" },
            { title: "명의변경" },
            { title: "리뉴얼" },
            { title: "폐점관리" },
          ],
        },
        { title: "계약진행", icon: RiDraftLine },
        // 셋이 같은 네모 문서이고 완료에만 체크가 붙는다. 꼬리가 달린 문서는 앞의 둘과 계열이
        // 어긋난다.
        { title: "계약완료", icon: RiTaskLine },
      ],
    },
    {
      title: "가맹점관리",
      items: [{ title: "오픈매장관리", icon: RiStoreLine }, { title: "가맹점현황", icon: RiStore2Line }],
    },
    {
      title: "운영관리",
      items: [
        { title: "지원요청관리", icon: RiCustomerServiceLine },
        { title: "품질관리", icon: RiShieldCheckLine },
        { title: "미션관리", icon: RiFlagLine },
        { title: "일정관리", icon: RiCalendarLine },
        { title: "활동관리", icon: RiRunLine },
        { title: "설문조사관리", icon: RiQuestionnaireLine },
        {
          title: "파트너 & 고객센터",
          icon: RiHeadphoneLine,
          items: [{ title: "고객의 소리" }, { title: "점주의 소리" }],
        },
        { title: "발주관리", icon: RiTruckLine },
      ],
    },
    {
      title: "앱관리",
      items: [
        { title: "가맹점 공지사항", icon: RiMegaphoneLine },
        // 교육자료·청년늬우스·홍보자료는 같은 목록 아이콘을 쓴다. 성격이 같은 게시판이라
        // 아이콘을 따로 두면 서로 다른 기능처럼 보인다. 공지사항·팝업·FAQ 는 게시판이 아니라
        // 각자 다른 쓰임이라 자기 아이콘을 갖는다.
        { title: "교육자료", icon: RiListUnordered },
        { title: "청년늬우스", icon: RiListUnordered },
        { title: "홍보자료", icon: RiListUnordered },
        { title: "팝업", icon: RiWindowLine },
        { title: "FAQ", icon: RiQuestionLine },
      ],
    },
    {
      title: "커뮤니티",
      items: [
        { title: "전사공지사항", icon: RiMegaphoneLine },
        { title: "운영FAQ", icon: RiQuestionAnswerLine },
        { title: "운영관리매뉴얼", icon: RiBookLine },
      ],
    },
    {
      title: "통계",
      items: [
        {
          title: "매출",
          icon: RiLineChartLine,
          items: [
            { title: "일일실적" },
            { title: "Comp.S 순위" },
            { title: "MSR" },
          ],
        },
        { title: "품질관리", icon: RiShieldCheckLine },
        { title: "운영", icon: RiFolderChartLine, items: [{ title: "지원요청 현황" }] },
        {
          title: "데이터 관리",
          icon: RiDatabase2Line,
          items: [
            { title: "목표 매출 업로드" },
            { title: "배달 매출 업로드" },
            { title: "재료비 업로드" },
            { title: "로열티 업로드" },
            { title: "상품 설정" },
            { title: "지출 비용 설정" },
          ],
        },
      ],
    },
    {
      title: "업무 관리",
      items: [{ title: "업무관리", icon: RiTimeLine }, { title: "업무관리 사용자별", icon: RiUserSettingsLine }],
    },
  ]
