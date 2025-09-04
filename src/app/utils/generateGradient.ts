export function generateGradient(baseColor: string): string {
  const dark = darkenColor(baseColor, 40);
  const darker = darkenColor(baseColor, 80);
  return `linear-gradient(to right, ${baseColor}, ${dark}, ${darker})`;
}

export function darkenColor(hex: string, amount = 40): string {
  let col = hex.startsWith("#") ? hex.slice(1) : hex;
  if (col.length === 3) {
    col = col
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(col, 16);

  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);

  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toLowerCase()
  );
}
