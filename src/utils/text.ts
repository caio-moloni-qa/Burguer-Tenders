export function digitsOnly(value: string, maxLength = Number.POSITIVE_INFINITY): string {
  let out = "";
  for (const char of value) {
    if (char >= "0" && char <= "9") {
      out += char;
      if (out.length >= maxLength) {
        break;
      }
    }
  }
  return out;
}

export function withoutCombiningMarks(value: string): string {
  let out = "";
  for (const char of value.normalize("NFD")) {
    const code = char.charCodeAt(0);
    if (code < 0x0300 || code > 0x036f) {
      out += char;
    }
  }
  return out;
}

export function normalizeSpaces(value: string): string {
  return value.trim().split(" ").filter(Boolean).join(" ");
}

export function isLetter(char: string): boolean {
  return char.toLocaleLowerCase() !== char.toLocaleUpperCase();
}

