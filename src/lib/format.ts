export function formatMm(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)} mm`;
}
