// 고른 종류가 아래 칸들을 세우고 그 건이 어디로 접수되는지를 정하므로, 그 반응을 화면 안에서
// 보여 주기 위해 클라이언트에서 그린다.
"use client";

import { useRef, useState } from "react";

import { RiArrowLeftLine, RiAttachment2, RiCloseLine, RiInformationLine } from "@remixicon/react";

import { AppHeader, Button, Chip, Field, Input, SelectBox, SelectBoxGroup, Textarea } from "@ooee/ui";

import { MobileWebView } from "@/components/screens/screen-chrome";

import { categoriesOf, CHANNELS, handlingNote, menuLabel, type Channel } from "./write-data";

/**
 * 사장님 앱의 통합 등록 폼이다. 점주의 소리와 지원요청을 한 폼에서 접수한다.
 *
 * 폼을 하나로 합친 까닭은 실무 요청이 점주의 소리로, 제안이 지원요청으로 잘못 접수되고 있기
 * 때문이다. 접수 단계에서 점주가 종류를 직접 고르게 해서 오입을 줄이는 것이 이 화면의 일이다.
 *
 * 한 장이다. 맨 위에서 어떤 내용을 보내려는 것인지 묻고, 그 아래에 카테고리와 제목, 내용, 첨부가
 * 선다. 장을 나누지 않으므로 점주는 자기가 무엇을 접수하는 중인지와 남은 칸이
 * 무엇인지를 한 화면에서 본다. 고르기 전에는 아래 칸들을 세우지 않으며, 그 까닭은 그 물음에
 * 붙인 주석에 적었다.
 *
 * 아직 문구를 받지 못한 자리: 등록 직전의 확인 시트와 접수 완료 화면이다.
 */
