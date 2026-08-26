"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";

import { Input, PartialMaskedInput } from "@ooee/ui";
import { ColorSwatch } from "@/components/color-swatch";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const copy = {
  ko: {
    amount: "금액",
    clear: "입력 내용 지우기",
    currencyUnit: "원",
    mobilePhone: "휴대전화번호",
    formattedNumber: "Formatted number",
    formattedNumberDescription: "숫자를 입력하면 지정된 형식을 자동 적용합니다. 전화번호나 사업자등록번호처럼 형식이 정해진 값에 사용할 수 있습니다.",
    amountDescription: "숫자를 입력하면 천 단위 구분을 자동 적용하고, 입력값과 통화 단위를 분리해 Suffix로 표시합니다.",
    colorPickerInput: "HEX value",
    colorPickerInputDescription: "HEX 값을 직접 입력하고 Leading color swatch로 현재 색상을 확인합니다.",
    colorPickerInputLabel: "컬러 HEX 값",
    segmentedInput: "Segmented input · Single container",
    segmentedInputDescription: "하나의 외곽 Container 안에서 값을 여러 실제 Input 그룹으로 나누는 유형입니다. 각 그룹의 마스킹 여부는 용도에 따라 선택할 수 있습니다.",
    splitInput: "Split input · Multiple containers",
    splitInputDescription: "인증코드처럼 한 자리씩 입력하는 독립 Input Container 여섯 개로 하나의 값을 구성하는 유형입니다.",
    verificationCode: "6자리 인증코드",
    partialMaskedInput: "Partial masked input",
    partialMaskedInputDescription: "전체 자릿수 중 일부만 실제로 입력받고 나머지는 고정 마스킹으로 표시하는 유형입니다. 현재 예시는 총 4자리 중 앞 2자리만 입력받습니다.",
    partialMaskedValue: "4자리 값의 앞 2자리",
    residentRegistrationNumber: "Resident registration number",
    residentRegistrationNumberDescription: "주민등록번호 형식에 맞춰 앞자리 6자리와 뒷자리 첫 숫자를 두 개의 Input Container로 나누고 나머지 값을 마스킹합니다.",
    groupedNumber: "16자리 번호",
    residentNumber: "주민등록번호",
    birthDateSixDigits: "생년월일 6자리",
    residentPrivateDigit: "주민등록번호 뒷자리 첫 번째 숫자",
  },
  en: {
    amount: "Amount",
    clear: "Clear input",
    currencyUnit: "KRW",
    mobilePhone: "Mobile phone number",
    formattedNumber: "Formatted number",
    formattedNumberDescription: "Applies a defined format automatically as digits are entered. It supports fixed formats such as phone or business registration numbers.",
    amountDescription: "Applies thousands separators automatically and keeps the currency unit separate as a suffix.",
    colorPickerInput: "HEX value",
    colorPickerInputDescription: "Enter a HEX value directly and preview the current color with a leading color swatch.",
    colorPickerInputLabel: "Color HEX value",
    segmentedInput: "Segmented input · Single container",
    segmentedInputDescription: "Splits a value across multiple actual input groups inside one outer container. Masking can be enabled independently for each group.",
    splitInput: "Split input · Multiple containers",
    splitInputDescription: "Builds one value from six independent input containers, each accepting one digit, as in a verification code.",
    verificationCode: "6-digit verification code",
    partialMaskedInput: "Partial masked input",
    partialMaskedInputDescription: "Accepts only part of a fixed-length value and displays the rest as fixed masking. This example accepts the first two digits of a four-digit value.",
    partialMaskedValue: "First 2 digits of a 4-digit value",
    residentRegistrationNumber: "Resident registration number",
    residentRegistrationNumberDescription: "Splits the first six digits and the first private digit into two input containers, then masks the remaining resident registration number.",
    groupedNumber: "16-digit number",
    residentNumber: "Resident registration number",
    birthDateSixDigits: "Birth date, 6 digits",
    residentPrivateDigit: "First private digit of resident registration number",
  },
} as const;

