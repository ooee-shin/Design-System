// 저장 전까지 고른 값을 들고 있으므로 이 화면은 클라이언트에서 그린다.
"use client";

/**
 * 환경설정의 테마설정 화면이다. 관리자 웹의 좌측 메뉴가 어떻게 보일지 여기서 고른다.
 *
 * 화면을 감싸는 레이아웃은 `AdminLayout` 이 갖는다. 헤더와 좌측 메뉴, 그 둘을 세우는 CSS 변수가
 * 거기 있고, 이 파일에는 본문만 남는다.
 */

import * as React from "react"
import { useMemo, useRef, useState } from "react"

import { RiPaletteLine } from "@remixicon/react"

import { Button, InputButton, Radio, RadioField, RadioGroup } from "@ooee/ui"

import { BRAND_STEPS, DEFAULT_BRAND_SEED, createBrandPalette } from "@ooee/tokens"

import { useBrandTheme } from "@/components/brand-theme-provider"
import { ColorSwatch } from "@/components/color-swatch"

import { AdminLayout, SIDEBAR_STYLES } from "@/components/candidates/admin-layout"
import { PageHeader, type PageHeaderTab } from "@/components/candidates/page-header"
import { Tabs, TabsPanel } from "@/components/candidates/tabs"

// 지금 화면은 환경설정의 테마설정이다. 좌측 메뉴가 아니라 헤더의 설정에서 들어오는 자리이므로
// 경로도 좌측 메뉴와 맞물리지 않는다.
const PAGE_PATH = ["환경설정", "테마설정"];

// 즐겨찾기에 담기면 좌측 메뉴의 맨 위 묶음에 이 줄로 선다. 담는 것은 경로가 아니라 화면 하나
// 이므로 이름은 경로의 마지막 항목을 쓴다.
const PAGE_FAVORITE = { title: PAGE_PATH[PAGE_PATH.length - 1], icon: RiPaletteLine };

// 제목 옆 설명 아이콘을 세우는 값이다. 펼쳐지는 자리는 아직 붙이지 않았고 실제 문구도 받지
// 않아, 지금은 아이콘이 서는지만 정한다.
const PAGE_DESCRIPTION = "이 화면이 무엇을 하는 자리인지 적습니다.";

// 테마는 관리자 웹과 두 앱이 따로 갖는다. 지금 만든 것은 관리자 웹 하나이며, 나머지 둘은 탭만
// 서 있고 내용은 아직 없다.
const THEME_TABS: PageHeaderTab[] = [
  { value: "admin", label: "관리자 웹" },
  { value: "sv", label: "SV앱" },
  { value: "sto", label: "STO앱" },
];

export default function Page() {
  // 화면에 실제로 반영되어 있는 값이다. 설정 패널은 자기 안에서 고르고, 저장을 눌렀을 때만 이
  // 값을 바꾼다.
  const { seed, applySeed } = useBrandTheme();
  const [applied, setApplied] = useState({ styleName: SIDEBAR_STYLES[0].name, showRowIcons: true });

  // 즐겨찾기는 누른 즉시 좌측 메뉴에 반영된다. 저장을 거치는 세 설정과 달리 이 화면 자체를
  // 담아 두는 표시이므로 저장 버튼이 관여하지 않는다.
  const [favorite, setFavorite] = useState(false);

  return (
    <AdminLayout
      menuStyle={applied.styleName}
      showRowIcons={applied.showRowIcons}
      favorites={favorite ? [PAGE_FAVORITE] : []}
    >
      {/* 탭 줄은 머리에 서고 그 탭이 여는 내용은 그 아래 본문이다. 둘이 서로를 가리켜야 하므로
          `Tabs` 가 머리와 본문을 함께 감싼다. */}
      <Tabs defaultValue={THEME_TABS[0].value} className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          path={PAGE_PATH}
          title="테마설정"
          tabs={THEME_TABS}
          favorite={favorite}
          onFavoriteChange={setFavorite}
          description={PAGE_DESCRIPTION}
        />
        <TabsPanel value={THEME_TABS[0].value} className="flex flex-1 flex-col gap-6 p-6">
          <MenuStyleSetting
            applied={{ seed, ...applied }}
            onSave={(next) => {
              applySeed(next.seed);
              setApplied({ styleName: next.styleName, showRowIcons: next.showRowIcons });
            }}
          />
        </TabsPanel>
        {THEME_TABS.slice(1).map((tab) => (
          <TabsPanel key={tab.value} value={tab.value} className="p-6 text-sm text-oe-foreground-tertiary">
            아직 만들지 않았습니다.
          </TabsPanel>
        ))}
      </Tabs>
    </AdminLayout>
  );
}

