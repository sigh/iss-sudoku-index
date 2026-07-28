// Title: Zip-Pea
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=aE-TiTDHNpk
// Source: https://sudokupad.app/mqx8o45al4

// Normal sudoku rules apply. Each green split-pea segment has white circled
// endpoints; its strictly between cells sum to the two-digit number made by
// those endpoint digits, in either order. The lavender portions alone are
// zipper lines: equal-distance cells sum to the dot-marked centre digit.

// Green circles and interpolated paths come from the drawn green line and
// circle overlays; each entry is one segment between adjacent circles.
const splitPeas = [
  ['R2C1', 'R8C1', ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1']],
  ['R2C9', 'R8C9', ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9']],
  ['R8C9', 'R7C6', ['R8C8', 'R8C7']],
  ['R7C6', 'R5C8', ['R6C7', 'R5C7', 'R4C7', 'R3C8', 'R4C8']],
  ['R1C9', 'R9C1', ['R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2']],
  ['R2C5', 'R4C4', ['R1C5', 'R1C4', 'R1C3', 'R2C3', 'R3C3']],
];

// Each alternative selects which circled endpoint is the tens digit.
function splitPea(a, b, between) {
  return new Or([
    new Sum(0, ...between, [a, -10], [b, -1]),
    new Sum(0, ...between, [a, -1], [b, -10]),
  ]);
}

// Lavender paths are transcribed from the separate lavender strokes, including
// their dot-marked centre cells.
const zippers = [
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8'],
  ['R6C7', 'R5C7', 'R4C7', 'R3C8', 'R4C8'],
  ['R3C3', 'R2C3', 'R1C3', 'R1C4', 'R1C5'],
];

return [
  new Shape('9x9'),
  ...splitPeas.map(([a, b, between]) => splitPea(a, b, between)),
  ...zippers.map(cells => new Zipper(...cells)),
];
