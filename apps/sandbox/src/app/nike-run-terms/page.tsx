"use client";

/**
 * 나이키 런 약관 동의 (요청 #108)
 *
 * 요청 원문: 키로수 저장 및 위치정보 페이지 약관 팝업 등등 4-5개 정도 (비슷한 화면: 나이키 런)
 * 이 화면은 그 가운데 「약관 팝업」 한 장이다. 유형: web.
 *
 * 지어냄: 약관 세 개(이용약관·위치기반서비스 이용약관 필수, 마케팅 정보 수신 선택)와 전체 동의, 항목마다 「보기」 버튼이
 * 여는 약관 팝업(닫기·동의하고 닫기), 필수를 모두 고르면 켜지는 「동의하고 시작하기」 버튼. 약관 본문은 자리 문장이다.
 *
 * 비워 둔 자리: 약관 실제 본문, 시작하기의 목적지. 팝업은 공용 컴포넌트가 없어 화면 안에서 직접 그렸다.
 */

import { useEffect, useState } from "react";
import { Button, CheckboxField } from "@ooee/ui";

type Term = { id: string; title: string; required: boolean; body: string };

const TERMS: Term[] = [
  { id: "service", title: "나이키 런 이용약관", required: true, body: "나이키 런 서비스 이용에 관한 약관 본문이 들어갈 자리예요." },
  { id: "location", title: "위치기반서비스 이용약관", required: true, body: "달린 거리와 경로를 기록하기 위한 위치 정보 이용에 관한 약관 본문이 들어갈 자리예요." },
  { id: "marketing", title: "마케팅 정보 수신 동의", required: false, body: "이벤트와 소식을 받아보는 것에 관한 약관 본문이 들어갈 자리예요." },
];

export default function NikeRunTermsPage() {
  const [agreed, setAgreed] = useState<Record<string, boolean>>({ service: false, location: false, marketing: false });
  const [openId, setOpenId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const all = TERMS.every((term) => agreed[term.id]);
  const some = TERMS.some((term) => agreed[term.id]);
  const requiredDone = TERMS.filter((term) => term.required).every((term) => agreed[term.id]);
  const open = TERMS.find((term) => term.id === openId) ?? null;

  useEffect(() => {
    if (!openId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto flex h-14 max-w-[960px] items-center px-6">
          <span className="text-base font-semibold text-oe-foreground-primary">나이키 런</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-[960px] flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-oe-foreground-primary">약관 동의</h1>
          <p className="text-sm text-oe-foreground-secondary">서비스를 시작하기 전에 약관을 확인해 주세요.</p>
        </div>

        <div className="flex max-w-[480px] flex-col gap-4 rounded-oe-control border border-oe-border-secondary bg-oe-background-primary p-6">
          <CheckboxField
            isParent
            layout="fill"
            label="전체 동의"
            checked={all}
            indeterminate={some && !all}
            onCheckedChange={(checked) => {
              setStarted(false);
              setAgreed({ service: checked, location: checked, marketing: checked });
            }}
          />
          <div className="flex flex-col border-t border-oe-border-secondary pt-2">
            {TERMS.map((term) => (
              <div key={term.id} className="flex items-center justify-between gap-2">
                <CheckboxField
                  layout="fill"
                  label={`${term.required ? "(필수)" : "(선택)"} ${term.title}`}
                  checked={agreed[term.id]}
                  onCheckedChange={(checked) => {
                    setStarted(false);
                    setAgreed((prev) => ({ ...prev, [term.id]: checked }));
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  tone="neutral"
                  controlSize="small"
                  aria-label={`${term.title} 보기`}
                  onClick={() => setOpenId(term.id)}
                >
                  보기
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            controlSize="xlarge"
            layout="fill"
            disabled={!requiredDone}
            onClick={() => setStarted(true)}
          >
            동의하고 시작하기
          </Button>

          {started ? (
            <p
              role="status"
              className="rounded-oe-control border border-oe-success-border-primary bg-oe-success-background-primary px-4 py-3 text-sm text-oe-success-foreground-primary"
            >
              동의가 끝났어요. 이제 달릴 수 있어요.
            </p>
          ) : null}
        </div>
      </main>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="nike-run-terms-dialog-title"
            className="flex w-full max-w-[480px] flex-col gap-4 rounded-oe-control border border-oe-border-secondary bg-oe-background-primary p-6"
          >
            <h2 id="nike-run-terms-dialog-title" className="text-lg font-semibold text-oe-foreground-primary">
              {open.title}
            </h2>
            <p className="text-sm text-oe-foreground-secondary">{open.body}</p>
            <div className="flex justify-end gap-1.5">
              <Button type="button" variant="outline" tone="neutral" onClick={() => setOpenId(null)}>
                닫기
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setAgreed((prev) => ({ ...prev, [open.id]: true }));
                  setOpenId(null);
                }}
              >
                동의하고 닫기
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
