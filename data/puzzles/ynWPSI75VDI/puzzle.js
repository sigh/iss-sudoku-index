// Title: Jigsaw Falling into Place
// Author: ndsurgenor
// Video: https://www.youtube.com/watch?v=ynWPSI75VDI
// Source: https://app.crackingthecryptic.com/sudoku/J7HNpQqNG9

// Rules: 1-9 in each row, column and marked (jigsaw) shape; no default 3x3
// boxes. Digits printed above a column must appear in that column, top to
// bottom, in the printed order, with at least one cell strictly between each
// consecutive pair. No givens.

// Jigsaw regions, transcribed from the puzzle's drawn region layout (row, col
// 0-indexed there; converted to 1-indexed R#C# below).
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C3', 'R5C4'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R9C1', 'R9C2', 'R9C3', 'R6C2'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C6', 'R2C7'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C5', 'R6C4', 'R6C5', 'R6C6', 'R3C5', 'R7C5'],
  ['R7C4', 'R7C6', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6', 'R8C3'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R4C8'],
  ['R4C7', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9', 'R5C6'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
];

// Outside-clue digit sequences printed above each column, left to right.
const columnClues = [
  [5, 9, 6],
  [1, 4, 6, 7],
  [2, 3, 8],
  [9, 7, 5, 3],
  [1, 2, 3, 5, 8],
  [8, 6, 4, 2],
  [7, 5, 4],
  [1, 4, 8, 9],
  [4, 1, 6],
];

// One NFA per column, scanning R1..R9 of that column top to bottom. State
// tracks how many of the clue's digits have been matched (`idx`) and whether
// the immediately preceding cell was itself a match (`justMatched`). A cell
// only counts as the next match when its value equals the next expected
// digit AND the previous cell was not itself a match -- that enforces "at
// least one cell between" consecutive listed digits. Any other cell (wrong
// value, or the right value arriving right after a match) passes through
// without advancing idx; since each digit occupies exactly one cell in the
// column, failing to match it here means the sequence can never complete,
// so accept correctly requires idx to reach the clue length.
const columnOrderNFAs = columnClues.map((clue, colIdx) => {
  const spec = NFA.encodeSpec({
    startState: { idx: 0, justMatched: false },
    transition: ({ idx, justMatched }, value) => {
      if (idx < clue.length && value === clue[idx] && !justMatched) {
        return { idx: idx + 1, justMatched: true };
      }
      return { idx, justMatched: false };
    },
    accept: ({ idx }) => idx === clue.length,
  }, 9);

  const col = colIdx + 1;
  const cells = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(row => makeCellId(row, col));
  return new NFA(spec, `col${col}-order`, cells);
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  ...columnOrderNFAs,
];
