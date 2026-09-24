"use client";

/**
 * 나이키 런 러닝 기록 저장 (요청 #108)
 *
 * 요청 원문: 키로수 저장 및 위치정보 페이지 약관 팝업 등등 4-5개 정도 (비슷한 화면: 나이키 런)
 * 이 화면은 그 가운데 「키로수 저장」 한 장이다. 유형: web.
 *
 * 지어냄: 이번 런의 거리(km)·시간·평균 페이스 요약, 저장 버튼과 저장 후 안내, 기본값 거리 5.20km.
 *
 * 비워 둔 자리: 없음. 「위치 정보 설정」·「기록 목록 보기」 링크는 같은 회차의 화면을 가리킨다. 저장은 화면 안 상태만 바꾼다.
 */

import { useState } from "react";
import { Button, Field, Input } from "@ooee/ui";

const RUN_SECONDS = 28 * 60 + 34;

function formatPace(distance: number): string {
  if (!Number.isFinite(distance) || distance <= 0) return "-";
  const perKm = Math.round(RUN_SECONDS / distance);
  return `${Math.floor(perKm / 60)}'${String(perKm % 60).padStart(2, "0")}"/km`;
}

const LINK_CLASS =
  "rounded-sm text-sm text-oe-brand-foreground-primary underline outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary";

export default function NikeRunSavePage() {
  const [distance, setDistance] = useState("5.20");
  const [saved, setSaved] = useState(false);

  const value = Number(distance);
  const invalid = distance.trim() === "" || !Number.isFinite(value) || value <= 0;

  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between px-6">
          <span className="text-base font-semibold text-oe-foreground-primary">나이키 런</span>
          <a href="/nike-run-location" className={LINK_CLASS}>
            위치 정보 설정
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-[960px] flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-oe-foreground-primary">러닝 기록 저장</h1>
          <p className="text-sm text-oe-foreground-secondary">이번 런의 거리를 확인하고 저장해요.</p>
        </div>

        <section
          aria-label="이번 런 요약"
          className="grid grid-cols-1 gap-4 rounded-oe-control border border-oe-border-secondary bg-oe-background-primary p-6 sm:grid-cols-3"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs text-oe-foreground-tertiary">거리</span>
            <span className="text-2xl font-semibold tabular-nums text-oe-foreground-primary">
              {invalid ? "-" : `${value.toFixed(2)} km`}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-oe-foreground-tertiary">시간</span>
            <span className="text-2xl font-semibold tabular-nums text-oe-foreground-primary">00:28:34</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-oe-foreground-tertiary">평균 페이스</span>
            <span className="text-2xl font-semibold tabular-nums text-oe-foreground-primary">{formatPace(value)}</span>
          </div>
        </section>

        <form
          className="flex max-w-[480px] flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!invalid) setSaved(true);
          }}
        >
          <Field
            label="거리"
            required
            helperText="소수 둘째 자리까지 적을 수 있어요."
            errorMessage={invalid ? "0보다 큰 거리를 입력해 주세요." : undefined}
          >
            <Input
              controlSize="xlarge"
              inputMode="decimal"
              suffix="km"
              value={distance}
              onChange={(event) => {
                setDistance(event.target.value);
                setSaved(false);
              }}
            />
          </Field>

          <Button type="submit" controlSize="xlarge" disabled={invalid}>
            거리 저장
          </Button>

          {saved ? (
            <p
              role="status"
              className="rounded-oe-control border border-oe-success-border-primary bg-oe-success-background-primary px-4 py-3 text-sm text-oe-success-foreground-primary"
            >
              {value.toFixed(2)}km를 저장했어요.
            </p>
          ) : null}
        </form>

        <a href="/nike-run-records" className={`${LINK_CLASS} self-start`}>
          기록 목록 보기
        </a>
      </main>
    </div>
  );
}
