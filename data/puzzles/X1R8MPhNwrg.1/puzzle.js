// Title: Oct 25 2021: Minmax Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=X1R8MPhNwrg
// Source: https://tinyurl.com/4awj5kfu

// Normal sudoku rules apply. A digit outside the grid gives the sum of the
// largest and smallest of the first three digits of that row/column, counted
// from the side the clue is printed on (worked example in the rules text:
// row 4 read as 7,4,9 from the left gives 9+4=13). The three counted cells
// are fixed by which side the clue sits on; their max+min does not depend on
// reading order within them, so the direction only selects the triple, not
// an order to scan it in.
const minmax = (target, ...cells) => {
  // State is the bitmask of digits seen among the three cells so far (order
  // irrelevant, so no adjacency/order requirement on `cells`). The accept
  // predicate reads the lowest and highest set bits off the finished mask.
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (mask, value) => mask | (1 << (value - 1)),
    accept: mask => {
      const minimum = 32 - Math.clz32(mask & -mask);
      const maximum = 32 - Math.clz32(mask);
      return minimum + maximum === target;
    },
  }, 9);
  return new NFA(spec, `minmax-${target}`, cells);
};

// Outside clues, transcribed from the payload's `text` overlay entries
// (raster margin coordinates R0/R10/C0/C10 around the 9x9 grid). Each names
// the near-side triple of cells for its row/column per the rule above.
const outsideClues = [
  minmax(4, 'R1C2', 'R2C2', 'R3C2'),   // above column 2
  minmax(10, 'R1C4', 'R2C4', 'R3C4'),  // above column 4
  minmax(10, 'R1C6', 'R2C6', 'R3C6'),  // above column 6
  minmax(5, 'R1C8', 'R2C8', 'R3C8'),   // above column 8
  minmax(10, 'R1C9', 'R2C9', 'R3C9'),  // above column 9
  minmax(11, 'R9C1', 'R8C1', 'R7C1'),  // below column 1
  minmax(12, 'R9C2', 'R8C2', 'R7C2'),  // below column 2
  minmax(9, 'R9C8', 'R8C8', 'R7C8'),   // below column 8
  minmax(6, 'R2C1', 'R2C2', 'R2C3'),   // left of row 2
  minmax(13, 'R4C1', 'R4C2', 'R4C3'),  // left of row 4
  minmax(10, 'R6C1', 'R6C2', 'R6C3'),  // left of row 6
  minmax(10, 'R8C1', 'R8C2', 'R8C3'),  // left of row 8
  minmax(8, 'R2C9', 'R2C8', 'R2C7'),   // right of row 2
  minmax(11, 'R4C9', 'R4C8', 'R4C7'),  // right of row 4
  minmax(13, 'R6C9', 'R6C8', 'R6C7'),  // right of row 6
  minmax(4, 'R8C9', 'R8C8', 'R8C7'),   // right of row 8
];

// Givens, transcribed from the payload's `grid` array.
const givens = [
  new Given('R1C6', 1),
  new Given('R2C2', 1),
  new Given('R2C8', 2),
  new Given('R3C4', 5),
  new Given('R3C6', 3),
  new Given('R4C1', 7),
  new Given('R4C3', 8),
  new Given('R4C7', 3),
  new Given('R6C3', 4),
  new Given('R6C7', 5),
  new Given('R6C9', 6),
  new Given('R7C4', 6),
  new Given('R7C6', 2),
  new Given('R8C2', 4),
  new Given('R8C8', 3),
  new Given('R9C4', 1),
];

return [
  new Shape('9x9'),
  ...givens,
  ...outsideClues,
];