export function InputCustomExamples() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [phoneValue, setPhoneValue] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [groupedNumberParts, setGroupedNumberParts] = useState(["", "", "", ""]);
  const groupedNumberRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [verificationCodeParts, setVerificationCodeParts] = useState(["", "", "", "", "", ""]);
  const verificationCodeRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [partialMaskedValue, setPartialMaskedValue] = useState("");
  const [residentBirthDate, setResidentBirthDate] = useState("");
  const [residentPrivateDigit, setResidentPrivateDigit] = useState("");
  const residentBirthDateRef = useRef<HTMLInputElement | null>(null);
  const residentPrivateDigitRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <CustomInputCard label={c.formattedNumber} description={c.formattedNumberDescription}>
        <Input type="tel" inputMode="numeric" autoComplete="tel" aria-label={c.mobilePhone} value={phoneValue} onChange={(event) => setPhoneValue(formatMobilePhone(event.target.value))} placeholder="010-0000-0000" clearable={phoneValue.length > 0} clearLabel={c.clear} onClear={() => setPhoneValue("")} />
      </CustomInputCard>

      <CustomInputCard label="Amount" description={c.amountDescription}>
        <Input type="text" inputMode="numeric" autoComplete="off" aria-label={c.amount} value={formatCurrencyAmount(amountValue)} onChange={(event) => setAmountValue(event.target.value.replace(/\D/g, ""))} placeholder="0" suffix={c.currencyUnit} clearable={amountValue.length > 0} clearLabel={c.clear} onClear={() => setAmountValue("")} textAlign="right" className="tabular-nums" containerClassName="gap-0 [&_[data-slot=input-suffix]]:ml-2 [&_[data-slot=input-clear]]:visible [&_[data-slot=input-clear]]:mr-0 [&_[data-slot=input-clear]]:w-0 [&_[data-slot=input-clear]]:overflow-hidden [&_[data-slot=input-clear]]:transition-[color,background-color,opacity,width,margin] focus-within:[&_[data-slot=input-clear]]:w-6" />
      </CustomInputCard>

      <CustomInputCard label={c.segmentedInput} description={c.segmentedInputDescription}>
        <div role="group" aria-label={c.groupedNumber} className="flex h-oe-control-regular w-full items-center gap-2 rounded-lg border border-oe-border-primary bg-oe-background-primary px-3 text-sm text-oe-foreground-primary transition-[border-color,box-shadow] focus-within:border-oe-focus-ring focus-within:ring-1 focus-within:ring-oe-focus-ring">
          {groupedNumberParts.map((part, index) => (
            <div key={index} className="contents">
              {index > 0 ? <span className="text-oe-foreground-placeholder" aria-hidden="true">-</span> : null}
              <input ref={(node) => { groupedNumberRefs.current[index] = node; }} type={index >= 2 ? "password" : "text"} inputMode="numeric" autoComplete="off" maxLength={4} aria-label={`${c.groupedNumber} ${index + 1}/4`} value={part} placeholder={["1234", "5678", "9012", "3456"][index]} onChange={(event) => updateGroupedNumber(index, event.target.value, groupedNumberParts, setGroupedNumberParts, groupedNumberRefs.current)} onPaste={(event) => handleGroupedNumberPaste(event, index, groupedNumberParts, setGroupedNumberParts, groupedNumberRefs.current)} onKeyDown={(event) => handleGroupedNumberBackspace(event, index, part, groupedNumberRefs.current)} className="h-full w-[5ch] shrink-0 bg-transparent p-0 text-left tabular-nums outline-none placeholder:text-oe-foreground-placeholder" />
            </div>
          ))}
        </div>
      </CustomInputCard>

      <CustomInputCard label={c.splitInput} description={c.splitInputDescription}>
        <div role="group" aria-label={c.verificationCode} className="flex w-full items-center justify-center gap-2">
          {verificationCodeParts.map((part, index) => (
            <div key={index} className="w-9 shrink-0">
              <Input ref={(node) => { verificationCodeRefs.current[index] = node as HTMLInputElement | null; }} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={1} aria-label={`${c.verificationCode} ${index + 1}/6`} value={part} onChange={(event) => updateVerificationCode(index, event.target.value, verificationCodeParts, setVerificationCodeParts, verificationCodeRefs.current)} onPaste={(event) => handleVerificationCodePaste(event, index, verificationCodeParts, setVerificationCodeParts, verificationCodeRefs.current)} onKeyDown={(event) => handleVerificationCodeBackspace(event, index, part, verificationCodeRefs.current)} className="text-center tabular-nums" containerClassName="px-2" />
            </div>
          ))}
        </div>
      </CustomInputCard>

      <CustomInputCard label={c.partialMaskedInput} description={c.partialMaskedInputDescription}>
        <PartialMaskedInput inputLength={2} totalLength={4} maskInput={false} aria-label={c.partialMaskedValue} value={partialMaskedValue} onValueChange={setPartialMaskedValue} />
      </CustomInputCard>

      <CustomInputCard label={c.residentRegistrationNumber} description={c.residentRegistrationNumberDescription}>
        <div role="group" aria-label={c.residentNumber} className="flex w-full items-center gap-2">
          <div className="min-w-0 flex-1">
            <Input ref={residentBirthDateRef} type="text" inputMode="numeric" autoComplete="off" maxLength={6} aria-label={c.birthDateSixDigits} value={residentBirthDate} onChange={(event) => { const next = event.target.value.replace(/\D/g, "").slice(0, 6); setResidentBirthDate(next); if (next.length === 6) residentPrivateDigitRef.current?.focus(); }} placeholder={c.birthDateSixDigits} className="tabular-nums" />
          </div>
          <span className="shrink-0 text-oe-foreground-placeholder" aria-hidden="true">-</span>
          <div className="min-w-0 flex-1">
            <PartialMaskedInput ref={residentPrivateDigitRef} inputLength={1} totalLength={7} maskInput={false} aria-label={c.residentPrivateDigit} value={residentPrivateDigit} onValueChange={setResidentPrivateDigit} onKeyDown={(event) => { if (event.key === "Backspace" && residentPrivateDigit.length === 0) residentBirthDateRef.current?.focus(); }} />
          </div>
        </div>
      </CustomInputCard>
    </>
  );
}

