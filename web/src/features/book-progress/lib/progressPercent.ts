// 読了率 (0〜100 の整数)。ページ数が 0 なら 0、現在のページがページ数を超えていても 100 で止める。
export function progressPercent(currentPage: number, totalPages: number): number {
  if (totalPages <= 0) return 0;
  return Math.min(100, Math.round((currentPage / totalPages) * 100));
}
