// Title: What an Odd Sight
// Author: damo_89
// Video: https://www.youtube.com/watch?v=UrkZI_uiuYE
// Source: https://sudokupad.app/7oe1c7nwpc

// Normal sudoku rules apply. A digit in a circle is odd and counts the odd
// digits seen from it in all four orthogonal directions combined, itself
// included; even digits block the view. A digit in a square is even and counts
// the even digits seen the same way, with odd digits blocking. ALL circles and
// squares are given, so no unmarked cell may satisfy either clue.
//
// Both clues count the same quantity: the digits sharing the cell's own parity
// that are visible from it. The view along a direction stops at the first digit
// of the other parity, so the cells seen across the row are exactly the maximal
// run of same-parity cells containing the cell, and likewise down the column.
// With H and V for those two run lengths, the count is H + V - 1, the cell
// itself lying in both runs. The VH and VV overlays hold H and V per cell.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const hRun = graph.makeOverlay('VH');   // run length across the row
const vRun = graph.makeOverlay('VV');   // run length down the column

// The drawn markers: nine rounded (circle) and six square underlays, one per cell.
const circles = ['R1C9', 'R2C5', 'R3C2', 'R4C1', 'R4C5',
                 'R6C6', 'R6C7', 'R7C1', 'R7C4'];
const squares = ['R4C9', 'R5C5', 'R5C6', 'R6C2', 'R6C5', 'R7C9'];
const marked = new Set([...circles, ...squares]);

// Run lengths, scanning a line as [digit, len, digit, len, ...]. The state holds
// the parity of the run in progress, the length `k` claimed by its first cell,
// and `left`, how many of its cells are still to be read. A same-parity digit
// continues the run and must repeat `k`; a digit of the other parity is allowed
// only once the run is used up, and starts a new one. `first` marks the read of
// the length that opens a run, which sets `k` instead of being checked against it.
const runSpec = NFA.encodeSpec({
  startState: { awaitLen: false, first: false, par: null, k: 0, left: 0 },
  transition: (s, value) => {
    if (!s.awaitLen) {
      const par = value % 2;
      if (s.left > 0) {
        if (par !== s.par) return undefined;
        return { awaitLen: true, first: false, par: par, k: s.k, left: s.left - 1 };
      }
      if (s.par !== null && par === s.par) return undefined;
      return { awaitLen: true, first: true, par: par, k: 0, left: 0 };
    }
    if (s.first) {
      return { awaitLen: false, first: false, par: s.par, k: value, left: value - 1 };
    }
    if (value !== s.k) return undefined;
    return { awaitLen: false, first: false, par: s.par, k: s.k, left: s.left };
  },
  // The line must end with the final run complete, on a digit-length pair boundary.
  accept: (s) => !s.awaitLen && s.left === 0,
}, geometry);

const runLines = [
  ...graph.rows().map(cells => [cells, hRun]),
  ...graph.columns().map(cells => [cells, vRun]),
].map(([cells, overlay]) => new NFA(runSpec, 'runLength',
  ...cells.flatMap(cell => [cell, overlay.at(cell)])));

// Reads [H, V, digit] and tests digit === H + V - 1 when `equal`, and its
// negation otherwise. The state accumulates H then H + V, then compares.
const countSpec = (equal) => NFA.encodeSpec({
  startState: { phase: 0, sum: 0 },
  transition: (s, value) => {
    if (s.phase === 0) return { phase: 1, sum: value };
    if (s.phase === 1) return { phase: 2, sum: s.sum + value };
    return ((s.sum - 1 === value) === equal) ? { phase: 3, sum: 0 } : undefined;
  },
  accept: (s) => s.phase === 3,
}, geometry);
const isCount = countSpec(true);
const notCount = countSpec(false);

const clues = graph.cells().map(cell => marked.has(cell)
  ? new NFA(isCount, 'clue', hRun.at(cell), vRun.at(cell), cell)
  : new NFA(notCount, 'unmarked', hRun.at(cell), vRun.at(cell), cell));

const parities = [
  ...circles.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...squares.map(cell => new Given(cell, 2, 4, 6, 8)),
];

return [
  new Shape('9x9'),
  hRun.toVar('hRun'),
  vRun.toVar('vRun'),
  new Given('R6C4', 1),
  ...parities,
  ...runLines,
  ...clues,
];
