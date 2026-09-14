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
