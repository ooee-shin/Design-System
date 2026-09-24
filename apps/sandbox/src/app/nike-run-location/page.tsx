"use client";

/**
 * 나이키 런 위치 정보 설정 (요청 #108)
 *
 * 요청 원문: 키로수 저장 및 위치정보 페이지 약관 팝업 등등 4-5개 정도 (비슷한 화면: 나이키 런)
 * 이 화면은 그 가운데 「위치정보 페이지」 한 장이다. 유형: web.
 *
 * 지어냄: 위치 정보 사용 스위치, 수집 시점 두 갈래(앱을 사용하는 동안만 · 항상), 설정 저장 버튼과 저장 안내,
 * 위치기반서비스 이용약관 링크. 기본값은 사용 켬·앱을 사용하는 동안만.
 *
 * 비워 둔 자리: 약관 링크는 같은 회차의 약관 화면을 가리킨다. 저장은 화면 안 상태만 바꾼다.
 */

import { useState } from "react";
import { Button, Field, RadioField, RadioGroup, SwitchField } from "@ooee/ui";

const LINK_CLASS =
  "rounded-sm text-sm text-oe-brand-foreground-primary underline outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary";

export default function NikeRunLocationPage() {
  const [enabled, setEnabled] = useState(true);
  const [timing, setTiming] = useState("while-using");
  const [saved, setSaved] = useState(false);

  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between px-6">
          <span className="text-base font-semibold text-oe-foreground-primary">나이키 런</span>
          <a href="/nike-run-save" className={LINK_CLASS}>
            러닝 기록 저장
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-[960px] flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-oe-foreground-primary">위치 정보 설정</h1>
          <p className="text-sm text-oe-foreground-secondary">달린 거리와 경로를 기록하려면 위치 정보가 필요해요.</p>
        </div>

        <form
          className="flex max-w-[480px] flex-col gap-6 rounded-oe-control border border-oe-border-secondary bg-oe-background-primary p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
        >
          <SwitchField
            label="위치 정보 사용"
            checked={enabled}
            onCheckedChange={(checked) => {
              setEnabled(checked);
              setSaved(false);
            }}
          />

          <Field label="위치 수집 시점" group disabled={!enabled}>
            <RadioGroup
              value={timing}
              disabled={!enabled}
              onValueChange={(next) => {
                setTiming(String(next));
                setSaved(false);
              }}
            >
              <RadioField value="while-using" label="앱을 사용하는 동안만" />
              <RadioField value="always" label="항상 허용" bottomDescription="앱을 닫아도 달리는 동안 경로를 기록해요." />
            </RadioGroup>
          </Field>

          <a href="/nike-run-terms" className={`${LINK_CLASS} self-start`}>
            위치기반서비스 이용약관 보기
          </a>

          <Button type="submit" controlSize="xlarge">
            설정 저장
          </Button>

          {saved ? (
            <p
              role="status"
              className="rounded-oe-control border border-oe-success-border-primary bg-oe-success-background-primary px-4 py-3 text-sm text-oe-success-foreground-primary"
            >
              위치 정보 설정을 저장했어요.
            </p>
          ) : null}
        </form>
      </main>
    </div>
  );
}
