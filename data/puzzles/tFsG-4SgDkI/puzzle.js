// Title: Attack Of The Clones
// Author: Matt & Sam Cavnar-Johnson
// Video: https://www.youtube.com/watch?v=tFsG-4SgDkI
// Source: https://app.crackingthecryptic.com/sudoku/t7Lfmrnj4H

// Standard sudoku + anti-knight. Two killer cages carry a printed total; one
// straddling 2x2 block is all-different only (no printed total). Each arrow's
// first (bulb) cell equals the sum of its remaining arm cells. The hidden-clone
// rule ("one of the other 8 boxes is a hidden clone of box 4") is encoded as a
// disjunction over the 8 candidate boxes: for the chosen box, each of its 9
// cells equals box 4's cell at the same relative position, via one
// SameValues(2, a, b) per position (a singleton-vs-singleton SameValues is
// plain equality).

const box4 = [
  'R4C1', 'R4C2', 'R4C3',
  'R5C1', 'R5C2', 'R5C3',
  'R6C1', 'R6C2', 'R6C3',
];
// Every box in reading order, so boxes[i] lines up position-for-position with
// box4 (boxes[3] === box4).
const boxes = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'],
  box4,
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
  ['R7C4', 'R7C5', 'R7C6', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
];

const cloneChoices = boxes
  .filter(box => box !== box4)
  .map(box => new And(box4.map((cell, i) => new SameValues(2, cell, box[i]))));

// Cages: totalled from `cages` (R1C9-R3C9=19, R2C1-R2C3=21, R6C6/C7,R7C6/C7=12);
// the fourth (R3C6/C7,R4C6/C7) has no printed total, so it is all-different only.
const cages = [
  new Cage(19, 'R1C9', 'R2C9', 'R3C9'),
  new Cage(21, 'R2C1', 'R2C2', 'R2C3'),
  new AllDifferent('R3C6', 'R3C7', 'R4C6', 'R4C7'),
  new Cage(12, 'R6C6', 'R6C7', 'R7C6', 'R7C7'),
];

// Arrows: bulb cell first (confirmed by the drawn circle underlay at that
// cell in every case), remaining cells are the arm that sums to it.
const arrows = [
  new Arrow('R2C4', 'R2C5', 'R2C6'),
  new Arrow('R5C6', 'R5C5', 'R5C4'),
  new Arrow('R5C7', 'R5C8', 'R5C9'),
  new Arrow('R9C9', 'R8C9', 'R7C9', 'R6C8', 'R7C7'),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages,
  ...arrows,
  new Or(cloneChoices),
];
