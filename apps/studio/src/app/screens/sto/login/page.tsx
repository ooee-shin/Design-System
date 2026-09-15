// `Input` 은 `"use client"` 를 스스로 선언하지 않고 소비자 쪽을 전제한다. 관리자 로그인과 같다.
"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";

import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";

import { Button, CheckboxField, Input } from "@ooee/ui";

import { MobileWebView } from "@/components/screens/screen-chrome";
import { cn } from "@/lib/utils";

/**
 * STO 로그인. 사장님용 앱의 첫 화면이며 웹에서 접근하면 모바일 뷰가 화면 가운데에 선다.
 *
 * 폼은 관리자 로그인에서 가져왔다. 아이디와 비밀번호 입력의 순서, 비밀번호 입력의 보기 전환,
 * 컨트롤 크기(`xlarge`)와 입력 변형(`filled`), 보이는 Label 없이 `aria-label` 로 이름을 주는
 * 방식이 같다. 가져오지 않은 것은 좌우를 가르는 바깥 레이아웃과 오른쪽 브랜드 패널, 폼 폭을
 * `max-w-sm` 으로 묶는 처리다. 앱은 한 칸짜리 화면이므로 좌우 여백만 두고 폭을 다 쓴다. 바닥의
 * Footer 는 관리자 로그인과 같은 구성을 그대로 쓴다.
 *
 * 관리자 화면에 없던 것은 「아이디 찾기」, 「회원가입」, 그리고 「로그인 상태 유지」다. 링크 셋은
 * 사용자 결정(2026-09-15)에 따라 로그인 버튼 아래 한 줄에 아이디 찾기·비밀번호 찾기·회원가입
 * 순서로 서고 구분선으로 갈린다. 관리자 화면의 「아이디 저장」은 가져오지 않는다. 앱은 로그인
 * 상태를 유지하므로 아이디만 남기는 선택을 따로 두지 않기로 했다.
 *
 * 비워 둔 자리: 제목 아래에 들어갈 문구, 로그인에 성공했을 때 가는 화면, 그리고 링크들이 갈
 * 페이지다. 폼 아래의 링크 셋과 Footer 의 두 링크 모두 갈 곳이 없는 상태로 둔다.
 */

// 제목은 사용자가 준 문구다.
const SCREEN_TITLE = "블루키 사장님 앱 로그인";

// 저작권 표기의 이름은 환경설정이 소유하는 값이다. 실제 값이 붙기 전까지 어디서 오는 값인지
// 그대로 적으며, 관리자 로그인과 같은 자리를 가리킨다.
const BRAND_NAME = "{BrandName}";

// 이 자리에 설 것은 사용자가 환경설정에 등록하는 {STO 로그인 로고 이미지}다. 아직 그 설정과 잇지
// 않았으므로, 관리자 웹이 메인 로고로 쓰고 있는 시험용 이미지를 그대로 세워 둔다. 원본은
// 2120×399 이며 여기서는 높이 36px 로 서고 폭은 비율대로 191px 이 된다.
const LOGIN_LOGO = { src: "/images/main-logo-sample.png", width: 191, height: 36 };

/**
 * 로그인을 눌렀을 때 화면이 알리는 두 가지다. 문구는 사용자가 준 것을 그대로 쓴다.
 *
 * `empty` 는 두 칸 중 하나라도 비었을 때다. 비어 있다는 것은 칸 자체가 이미 보여 주므로 입력에
 * 오류 표시를 더하지 않고, 비어 있는 첫 칸으로 커서만 옮긴다. `mismatch` 는 아이디와 비밀번호가
 * 맞지 않을 때다. 첫 칸에만 오류를 표시하고 그 칸으로 커서를 옮긴다. 두 칸을 함께 붉히면 고칠
 * 자리가 둘로 보이는데, 사용자가 손대는 자리는 언제나 커서가 놓인 한 칸이다.
 *
 * 두 표시 모두 알리는 일만 한다. 사용자가 다음으로 무엇을 하든, 누르거나 입력하는 순간 걷는다.
 * 읽고 나서 손을 움직이는 것이 이미 확인했다는 뜻이며, 그 뒤로도 붉은 채로 남아 있으면 방금
 * 지나간 잘못을 화면이 계속 붙들고 있는 셈이 된다.
 */
const LOGIN_NOTICE = {
  // 아직 채우지 않았다고 알리는 안내다. 잘못한 것이 아니라 남은 것이 있다는 뜻이므로 오류 색을
  // 쓰지 않는다.
  empty: { message: "아이디 또는 비밀번호를 입력해 주세요.", tone: "text-oe-brand-foreground-secondary" },
  // 이쪽은 넣은 값이 맞지 않는다는 오류다.
  mismatch: {
    message: "아이디 또는 비밀번호가 올바르지 않습니다. 입력한 정보를 다시 확인해주세요.",
    tone: "text-oe-danger-foreground-secondary",
  },
} as const;

