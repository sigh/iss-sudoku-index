// Title: Compression Algorithm
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=tSUeSQGsaCI
// Source: https://sudokupad.app/ce8o5jwu3i

// Squishdoku: nine overlapping 3x3 boxes tile the 7x7 grid; each holds digits
// 1-9 once each, and rows/columns (length 7) must not repeat. Boxes overlap
// on their shared border row/column, so they are hand-rolled AllDifferent
// groups (NoBoxes) rather than the solver's default tiling; a widened 1-9
// value range on the 7-cell rows/columns keeps AllDifferent(9 cells) forcing
// every digit 1-9 exactly once per box by pigeonhole.
// Index Lines: the digit in the Nth cell along a line (from the diamond)
// gives the position along the line where digit N appears. Stated this way
// for every N from 1 to the line's length, so every one of those digits must
// actually be present on the line -- a line of length L is a permutation of
// 1-L, so its cells' candidates are restricted to 1-L.

// Overlapping 3x3 boxes, row-major within each box (drawn as hidden,
// unique-only, no-total regions).
const BOXES = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R1C3', 'R1C4', 'R1C5', 'R2C3', 'R2C4', 'R2C5', 'R3C3', 'R3C4', 'R3C5'],
  ['R1C5', 'R1C6', 'R1C7', 'R2C5', 'R2C6', 'R2C7', 'R3C5', 'R3C6', 'R3C7'],
  ['R3C1', 'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3'],
  ['R3C3', 'R3C4', 'R3C5', 'R4C3', 'R4C4', 'R4C5', 'R5C3', 'R5C4', 'R5C5'],
  ['R3C5', 'R3C6', 'R3C7', 'R4C5', 'R4C6', 'R4C7', 'R5C5', 'R5C6', 'R5C7'],
  ['R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3', 'R7C1', 'R7C2', 'R7C3'],
  ['R5C3', 'R5C4', 'R5C5', 'R6C3', 'R6C4', 'R6C5', 'R7C3', 'R7C4', 'R7C5'],
  ['R5C5', 'R5C6', 'R5C7', 'R6C5', 'R6C6', 'R6C7', 'R7C5', 'R7C6', 'R7C7'],
];

// Index lines (teal), cell order starting from the drawn diamond marker.
const INDEX_LINES = [
  ['R1C1', 'R1C2', 'R2C2', 'R2C3', 'R3C3', 'R3C4', 'R4C4', 'R4C5', 'R4C6'],
  ['R1C5', 'R1C6', 'R2C6', 'R2C7', 'R3C7'],
  ['R5C2', 'R5C3', 'R6C3', 'R6C4', 'R7C4', 'R7C5'],
  ['R4C7', 'R5C6', 'R6C6', 'R7C6'],
];

// The rule "cell p's digit gives the position of digit p on the line" holds
// for every position p on the line at once. Applying it at both p and q shows
// it is symmetric: cell_p == q forces cell_q == p, and vice versa. So one
// Pair per unordered position pair {p, q} (1-indexed from the diamond) states
// the whole rule for that line: cell_p == q iff cell_q == p. Combined with the
// 1-L candidate restriction above, this forces the line to be an involution
// on {1..L}, which is automatically a permutation.
const indexConstraints = (cells) => {
  const n = cells.length;
  const range = Array.from({ length: n }, (_, i) => i + 1);
  const domain = cells.map((cell) => new Given(cell, ...range));
  const pairs = [];
  for (let p = 1; p <= n; p++) {
    for (let q = p + 1; q <= n; q++) {
      const key = Pair.fnToKey((a, b) => (a === q) === (b === p), 9);
      pairs.push(new Pair(key, `Index ${p}<->${q}`, cells[p - 1], cells[q - 1]));
    }
  }
  return [...domain, ...pairs];
};

return [
  new Shape('7x7', 9),
  new NoBoxes(),
  ...BOXES.map((cells) => new AllDifferent(...cells)),
  ...INDEX_LINES.flatMap(indexConstraints),
];
