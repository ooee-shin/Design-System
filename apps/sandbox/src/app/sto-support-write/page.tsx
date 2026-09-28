"use client";

/**
 * STO 지원요청 작성
 *
 * 요청 원문: STO 지원요청하는 앱 버전 1페이지 만들어줘
 *
 * 요청에 없어 정한 것(지어냄): 화면 key 는 sto-support-write(기존 sto-support-request 와 겹치지 않게),
 * 입력 항목(요청 유형·제목·내용)과 제출 버튼 문구·기본값.
 *
 * 비워 둔 자리: 뒤로가기의 목적지(`#`), 제출 뒤의 동작(제출은 `preventDefault` 까지).
 */

import { useState } from "react";
import { RiArrowLeftLine } from "@remixicon/react";
import { AppHeader, Button, Field, Input, Select, Textarea } from "@ooee/ui";

const REQUEST_TYPES = [
  { value: "usage", label: "이용 문의" },
  { value: "error", label: "오류 신고" },
  { value: "suggestion", label: "기능 제안" },
  { value: "etc", label: "기타" },
];

const TITLE_MAX = 50;
const CONTENT_MAX = 500;

export default function StoSupportWritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col border-oe-border-secondary bg-oe-background-primary sm:border-x">
        <AppHeader
          title="지원요청 작성"
          leadingElement={
            <Button
              render={<a href="#" />}
              nativeButton={false}
              role="link"
              variant="ghost"
              tone="neutral"
              controlSize="large"
              leadingIcon={<RiArrowLeftLine aria-hidden="true" />}
              aria-label="뒤로가기"
            />
          }
        />
        <form className="flex flex-1 flex-col gap-5 px-oe-padding-default pt-5 pb-8" onSubmit={(event) => event.preventDefault()}>
          <Field label="요청 유형" required>
            <Select controlSize="large" placeholder="유형 선택" options={REQUEST_TYPES} />
          </Field>
          <Field label="제목" required characterCount={{ current: title.length, max: TITLE_MAX }}>
            <Input
              controlSize="large"
              placeholder="요청 제목 입력"
              maxLength={TITLE_MAX}
              value={title}
              onValueChange={setTitle}
            />
          </Field>
          <Field label="내용" required characterCount={{ current: content.length, max: CONTENT_MAX }}>
            <Textarea
              height={140}
              placeholder="요청 내용 입력"
              maxLength={CONTENT_MAX}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </Field>
          <Button type="submit" layout="fill" controlSize="large" className="mt-auto">
            요청 등록
          </Button>
        </form>
      </div>
    </div>
  );
}
