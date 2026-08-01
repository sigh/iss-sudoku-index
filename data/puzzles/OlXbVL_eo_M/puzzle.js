// Title: No Magic for you
// Author: Charley Red
// Video: https://www.youtube.com/watch?v=OlXbVL_eo_M
// Source: https://app.crackingthecryptic.com/D34jfpRqTF

// Standard Sudoku rules apply. A magic line is three consecutive horizontal or
// vertical cells summing to 15; because all possible magic lines are given and
// none are drawn, every such run must have a sum other than 15.
const givens = [
  ['R1C4', 9], ['R1C8', 4],
  ['R2C2', 4], ['R2C3', 6],
  ['R3C1', 9], ['R3C6', 6],
  ['R4C5', 3],
  ['R5C1', 7], ['R5C2', 3], ['R5C6', 2], ['R5C8', 1],
  ['R6C3', 2], ['R6C5', 1], ['R6C8', 3],
  ['R7C2', 7], ['R7C3', 9],
  ['R8C5', 7], ['R8C7', 8],
  ['R9C4', 8], ['R9C7', 4], ['R9C9', 9],
]; // Givens transcribed from the puzzle grid.

const magicFreeSpec = NFA.encodeSpec({
  startState: { count: 0, sum: 0 },
  transition: ({ count, sum }, value) => {
    if (value === SEGMENT_BREAK) {
      return count === 3 ? { count: 0, sum: 0 } : undefined;
    }
    if (count === 3) return undefined;
    const nextSum = sum + value;
    if (count === 2 && nextSum === 15) return undefined;
    return { count: count + 1, sum: nextSum };
  },
  accept: ({ count }) => count === 3,
  maxDepth: 3,
}, 9, { multiSegment: true });
// Each segment is one consecutive three-cell run; state stores its length and sum.

const triples = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 7; col++) {
    triples.push([makeCellId(row, col), makeCellId(row, col + 1), makeCellId(row, col + 2)]);
  }
}
for (let row = 1; row <= 7; row++) {
  for (let col = 1; col <= 9; col++) {
    triples.push([makeCellId(row, col), makeCellId(row + 1, col), makeCellId(row + 2, col)]);
  }
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new NFA(magicFreeSpec, 'no magic lines', ...triples),
];
