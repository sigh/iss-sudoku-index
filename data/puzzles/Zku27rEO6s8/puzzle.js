// Title: Postcodes
// Author: Maggie & BremSter
// Video: https://www.youtube.com/watch?v=Zku27rEO6s8
// Source: https://app.crackingthecryptic.com/czdmvpnot8

// Normal sudoku rules apply.
//
// A purple line contains a set of consecutive digits, in any order (Renban).
//
// A grey "tab" is a small bump drawn on one cell's edge, poking in from a
// neighbouring cell or the outer border. The digit(s) printed at that cell
// must be placed within three cells of the tab's narrow end -- the tabbed
// cell itself plus the next two cells further on -- counting in the
// direction the bump points, along that row or column.

// Renban lines (purple): each list is the drawn stroke order.
const renbanLines = [
  ['R2C2', 'R3C2', 'R4C2', 'R4C3', 'R3C3', 'R3C4'],
  ['R7C2', 'R6C2', 'R5C2', 'R5C3', 'R6C3', 'R6C4'],
  ['R3C8', 'R4C8', 'R5C8', 'R5C7', 'R4C7', 'R4C6'],
  ['R8C8', 'R7C8', 'R6C8', 'R6C7', 'R7C7', 'R7C6'],
  ['R1C4', 'R1C5', 'R2C5', 'R2C6', 'R2C7', 'R1C7'],
  ['R9C3', 'R8C3', 'R8C4', 'R8C5', 'R9C5', 'R9C6'],
];

// Tabs (grey): `cell` is the cell the bump enters; `dir` is the unit
// [dRow,dCol] it points, away from its base; `digits` are the value(s)
// printed at that cell.
const tabs = [
  { cell: 'R3C2', dir: [-1, 0], digits: [1] },
  { cell: 'R7C8', dir: [1, 0], digits: [8] },
  { cell: 'R1C8', dir: [1, 0], digits: [3, 6] },
  { cell: 'R3C7', dir: [1, 0], digits: [2, 9] },
  { cell: 'R3C4', dir: [1, 0], digits: [3] },
  { cell: 'R3C5', dir: [0, 1], digits: [2, 3] },
  { cell: 'R4C4', dir: [0, -1], digits: [1, 7] },
  { cell: 'R7C5', dir: [0, -1], digits: [2, 3] },
  { cell: 'R6C6', dir: [0, 1], digits: [1, 7] },
  { cell: 'R7C3', dir: [-1, 0], digits: [1, 9] },
  { cell: 'R8C2', dir: [0, 1], digits: [3, 4] },
  { cell: 'R1C1', dir: [1, 0], digits: [9] },
];

const SIZE = 9;
const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Every tab's 3-cell window reaches exactly to the grid edge in `dir` (never
// short, never off-grid) -- the internal-arithmetic check that this is the
// puzzle's intended cell count and direction, not an off-by-one.
const forbidden = new Map(); // cellId -> Set of digits excluded from it

for (const { cell, dir, digits } of tabs) {
  const { row, col } = parseCellId(cell);
  const window = new Set();
  for (let k = 0; k < 3; k++) {
    const r = row + dir[0] * k, c = col + dir[1] * k;
    if (r < 1 || r > SIZE || c < 1 || c > SIZE) {
      throw new Error(`tab window left the grid: ${cell} dir ${dir}`);
    }
    window.add(makeCellId(r, c));
  }
  // A tab pointing along a row restricts its digit(s) within that row
  // (columns vary); one pointing along a column restricts within that
  // column (rows vary).
  const alongRow = dir[0] === 0;
  for (let i = 1; i <= SIZE; i++) {
    const other = alongRow ? makeCellId(row, i) : makeCellId(i, col);
    if (window.has(other)) continue;
    if (!forbidden.has(other)) forbidden.set(other, new Set());
    for (const d of digits) forbidden.get(other).add(d);
  }
}

// Each excluded cell becomes a multi-value Given restricting it to every
// digit except the tab's -- the standard "cell is one of these digits" idiom
// for a candidate restriction with no dedicated class.
const tabGivens = [...forbidden.entries()].map(
  ([cell, excluded]) => new Given(cell, ...ALL_DIGITS.filter(d => !excluded.has(d))));

return [
  new Shape('9x9'),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...tabGivens,
];
