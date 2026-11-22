import { BIO_MAX_LENGTH } from "../model";

// 自己紹介の残り文字数。上限を超えると負になる。
// 数え方は ProfileSettingsFormSchema に揃える (前後の空白を落としてから length)。揃えないと、
// 画面は「残り 0 文字」なのに保存で上限超えのエラーになる、といった食い違いが出る。
export function remainingBioLength(bio: string): number {
  return BIO_MAX_LENGTH - bio.trim().length;
}
