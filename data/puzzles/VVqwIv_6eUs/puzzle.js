// Title: Juosan Killer Sudoku
// Author: udukos
// Video: https://www.youtube.com/watch?v=VVqwIv_6eUs
// Source: https://app.crackingthecryptic.com/sudoku/Df2Q4M7pML
//
// Standard sudoku (givens, rows/cols/boxes) plus killer cages (sum, no
// repeats). Parity rule: odd digits (1,3,5,7,9) may run consecutively for
// more than two cells vertically but not horizontally; even digits
// (2,4,6,8) may run consecutively for more than two cells horizontally but
// not vertically. Read together this means: in every row, a same-parity
// run of odd digits is capped at 2 cells (even runs in a row are
// unrestricted); in every column, a same-parity run of even digits is
// capped at 2 cells (odd runs in a column are unrestricted).
//
// Each parity cap is a "must not match" pattern (no run of 3+), which is an
// NFA whose transition rejects (returns undefined) as soon as the capped
// run reaches 3, rather than a Regex (no negation). One multiSegment NFA
// scans all 9 rows (resetting its run/parity state at each SEGMENT_BREAK, so
// a run never carries across a row boundary), and a second scans all 9
// columns the same way.

const grid = cellGraph('9x9');

// Cage cells and totals: transcribed from the payload's `cages` array
// (metadata stubs for title/author/rules excluded), left-to-right,
// top-to-bottom.
const cages = [
  ['R1C3', 'R2C3', 7],
  ['R2C2', 'R3C2', 'R3C1', 14],
  ['R3C4', 'R3C5', 8],
  ['R3C6', 'R3C7', 'R3C8', 'R4C7', 18],
  ['R1C5', 'R1C6', 10],
  ['R1C8', 'R2C8', 'R2C9', 'R1C9', 27],
  ['R5C8', 'R5C9', 14],
  ['R4C1', 'R5C1', 'R4C2', 11],
  ['R5C3', 'R5C2', 14],
  ['R6C5', 'R7C5', 'R8C5', 'R8C6', 'R7C6', 'R6C6', 26],
  ['R8C4', 'R9C4', 'R9C5', 21],
  ['R8C8', 'R8C9', 9],
];

// Rejects a run of 3+ odd digits. `run` counts the current same-parity
// streak, clamped at 3 (a dead sink - the branch already died via the
// undefined return the step it hit 3, so 3 never actually survives, but the
// clamp keeps the state space tiny regardless). SEGMENT_BREAK resets the
// state so a run never carries across a row boundary; maxDepth covers all 9
// rows' cells plus the 8 breaks between them.
const oddCapSpec = NFA.encodeSpec({
  startState: { parity: null, run: 0 },
  transition: ({ parity, run }, value) => {
    if (value === SEGMENT_BREAK) return { parity: null, run: 0 };
    const p = value % 2 === 1 ? 1 : 0; // 1 = odd, 0 = even
    const newRun = p === parity ? run + 1 : 1;
    if (p === 1 && newRun > 2) return undefined; // 3rd consecutive odd: reject
    return { parity: p, run: Math.min(newRun, 3) };
  },
  accept: () => true,
  maxDepth: 9 * 9 + 8,
}, 9, { multiSegment: true });

// Rejects a run of 3+ even digits (column direction). Same reset/maxDepth
// reasoning as oddCapSpec, over the 9 columns.
const evenCapSpec = NFA.encodeSpec({
  startState: { parity: null, run: 0 },
  transition: ({ parity, run }, value) => {
    if (value === SEGMENT_BREAK) return { parity: null, run: 0 };
    const p = value % 2 === 1 ? 1 : 0;
    const newRun = p === parity ? run + 1 : 1;
    if (p === 0 && newRun > 2) return undefined; // 3rd consecutive even: reject
    return { parity: p, run: Math.min(newRun, 3) };
  },
  accept: () => true,
  maxDepth: 9 * 9 + 8,
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),
  ...cages.map(cells => new Cage(cells[cells.length - 1], ...cells.slice(0, -1))),
  new NFA(oddCapSpec, 'OddRunCapRow', ...grid.rows()),
  new NFA(evenCapSpec, 'EvenRunCapCol', ...grid.columns()),
];
