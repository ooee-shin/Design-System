"use client"

import { useState } from "react"

import { RiSearchLine } from "@remixicon/react"

import { Input } from "@ooee/ui"

import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/candidates/sidebar"

// 받은 코드는 `SidebarInput` 위에 돋보기를 좌표로 얹고, 이름은 화면에서 감춘 Label 이 갖고
// 있었다. 공용 `Input` 은 Leading element 자리를 스스로 갖고 있으므로 좌표로 얹을 일이 없고,
// 보이는 Label 을 두지 않는 자리이므로 이름은 `aria-label` 이 갖는다.
export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  // `Input` 은 값을 소유하지 않으므로 값이 있는지는 쓰는 쪽이 판단해 `clearable` 로 전달한다.
  const [query, setQuery] = useState("")

  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          {/* `type="search"` 로 두면 브라우저가 자기 지우기 버튼을 붙여서, 공용 `Input` 이 그리는
              지우기와 같은 일을 하는 버튼이 둘이 된다. 지우기는 공용 쪽 하나만 쓴다. */}
          <Input
            id="search"
            type="text"
            // Fill 이다. 테두리로 경계를 만들지 않고 바탕 한 단계로만 선다. 좌우 안쪽 여백은
            // controlSize 가 주는 10px 에 6px 을 더해 16px 로 둔다. 편집하는 동안 바탕이
            // 밝아지는 것은 컴포넌트가 갖고 있는 동작이므로 덮어쓰지 않고, 그때 글자와 아이콘만
            // 밝은 바탕에 맞는 색으로 함께 바꾼다.
            //
            // 공용 `Input` 은 `oe` 토큰을 쓰므로 좌측 메뉴 바탕과 무관하게 흰 상자로 선다. 짙은
            // 바탕에서는 그것만 떠 보이므로 바탕과 글자를 좌측 메뉴의 값에 맞춘다.
            variant="filled"
            containerClassName="px-4 bg-sidebar-accent text-sidebar-foreground has-[[data-slot=input]:focus]:text-oe-foreground-primary [&_[data-slot=input-leading]]:text-sidebar-foreground/60 [&_[data-slot=input-clear]]:text-sidebar-foreground/60 has-[[data-slot=input]:focus]:[&_[data-slot=input-leading]]:text-oe-foreground-tertiary has-[[data-slot=input]:focus]:[&_[data-slot=input-clear]]:text-oe-foreground-tertiary"
            className="placeholder:text-sidebar-foreground/50"
            controlSize="small"
            placeholder="메뉴 검색"
            aria-label="메뉴 검색"
            leadingElement={<RiSearchLine />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            clearable={query.length > 0}
            clearLabel="검색어 지우기"
            onClear={() => setQuery("")}
          />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
