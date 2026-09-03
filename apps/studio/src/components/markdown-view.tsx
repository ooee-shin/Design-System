/**
 * 저장소의 `docs/system` 문서를 Studio 화면에서 그대로 읽기 위한 표시 컴포넌트다.
 * 문서 원본은 저장소가 소유하고 이 컴포넌트는 표시만 한다.
 */
export function MarkdownView({ html }: { html: string }) {
  return <div className="studio-markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}
