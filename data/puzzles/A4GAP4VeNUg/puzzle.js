// Title: Snowballs
// Author: Nordy
// Video: https://www.youtube.com/watch?v=A4GAP4VeNUg
// Source: https://app.crackingthecryptic.com/sudoku/T8mg9QGpdf

// Normal sudoku rules apply (default 9x9 shape with the standard boxes).
// Each blue circle is a Snowball: a straight horizontal-or-vertical run of
// orthogonally connected cells starting at the circled cell, whose corner
// number gives the run's total length in cells (including the start). From
// the run's third cell on, each digit equals the sum of the two preceding
// digits along the run. Snowballs may share cells with each other.
//
// The source draws no line, arrow, or other mark for any Snowball -- only
// the circle and its corner-number overlay -- and the rules text does not
// say which of horizontal/vertical, nor which end a run extends toward,
// so every direction that keeps the run's length cells on the grid is
// encoded as a live alternative (Or of one NFA per direction), never
// resolved by which one yields the known solution.

const GRID = 9;

// Snowball start cell + path length, transcribed from the circle marks and
// their paired corner-number labels.
const snowballs = [
  { r: 1, c: 1, len: 5 },
  { r: 1, c: 5, len: 4 },
  { r: 2, c: 8, len: 3 },
  { r: 5, c: 9, len: 3 },
  { r: 9, c: 9, len: 5 },
  { r: 9, c: 5, len: 4 },
  { r: 7, c: 7, len: 3 },
  { r: 6, c: 6, len: 4 },
  { r: 5, c: 5, len: 4 },
  { r: 4, c: 4, len: 3 },
  { r: 5, c: 1, len: 4 },
  { r: 7, c: 3, len: 3 },
  { r: 8, c: 2, len: 3 },
];

// State = the last two digits consumed so far along the run (null until
// consumed). From the third digit on, the incoming value must equal the sum
// of the two carried digits, then the window shifts forward.
const fibonacciSpec = NFA.encodeSpec({
  startState: { a: null, b: null },
  transition: ({ a, b }, value) => {
    if (a === null) return { a: value, b: null };
    if (b === null) return { a, b: value };
    if (value !== a + b) return undefined;
    return { a: b, b: value };
  },
  accept: () => true,
}, 9);

const DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

function runCells(r, c, len, [dr, dc]) {
  const cells = [];
  for (let i = 0; i < len; i++) {
    const rr = r + dr * i;
    const cc = c + dc * i;
    if (rr < 1 || rr > GRID || cc < 1 || cc > GRID) return null;
    cells.push(makeCellId(rr, cc));
  }
  return cells;
}

const snowballConstraints = snowballs.map(({ r, c, len }) => {
  const alternatives = DIRECTIONS
    .map(d => runCells(r, c, len, d))
    .filter(cells => cells !== null)
    .map(cells => new NFA(
      fibonacciSpec, `Snowball R${r}C${c} len ${len}`, ...cells));
  return new Or(alternatives);
});

return [
  new Shape('9x9'),
  new Given('R6C6', 1),
  ...snowballConstraints,
];
