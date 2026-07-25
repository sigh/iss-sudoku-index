// Title: Mod Prod in the Fog
// Author: Scott Buckley
// Video: https://www.youtube.com/watch?v=Zg-oRYNDIZM
// Source: https://sudokupad.app/1ej6condot

// Rules encoded: normal sudoku (default row/column/box). Product lines: for
// each line, the product of every cell on the line EXCEPT the circled
// endpoint, reduced mod 10, equals the circled cell's own digit (the circled
// cell is not itself one of the multiplied digits, by analogy with an Arrow
// bulb being excluded from its own arm sum). Weak Kropki: dotted cell pairs
// differ by 1 or 2. Digits may repeat on a line (no other rule forbids it)
// so no AllDifferent is added for lines.
// Omitted: dynamic fog is solving UI, not a final-grid rule.

// Each entry: [circledCell, ...otherCells] (order of "other" cells does not
// matter -- multiplication is commutative). Grouped by drawn colour (green,
// blue, orange); the grouping has no logical effect since every line is an
// independent constraint.
const productLines = [
  // Green
  ['R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R4C8'],
  ['R5C3', 'R4C3', 'R5C2'],
  ['R5C6', 'R8C4', 'R7C4', 'R7C5', 'R7C6', 'R6C6'],
  ['R1C1', 'R2C1', 'R3C2'],
  // Blue
  ['R1C5', 'R2C5', 'R2C6', 'R1C6'],
  ['R1C3', 'R3C2', 'R2C3'],
  ['R7C8', 'R4C9', 'R5C9', 'R6C8'],
  ['R8C1', 'R7C1', 'R8C2', 'R9C1'],
  // Orange
  ['R6C9', 'R7C9', 'R7C8', 'R8C8', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R8C7'],
  ['R1C9', 'R1C8', 'R2C8', 'R3C9', 'R3C8', 'R2C7', 'R1C7'],
  ['R6C3', 'R6C1', 'R6C2'],
  ['R4C3', 'R4C1', 'R4C2'],
  ['R2C2', 'R3C1', 'R3C2'],
  ['R1C1', 'R1C2', 'R1C3'],
  ['R3C6', 'R2C4', 'R3C4', 'R3C5'],
  ['R4C4', 'R6C4', 'R5C4'],
  ['R8C4', 'R7C3', 'R8C3', 'R9C3', 'R9C4'],
];

// Weak Kropki dot edges: |a - b| in {1, 2}.
const weakKropkiDots = [
  ['R8C2', 'R8C3'],
  ['R8C3', 'R8C4'],
  ['R2C4', 'R2C5'],
];

// NFA per product line: read the circled cell first (sets `target`), then
// multiply the remaining cells' digits mod 10 into `product`; accept when
// the final product equals the circled digit. State space is bounded
// (target in 1..9 or null, product in 0..9), so no maxDepth is needed.
const productLineSpec = NFA.encodeSpec({
  startState: { target: null, product: 1 },
  transition: ({ target, product }, value) => {
    if (target === null) return { target: value, product: 1 };
    return { target, product: (product * value) % 10 };
  },
  accept: ({ target, product }) => target !== null && product === target,
}, 9);

function productLine(cells) {
  return new NFA(productLineSpec, 'mod product line', ...cells);
}

const weakKropkiKey = Pair.fnToKey(
  (a, b) => { const d = Math.abs(a - b); return d === 1 || d === 2; }, 9);

function weakKropki(cellA, cellB) {
  return new Pair(weakKropkiKey, 'weak Kropki', cellA, cellB);
}

return [
  new Shape('9x9'),
  ...productLines.map(productLine),
  ...weakKropkiDots.map(([a, b]) => weakKropki(a, b)),
];