type LoginNotice = keyof typeof LOGIN_NOTICE | null;

export default function StoLoginScreenPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<LoginNotice>(null);

  const userIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // 실제 인증과 잇지 않았으므로, 두 칸이 모두 채워져 있으면 맞지 않은 것으로 본다. 성공했을 때
  // 어디로 가는지가 정해지면 그 자리가 이 분기의 반대쪽이 된다.
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId || !password) {
      setNotice("empty");
      focusFirst(userId ? passwordRef : userIdRef);
      return;
    }

    setNotice("mismatch");
    focusFirst(userIdRef);
  };

  // 알린 뒤에는 사용자의 다음 동작 한 번으로 걷는다. 그 동작이 무엇인지는 가리지 않는다. 입력을
  // 누르면 그 칸은 커서가 놓인 보통 상태가 되고, 바깥을 누르면 아무 표시도 없는 상태로 돌아간다.
  useEffect(() => {
    if (!notice) return;

    const clear = () => setNotice(null);
    document.addEventListener("pointerdown", clear, { once: true });
    document.addEventListener("keydown", clear, { once: true });

    return () => {
      document.removeEventListener("pointerdown", clear);
      document.removeEventListener("keydown", clear);
    };
  }, [notice]);

  const invalid = notice === "mismatch";

  return (
    <MobileWebView label="STO 사장님용 앱 로그인 화면">
      {/* 좌우 여백은 모바일에서 기본값으로 서고 태블릿(`md`, 768px)부터 wide 로 벌어진다.
            규칙은 `interaction.md` 의 「화면 좌우 여백」이 소유한다. */}
        <div className="flex flex-1 flex-col justify-center px-oe-padding-default py-10 md:px-oe-padding-wide">
        {/* 로고와 시스템명은 한 덩이로 가운데에 선다. 아래의 폼은 왼쪽 선을 지킨다. */}
        <div className="mb-8 text-center">
          <Image
            src={LOGIN_LOGO.src}
            width={LOGIN_LOGO.width}
            height={LOGIN_LOGO.height}
            alt="{STO 로그인 로고 이미지}"
            priority
            className="mx-auto mb-6 h-9 w-auto"
          />
          <h1 className="text-2xl font-semibold text-oe-foreground-primary">{SCREEN_TITLE}</h1>
        </div>

        <form className="flex flex-col gap-3" onSubmit={submit} noValidate>
          {/* 보이는 Label 을 두지 않으므로 이름은 `aria-label` 이 갖는다. Placeholder 는 값이
              들어오면 사라지므로 이름을 대신할 수 없다. */}
          <Input
            ref={userIdRef}
            type="text"
            autoComplete="username"
            placeholder="아이디 입력"
            aria-label="아이디"
            aria-invalid={invalid || undefined}
            aria-describedby={LOGIN_NOTICE_ID}
            variant="filled"
            controlSize="xlarge"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />

          <PasswordInput
            inputRef={passwordRef}
            value={password}
            onValueChange={setPassword}
          />

          <LoginNoticeMessage notice={notice} />

          {/* CheckboxField 는 사방 8px 의 내부 조작 여백을 갖는다. 그대로 두면 체크박스가
              입력보다 8px 안쪽에서 시작하므로, `checkbox.md` 가 정한 대로 여백만큼 바깥으로
              보정해 실제 Indicator 의 왼쪽 시작점을 입력에 맞춘다. */}
          <CheckboxField label="로그인 상태 유지" className="-ml-2" />

          <Button type="submit" layout="fill" controlSize="xlarge" className="mt-2">
            로그인
          </Button>
        </form>

        {/* 로그인한 뒤에 가는 길이 아니라 로그인하지 못한 사람이 가는 길이므로, 폼 바깥에 둔다. */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <AuthLink label="아이디 찾기" />
          <LinkDivider />
          <AuthLink label="비밀번호 찾기" />
          <LinkDivider />
          <AuthLink label="회원가입" emphasis />
        </div>
      </div>

      {/* 폼이 남은 높이의 가운데에 서고 Footer 는 바닥에 붙는다. 관리자 로그인과 같은 구성이다. */}
      <footer className="flex flex-col items-center gap-2 px-oe-padding-default pb-8 md:px-oe-padding-wide">
        <div className="flex items-center gap-3">
          <AuthLink label="이용약관" />
          <LinkDivider />
          <AuthLink label="개인정보처리방침" />
        </div>
        <p className="text-xs text-oe-foreground-tertiary">
          Copyright © {BRAND_NAME}. All rights reserved.
        </p>
      </footer>
    </MobileWebView>
  );
}

