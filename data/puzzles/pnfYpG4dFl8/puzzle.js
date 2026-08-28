// Title: Fog X
// Author: Chameleon
// Video: https://www.youtube.com/watch?v=pnfYpG4dFl8
// Source: https://link.sudokupad.app/chameleon-fogx

// Rules:
//   Normal sudoku rules apply (6x6 grid, 2x3 boxes, digits 1-6).
//   Normal fog of war rules -- solving UI, no final-grid effect.
//   Digits in a cage cannot repeat and sum to the number in the corner
//   (if given).
//   Digits don't repeat on a blue line.
// There are no givens.

// Cages, transcribed from the drawn cage outlines and their corner clues.
// Two corner clues are written out rather than printed as a bare numeral:
// "That's right. It's 7!" on R1C1-R1C3, and ">3" on the single cell R1C6.
// Each is read as the clue it spells out. The alternative -- treating a
// non-numeral corner clue as "no number given" -- leaves both cages inert:
// R1C1-R1C3 lies wholly inside row 1 and box 1, so its no-repeat clause adds
// nothing, and a one-cell cage cannot repeat with itself.
const cages = [
  new Cage(7, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(7, 'R2C4', 'R2C5', 'R2C6'),
  new Cage(3, 'R5C1', 'R6C1'),
  new Cage(15, 'R2C1', 'R2C2', 'R3C1', 'R3C2'),
  new Cage(8, 'R4C4', 'R4C5', 'R5C5'),
  // Drawn with an empty corner: no-repeat only.
  new Cage(0, 'R3C3', 'R4C2', 'R4C3', 'R5C3', 'R5C4', 'R6C4'),
];

// The one-cell cage R1C6 is its own total, so ">3" restricts its digit.
const overThree = new Given('R1C6', 4, 5, 6);

// Blue lines: the blue strokes of the background artwork, which draws a large
// X across the grid. Cell lists are the cells each stroke's centreline runs
// through; the strokes run corner-to-corner along cell-centre diagonals, with
// rounded turns near the middle of the grid.
//   stroke 1  the grid's top-left corner down to its bottom-left corner,
//             turning in column 3
//   stroke 2  the grid's top-right corner down to the R2C5/R3C4 corner
//   stroke 3  the R5C5/R6C6 corner up to a small curl drawn inside R3C4
// A cell a stroke only grazes at a corner is not on the stroke: R5C3 for
// stroke 1, R3C4 for stroke 2, R6C6 for stroke 3 each hold 0.00 cells of
// stroke length, against 1.15 cells or more for every listed cell.
const blueLines = [
  new AllDifferent('R1C1', 'R2C2', 'R3C3', 'R4C3', 'R5C2', 'R6C1'),
  new AllDifferent('R1C6', 'R2C5'),
  new AllDifferent('R3C4', 'R4C4', 'R5C5'),
];
// A fourth blue stroke runs right from the middle of the X across R3C4, R3C5
// and R3C6. All three cells lie in row 3, so the row already carries its
// no-repeat clause and it needs no constraint of its own.

return [
  new Shape('6x6'),
  overThree,
  ...cages,
  ...blueLines,
];