export default function StoWriteScreenPage() {
  // 점주가 고른 종류다. 고르기 전에는 비어 있다. 기본값을 두지 않는 것이 이 화면의 핵심이다. 앱이
  // 미리 골라 두면 점주가 그대로 두고 넘어가 오입이 그대로 남는다.
  const [kind, setKind] = useState<Channel | null>(null);

  const [category, setCategory] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // 고른 파일이다. 실제로 올리지는 않으므로 이름과 크기, 그리고 이미지일 때 그 그림을 가리키는
  // 주소만 들고 있으며, 고른 뒤에 무엇이 붙었는지 화면에서 보여야 파일 선택이 끝난 것을 알 수 있다.
  const [files, setFiles] = useState<PickedFile[]>([]);
  const filePicker = useRef<HTMLInputElement>(null);

  return (
    <MobileWebView label="STO 사장님용 앱 통합 등록 폼 화면">
      <AppHeader
        // 고른 종류를 제목에 넣지 않는다. 한 장이라 고른 값이 화면에 그대로 보이고, 제목이 따라
        // 바뀌면 같은 장에 있는데도 다른 화면으로 넘어온 것처럼 읽힌다.
        title="등록"
        leadingElement={
          <Button variant="ghost" tone="neutral" controlSize="small" leadingIcon={<RiArrowLeftLine />} aria-label="뒤로" />
        }
      />

      <div className="flex flex-1 flex-col">
        {/* 구분선에 닿는 쪽만 여백을 24px 로 둔다. 안내 줄과 구분선이 같은 회색이라 기본 16px 에서는
            두 덩이가 붙어 보이고, 안내가 구분선의 일부처럼 읽힌다. 아래 구역도 같은 24px 로 시작해
            선을 가운데 두고 위아래가 같은 폭으로 떨어진다. */}
        <div className="flex flex-col gap-5 px-oe-padding-default pt-oe-padding-default pb-6">
          {/* 종류를 맨 위에서 묻는다. 다음 장으로 넘기지 않고 한 장에 세우므로, 점주는 무엇을 고르면
              아래에 무엇을 채워야 하는지를 한 화면에서 본다.

              이 자리만 「종류」 같은 칸 이름을 달지 않고 묻는 말로 세운다. 아래 넷은 값을 받아 적는
              칸이지만 이것은 점주에게 무엇을 하려는 것인지 되묻는 자리이고, 두 선택지가 그 물음의
              답이기 때문이다. 「어떤 내용인가요」는 서술어가 없는 명사구 물음이라 무엇을 하려는
              것인지가 빠지므로, 목적어와 서술어와 종결어미를 갖춰 적는다.

              아래 칸들은 종류를 고른 뒤에 선다. 빈 칸을 미리 늘어놓으면 고르지 않은 채로 아래를
              채우다가 종류를 스쳐 지나가고, 무엇을 접수하는 중인지 알리는 안내도 종류가 없으면
              적을 말이 없다. 오입을 줄이는 것이 이 폼의 일이므로 그 물음을 먼저 통과시킨다.

              선택지는 항상 펼쳐 둔다. 목록을 열어 고르게 하면 두 선택지의 보기를 함께 읽을 수 없는데,
              점주가 자기 상황을 그 보기에 비춰 고르는 것이 이 자리의 일이다. */}
          <h2 className="text-2xl font-semibold text-oe-foreground-primary">어떤 내용을 보내시겠어요?</h2>

          <SelectBoxGroup
            ariaLabel="어떤 내용을 보내시겠어요?"
            trailingElement="radio"
            value={kind ?? ""}
            onValueChange={(value) => {
              const next = value as Channel;
              if (next === kind) return;
              setKind(next);
              // 종류를 바꾸면 고른 카테고리를 비운다. 두 종류가 서로 다른 카테고리 한 벌을 쓰므로
              // 앞서 고른 값이 새 목록에 없고, 남겨 두면 어느 칩도 눌리지 않은 채로 값만 남는다.
              setCategory(null);
            }}
          >
            {CHANNELS.map((channel) => (
              <SelectBox
                key={channel.value}
                value={channel.value}
                title={channel.choice}
                description={channel.example}
                className={NEUTRAL_SELECTED}
              />
            ))}
          </SelectBoxGroup>

          {/* 고른 뒤에는 그 종류가 어디로 가는 건인지 먼저 알린다. 두 선택지의 이름은 점주가 자기
              상황을 읽고 고르도록 쓴 말이라, 그것이 앱의 어느 메뉴로 접수되는지는 고르는 자리에
              드러나지 않는다. 그 연결을 여기서 한 줄로 잇는다.

              회색 바탕에 아이콘을 앞세운다. 입력하는 칸이 아니라 읽는 안내이므로 흰 바탕의 칸들과
              다른 바탕을 깔아 구분하고, 아이콘은 글의 첫 줄에 맞춰 위로 붙인다. */}
          {kind === null ? null : (
            <div className="flex items-start gap-2 rounded-lg bg-oe-background-secondary p-3">
              <RiInformationLine className="mt-0.5 size-4 shrink-0 text-oe-foreground-tertiary" aria-hidden="true" />
              {/* 아이콘과 같은 tertiary 로 적는다. 채워야 하는 칸이 아니라 한 번 읽고 지나가는
                  안내이므로, 아래 칸들의 라벨보다 한 단계 물러나 있어야 한다. 그 안에서 메뉴 이름만
                  secondary 로 한 단계 올린다. 점주가 찾아가야 할 곳은 그 이름 하나이며, 굵기는
                  건드리지 않고 색만 올려 글줄의 흐름을 끊지 않는다.

                  두 문장이다. 앞은 어디로 가는지, 뒤는 그 뒤에 무슨 일이 일어나는지 알린다. 뒤쪽
                  문장이 두 채널의 실제 차이이며, 아직 아무 칸도 채우지 않은 시점이라 읽고 나서 위의
                  선택지를 다시 눌러도 버릴 것이 없다. 문장은 `write-data.ts` 가 소유한다. */}
              <p className="text-sm leading-5 text-oe-foreground-tertiary">
                이 내용은 사장님 앱의 <span className="text-oe-foreground-secondary">「{menuLabel(kind)}」</span>에
                등록됩니다. {handlingNote(kind)}
              </p>
            </div>
          )}
        </div>

        {kind === null ? null : (
          <>
            {/* 고른 뒤에 서는 칸들은 굵은 선 아래에 둔다. 위는 무엇을 보낼지 정하는 자리이고
                아래는 그 내용을 적는 자리라서, 같은 20px 간격으로 이어 두면 한 줄기로 읽힌다. */}
            <SectionDivider />

            {/* 바닥 여백은 64px 이다. 등록 버튼이 설 자리를 비워 두는 것이며, 마지막 칸을 채우다가
                화면 끝에 닿았을 때 아래가 막혀 보이지 않게 한다. */}
            <div className="flex flex-col gap-5 px-oe-padding-default pt-6 pb-16">
              {/* 카테고리는 열어서 고르지 않고 칩으로 펼쳐 둔다. 목록이 일곱 개 안팎으로 짧고, 점주가
                  무엇 중에서 고르는 것인지를 목록을 열어 보지 않고 알아야 어느 것이 자기 건인지 견줄 수
                  있다. 고른 값도 그 자리에 그대로 남아 접힌 Select 처럼 한 칸으로 줄지 않는다.

                  고를 수 있는 것은 하나다. 이미 고른 칩을 다시 눌러 비우지는 않는다. 필수 값이라
                  비운 상태는 등록할 수 없는 상태이며, 바꾸려면 다른 칩을 누르면 된다.

                  고른 칩은 `activeStyle="fill"` 로 진한 뉴트럴을 채운다. 위에 Focus 색으로 맞춘 선택
                  경계가 있고 등록 버튼도 brand 색으로 설 자리이므로, 고른 칩까지 brand 를 옅게 깔면
                  파란 기가 세 곳에서 돌아 무엇이 지목된 것인지 색으로 갈리지 않는다. */}
              <Field label="카테고리" group required>
                <div role="group" className="flex flex-wrap gap-1.5">
                  {categoriesOf(kind).map((name) => (
                    <Chip
                      key={name}
                      shape="rounded"
                      controlSize="large"
                      active={category === name}
                      activeStyle="fill"
                      onClick={() => setCategory(name)}
                    >
                      {name}
                    </Chip>
                  ))}
                </div>
              </Field>

              {/* 제목은 25자까지다. 목록에서 한 줄로 서는 값이라 길어지면 어차피 말줄임되고, 짧게
                  쓰게 두면 무슨 건인지가 그 한 줄에 담긴다. */}
              <Field label="제목" required characterCount={{ current: title.length, max: 25 }}>
                <Input
                  controlSize="large"
                  layout="fill"
                  maxLength={25}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Field>

              <Field label="내용" required characterCount={{ current: body.length, max: 1000 }}>
                <Textarea
                  className="w-full"
                  height={160}
                  maxLength={1000}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
              </Field>

              {/* 첨부는 있으면 돕는 값이라 필수가 아니다. 그래서 위의 세 칸과 한 묶음으로 두지 않고
                  옅은 선으로 한 번 끊는다. 넷을 같은 간격으로 늘어놓으면 알려야 하는 것과 덧붙이는
                  것이 같은 무게로 읽힌다.

                  라벨과 버튼을 한 줄에 둔다. 첨부는 채워 넣는 값이 아니라 누르는 조작인데, 다른
                  칸들처럼 라벨 아래에 컨트롤이 서면 입력할 값으로 읽힌다. `Field` 의 Header 오른쪽
                  끝이 보조 조작을 담는 자리이므로 그 자리를 쓴다.

                  버튼을 누르면 기기의 파일 선택이 실제로 열린다. 모양만 있는 버튼으로 두면 눌러도
                  아무 일이 없어서, 이 자리가 무엇을 하는 자리인지 화면에서 확인할 수 없다. 고른
                  파일은 올리지 않고 이름과 크기만 아래에 세운다. */}
              <div className="mt-1 border-t border-oe-border-secondary pt-5">
                <input
                  ref={filePicker}
                  type="file"
                  multiple
                  hidden
                  onChange={(event) => {
                    const picked = Array.from(event.target.files ?? []).map((file) => ({
                      name: file.name,
                      size: file.size,
                      // 이미지는 섬네일 자리에 그림을 채우므로, 브라우저가 들고 있는 파일을 가리키는
                      // 주소를 만든다. 올리지 않는 화면이라 서버가 내려 주는 주소가 없다.
                      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
                    }));
                    setFiles((previous) => {
                      // 새로 고른 목록이 앞의 것을 대신하므로 앞서 만든 주소는 돌려준다. 그대로 두면
                      // 그 파일이 탭을 닫을 때까지 메모리에 남는다.
                      for (const item of previous) {
                        if (item.preview) URL.revokeObjectURL(item.preview);
                      }
                      return picked;
                    });
                    // 같은 파일을 다시 고를 수 있게 값을 비운다. 값이 남아 있으면 같은 파일을 두
                    // 번째로 고를 때 `change` 가 일어나지 않는다.
                    event.target.value = "";
                  }}
                />
                <Field
                  label="첨부"
                  group
                  trailingElement={
                    <Button controlSize="small" onClick={() => filePicker.current?.click()}>
                      파일 첨부하기
                    </Button>
                  }
                >
                  {files.length === 0 ? null : (
                    <ul className="flex flex-col gap-1">
                      {files.map((file) => (
                        <li
                          key={file.name}
                          // 양 끝에 40px 상자가 하나씩 서므로 네 변의 여백을 8px 로 같게 둔다. 미디어가
                          // 들어올 때 상자에 8px 을 두는 것은 shadcn 의 Attachment 와 이 저장소의
                          // `MessageFileAttachment` 가 같고, 그 결과 줄 높이가 58px 로 정해진다.
                          //
                          // 모서리는 컨트롤의 8px 이 아니라 `rounded-xl`(14px) 이다. `interaction.md` 의
                          // 「공통 Control Radius」가 첨부 카드를 적용 대상에서 빼 두었고, 안의 섬네일은
                          // 한 단계 낮은 `rounded-lg`(10px) 를 쓴다.
                          className="flex items-center gap-2 rounded-xl border border-oe-border-secondary p-2"
                        >
                          {/* 무엇이 붙었는지는 이름만으로 다 읽히지 않는다. 사진을 올린 점주는 그 사진이
                              맞는지 확인해야 하므로, 이미지는 40px 상자 안에 짧은 변을 기준으로 채워
                              보여 준다. 이미지가 아닌 파일은 같은 크기의 회색 상자에 첨부 아이콘을
                              세워, 줄마다 이름이 시작하는 자리가 어긋나지 않게 한다.

                              채운 그림에는 1px 안쪽 선을 얹는다. 흰 바탕의 이미지는 상자의 경계가
                              보이지 않아 줄 위에 그림만 떠 있는 것처럼 읽힌다. */}
                          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-oe-background-secondary">
                            {file.preview ? (
                              // `next/image` 는 빌드 때 알 수 있는 주소를 최적화하는 것이므로, 브라우저가
                              // 방금 만든 `blob:` 주소에는 쓸 수 없다.
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={file.preview}
                                alt=""
                                className="size-full rounded-lg object-cover shadow-[inset_0_0_0_1px_var(--oe-border-visual)]"
                              />
                            ) : (
                              <RiAttachment2 className="size-5 text-oe-foreground-tertiary" />
                            )}
                          </span>
                          {/* 이름 아래에 종류와 크기를 한 줄로 붙인다. 용량을 이름 오른쪽에 두면 긴
                              이름이 먼저 말줄임되어 무슨 파일인지가 용량 때문에 가려지고, 두 값이 같은
                              줄에서 같은 무게로 읽힌다. 아래로 내리면 이름이 줄 너비를 다 쓰고 섬네일
                              높이와 두 줄의 높이가 맞는다. shadcn 의 Attachment 가 Title 과 Description
                              을 그렇게 쌓으며, 「PNG · 828 KB」 표기도 그 형식이다. */}
                          <span className="min-w-0 flex-1 leading-tight">
                            <span className="block truncate text-sm font-medium text-oe-foreground-primary">{file.name}</span>
                            <span className="mt-0.5 block truncate text-xs text-oe-foreground-tertiary">{fileMeta(file)}</span>
                          </span>
                          {/* 지우는 버튼은 40px 정사각이다. 그 안의 아이콘이 12px 이던 것을 16px 로
                              키웠는데, 누르는 면이 작으면 모바일에서 한 번에 맞히기 어렵다. shadcn 의
                              Attachment 는 이 자리에 24px 짜리 아이콘 버튼을 두지만 그쪽은 포인터로 쓰는
                              화면이고, 이 화면은 손가락으로 쓰므로 40px 을 유지한다. 섬네일과 같은
                              크기라 8px 여백 안에서 양 끝이 대칭으로 선다.

                              당겨 두지 않는다. 아이콘을 줄의 오른쪽 끝에 맞추려고 버튼을 8px 당겼더니
                              버튼이 줄의 경계를 3px 넘어서고 줄의 오른쪽 여백이 음수가 되어, 누르는
                              면이 상자 밖으로 나왔다. 아이콘이 왼쪽 글자보다 안쪽에 서는 것은 버튼이
                              자기 안에 12px 을 갖고 있기 때문이며, 그 안쪽 자리는 버튼이 정한다. */}
                          <Button
                            variant="ghost"
                            tone="neutral"
                            controlSize="large"
                            className="shrink-0"
                            leadingIcon={<RiCloseLine />}
                            aria-label={`${file.name} 지우기`}
                            onClick={() =>
                              setFiles((previous) =>
                                previous.filter((item) => {
                                  if (item.name !== file.name) return true;
                                  if (item.preview) URL.revokeObjectURL(item.preview);
                                  return false;
                                }),
                              )
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </Field>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 등록 버튼은 아직 세우지 않는다. 누른 뒤에 열리는 확인 시트와 접수 완료의 문구를 받지
          못했으므로, 눌러도 아무 일이 없는 버튼을 바닥에 붙여 두지 않는다. */}
    </MobileWebView>
  );
}

/**
 * 고른 SelectBox 를 중립으로 내린다.
 *
 * 컴포넌트의 기본은 브랜드 테두리와 브랜드 5% 바탕인데, 그 테두리 색이 `--oe-focus-ring` 과 같은
 * 값이라 고른 것과 포커스가 놓인 것이 화면에서 갈리지 않는다. 검정 1px 로 내리면 둘이 분리되고,
 * 폼의 맨 위가 파랗게 번지지 않는다. 안의 라디오도 같은 검정으로 맞춰야 한 컨트롤 안에서 색이
 * 갈리지 않는다.
 *
 * 이 화면에서 먼저 쓰고, 다른 화면에서 다시 검증한 뒤에 `packages/ui` 의 SelectBox 로 올린다.
 * 그때까지는 화면이 컴포넌트의 클래스를 덮는 자리라 `!` 가 붙는다. 올리고 나면 이 상수는 지운다.
 */
const NEUTRAL_SELECTED = [
  "data-[selected]:!border-oe-border-bold-primary",
  "data-[selected]:!bg-transparent",
  "data-[selected]:!shadow-none",
  "data-[selected]:hover:!bg-oe-interaction-hover-subtle",
  "data-[selected]:active:!bg-oe-interaction-hover",
  "[&_[data-slot=radio][data-checked]]:!border-oe-border-bold-primary",
  "[&_[data-slot=radio][data-checked]]:!bg-oe-background-bold-primary",
].join(" ");

/**
 * 화면이 들고 있는 첨부 파일이다. 올리지 않으므로 파일 자체는 남기지 않고, 줄에 세울 이름과
 * 크기, 그리고 이미지일 때 그 그림을 가리키는 주소만 갖는다.
 */
type PickedFile = { name: string; size: number; preview: string | null };

/**
 * 이름 아래에 서는 한 줄이다. 확장자에서 딴 종류와 크기를 가운뎃점으로 잇는다. 확장자가 없는
 * 파일도 있으므로 그때는 크기만 적는다.
 */
function fileMeta(file: PickedFile) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : null;
  const size = fileSize(file.size);
  return extension ? `${extension.toUpperCase()} · ${size}` : size;
}

/**
 * 파일 크기를 사람이 읽는 단위로 적는다. 1024 로 나누는 이진 단위가 기기의 표기와 맞는다.
 * 숫자와 단위 사이를 띄우는 것은 shadcn 의 Attachment 표기와 같다.
 */
function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * 섹션을 가르는 굵은 선이다. 좌우 여백 없이 화면 폭을 가득 채운다.
 *
 * 16px 회색 띠로 두는 것은 위아래가 같은 폼의 다음 칸이 아니라 다른 단계라는 뜻이기 때문이다.
 * 여백 안에 든 1px 선은 한 묶음 안에서 줄을 끊는 표시이고, 폼의 첨부 위에 그 선이 이미 쓰이고
 * 있다. 같은 화면에서 두 종류의 끊김을 같은 선으로 적으면 위계가 사라진다.
 *
 * 공용 컴포넌트가 아니라 이 화면이 갖는다. 아직 이 화면 하나에만 쓰이며, 다른 화면에서 같은
 * 끊김이 필요해질 때 `packages/ui` 로 올린다.
 */
function SectionDivider() {
  return <div aria-hidden="true" className="h-4 shrink-0 bg-oe-background-secondary" />;
}
