// Title: World, a Tuning Fork
// Author: Philipp Blume, aka glum_hippo
// Video: https://www.youtube.com/watch?v=yCTzl3Z2z1Y
// Source: https://app.crackingthecryptic.com/55e6o5g53o

// Normal Sudoku rules apply. Each drawn checkerboard symbol marks a 2x2 area
// with alternating odd and even digits; every unmarked 2x2 area must not have
// that pattern. Lavender zipper lines are omitted because the local drawing
// does not determine their individual traversals.

// Each table is transcribed from the eight drawn black/gray checkerboard
// symbols. Cells are in row-major order within the marked 2x2 area.
const markedBattenburgs = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R3C2', 'R3C3', 'R4C2', 'R4C3'],
  ['R3C8', 'R3C9', 'R4C8', 'R4C9'],
  ['R4C3', 'R4C4', 'R5C3', 'R5C4'],
  ['R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R6C2', 'R6C3', 'R7C2', 'R7C3'],
  ['R6C5', 'R6C6', 'R7C5', 'R7C6'],
  ['R6C8', 'R6C9', 'R7C8', 'R7C9'],
];

// State records the first three parities in the row-major 2x2 scan. The
// fourth digit must have the first parity while the other two have the other.
const checkerboard = NFA.encodeSpec({
  startState: { a: null, b: null, c: null },
  transition: ({ a, b, c }, value) => {
    const parity = value % 2;
    if (a === null) return { a: parity, b: null, c: null };
    if (b === null) return { a, b: parity, c: null };
    if (c === null) return { a, b, c: parity };
    return a !== b && a !== c && a === parity ? { done: true } : undefined;
  },
  accept: state => state.done === true,
}, 9);

// This companion machine accepts all 2x2 parity patterns except checkerboards.
const notCheckerboard = NFA.encodeSpec({
  startState: { a: null, b: null, c: null },
  transition: ({ a, b, c }, value) => {
    const parity = value % 2;
    if (a === null) return { a: parity, b: null, c: null };
    if (b === null) return { a, b: parity, c: null };
    if (c === null) return { a, b, c: parity };
    return a !== b && a !== c && a === parity ? undefined : { done: true };
  },
  accept: state => state.done === true,
}, 9);

const cell = (row, col) => makeCellId(row, col);
const allSquares = [];
for (let row = 1; row < 9; row++) {
  for (let col = 1; col < 9; col++) {
    allSquares.push([cell(row, col), cell(row, col + 1), cell(row + 1, col), cell(row + 1, col + 1)]);
  }
}
const markedKeys = new Set(markedBattenburgs.map(square => square.join(',')));
const unmarkedBattenburgs = allSquares.filter(square => !markedKeys.has(square.join(',')));
const graph = cellGraph('9x9');
const origin = 'R1C1';
const templateSquare = [origin, 'R1C2', 'R2C1', 'R2C2'];
const replicateSquares = (spec, name, squares) => graph.makeReplicate(
  new NFA(spec, name, ...templateSquare),
  squares.map(square => square[0]),
);

return [
  new Shape('9x9'),
  replicateSquares(checkerboard, 'marked battenburg', markedBattenburgs),
  replicateSquares(notCheckerboard, 'unmarked battenburg', unmarkedBattenburgs),
];
