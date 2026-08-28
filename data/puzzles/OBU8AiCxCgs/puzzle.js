// Title: Arrow Sudoku by Philipp Blume
// Author: Philipp Blume
// Video: https://www.youtube.com/watch?v=OBU8AiCxCgs
// Source: https://cracking-the-cryptic.web.app/sudoku/L64MLDmGdJ

// Normal sudoku rules apply, standard 3x3 boxes. No digit repeats on the
// marked anti-diagonal (R1C9..R9C1). Each arrow's arm digits sum either to
// its circled digit or to the square of that digit; the circled digit is
// not itself part of the sum.
//
// squareOrSum encodes "arm sum = bulb OR arm sum = bulb^2" per arrow. The
// square is not linear in the bulb's digit, so the second branch case-splits
// on the bulb's nine possible values and fixes the literal target (v*v) per
// branch -- verified against a small accept/reject fixture (bulb, one arm
// cell): the 11 accepted pairs are exactly the 9 equal pairs plus (2,4) and
// (3,9), with (1,1) counted once.
const squareOrSum = (bulb, ...arm) => new Or([
  new Arrow(bulb, ...arm),
  ...Array.from({ length: 9 }, (_, i) => i + 1).map(
    v => new And([new Given(bulb, v), new Sum(v * v, ...arm)])),
]);

// Bulb (circle) + arm cells per arrow, in drawn order. Two arrows bend once
// at a diagonal step between cell centres (arrow 6: R6C3->R7C2; arrow 10:
// R6C6->R7C7; arrow 11 bends twice: R7C6->R8C5 and R8C3->R9C4).
const arrows = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R2C1', 'R2C2', 'R2C3'],
  ['R3C1', 'R3C2', 'R3C3', 'R3C4'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4'],
  ['R6C1', 'R6C2', 'R6C3', 'R7C2'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R4C9', 'R4C8', 'R4C7'],
  ['R5C9', 'R5C8', 'R5C7', 'R5C6'],
  ['R6C9', 'R6C8', 'R6C7', 'R6C6', 'R7C7'],
  ['R7C9', 'R7C8', 'R7C7', 'R7C6', 'R8C5', 'R8C4', 'R8C3', 'R9C4'],
  ['R8C9', 'R8C8', 'R8C7', 'R8C6'],
  ['R9C9', 'R9C8', 'R9C7'],
];

return [
  new Shape('9x9'),
  new Given('R7C3', 9),
  new Given('R8C5', 4),
  new Diagonal(1),
  ...arrows.map(([bulb, ...arm]) => squareOrSum(bulb, ...arm)),
];
