export default (x0, y0, x1, y1) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const s = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
  const xi = (dx * 1.0) / s;
  const yi = (dy * 1.0) / s;

  let x = x0;
  let y = y0;
  const out = [];

  out.push({ x: x0, y: y0 });

  for (var i = 0; i < s; i++) {
    x += xi;
    y += yi;
    out.push({ x: x, y: y });
  }

  return out;
};
