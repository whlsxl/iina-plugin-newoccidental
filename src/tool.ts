import { iso6392 } from "iso-639-2";

export function getLangName(t2: string): string | null {
  for (const t2Name of iso6392) {
    if (t2Name.iso6392B === t2) {
      return t2Name.name;
    }
  }
  return null;
}
