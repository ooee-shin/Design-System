"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/candidates/tabs";
import { docKeyOf, studioDocUrl } from "@/components/component-inspector/component-map";
import type { ScreenRoot } from "@/components/renewal/screen-registry";
import type { SandboxScreen } from "@/screens";

type Project = { id: string; name: string; description: string };

/** 블루키 리뉴얼 탭의 값. 프로젝트 id 와 겹치지 않게 둔다. */
export const RENEWAL_TAB = "renewal";

const CHIP = "inline-flex rounded-md border border-oe-border-secondary px-1.5 py-0.5 text-xs text-oe-foreground-secondary";

/**
 * sandbox 첫 화면의 탭이다. 화면이 쌓일수록 한 줄로 늘어놓은 목록은 스크롤만 길어지므로, 프로젝트마다
 * 탭 하나로 나눠 「어느 프로젝트에 무엇이 들어 있는지」를 먼저 보이게 한다(2026-09-22 개발자).
 *
 * 고른 탭은 주소의 `#<탭>` 에 남긴다. 링크로 건네면 받은 사람이 같은 탭을 열고, 화면을 보고 뒤로
 * 오면 보던 탭으로 돌아온다. 정적으로 내보낸 사이트라 쿼리 대신 해시를 쓴다.
 */
export function SandboxIndexTabs({
  projects,
  screens,
  renewal,
  uiImports = {},
}: {
  projects: readonly Project[];
  screens: SandboxScreen[];
  renewal: ScreenRoot[];
  /** 화면 key → 그 화면이 `@ooee/ui` 에서 가져온 컴포넌트 이름. 빌드 때 센다. */
  uiImports?: Record<string, string[]>;
}) {
  const tabs = [...projects.map((project) => project.id), RENEWAL_TAB];
  // 첫 탭은 화면이 있는 첫 프로젝트다. 빈 탭부터 열면 무엇이 있는지 모른 채 다른 탭을 눌러 봐야 한다.
  const firstWithScreens = projects.find((project) => screens.some((screen) => screen.project === project.id))?.id;
  const [value, setValue] = useState<string>(firstWithScreens ?? RENEWAL_TAB);

  useEffect(() => {
    const fromHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (tabs.includes(hash)) setValue(hash);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // tabs 는 받은 목록에서 매번 새로 만들지만 값이 바뀌지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (next: string) => {
    setValue(next);
    window.history.replaceState(null, "", `#${next}`);
  };

  return (
    <Tabs value={value} onValueChange={(next) => choose(String(next))} className="flex flex-col gap-6">
      <div className="border-b border-oe-border-secondary">
        <TabsList aria-label="프로젝트">
          {projects.map((project) => (
            <TabsTab key={project.id} value={project.id}>
              {project.name}
              <span className="ml-1.5 text-oe-foreground-tertiary">{screens.filter((screen) => screen.project === project.id).length}</span>
            </TabsTab>
          ))}
          <TabsTab value={RENEWAL_TAB}>
            블루키 리뉴얼
            <span className="ml-1.5 text-oe-foreground-tertiary">{renewal.reduce((sum, root) => sum + root.items.filter((item) => item.href).length, 0)}</span>
          </TabsTab>
        </TabsList>
      </div>

      {projects.map((project) => {
        const inProject = screens.filter((screen) => screen.project === project.id);
        return (
          <TabsPanel key={project.id} value={project.id} className="flex flex-col gap-3 outline-none">
            <p className="text-sm text-oe-foreground-secondary">{project.description}</p>
            {inProject.length === 0 ? (
              <p className="text-sm text-oe-foreground-tertiary">아직 만든 화면이 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {inProject.map((screen) => (
                  <li key={screen.key} className="rounded-lg border border-oe-border-secondary bg-oe-background-primary p-4">
                    <Link
                      href={screen.href}
                      className="rounded-sm text-base font-medium text-oe-foreground-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-oe-focus-ring"
                    >
                      {screen.name}
                    </Link>
                    <p className="mt-1 text-sm text-oe-foreground-secondary">{screen.prompt}</p>
                    {uiImports[screen.key]?.length ? (
                      <ul aria-label="쓴 컴포넌트" className="mt-2 flex flex-wrap gap-1.5">
                        {uiImports[screen.key].map((name) => {
                          const key = docKeyOf(name);
                          return (
                            <li key={name}>
                              {key ? (
                                <a
                                  href={studioDocUrl(key)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`${CHIP} hover:border-oe-border-primary hover:text-oe-foreground-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring`}
                                >
                                  {name}
                                </a>
                              ) : (
                                <span className={CHIP}>{name}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                    <p className="mt-2 text-xs text-oe-foreground-tertiary">
                      {screen.createdAt}
                      {screen.source ? ` · 원본 ${screen.source}` : " · 원본 없음"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </TabsPanel>
        );
      })}

      <TabsPanel value={RENEWAL_TAB} className="flex flex-col gap-6 outline-none">
        <p className="text-sm text-oe-foreground-secondary">
          블루키 제품 화면을 한 건씩 구현하는 작업장입니다. 화면끼리 이어지는 데모가 아니고, 화면에 보이는 요소가 실제로 동작하지 않을 수 있습니다.
        </p>
        {renewal.map((root) => (
          <section key={root.key} aria-labelledby={`renewal-${root.key}`} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id={`renewal-${root.key}`} className="text-base font-semibold text-oe-foreground-primary">
                {root.name}
              </h2>
              <Link
                href={`/renewal/${root.key}`}
                className="rounded-sm text-xs text-oe-foreground-tertiary underline-offset-4 outline-none hover:text-oe-foreground-primary hover:underline focus-visible:ring-2 focus-visible:ring-oe-focus-ring"
              >
                작업 목록
              </Link>
            </div>
            <p className="text-sm text-oe-foreground-secondary">{root.note}</p>
            <ul className="flex flex-col divide-y divide-oe-border-secondary rounded-lg border border-oe-border-secondary bg-oe-background-primary">
              {root.items.map((item) => (
                <li key={item.key} className="flex items-baseline justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="rounded-sm text-sm font-medium text-oe-foreground-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-oe-focus-ring"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-oe-foreground-tertiary">{item.name}</span>
                    )}
                    {item.scope ? <p className="mt-0.5 text-xs text-oe-foreground-tertiary">{item.scope}</p> : null}
                  </div>
                  <span className="shrink-0 text-xs text-oe-foreground-tertiary">{!item.href ? "예정" : item.inProgress ? "만드는 중" : ""}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </TabsPanel>
    </Tabs>
  );
}
