"use client";

/**
 * 자율 1페이지 작성 프로젝트: web
 *
 * 요구사항이 화면 내용을 정하지 않아 계정 설정 화면 한 장으로 자유롭게 구성했다. 이름·이메일 입력,
 * 언어 선택, 이메일 알림 수신 여부와 저장 버튼 모두 요청에 없어 처리하는 쪽이 정한 값이다.
 */

import { Button, Field, Input, Select, SwitchField } from "@ooee/ui";
export default function AccountSettingsPage() {
  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-center gap-8 px-oe-padding-default py-16 md:px-oe-padding-wide">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-oe-foreground-primary">계정 설정</h1>
          <p className="text-sm text-oe-foreground-secondary">기본 정보와 알림 설정을 관리합니다.</p>
        </div>

        <form
          className="flex flex-col gap-4 rounded-xl border border-oe-border-secondary bg-oe-background-primary p-6"
          onSubmit={(event) => event.preventDefault()}
        >
          <Field label="이름">
            <Input controlSize="large" placeholder="이름을 입력하세요" />
          </Field>

          <Field label="이메일">
            <Input type="email" controlSize="large" placeholder="이메일을 입력하세요" />
          </Field>

          <Field label="언어">
            <Select
              controlSize="large"
              options={[
                { value: "ko", label: "한국어" },
                { value: "en", label: "English" },
              ]}
              defaultValue="ko"
            />
          </Field>

          <SwitchField label="이메일 알림 받기" defaultChecked />

          <Button type="submit" variant="fill" layout="fill" controlSize="large">
            저장
          </Button>
        </form>
      </main>
    </div>
  );
}
