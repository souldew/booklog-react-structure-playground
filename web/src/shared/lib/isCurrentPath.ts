// ナビやタブで、リンクを現在地として強調するかの判定。section の下の階層 (/books/1) でも現在地とみなす。
// ただし / (ルート) は完全一致だけ。前方一致にすると全ページで現在地になる。
export function isCurrentPath(pathname: string, section: string): boolean {
  if (section === "/") return pathname === section;
  return pathname === section || pathname.startsWith(`${section}/`);
}
