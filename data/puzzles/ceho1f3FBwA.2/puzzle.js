// Title: 5/16/23: Math(s)-ier Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=ceho1f3FBwA
// Source: https://tinyurl.com/yc5875mz

// Normal sudoku rules apply. A clue to the left/right of a row is the sum of
// the three cells of that row nearest the clue; a clue above/below a column
// is the product of the three cells of that column nearest the clue. Each
// outside clue's three cells are the ones drawn nearest it on the border.

// Product-clue state tracks the running product of the cells read so far,
// rejecting early once it can no longer divide the target (same pattern as
// data/scripts/factorial_cages.js).
function productClue(target, cells) {
  const spec = NFA.encodeSpec({
    startState: 1,
    transition: (state, value) => {
      const next = state * value;
      return target % next === 0 ? next : undefined;
    },
    accept: state => state === target,
  }, 9);
  return new NFA(spec, `product ${target}`, ...cells);
}

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C1', 1), new Given('R2C4', 1), new Given('R3C7', 1),
  new Given('R4C2', 1), new Given('R4C5', 6), new Given('R5C4', 4),
  new Given('R5C6', 8), new Given('R6C5', 2), new Given('R6C8', 1),
  new Given('R7C3', 1), new Given('R8C6', 1), new Given('R9C9', 1),

  // Row-sum outside clues.
  new Sum(18, 'R1C1', 'R1C2', 'R1C3'),
  new Sum(16, 'R4C1', 'R4C2', 'R4C3'),
  new Sum(16, 'R7C1', 'R7C2', 'R7C3'),
  new Sum(15, 'R3C7', 'R3C8', 'R3C9'),
  new Sum(18, 'R6C7', 'R6C8', 'R6C9'),
  new Sum(8, 'R9C7', 'R9C8', 'R9C9'),

  // Column-product outside clues.
  productClue(18, ['R1C1', 'R2C1', 'R3C1']),
  productClue(10, ['R1C4', 'R2C4', 'R3C4']),
  productClue(15, ['R1C7', 'R2C7', 'R3C7']),
  productClue(16, ['R7C3', 'R8C3', 'R9C3']),
  productClue(14, ['R7C6', 'R8C6', 'R9C6']),
  productClue(14, ['R7C9', 'R8C9', 'R9C9']),
];
