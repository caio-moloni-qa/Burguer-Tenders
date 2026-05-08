export function digitsOnly(value, maxLength = Number.POSITIVE_INFINITY) {
  let out = "";
  for (const char of String(value || "")) {
    if (char >= "0" && char <= "9") {
      out += char;
      if (out.length >= maxLength) {
        break;
      }
    }
  }
  return out;
}