const LOGIN_NOTICE_ID = "sto-login-notice";

/** 커서를 옮긴 칸이 화면 밖이면 스크롤이 함께 따라와야 하므로 브라우저 기본 동작에 맡긴다. */
function focusFirst(target: RefObject<HTMLInputElement | null>) {
  target.current?.focus();
}

/**
 * 안내와 오류 문구가 함께 서는 자리다. 문구가 없을 때도 같은 높이를 차지한다. 나타날 때마다 아래의
 * 체크박스와 버튼이 밀려 내려가면 누르려던 자리가 눌리는 순간에 바뀐다.
 *
 * `role="alert"` 이므로 화면 낭독기는 문구가 채워지는 순간에 읽는다. 자리를 늘 두는 것과 읽히는
 * 시점은 별개이며, 비어 있는 동안에는 읽을 것이 없다.
 */
function LoginNoticeMessage({ notice }: { notice: LoginNotice }) {
  const current = notice ? LOGIN_NOTICE[notice] : null;

  return (
    <div className="grid text-sm leading-5">
      {/* 자리를 잡는 것은 가장 긴 문구 자신이다. 높이를 숫자로 적어 두면 폭이 달라질 때마다 그
          숫자가 틀리는데, 앱은 280px 부터 570px 까지 넓어진다. 보이지 않게 같은 칸에 겹쳐 두면
          어느 폭에서든 실제로 필요한 높이가 그대로 잡힌다. */}
      <span aria-hidden="true" className="invisible [grid-area:1/1]">
        {LOGIN_NOTICE.mismatch.message}
      </span>
      <p id={LOGIN_NOTICE_ID} role="alert" className={cn("[grid-area:1/1]", current?.tone)}>
        {current?.message ?? null}
      </p>
    </div>
  );
}

/** 링크와 링크 사이를 가르는 세로 선이다. 읽을 것이 아니라 경계이므로 낭독기에서 감춘다. */
function LinkDivider() {
  return <span aria-hidden="true" className="h-3 w-px bg-oe-border-secondary" />;
}

/**
 * 갈 페이지를 아직 만들지 않았으므로 목적지를 두지 않는다. 자리와 누를 수 있는 모양만 갖는다.
 *
 * 글자색은 `interaction.md` 의 「글자만 있는 링크의 위계」가 정한 `oe-foreground-tertiary` 다.
 * 이 줄은 다른 화면으로 나가는 통로이므로 본문보다 물러선다. Hover 에서는 밑줄만 붙고 글자색은
 * 그대로 있다. 색까지 바뀌면 줄에 놓인 링크들의 위계가 포인터를 올리는 동안 뒤집힌다.
 *
 * `emphasis` 는 한 단계 올린다. 계정이 없는 사람에게는 회원가입이 이 화면에서 실제로 해야 하는
 * 일이므로, 아이디와 비밀번호를 잃어버린 경우와 같은 무게로 두지 않는다.
 */
function AuthLink({ label, emphasis = false }: { label: string; emphasis?: boolean }) {
  return (
    <a
      href="#"
      className={cn(
        "rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-oe-focus-ring",
        emphasis ? "text-oe-foreground-primary" : "text-oe-foreground-tertiary",
      )}
    >
      {label}
    </a>
  );
}

/**
 * `input.md` 가 정한 비밀번호 입력이다. 입력하는 동안에도 마스킹하고, 자기 입력을 확인해야 하는
 * 자리이므로 Trailing element 로 보기 전환을 둔다. 실제 `type` 을 `password` 와 `text` 로 바꾸며
 * 비밀번호용 Leading icon 은 쓰지 않는다.
 */
function PasswordInput({
  inputRef,
  value,
  onValueChange,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      ref={inputRef}
      type={visible ? "text" : "password"}
      autoComplete="current-password"
      placeholder="비밀번호 입력"
      aria-label="비밀번호"
      aria-describedby={LOGIN_NOTICE_ID}
      variant="filled"
      controlSize="xlarge"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      trailingElement={
        <button
          type="button"
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          onClick={() => setVisible((current) => !current)}
          className="grid size-6 place-items-center rounded-md text-oe-foreground-tertiary transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:outline-none"
        >
          {visible ? (
            <RiEyeOffLine className="size-oe-icon-small" aria-hidden="true" />
          ) : (
            <RiEyeLine className="size-oe-icon-small" aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}