export function InputColorExample() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [colorValue, setColorValue] = useState("#0073FF");

  return (
    <CustomInputCard label={c.colorPickerInput} description={c.colorPickerInputDescription}>
      <Input
        type="text"
        inputMode="text"
        autoComplete="off"
        aria-label={c.colorPickerInputLabel}
        value={colorValue}
        onChange={(event) => setColorValue(formatHexColor(event.target.value))}
        placeholder="#000000"
        leadingElement={<ColorSwatch color={isCompleteHexColor(colorValue) ? colorValue : "#0073FF"} />}
        className="font-mono tabular-nums uppercase"
      />
    </CustomInputCard>
  );
}

function CustomInputCard({ label, description, children }: { label: string; description: string; children: ReactNode }) {
  return <div className="flex min-h-28 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-[11px] font-medium text-oe-foreground-primary">{label}</p><p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p></div><div className="mt-auto">{children}</div></div>;
}

function formatMobilePhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatCurrencyAmount(value: string) {
  if (!value) return "";
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatHexColor(value: string) {
  const hex = value.replace(/[^0-9a-f]/gi, "").slice(0, 6).toUpperCase();
  return hex.length > 0 ? `#${hex}` : "";
}

function isCompleteHexColor(value: string) {
  return /^#[0-9A-F]{6}$/i.test(value);
}

function updateVerificationCode(index: number, value: string, current: string[], setValue: (value: string[]) => void, refs: Array<HTMLInputElement | null>) {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  const next = [...current];
  if (digits.length <= 1) {
    next[index] = digits;
    setValue(next);
    if (digits.length === 1 && index < 5) refs[index + 1]?.focus();
    return;
  }
  digits.split("").forEach((digit, offset) => { if (index + offset < 6) next[index + offset] = digit; });
  setValue(next);
  refs[Math.min(index + digits.length - 1, 5)]?.focus();
}

function handleVerificationCodePaste(event: ClipboardEvent<HTMLInputElement>, index: number, current: string[], setValue: (value: string[]) => void, refs: Array<HTMLInputElement | null>) {
  const digits = event.clipboardData.getData("text").replace(/\D/g, "");
  if (digits.length <= 1) return;
  event.preventDefault();
  updateVerificationCode(index, digits, current, setValue, refs);
}

function handleVerificationCodeBackspace(event: KeyboardEvent<HTMLInputElement>, index: number, value: string, refs: Array<HTMLInputElement | null>) {
  if (event.key === "Backspace" && value.length === 0 && index > 0) refs[index - 1]?.focus();
}

function updateGroupedNumber(index: number, value: string, current: string[], setValue: (value: string[]) => void, refs: Array<HTMLInputElement | null>) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  const next = [...current];
  if (digits.length <= 4) {
    next[index] = digits;
    setValue(next);
    if (digits.length === 4 && index < 3) refs[index + 1]?.focus();
    return;
  }
  const distributed = digits.match(/.{1,4}/g) ?? [];
  distributed.forEach((part, offset) => { if (index + offset < 4) next[index + offset] = part; });
  setValue(next);
  refs[Math.min(index + distributed.length - 1, 3)]?.focus();
}

function handleGroupedNumberBackspace(event: KeyboardEvent<HTMLInputElement>, index: number, value: string, refs: Array<HTMLInputElement | null>) {
  if (event.key === "Backspace" && value.length === 0 && index > 0) refs[index - 1]?.focus();
}

function handleGroupedNumberPaste(event: ClipboardEvent<HTMLInputElement>, index: number, current: string[], setValue: (value: string[]) => void, refs: Array<HTMLInputElement | null>) {
  const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, (4 - index) * 4);
  if (digits.length <= 4) return;
  event.preventDefault();
  updateGroupedNumber(index, digits, current, setValue, refs);
}
