/**
 * 회사 메인 페이지 (#131)
 *
 * 요구사항 원문:
 * 회사 메인 페이지. 반다이 처럼 이미지도 알아서 만들던지 아니면 가지고 와서 첨부 지어냄: 회사 이름·소개 문구·사업 분야 카드·소식 목록·문의 버튼 문구와 예시 데이터 전부, 이미지는 외부 파일 없이 화면 코드 안에서 그린 일러스트(그라디언트·도형·SVG)로 대신함 프로젝트: harness-test 유형: web, tablet, mobile
 *
 * 요청에 없어 정한 것(지어냄):
 * - 구성: 머리글(로고·메뉴·문의하기) → 히어로 → 사업 분야 카드 3장 → 소식 목록 → 문의 안내 → 바닥글.
 * - 회사 이름은 환경설정이 소유하는 값이라 `{회사명}` 자리로 둔다. 소개·카드·소식 문구와 날짜는 모두 예시다.
 * - 이미지는 외부 파일 없이 SVG 도형으로 그린 일러스트이며 색은 `oe-*` 토큰만 쓴다.
 * - 정렬은 요청이 말하지 않아 모두 왼쪽 정렬이다.
 *
 * 정하지 않아 비워 둔 자리:
 * - 모든 링크의 목적지(`href="#"`). 메뉴·카드·소식·문의하기가 가리킬 화면이 아직 없다.
 * - 반다이의 실제 구성과 이미지. 접속해 확인할 수 없어 「이미지가 큰 히어로·사업 카드·소식 목록」이라는 일반 구성으로 읽었다.
 */
import React from "react";
import { Badge, Button } from "@ooee/ui";
import { RiArrowRightLine, RiArrowRightUpLine } from "@remixicon/react";

const CONTAINER = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const LINK_FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary";

const NAV = ["회사 소개", "사업 분야", "소식", "채용"];

const BUSINESS = [
  {
    key: "character",
    title: "캐릭터·상품",
    description: "오래 곁에 두고 싶은 캐릭터를 만들고, 손에 쥘 수 있는 상품으로 전합니다.",
    tone: "bg-oe-warning-background-secondary",
  },
  {
    key: "digital",
    title: "디지털 콘텐츠",
    description: "게임과 앱, 영상으로 언제 어디서나 이어지는 즐거움을 만듭니다.",
    tone: "bg-oe-info-background-secondary",
  },
  {
    key: "experience",
    title: "체험·이벤트",
    description: "팬과 가족이 함께 모이는 전시와 팝업, 참여형 행사를 기획합니다.",
    tone: "bg-oe-success-background-secondary",
  },
] as const;

const NEWS = [
  { date: "2026.09.24", category: "공지", title: "추석 연휴 고객센터 운영 시간을 안내드립니다", isNew: true },
  { date: "2026.09.18", category: "제품", title: "가을 한정 캐릭터 상품 12종을 공개합니다", isNew: true },
  { date: "2026.09.05", category: "보도자료", title: "신작 모바일 게임 사전 등록을 시작합니다", isNew: false },
  { date: "2026.08.29", category: "채용", title: "2026년 하반기 신입·경력 공개 채용 안내", isNew: false },
  { date: "2026.08.12", category: "공지", title: "개인정보 처리방침이 일부 변경됩니다", isNew: false },
];

const FOOTER_LINKS = ["개인정보 처리방침", "이용약관", "고객센터"];

function HeroArt() {
  return (
    <svg viewBox="0 0 480 400" className="h-full w-full" aria-hidden="true" focusable="false">
      <circle cx="250" cy="210" r="150" className="fill-oe-brand-background-primary" />
      <circle cx="250" cy="210" r="104" className="fill-oe-brand-background-bold-primary" />
      <rect x="60" y="60" width="96" height="96" rx="24" transform="rotate(-12 108 108)" className="fill-oe-warning-background-bold-primary" />
      <circle cx="404" cy="96" r="44" className="fill-oe-info-background-bold-primary" />
      <path d="M392 300 L420 352 L364 352 Z" className="fill-oe-success-background-bold-primary" />
      <circle cx="220" cy="190" r="10" className="fill-oe-foreground-inverse" />
      <circle cx="282" cy="190" r="10" className="fill-oe-foreground-inverse" />
      <path d="M216 232 Q250 268 286 232" fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-oe-foreground-inverse" />
      <circle cx="90" cy="300" r="14" className="fill-oe-accent-background-bold-primary" />
      <circle cx="140" cy="344" r="8" className="fill-oe-brand-background-bold-primary" />
      <circle cx="430" cy="210" r="8" className="fill-oe-warning-background-bold-primary" />
    </svg>
  );
}

