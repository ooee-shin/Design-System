"use client";

/**
 * STO 지원요청. STO는 사장님용 모바일 앱이며 웹에서 열면 390px 모바일 뷰가 화면 가운데에 선다.
 * 매장 사장님이 본사에 지원을 요청하는 폼 한 장이다. 맨 위는 앱 헤더로 제목 「지원요청」과 왼쪽
 * 뒤로가기 아이콘 버튼이 있다. 본문은 위에서 아래로 요청 유형(필수, 단일 선택), 매장(필수, 단일
 * 선택), 제목(필수, 한 줄), 내용(필수, 여러 줄, 최대 500자에 글자 수 표시), 사진 첨부(선택, 사진
 * 선택 화면을 여는 입력형 버튼), 연락 가능 시간(필수, 단일 선택, 기본값 무관), 긴급 요청 여부(스위치,
 * 기본 꺼짐)를 두고, 맨 아래에 폭을 채우는 XLarge 「요청 보내기」 제출 버튼을 화면 바닥에 둔다.
 *
 * 비워 둔 자리: 뒤로가기 버튼을 눌렀을 때의 이동 경로, 사진 선택 화면을 열었을 때의 실제 UI와
 * 첨부된 사진의 표시 방식, 「요청 보내기」를 눌렀을 때의 제출 동작과 검증.
 */

import { useState } from "react";
import { RiArrowLeftLine, RiImageAddLine } from "@remixicon/react";

import { AppHeader, Button, Field, Input, InputButton, Select, SwitchField, Textarea } from "@ooee/ui";

const REQUEST_TYPE_OPTIONS = [
  { value: "device-error", label: "기기 오류" },
  { value: "settlement", label: "정산 문의" },
  { value: "inventory", label: "재고 요청" },
  { value: "etc", label: "기타" },
];

const STORE_OPTIONS = [
  { value: "gangnam", label: "강남점" },
  { value: "hongdae", label: "홍대점" },
  { value: "busan-seomyeon", label: "부산 서면점" },
];

const CONTACT_TIME_OPTIONS = [
  { value: "morning", label: "오전" },
  { value: "afternoon", label: "오후" },
  { value: "any", label: "무관" },
];

const CONTENT_MAX_LENGTH = 500;

export default function StoSupportRequestPage() {
  const [content, setContent] = useState("");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-oe-background-primary">
      <AppHeader
        title="지원요청"
        leadingElement={<Button variant="ghost" tone="neutral" aria-label="뒤로가기" leadingIcon={<RiArrowLeftLine />} />}
      />

      <form onSubmit={(event) => event.preventDefault()} className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-5 px-4 py-5">
          <Field label="요청 유형" required>
            <Select controlSize="large" placeholder="요청 유형 선택" options={REQUEST_TYPE_OPTIONS} />
          </Field>

          <Field label="매장" required>
            <Select controlSize="large" placeholder="매장 선택" options={STORE_OPTIONS} />
          </Field>

          <Field label="제목" required>
            <Input controlSize="large" placeholder="요청 제목을 입력해 주세요" />
          </Field>

          <Field label="내용" required characterCount={{ current: content.length, max: CONTENT_MAX_LENGTH }}>
            <Textarea
              placeholder="상황을 자세히 적어 주세요"
              maxLength={CONTENT_MAX_LENGTH}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </Field>

          <Field label="사진 첨부">
            <InputButton
              controlSize="large"
              placeholder="사진 선택"
              leadingElement={<RiImageAddLine />}
              aria-haspopup="dialog"
              onClick={() => {}}
            />
          </Field>

          <Field label="연락 가능 시간" required>
            <Select controlSize="large" placeholder="연락 가능 시간 선택" defaultValue="any" options={CONTACT_TIME_OPTIONS} />
          </Field>

          <SwitchField label="긴급 요청" defaultChecked={false} />
        </div>

        <div className="sticky bottom-0 border-t border-oe-border-secondary bg-oe-background-primary px-4 py-3">
          <Button type="submit" variant="fill" tone="brand" controlSize="xlarge" layout="fill">
            요청 보내기
          </Button>
        </div>
      </form>
    </div>
  );
}
