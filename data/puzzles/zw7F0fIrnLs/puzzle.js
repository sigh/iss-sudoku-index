// Title: Ballroom
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=zw7F0fIrnLs
// Source: https://sudokupad.app/mvn7atnxaz

// Rules encoded: the 6x6 interior is divided into four orthogonally connected
// nine-cell regions each holding 1-9 once; no digit repeats in a row or column
// of the interior; a digit in any circle (interior or outside) equals the number
// of circles holding that digit; a circled outside cell equals the digit in the
// Nth cell looking into the grid, N being the digit in the first cell, and those
// first N cells share a region while the (N+1)th cell, if any, does not.
// No rule is omitted. The outside ring is not part of the Sudoku grid: the ten
// circled outside cells are the Var group O (cells VO1..VO10), uncircled ring cells carry nothing.
const shape = new Shape('6x6', 9);
const graph = cellGraph(shape);
const cc = graph.makeOverlay('CC');

// Interior circles: the drawn circles on R2C2..R7C7 of the 8x8 canvas, shifted by (-1,-1).
const innerCircles = [
  'R1C1', 'R1C2', 'R1C4', 'R1C5', 'R1C6',
  'R2C1', 'R2C2', 'R2C3', 'R2C5',
  'R3C1', 'R3C3', 'R3C4', 'R3C5', 'R3C6',
  'R4C2', 'R4C4', 'R4C5',
  'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6',
  'R6C1', 'R6C2', 'R6C4', 'R6C6',
];
// Outside circles: [Var cell, line of grid cells looking into the grid, first cell first]. Drawn at
// canvas R1C2, R1C3, R1C5, R1C6, R1C7 (top), R2C1, R7C1 (left), R4C8 (right), R8C2, R8C4 (bottom).
const col = c => [1, 2, 3, 4, 5, 6].map(r => makeCellId(r, c));
const colUp = c => col(c).reverse();
const row = r => [1, 2, 3, 4, 5, 6].map(c => makeCellId(r, c));
const rowLeft = r => row(r).reverse();
const outer = new Var('O', 'Circled outside cells', 10);
const outside = [
  col(1), col(2), col(4), col(5), col(6),
  row(1), row(6),
  rowLeft(3),
  colUp(1), colUp(3),
].map((line, i) => ({ cell: outer.cell(i + 1), line }));

// Reads [c1, cc(c1), c2, cc(c2), ..., c6, cc(c6), clue]: each grid digit is followed by its region
// label, the outside clue comes last (13 reads). State fields: p = kind of the next read
// (F first digit, L label, D digit, Z skipped tail, E accepted), n = the first digit N (N > 6 has
// no Nth cell, so is rejected), i = cells read so far, label = region label of the first cell,
// t = the digit of the Nth cell, r = reads left once the same-region run is settled.
// Labels must equal the first cell's while i <= N and differ at i = N + 1 (none when N = 6).
const lineClue = NFA.encodeSpec({
  startState: { p: 'F' },
  transition(s, v) {
    if (s.p === 'F') {
      if (v > 6) return undefined;
      return { p: 'L', i: 1, n: v, t: v === 1 ? v : 0 };
    }
    if (s.p === 'L') {
      if (s.i === 1) return { p: 'D', i: 1, n: s.n, t: s.t, label: v };
      if (s.i <= s.n && v !== s.label) return undefined;
      if (s.i === s.n + 1 && v === s.label) return undefined;
      if (s.i === s.n + 1 || s.i === 6) return { p: 'Z', t: s.t, r: 13 - 2 * s.i };
      return { p: 'D', i: s.i, n: s.n, t: s.t, label: s.label };
    }
    if (s.p === 'D') {
      const i = s.i + 1;
      return { p: 'L', i, n: s.n, t: i === s.n ? v : s.t, label: s.label };
    }
    // p === 'Z': the last read is the outside clue, which must equal the Nth cell's digit.
    if (s.r > 1) return { p: 'Z', t: s.t, r: s.r - 1 };
    return v === s.t ? { p: 'E' } : undefined;
  },
  accept: s => s.p === 'E',
}, shape);

return [
  shape,
  new NoBoxes(),
  new RegionSize(9),
  new ChaosConstruction(),
  outer,
  new CountingCircles(...innerCircles, ...outside.map(o => o.cell)),
  ...outside.map(o => new NFA(lineClue, 'numbered room with region run',
    [...o.line.flatMap(c => [c, cc.at(c)]), o.cell])),
];