function CardArt({ kind }: { kind: (typeof BUSINESS)[number]["key"] }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true" focusable="false">
      {kind === "character" && (
        <>
          <circle cx="160" cy="104" r="66" className="fill-oe-warning-background-bold-primary" />
          <circle cx="112" cy="52" r="20" className="fill-oe-warning-background-bold-primary" />
          <circle cx="208" cy="52" r="20" className="fill-oe-warning-background-bold-primary" />
          <circle cx="138" cy="96" r="8" className="fill-oe-foreground-primary" />
          <circle cx="182" cy="96" r="8" className="fill-oe-foreground-primary" />
          <path d="M140 124 Q160 142 180 124" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-oe-foreground-primary" />
          <circle cx="60" cy="150" r="10" className="fill-oe-accent-background-bold-primary" />
          <circle cx="268" cy="44" r="7" className="fill-oe-brand-background-bold-primary" />
        </>
      )}
      {kind === "digital" && (
        <>
          <rect x="86" y="34" width="148" height="132" rx="18" className="fill-oe-info-background-bold-primary" />
          <rect x="100" y="48" width="120" height="86" rx="10" className="fill-oe-background-primary" />
          <path d="M148 68 L148 114 L186 91 Z" className="fill-oe-info-background-bold-primary" />
          <circle cx="160" cy="151" r="6" className="fill-oe-background-primary" />
          <circle cx="52" cy="60" r="12" className="fill-oe-brand-background-bold-primary" />
          <rect x="256" y="128" width="30" height="30" rx="8" className="fill-oe-warning-background-bold-primary" />
        </>
      )}
      {kind === "experience" && (
        <>
          <path d="M60 160 L160 44 L260 160 Z" className="fill-oe-success-background-bold-primary" />
          <rect x="132" y="112" width="56" height="48" rx="8" className="fill-oe-background-primary" />
          <rect x="158" y="20" width="4" height="30" className="fill-oe-foreground-primary" />
          <path d="M162 20 L192 30 L162 40 Z" className="fill-oe-danger-background-bold-primary" />
          <circle cx="42" cy="56" r="10" className="fill-oe-warning-background-bold-primary" />
          <circle cx="286" cy="88" r="14" className="fill-oe-brand-background-bold-primary" />
        </>
      )}
    </svg>
  );
}

