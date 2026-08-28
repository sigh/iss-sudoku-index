// Title: November 8, 2021: PAINKILLERS
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=w-5nFQO26Wk
// Source: https://tinyurl.com/3pwesjdb

// Normal sudoku rules apply (rows, columns, boxes all-different -- ISS
// default). Killer cages: digits in each cage sum to the labelled total and
// do not repeat within the cage -> Cage(sum, ...cells). Arrows: digits along
// the arm sum to the two-digit total shown in the attached pill, read
// left-to-right or top-to-bottom -> PillArrow(2, ...pillCells, ...arm);
// PillArrow sorts the supplied pill cells into reading order itself.
//
// Each arrow's payload `lines` array lists the arm cells but repeats the
// pill cell the line is drawn touching (for rendering only); that repeated
// cell is dropped from the arm passed to PillArrow so it is not double
// counted as both a pill digit and an arm addend.

const givens = [
  ['R3C6', 4], ['R4C7', 1], ['R6C3', 6], ['R7C4', 3],
].map(([cell, digit]) => new Given(cell, digit));

const cages = [
  [38, ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C3', 'R3C1', 'R3C2', 'R3C3']],
  [37, ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C6', 'R3C4', 'R3C5', 'R3C6']],
  [40, ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C9', 'R3C7', 'R3C8', 'R3C9']],
  [40, ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C3', 'R6C1', 'R6C2', 'R6C3']],
  [45, ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6']],
  [38, ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C9', 'R6C7', 'R6C8', 'R6C9']],
  [37, ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C3', 'R9C1', 'R9C2', 'R9C3']],
  [36, ['R7C4', 'R7C5', 'R7C6', 'R8C4', 'R8C6', 'R9C4', 'R9C5', 'R9C6']],
  [43, ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C9', 'R9C7', 'R9C8', 'R9C9']],
].map(([sum, cells]) => new Cage(sum, ...cells));

const arrows = [
  // pill R3C7,R3C8; line R3C8,R3C9,R2C9,R1C9,R1C8,R1C7,R2C7 -- drop shared R3C8.
  new PillArrow(2, 'R3C7', 'R3C8', 'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R2C7'),
  // pill R9C1,R9C2; line R9C2,R9C3,R8C3,R7C3,R7C2,R7C1,R8C1 -- drop shared R9C2.
  new PillArrow(2, 'R9C1', 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R7C2', 'R7C1', 'R8C1'),
  // pill R2C3,R3C3; line R3C3,R3C2,R3C1,R2C1,R1C1,R1C2,R1C3 -- drop shared R3C3.
  new PillArrow(2, 'R2C3', 'R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'),
  // pill R4C9,R5C9; line R5C9,R6C9,R6C8,R6C7,R5C7,R4C7,R4C8 -- drop shared R5C9.
  new PillArrow(2, 'R4C9', 'R5C9', 'R6C9', 'R6C8', 'R6C7', 'R5C7', 'R4C7', 'R4C8'),
  // pill R8C7,R9C7; line R9C7,R9C8,R9C9,R8C9,R7C9,R7C8,R7C7 -- drop shared R9C7.
  new PillArrow(2, 'R8C7', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R7C8', 'R7C7'),
  // pill R7C5,R7C6; line R7C6,R8C6,R9C6,R9C5,R9C4,R8C4,R7C4 -- drop shared R7C6.
  new PillArrow(2, 'R7C5', 'R7C6', 'R8C6', 'R9C6', 'R9C5', 'R9C4', 'R8C4', 'R7C4'),
  // pill R1C5,R1C6; line R1C5,R1C4,R2C4,R3C4,R3C5,R3C6,R2C6 -- drop shared R1C5.
  new PillArrow(2, 'R1C5', 'R1C6', 'R1C4', 'R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C6'),
  // pill R6C1,R6C2; line R6C2,R6C3,R5C3,R4C3,R4C2,R4C1,R5C1 -- drop shared R6C2.
  new PillArrow(2, 'R6C1', 'R6C2', 'R6C3', 'R5C3', 'R4C3', 'R4C2', 'R4C1', 'R5C1'),
  // pill R4C6,R5C6; line R5C6,R6C6,R6C5,R6C4,R5C4,R4C4,R4C5,R5C5 -- drop shared R5C6.
  new PillArrow(2, 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R4C4', 'R4C5', 'R5C5'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...arrows,
];
