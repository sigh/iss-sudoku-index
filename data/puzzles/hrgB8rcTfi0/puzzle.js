// Title: Creepy Crawly
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=hrgB8rcTfi0
// Source: https://app.crackingthecryptic.com/sudoku/bG3PFnNgpL

// Normal sudoku (standard 3x3 boxes, drawn explicitly and matching the
// default tiling). Every cage below is a killer cage: digits inside cannot
// repeat and must sum to the cage's clue. Four cage pairs carry no printed
// number; instead their clue is the algebraic label x, 2x, y or 2y. Every
// cage sharing a letter sums to the same unknown value (2x/2y mean twice
// that value), and the solver determines x and y from the grid.
//
// No auxiliary Var is needed for x/y: "both cages labelled x sum to the same
// value" is EqualSum between the two cages, and "2x is twice x" is a single
// coefficient Sum equating one 2x-labelled cage's total to twice one
// x-labelled cage's total (its partner is already tied to it by EqualSum).

const xCage1 = ['R1C4', 'R1C5', 'R1C6'];
const xCage2 = ['R3C7', 'R3C8', 'R3C9'];
const yCage1 = ['R4C3', 'R5C3', 'R6C3'];
const yCage2 = ['R7C1', 'R8C1', 'R9C1'];
const twoXCage1 = ['R4C1', 'R5C1', 'R6C1'];
const twoXCage2 = ['R7C3', 'R8C3', 'R9C3'];
const twoYCage1 = ['R3C4', 'R3C5', 'R3C6'];
const twoYCage2 = ['R1C7', 'R1C8', 'R1C9'];

const algebraCages = [xCage1, xCage2, yCage1, yCage2, twoXCage1, twoXCage2, twoYCage1, twoYCage2];

// coeffSum(cellsA, cellsB): sum(cellsA) - 2*sum(cellsB) = 0, i.e. cellsA's
// total is twice cellsB's total.
const doubleOf = (twiceCells, cells) => new Sum(
  0,
  ...twiceCells,
  ...cells.map(cell => [cell, -2]),
);

const numberCage = (total, cells) => new Cage(total, ...cells);

return [
  new Shape('9x9'),

  // Algebra cages -- provenance: the four cage pairs drawn with a letter
  // clue ("x", "2x", "y", "2y") instead of a printed number. Cage rule
  // still applies (no repeated digit), so each gets its own AllDifferent.
  ...algebraCages.map(cells => new AllDifferent(...cells)),
  new EqualSum(xCage1, xCage2),
  new EqualSum(yCage1, yCage2),
  new EqualSum(twoXCage1, twoXCage2),
  new EqualSum(twoYCage1, twoYCage2),
  doubleOf(twoXCage1, xCage1),
  doubleOf(twoYCage1, yCage1),

  // Numeric killer cages -- provenance: the drawn cages with a printed
  // top-left total.
  numberCage(10, ['R2C3', 'R2C4']),
  numberCage(6, ['R3C2', 'R4C2']),
  numberCage(5, ['R4C5', 'R4C6']),
  numberCage(15, ['R5C4', 'R6C4']),
  numberCage(20, ['R8C4', 'R9C4', 'R9C5']),
  numberCage(16, ['R8C6', 'R9C6', 'R9C7']),
  numberCage(12, ['R6C8', 'R6C9', 'R7C9']),
  numberCage(11, ['R4C8', 'R4C9', 'R5C9']),
  numberCage(29, ['R5C7', 'R6C6', 'R6C7', 'R7C5', 'R7C6']),
];