/**
 * 세 설정은 고르는 동안에는 이 자리에만 남고, 저장을 눌러야 화면에 반영된다. 고르는 즉시 바뀌면
 * 저장 버튼이 할 일이 없어지고, 한 패널 안에서 즉시 적용과 저장이 섞여 읽힌다.
 */
function MenuStyleSetting({
  applied,
  onSave,
}: {
  applied: { seed: string; styleName: string; showRowIcons: boolean }
  onSave: (next: { seed: string; styleName: string; showRowIcons: boolean }) => void
}) {
  // 아직 아무것도 고치지 않았으면 화면에 반영된 값을 그대로 보여 준다.
  //
  // 고친 값을 처음부터 갖고 있게 두면 안 된다. 메인 컬러는 브라우저에 저장되어 있다가 화면이
  // 뜬 뒤에 복원되는데, 그때 이 자리가 먼저 잡은 값은 아직 복원 전의 기본 색이다. 그러면 저장해
  // 둔 색으로 좌측 메뉴가 서 있는데 이 패널만 파란색을 가리키게 된다.
  const [edited, setEdited] = useState<typeof applied | null>(null);
  const draft = edited ?? applied;
  const edit = (patch: Partial<typeof applied>) => setEdited({ ...draft, ...patch });

  // 미리보기는 고르고 있는 색을 바로 보여 준다. 저장하기 전에는 화면의 브랜드 색이 아직 예전
  // 값이므로, 이 묶음 안에서만 쓸 팔레트를 만들어 얹는다. 색을 고르는 자리와 그 색이 어떻게
  // 보이는지가 한 화면에 있어야, 저장을 누르기 전에 판단할 수 있다.
  const previewBrand = useMemo(() => {
    const palette = createBrandPalette(draft.seed);
    return Object.fromEntries(
      BRAND_STEPS.map((step) => [`--brand-${step}`, palette.solid[step]]),
    ) as React.CSSProperties;
  }, [draft.seed]);

  return (
    // 카드 셋과 사이 간격을 더한 폭이다. 176 × 3 + 12 × 2 = 552 이다.
    <section className="flex w-[552px] flex-col gap-6">
      <span className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-oe-foreground-primary">메뉴 스타일 설정</h2>

        <span className="flex items-center gap-2">
          {/* 잘못 골랐을 때 돌아올 자리다. 고른 값을 기본값으로 되돌릴 뿐이고, 화면에 반영하려면
              저장을 눌러야 한다. */}
          <Button
            variant="outline"
            tone="neutral"
            controlSize="small"
            onClick={() => setEdited({ seed: DEFAULT_BRAND_SEED, styleName: SIDEBAR_STYLES[0].name, showRowIcons: true })}
          >
            기본값 초기화
          </Button>
          {/* 저장하고 나면 고친 값과 반영된 값이 같아지므로, 이 자리는 다시 반영된 값을 그대로
              따라간다. */}
          <Button
            variant="fill"
            controlSize="small"
            onClick={() => {
              onSave(draft);
              setEdited(null);
            }}
          >
            저장
          </Button>
        </span>
      </span>

      <SettingRow inline label="메인 컬러" description="버튼과 선택 표시 등 화면 곳곳의 기본 색으로 쓰입니다.">
        <MainColorInput value={draft.seed} onChange={(hex) => edit({ seed: hex })} />
      </SettingRow>

      <SettingRow label="메뉴 스타일" description="왼쪽 메뉴의 배경색과 글자색, 선택한 메뉴의 표시가 함께 바뀝니다.">
        <RadioGroup
          className="flex gap-3"
          value={draft.styleName}
          onValueChange={(next) => edit({ styleName: String(next) })}
          aria-label="메뉴 스타일"
        >
          {SIDEBAR_STYLES.map((item) => (
            <StyleOptionCard
              key={item.name}
              value={item.name}
              label={item.name}
              hint={item.hint}
              preview={item.preview}
              previewBrand={previewBrand}
            />
          ))}
        </RadioGroup>
      </SettingRow>

      {/* 아이콘은 색과 상관없이 어느 스타일에서나 같게 동작하므로 자기 축을 갖는다. */}
      <SettingRow inline label="메뉴 아이콘" description="메뉴 이름 앞에 아이콘을 함께 보여 줍니다.">
        {/* Switch 가 아니라 Radio 다. `switch.md` 는 토글한 즉시 결과가 나타나는 자리에만 Switch 를
            쓰라고 하고, 저장을 눌러 반영하는 화면에서는 Checkbox 로 가라고 한다. 이 설정은 나중에
            환경설정으로 옮겨 가므로, 저장 여부가 정해져도 바뀌지 않는 Radio 로 둔다. */}
        <RadioGroup
          className="flex items-center gap-2"
          value={draft.showRowIcons ? "사용" : "미사용"}
          onValueChange={(next) => edit({ showRowIcons: next === "사용" })}
          aria-label="메뉴 아이콘"
        >
          <RadioField value="사용" label="사용" />
          <RadioField value="미사용" label="미사용" />
        </RadioGroup>
      </SettingRow>
    </section>
  );
}

