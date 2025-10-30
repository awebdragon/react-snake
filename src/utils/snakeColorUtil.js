function hexToHSL(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

// eslint-disable-next-line no-unused-vars
function makeSnakeColors(startHex, endHex, length) {
  if (length <= 1) return [startHex]; 
  const start = hexToHSL(startHex);
  const end = hexToHSL(endHex);
  const colors = [];

  for (let i = 0; i < length; i++) {
    const t = i / (length - 1);
    let delta = end.h - start.h;
    if (Math.abs(delta) > 180) delta -= Math.sign(delta) * 360;
    const h = start.h + delta * t;
    const s = start.s + (end.s - start.s) * t;
    const l = start.l + (end.l - start.l) * t;
    colors.push(`hsl(${h}, ${s}%, ${l}%)`);
  }

  return colors;
}

export default makeSnakeColors;