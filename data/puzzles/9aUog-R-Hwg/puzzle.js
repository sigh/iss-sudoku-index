// Title: 10K
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=9aUog-R-Hwg
// Source: https://sudokupad.app/james-sinclair/10k

// Normal 6x6 sudoku rules apply (2x3 boxes).
// The digits in the plum cage have product 10000; digits may repeat within it.
// At least one of the four corner cells contains 3.

// Running product of the cage digits so far; a step that no longer divides 10000 is rejected.
const cageProduct = NFA.encodeSpec({
  startState: { product: 1 },
  transition: ({ product }, value) => {
    const next = product * value;
    return 10000 % next === 0 ? { product: next } : undefined;
  },
  accept: ({ product }) => product === 10000,
}, 6);

return [
  new Shape('6x6'),
  // Plum cage cells, from the filled cells drawn on the board.
  new NFA(cageProduct, 'product 10000',
    'R2C3', 'R2C5', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R4C5', 'R5C3', 'R5C4', 'R5C5'),
  new Or(['R1C1', 'R1C6', 'R6C1', 'R6C6'].map(cell => new Given(cell, 3))),
];
