// Title: Counting Down
// Author: CLASSIFIED
// Video: https://www.youtube.com/watch?v=dY6_UlWo7AQ
// Source: https://sudokupad.app/xel56nrbmp

// Normal sudoku plus:
// - 12 arrows: the arm digits sum to the digit in the attached circle.
// - Every arrow's digits (circle included) are strictly increasing along the
//   drawn path in one direction -- either circle-to-tip or tip-to-circle,
//   per arrow.
// - One quadruple-style circle at the intersection of R6C3/R6C4/R7C3/R7C4:
//   digits 5 and 8 must each appear at least once in those four cells.

const shape = new Shape('9x9');

// A line/arrow "increases in one direction" without specifying which end is
// smaller: either reading (bulb-to-tip or tip-to-bulb) may hold.
function directionlessThermo(...cells) {
  return new Or([
    new Thermo(...cells),
    new Thermo(...[...cells].reverse()),
  ]);
}

// Arrow bulb (circle cell) followed by its arm cells, in path order away
// from the bulb, as drawn.
const ARROWS = [
  ['R1C4', 'R1C3', 'R1C2', 'R1C1'],
  ['R2C6', 'R2C5', 'R2C4'],
  ['R1C7', 'R1C6', 'R1C5'],
  ['R3C9', 'R2C9', 'R1C9'],
  ['R4C8', 'R3C8', 'R2C8'],
  ['R7C9', 'R6C9', 'R5C9', 'R4C9'],
  ['R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R5C2', 'R6C2', 'R7C2'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R2C1', 'R3C1', 'R4C1'],
];

const arrowSums = ARROWS.map(cells => new Arrow(...cells));
const arrowDirections = ARROWS.map(cells => directionlessThermo(...cells));

// The 5 and 8 are stacked text overlays at the four cells' shared corner.
const quad = new Quad('R6C3', 5, 8);

return [
  shape,
  ...arrowSums,
  ...arrowDirections,
  quad,
];
