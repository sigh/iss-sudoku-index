// Title: Satellites
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=qIqlRzG5x5E
// Source: https://sudokupad.app/drnjmx02i1

// Normal sudoku rules (9x9, standard boxes, no givens). Arrow: digits along an
// arrow sum to the digit in that arrow's circle. Killer cage: digits in a
// cage don't repeat and sum to the cage's printed total, if any -- two cages
// carry no total and only forbid repeats. White dot: consecutive digits.
// Black dot: one digit is double the other. "Not all dots are given" means an
// undotted adjacent pair carries no constraint, so no negative/strict Kropki
// is encoded.

// Each `arrow` payload entry is one circle shared by several drawn line
// branches (a branching/multi-armed arrow). Every branch is modelled as its
// own Arrow sharing the circle cell, per the drawn segments.
const arrows = [
  // Circle R7C3, six branches (payload `arrow[0].lines`).
  new Arrow('R7C3', 'R7C2', 'R7C1'),
  new Arrow('R7C3', 'R8C2', 'R9C1'),
  new Arrow('R7C3', 'R8C3', 'R9C3'),
  new Arrow('R7C3', 'R6C4'),
  new Arrow('R7C3', 'R6C2', 'R5C1'),
  new Arrow('R7C3', 'R8C4', 'R9C5'),
  // Circle R3C7, two branches (payload `arrow[1].lines`).
  new Arrow('R3C7', 'R2C6', 'R1C5'),
  new Arrow('R3C7', 'R4C8', 'R5C9'),
];

// Killer cages with a printed total (payload `killercage[].value`).
const cages = [
  new Cage(21, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(6, 'R6C7', 'R6C8'),
  new Cage(7, 'R2C4', 'R3C4'),
  new Cage(15, 'R2C1', 'R2C2', 'R2C3'),
  new Cage(19, 'R7C8', 'R8C8', 'R9C8'),
];

// Killer cages with no printed total: digits still can't repeat, no sum.
const noTotalCages = [
  new AllDifferent('R5C2', 'R5C3', 'R5C4', 'R6C4', 'R6C5', 'R7C5', 'R8C5'),
  new AllDifferent('R2C5', 'R3C5', 'R4C5', 'R4C6', 'R5C6', 'R5C7', 'R5C8'),
];

// White dots: consecutive pair (payload `difference`, no `value` -> diff 1).
const whiteDots = [
  new WhiteDot('R5C6', 'R6C6'),
  new WhiteDot('R3C3', 'R4C3'),
  new WhiteDot('R7C7', 'R7C6'),
];

// Black dots: ratio pair (payload `ratio`, no `value` -> ratio 2).
const blackDots = [
  new BlackDot('R6C9', 'R5C9'),
  new BlackDot('R1C5', 'R1C4'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...cages,
  ...noTotalCages,
  ...whiteDots,
  ...blackDots,
];