/**
 * `input.md` 의 「Color input」이 보여 주는 둘째 조합이다. 입력란 모양의 버튼이 색 조각과 HEX 를
 * 함께 보여 주고, 줄 전체가 색 선택기를 여는 자리다.
 *
 * 공용 Color Picker 는 아직 없다. `input.md` 도 그것이 완성되기 전까지 팝업을 잇지 않는다고
 * 적고 있으므로, 그때까지 브라우저 선택기를 감춰 두고 버튼이 그것을 대신 연다.
 */
function MainColorInput({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const picker = useRef<HTMLInputElement>(null);

  return (
    <span className="relative inline-flex">
      <InputButton
        layout="fixed"
        fixedWidth={176}
        value={value.toUpperCase()}
        leadingElement={<ColorSwatch color={value} />}
        aria-label="메인 컬러"
        onClick={() => picker.current?.click()}
        className="font-mono tabular-nums uppercase"
      />
      <input
        ref={picker}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-4 size-0 opacity-0"
      />
    </span>
  );
}

/**
 * 설정 하나를 이름과 설명, 조작 장치로 묶는다. 설명은 그 설정이 무엇을 바꾸는지만 적는다.
 */
function SettingRow({
  label,
  description,
  inline = false,
  children,
}: {
  label: string
  description?: string
  /** 이름과 조작 장치를 좌우로 둘지. 장치가 좁을 때만 쓴다. */
  inline?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={inline ? "flex items-center justify-between gap-6" : "flex flex-col gap-4"}>
      <span className="flex flex-col gap-0.5">
        <span className="text-[15px] font-medium text-oe-foreground-primary">{label}</span>
        {description ? <span className="text-xs text-oe-foreground-tertiary">{description}</span> : null}
      </span>
      {children}
    </div>
  );
}

/**
 * `radio.md` 의 「선택 가능한 콘텐츠와 결합하기」가 보여 주는 카드를 그대로 가져왔다. 고른 카드는
 * 미리보기 둘레에 브랜드 색 테두리가 생기고, 카드 자체의 바탕은 바뀌지 않는다.
 *
 * 그 테두리는 `--brand-alpha-40` 대신 600 단계에 투명도를 입혀 쓴다. `--brand-alpha-*` 는 팔레트
 * 단계가 아니라 사용자가 넣은 seed 자체라, seed 가 아주 밝거나 어두우면 테두리도 함께 흔들린다.
 */
function StyleOptionCard({
  value,
  label,
  hint,
  preview,
  previewBrand,
}: {
  value: string
  label: string
  hint: string
  preview?: { band: string; body: string }
  /** 미리보기가 쓸 브랜드 팔레트. 고르고 있는 색에서 만든 값이다. */
  previewBrand?: React.CSSProperties
}) {
  const labelId = `sidebar-style-${value}`;

  return (
    // 링을 바깥으로 빼면서 미리보기 아래 3px 이 없어졌다. 카드 안쪽 간격으로 되돌린다.
    <label className="relative grid w-44 cursor-pointer gap-2 [&:has([data-slot=radio][data-checked])_.style-preview-frame]:outline-[color-mix(in_srgb,var(--brand-600)_40%,transparent)] [&:has([data-slot=radio]:focus-visible)_.style-preview-frame]:!outline-oe-focus-ring">
      {/* 고른 표시는 바깥에 그린다. 테두리로 두르면 그만큼 안쪽이 줄어서 미리보기가 카드 폭을
          다 쓰지 못하고 여백만 넓어진다. */}
      <span className="style-preview-frame block rounded-lg outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-150">
        {/* 미리보기는 그 스타일의 좌측 메뉴 바탕을 그대로 보여 준다. 그림의 얼개는 `radio.md` 의
            「선택 가능한 콘텐츠와 결합하기」가 쓰는 것과 같다. */}
        {preview ? (
          <StylePreview band={preview.band} body={preview.body} style={previewBrand} />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-oe-border-primary text-[11px] text-oe-foreground-tertiary"
          >
            미리보기
          </span>
        )}
      </span>
      {/* 라디오가 미리보기의 왼쪽 끝과 같은 자리에서 시작한다. 링을 바깥으로 빼면서 이미지가
          카드 끝까지 왔으므로, 예전에 이미지의 안쪽 여백을 맞추려고 두었던 4px 은 걷어낸다. */}
      <span className="flex min-h-7 items-center gap-2">
        <Radio
          value={value}
          aria-label={`${label}. ${hint}`}
          className="focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <span id={labelId} className="text-sm leading-5 font-medium whitespace-nowrap text-oe-foreground-primary">
          {label}
        </span>
      </span>
    </label>
  );
}

/**
 * 스타일의 미리보기다. 좌측 띠와 본문, 그 안의 막대 셋으로 화면의 얼개만 그리며, 그림은
 * `radio.md` 의 「선택 가능한 콘텐츠와 결합하기」가 쓰는 것과 같다.
 */
function StylePreview({
  band,
  body,
  style,
}: {
  band: string
  body: string
  /** 브랜드 팔레트를 여기에만 얹는다. 카드의 고른 표시와 라디오는 화면에 실제로 반영된 색을
   *  그대로 쓴다. 그 둘은 무엇을 골랐는지 말하는 표시이지 미리보기가 아니기 때문이다. */
  style?: React.CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className="flex h-24 w-full overflow-hidden rounded-lg border border-oe-border-visual"
    >
      {/* 흰 바탕끼리는 경계가 없으므로 띠의 오른쪽에 선을 둔다. */}
      <span className={`w-1/4 shrink-0 border-r border-oe-border-visual ${band}`} />
      <span className={`flex-1 p-3 ${body}`}>
        <span className="block h-1.5 w-1/3 rounded-full bg-current opacity-35" />
        <span className="mt-2 block h-1.5 w-1/2 rounded-full bg-current opacity-20" />
        <span className="mt-7 block h-6 w-full rounded-md bg-current opacity-10" />
      </span>
    </span>
  );
}