export default function CompanyMainPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-oe-background-primary text-oe-foreground-primary">
      <header className="border-b border-oe-border-secondary">
        <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3`}>
          <a href="#" aria-label={"{회사명} 홈"} className={`flex items-center gap-2 rounded-sm ${LINK_FOCUS}`}>
            <span className="grid size-8 place-items-center rounded-full bg-oe-brand-background-bold-primary" aria-hidden="true">
              <span className="size-3 rounded-full bg-oe-foreground-inverse" />
            </span>
            <span className="text-lg font-bold">{"{회사명}"}</span>
          </a>
          <nav aria-label="주요 메뉴" className="order-last w-full overflow-x-auto md:order-none md:w-auto">
            <ul className="flex gap-6 px-2 py-2">
              {NAV.map((label) => (
                <li key={label} className="shrink-0">
                  <a
                    href="#"
                    className={`rounded-sm text-sm font-medium text-oe-foreground-secondary transition-colors hover:text-oe-foreground-primary ${LINK_FOCUS}`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Button render={<a href="#" />} nativeButton={false} role="link" variant="outline" controlSize="small">
            문의하기
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className={`${CONTAINER} grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20`}>
          <div className="flex flex-col gap-6">
            <p className="text-sm font-medium text-oe-brand-foreground-primary">놀이가 일상이 되는 회사</p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              즐거움을 만드는 일,
              <br />
              우리가 함께합니다
            </h1>
            <p className="max-w-xl text-base text-oe-foreground-secondary">
              캐릭터와 상품, 게임과 앱, 전시와 행사까지. 사람들이 웃는 순간을 만들기 위해 서로 다른 분야의 팀이 한 곳에서 일합니다.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Button render={<a href="#" />} nativeButton={false} role="link" variant="fill" controlSize="xlarge" trailingIcon={<RiArrowRightLine aria-hidden="true" />}>
                사업 분야 보기
              </Button>
              <Button render={<a href="#" />} nativeButton={false} role="link" variant="outline" tone="neutral" controlSize="xlarge">
                회사 소개 보기
              </Button>
            </div>
          </div>
          <div className="aspect-[6/5] overflow-hidden rounded-3xl bg-oe-background-secondary">
            <HeroArt />
          </div>
        </section>

        <section aria-labelledby="business-title" className="bg-oe-background-secondary py-12 lg:py-20">
          <div className={`${CONTAINER} flex flex-col gap-8`}>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-oe-brand-foreground-primary">우리가 하는 일</p>
              <h2 id="business-title" className="text-2xl font-semibold sm:text-3xl">
                즐거움을 세 가지 방식으로 전합니다
              </h2>
            </div>
            <ul className="grid gap-5 md:grid-cols-3">
              {BUSINESS.map((item) => (
                <li key={item.key} className="flex flex-col overflow-hidden rounded-2xl border border-oe-border-secondary bg-oe-background-primary">
                  <div className={`aspect-[8/5] ${item.tone}`}>
                    <CardArt kind={item.key} />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="text-lg font-semibold">
                      <a href="#" className={`inline-flex items-center gap-1 rounded-sm hover:text-oe-brand-foreground-primary ${LINK_FOCUS}`}>
                        {item.title}
                        <RiArrowRightUpLine className="size-oe-icon-small" aria-hidden="true" />
                      </a>
                    </h3>
                    <p className="text-sm text-oe-foreground-secondary">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="news-title" className={`${CONTAINER} flex flex-col gap-6 py-12 lg:py-20`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="news-title" className="text-2xl font-semibold sm:text-3xl">
              소식
            </h2>
            <a href="#" className={`inline-flex items-center gap-1 rounded-sm text-sm font-medium text-oe-foreground-secondary hover:text-oe-foreground-primary ${LINK_FOCUS}`}>
              소식 전체 보기
              <RiArrowRightLine className="size-oe-icon-small" aria-hidden="true" />
            </a>
          </div>
          <ul className="border-t border-oe-border-secondary">
            {NEWS.map((news) => (
              <li key={news.title} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-oe-border-secondary py-4">
                <time className="w-24 shrink-0 text-sm text-oe-foreground-tertiary">{news.date}</time>
                <span className="flex shrink-0 items-center gap-1.5">
                  <Badge tone="neutral">{news.category}</Badge>
                  {news.isNew && <Badge tone="brand">새 소식</Badge>}
                </span>
                <a href="#" className={`min-w-0 flex-1 basis-64 rounded-sm text-base hover:text-oe-brand-foreground-primary ${LINK_FOCUS}`}>
                  {news.title}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="contact-title" className="bg-oe-background-secondary py-12 lg:py-16">
          <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-6`}>
            <div className="flex max-w-2xl flex-col gap-2">
              <h2 id="contact-title" className="text-2xl font-semibold sm:text-3xl">
                함께 만들고 싶은 일이 있다면
              </h2>
              <p className="text-base text-oe-foreground-secondary">제휴, 라이선스, 취재 문의를 남겨 주세요. 평일 10:00부터 18:00까지 확인하고 답을 드립니다.</p>
            </div>
            <Button render={<a href="#" />} nativeButton={false} role="link" variant="tonal" controlSize="xlarge">
              문의 남기기
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-oe-border-secondary">
        <div className={`${CONTAINER} flex flex-col gap-4 py-8`}>
          <nav aria-label="하단 메뉴">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((label) => (
                <li key={label}>
                  <a href="#" className={`rounded-sm text-sm text-oe-foreground-secondary hover:text-oe-foreground-primary ${LINK_FOCUS}`}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-sm text-oe-foreground-tertiary">Copyright © {"{회사명}"}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
