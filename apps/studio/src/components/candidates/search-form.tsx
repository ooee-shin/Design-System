"use client"

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
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <Input
            id="search"
            type="search"
            controlSize="small"
            placeholder="메뉴 검색"
            aria-label="메뉴 검색"
            leadingElement={<RiSearchLine />}
          />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
