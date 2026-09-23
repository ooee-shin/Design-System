import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import StoNoticeListPage from "./page";

afterEach(() => {
  cleanup();
});

test("화면 제목이 공지사항으로 보인다", () => {
  render(<StoNoticeListPage />);
  assert.ok(screen.getByRole("heading", { name: "공지사항" }));
});

test("필터 칩 세 개가 있고 처음 열면 전체가 골라져 있다", () => {
  render(<StoNoticeListPage />);
  const all = screen.getByRole("button", { name: "전체" });
  const required = screen.getByRole("button", { name: "필독" });
  const normal = screen.getByRole("button", { name: "일반" });
  assert.equal(all.getAttribute("aria-pressed"), "true");
  assert.equal(required.getAttribute("aria-pressed"), "false");
  assert.equal(normal.getAttribute("aria-pressed"), "false");
});

test("목록은 한 줄에 한 건씩 제목과 올린 날짜를 보여 준다", () => {
  render(<StoNoticeListPage />);
  const firstItem = screen.getByText("추석 연휴 매장 운영시간 변경 안내").closest("a");
  assert.ok(firstItem);
  assert.ok(within(firstItem as HTMLElement).getByText("2026-09-23"));
});

test("아직 읽지 않은 공지에는 새 글 배지, 필독 공지에는 필독 배지가 붙는다", () => {
  render(<StoNoticeListPage />);
  const unreadItem = screen.getByText("추석 연휴 매장 운영시간 변경 안내").closest("a");
  assert.ok(unreadItem);
  assert.ok(within(unreadItem as HTMLElement).getByText("새 글"));
  assert.ok(within(unreadItem as HTMLElement).getByText("필독"));
});

test("더 보기를 누르면 다음 20건이 아래에 이어 붙는다", () => {
  render(<StoNoticeListPage />);
  assert.equal(screen.getAllByRole("link").length, 20);
  fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
  assert.equal(screen.getAllByRole("link").length, 22);
  assert.equal(screen.queryByRole("button", { name: "더 보기" }), null);
});

test("공지가 한 건도 없으면 등록된 공지사항이 없습니다 한 줄만 보인다", () => {
  render(<StoNoticeListPage />);
  fireEvent.click(screen.getByRole("button", { name: "일반" }));
  assert.ok(screen.getByText("등록된 공지사항이 없습니다."));
  assert.equal(screen.queryAllByRole("link").length, 0);
});

test("항목을 누르는 링크는 정해지지 않은 목적지를 가리킨다", () => {
  render(<StoNoticeListPage />);
  const links = screen.getAllByRole("link");
  assert.equal(links[0].getAttribute("href"), "#");
});
