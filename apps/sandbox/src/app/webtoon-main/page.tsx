"use client"

/**
 * 요구사항: 네이버 웹툰 처럼 해줘
 *
 * 비워 둔 자리:
 * - 검색·로그인·요일 선택·모든 웹툰 상세 링크의 실제 목적지
 * - 웹툰 표지 이미지(자리만 마련)
 * - 랭킹·오늘의 웹툰에 실린 작품명·작가·장르·평점 데이터
 */

import { useState } from "react"
import { RiSearchLine, RiStarLine } from "@remixicon/react"
import { Badge, Button, Chip, Input } from "@ooee/ui"

const DAYS = ["전체", "월", "화", "수", "목", "금", "토", "일"] as const
type Day = (typeof DAYS)[number]
type Weekday = Exclude<Day, "전체">

type RankingWebtoon = {
  title: string
  author: string
  genre: string
  rating: string
}

type DailyWebtoon = RankingWebtoon & { day: Weekday }

const RANKING_WEBTOONS: RankingWebtoon[] = [
  { title: "나 혼자만 레벨업", author: "추공", genre: "액션", rating: "9.99" },
  { title: "화산귀환", author: "비가", genre: "무협", rating: "9.98" },
  { title: "여신강림", author: "야옹이", genre: "로맨스", rating: "9.97" },
  { title: "유미의 세포들", author: "이동건", genre: "일상", rating: "9.96" },
  { title: "참교육", author: "저스툰", genre: "드라마", rating: "9.95" },
]

const DAILY_WEBTOONS: DailyWebtoon[] = [
  { title: "신의 탑", author: "SIU", genre: "판타지", rating: "9.94", day: "월" },
  { title: "대학원 탈출일지", author: "카바", genre: "개그", rating: "9.87", day: "월" },
  { title: "외모지상주의", author: "박태준", genre: "액션", rating: "9.90", day: "화" },
  { title: "복학왕", author: "기안84", genre: "개그", rating: "9.80", day: "수" },
  { title: "마루는 강쥐", author: "모죠", genre: "일상", rating: "9.92", day: "목" },
  { title: "노블레스", author: "손제호", genre: "액션", rating: "9.93", day: "금" },
  { title: "치즈인더트랩", author: "순끼", genre: "로맨스", rating: "9.85", day: "토" },
  { title: "프리드로우", author: "전선욱", genre: "스포츠", rating: "9.88", day: "일" },
]

const LINK_FOCUS =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary"

function Rating({ rating }: { rating: string }) {
  return (
    <span className="flex items-center gap-0.5 text-xs text-oe-foreground-tertiary">
      <RiStarLine aria-hidden="true" className="size-oe-icon-xsmall" />
      {rating}
    </span>
  )
}

function Cover() {
  return (
    <span
      aria-hidden="true"
      className="flex aspect-[3/4] w-full shrink-0 items-center justify-center rounded-md bg-oe-background-secondary text-xs text-oe-foreground-tertiary"
    >
      표지
    </span>
  )
}

export default function WebtoonMainPage() {
  const [selectedDay, setSelectedDay] = useState<Day>("전체")
  const dailyWebtoons =
    selectedDay === "전체" ? DAILY_WEBTOONS : DAILY_WEBTOONS.filter((webtoon) => webtoon.day === selectedDay)

  return (
    <div className="min-h-dvh bg-oe-background-primary">
      <header className="flex items-center gap-3 border-b border-oe-border-secondary px-oe-padding-default py-3 md:px-oe-padding-wide">
        <h1 className="shrink-0 text-xl font-bold text-oe-brand-foreground-primary">웹툰</h1>
        <div className="min-w-0 flex-1 sm:max-w-sm">
          <Input
            variant="outline"
            controlSize="regular"
            aria-label="웹툰 검색"
            placeholder="웹툰, 작가 검색"
            leadingElement={<RiSearchLine aria-hidden="true" />}
          />
        </div>
        <Button variant="outline" tone="neutral" controlSize="regular" className="shrink-0">
          로그인
        </Button>
      </header>

      <main className="flex flex-col gap-8 px-oe-padding-default py-6 md:px-oe-padding-wide">
        <section aria-labelledby="day-picker-heading" className="flex flex-col gap-3">
          <h2 id="day-picker-heading" className="text-base font-semibold text-oe-foreground-primary">
            요일별 웹툰
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day) => (
              <Chip key={day} shape="rounded" active={selectedDay === day} onClick={() => setSelectedDay(day)}>
                {day}
              </Chip>
            ))}
          </div>
        </section>

        <section aria-labelledby="ranking-heading" className="flex flex-col gap-4">
          <h2 id="ranking-heading" className="text-base font-semibold text-oe-foreground-primary">
            인기 급상승 웹툰
          </h2>
          <ol className="flex flex-col gap-3">
            {RANKING_WEBTOONS.map((webtoon, index) => (
              <li key={webtoon.title} className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-center text-lg font-bold tabular-nums text-oe-brand-foreground-primary">
                  {index + 1}
                </span>
                <span className="h-16 w-12 shrink-0">
                  <Cover />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <a href="#" className={`truncate text-sm font-semibold text-oe-foreground-primary ${LINK_FOCUS}`}>
                    {webtoon.title}
                  </a>
                  <span className="truncate text-xs text-oe-foreground-secondary">{webtoon.author}</span>
                  <span className="flex items-center gap-2">
                    <Badge tone="neutral">{webtoon.genre}</Badge>
                    <Rating rating={webtoon.rating} />
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="today-heading" className="flex flex-col gap-4">
          <h2 id="today-heading" className="text-base font-semibold text-oe-foreground-primary">
            오늘의 웹툰
          </h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {dailyWebtoons.map((webtoon) => (
              <li key={webtoon.title} className="flex min-w-0 flex-col gap-2">
                <Cover />
                <a href="#" className={`truncate text-sm font-semibold text-oe-foreground-primary ${LINK_FOCUS}`}>
                  {webtoon.title}
                </a>
                <span className="truncate text-xs text-oe-foreground-secondary">{webtoon.author}</span>
                <span className="flex items-center gap-2">
                  <Badge tone="neutral">{webtoon.genre}</Badge>
                  <Rating rating={webtoon.rating} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
