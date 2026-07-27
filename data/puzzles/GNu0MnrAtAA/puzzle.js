// Title: Numbered Difference
// Author: AstralSky
// Video: https://www.youtube.com/watch?v=GNu0MnrAtAA
// Source: https://sudokupad.app/w6ftuh51wn

// Normal Sudoku on the 9x9 grid. No digits are given directly.
//
// Numbered Room clues (outside-grid, one per row/column) are themselves
// unsolved digits 1-9: VLr is the clue left of row r, VTc is the clue above
// column c. Neither VL nor VT is a literal Var-per-clue value (the fixed-int
// ISS `NumberedRoom` class needs a literal clue); here the same "digit in the
// first cell -> position N -> clue equals the Nth cell" relation is encoded
// with a custom NFA that reads the row/column's 9 cells then the clue cell.
//
// Diamonds: a diamond between two orthogonally adjacent cells means the pair
// differs by Y, the Numbered Room clue of the diamond's row (horizontal) or
// column (vertical). "All possible Diamonds are given" is encoded as a
// negative: every other orthogonally adjacent pair in that row/column must
// NOT differ by Y. Each pair is checked with a 3-cell NFA (cellA, cellB,
// clue) since the target difference is itself a variable, not a constant.

const graph = cellGraph('9x9');

const topVar = new Var('T', 'top (column) Numbered Room clues', 9);
const leftVar = new Var('L', 'left (row) Numbered Room clues', 9);
const topCell = c => topVar.cell(c);
const leftCell = r => leftVar.cell(r);

// --- Numbered Room indexing -------------------------------------------
// Reads [cell1..cell9, clue] where cell1 is nearest the clue's edge.
// State tracks N (cell1's value, i.e. the target position) and found (the
// digit read once the scan position reaches N). Accepts iff the clue's
// digit equals found.
const numberedRoomSpec = NFA.encodeSpec({
  startState: { pos: 0, N: null, found: null },
  transition: ({ pos, N, found }, value) => {
    if (pos === 10) return undefined; // exactly 10 symbols expected
    if (pos === 9) {
      // `value` is the trailing clue cell.
      return { pos: 10, ok: found === value };
    }
    const newPos = pos + 1;
    if (newPos === 1) {
      // The first cell defines N, and may itself be position N.
      return { pos: 1, N: value, found: value === 1 ? value : null };
    }
    return {
      pos: newPos,
      N,
      found: found !== null ? found : (newPos === N ? value : null),
    };
  },
  accept: (state) => state.pos === 10 && state.ok === true,
  maxDepth: 10,
}, 9);

const numberedRoomRows = graph.rows().map(
  (cells, i) => new NFA(numberedRoomSpec, 'numbered-room-row',
    [...cells, leftCell(i + 1)]));
const numberedRoomCols = graph.columns().map(
  (cells, i) => new NFA(numberedRoomSpec, 'numbered-room-col',
    [...cells, topCell(i + 1)]));

// --- Diamonds -----------------------------------------------------------
// Diamond pairs, transcribed from the drawn white-diamond markers (each a
// 45-degree-rotated white square straddling two cells), converted from the
// source's 10x10 coordinates (top row / left column are the outside clue
// border) to this 9x9 grid by subtracting 1 from both row and column, and
// normalized to (nearer-edge cell, farther-edge cell) order to match the
// pair enumeration below.
const diamondPairs = [
  ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R1C3', 'R1C4'],
  ['R1C3', 'R2C3'], ['R1C1', 'R2C1'], ['R2C1', 'R3C1'], ['R3C1', 'R4C1'],
  ['R3C2', 'R4C2'], ['R3C3', 'R3C4'], ['R2C5', 'R3C5'], ['R1C9', 'R2C9'],
  ['R3C7', 'R3C8'], ['R6C1', 'R6C2'], ['R6C2', 'R6C3'], ['R5C4', 'R6C4'],
  ['R5C6', 'R6C6'], ['R6C9', 'R7C9'], ['R8C9', 'R9C9'],
];
const diamondKeys = new Set(diamondPairs.map(([a, b]) => `${a}|${b}`));

// 3-cell NFA over (cellA, cellB, clue): accepts iff |A-B| does/does not
// equal the clue, depending on `shouldMatch`.
const diamondSpec = (shouldMatch) => NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    if (state.step === 0) return { step: 1, a: value };
    if (state.step === 1) return { step: 2, diff: Math.abs(state.a - value) };
    if (state.step === 2) return { step: 3, ok: state.diff === value };
    return undefined;
  },
  accept: (state) => state.step === 3 && (shouldMatch ? state.ok : !state.ok),
}, 9);
const diamondYes = diamondSpec(true);
const diamondNo = diamondSpec(false);

// All orthogonally adjacent pairs, paired with the clue cell (row-clue for
// a horizontal pair, column-clue for a vertical pair) that supplies Y.
const horizontalPairs = graph.rows().flatMap((line, i) => {
  const clue = leftCell(i + 1);
  return line.slice(0, -1).map((a, j) => ({ a, b: line[j + 1], clue }));
});
const verticalPairs = graph.columns().flatMap((line, i) => {
  const clue = topCell(i + 1);
  return line.slice(0, -1).map((a, j) => ({ a, b: line[j + 1], clue }));
});

const diamondConstraints = [...horizontalPairs, ...verticalPairs].map(
  ({ a, b, clue }) => {
    const isDiamond = diamondKeys.has(`${a}|${b}`);
    return new NFA(
      isDiamond ? diamondYes : diamondNo,
      isDiamond ? 'diamond' : 'no-diamond',
      [a, b, clue]);
  });

return [
  new Shape('9x9'),
  topVar,
  leftVar,
  ...numberedRoomRows,
  ...numberedRoomCols,
  ...diamondConstraints,
];
