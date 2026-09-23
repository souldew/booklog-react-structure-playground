// "YYYY-MM" を "YYYY年M月" にする。月別統計の見出しに使う。
export function formatMonth(month: string): string {
  const [year, monthNumber] = month.split("-");
  return `${year}年${Number(monthNumber)}月`;
}
