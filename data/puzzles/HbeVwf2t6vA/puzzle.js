// Title: Suicide Squad
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=HbeVwf2t6vA
// Source: https://tinyurl.com/53stawau

// Normal sudoku rules apply (Shape gives row/column/box all-different).
// Digits may not repeat within a cage -- unconditional, since no cage
// prints a total (killer cage with no total = AllDifferent(cells)).
// No circle is a digit-placement Quad: its numbers are candidate cage
// totals (several exceed 9), and every number the circle carries must be
// the total of at least one cage touching that circle. "Touching" cages
// are those containing at least one of the circle's 4 corner cells, the
// same vertex adjacency an ordinary digit-quadruple uses.

// Cage cell lists, transcribed from the drawn outlines.
const cages = [
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C5', 'R5C6'],
  ['R5C4', 'R6C4', 'R7C4'],
  ['R7C5', 'R8C4', 'R8C5'],
  ['R8C6', 'R9C4', 'R9C5', 'R9C6'],
  ['R7C6', 'R7C7', 'R7C8', 'R7C9'],
  ['R6C5', 'R6C6', 'R6C7'],
  ['R4C7', 'R4C8', 'R5C7'],
  ['R5C8', 'R6C8'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9'],
  ['R2C8', 'R2C9', 'R3C8'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C3'],
  ['R1C7', 'R2C7', 'R3C7'],
  ['R8C8', 'R9C8'],
  ['R8C9', 'R9C9'],
  ['R1C5', 'R1C6', 'R2C5'],
  ['R2C6', 'R3C5', 'R3C6'],
  ['R2C4', 'R3C3', 'R3C4'],
  ['R8C2', 'R9C2', 'R9C3'],
  ['R1C1', 'R2C1', 'R2C2'],
  ['R1C2', 'R1C3', 'R2C3'],
  ['R3C1', 'R4C1', 'R4C2'],
  ['R5C2', 'R5C3', 'R6C1', 'R6C2'],
];

// Each circle: candidate cage-total numbers, and the indices (into `cages`
// above) of the cages that touch it -- i.e. contain at least one of its 4
// corner cells. Transcribed from the drawn quadruple entries.
const circles = [
  { numbers: [13, 15, 17], cageIndices: [0, 1, 2] },
  { numbers: [17, 24, 25], cageIndices: [3, 4, 5] },
  { numbers: [12, 14, 16], cageIndices: [6, 7, 8] },
  { numbers: [14, 16], cageIndices: [9, 10] },
  { numbers: [11, 24], cageIndices: [11, 18] },
  { numbers: [13, 14, 20], cageIndices: [12, 15, 16] },
  { numbers: [6, 10], cageIndices: [13, 14] },
  { numbers: [13, 15, 20], cageIndices: [17, 19, 20] },
  { numbers: [11, 14], cageIndices: [21, 22] },
];

// For each circle number, at least one touching cage must total exactly
// that number. (Each circle's cage count equals its own number count, so
// this then forces a bijection as a consequence -- a cage total is a single
// value, so two distinct numbers in one circle can never share a witnessing
// cage -- not an assumption added on top of the stated rule.)
const circleConstraints = circles.flatMap(({ numbers, cageIndices }) =>
  numbers.map(n => new Or(
    cageIndices.map(i => new Sum(n, ...cages[i])))));

return [
  new Shape('9x9'),
  ...cages.map(cells => new AllDifferent(...cells)),
  ...circleConstraints,
];
