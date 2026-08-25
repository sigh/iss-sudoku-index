// Title: The Mandalorian Sudoku
// Author: Jeremy Butler
// Video: https://www.youtube.com/watch?v=MqWJdcw9eRE
// Source: https://app.crackingthecryptic.com/sudoku/R68bTRmnrP

// Normal sudoku rules apply -- default Shape('9x9') below (standard 3x3 box
// regions, as drawn).
//
// KILLER CAGES: digits in a cage sum to the total shown in its top-left
// corner, no repeated digit in a cage (Cage's default semantics). A grey
// background shades exactly these four cages' 9 cells -- decorative
// highlighting of the cage footprint, not an independent rule.
const cages = [
  new Cage(11, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(26, 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7'),
  new Cage(8, 'R5C5', 'R6C5'),
  new Cage(12, 'R7C5', 'R8C5'),
];

// XV PAIRS: a white "X" between two cells means they sum to 10, a white "V"
// means they sum to 5. The rules state not all such pairs are marked, so
// StrictXV/StrictKropki (which would forbid the sum on every unmarked
// adjacent pair) do not apply -- only the marked pairs below are
// constrained.
const xPairs = [
  new X('R2C3', 'R3C3'),
  new X('R2C5', 'R2C6'),
  new X('R4C3', 'R5C3'),
  new X('R5C4', 'R6C4'),
  new X('R6C1', 'R7C1'),
  new X('R8C2', 'R8C3'),
  new X('R8C4', 'R8C5'),
  new X('R9C5', 'R9C6'),
  new X('R6C6', 'R7C6'),
  new X('R6C5', 'R7C5'),
  new X('R6C7', 'R6C8'),
  new X('R6C8', 'R7C8'),
  new X('R4C9', 'R5C9'),
];

// The R4C5/R5C5 "V" is drawn twice, as two marks with identical position
// and style -- one mark drawn twice, not two separate clues, so it is
// listed once here.
const vPairs = [
  new V('R4C1', 'R5C1'),
  new V('R7C3', 'R7C4'),
  new V('R8C8', 'R8C9'),
  new V('R5C8', 'R5C9'),
  new V('R4C5', 'R5C5'),
  new V('R3C3', 'R3C4'),
  new V('R1C6', 'R2C6'),
  new V('R1C7', 'R2C7'),
  new V('R3C7', 'R3C8'),
];

// ARROW WITH PILL: "Digits on the arrow sum to the number in the oval read
// from top to bottom." The oval (pill) is the 2-cell rounded mark at
// R1C1/R2C1; read top to bottom, R1C1 is the tens digit and R2C1 the units
// digit of the arrow's target sum. The drawn arrow line starts inside that
// same 2-cell mark, so R1C1/R2C1 are the pill, not the arm; the arm is the
// remaining zig-zag path. A second arrow-styling entry in the source has no
// waypoints and renders nothing, so it is not a clue and is omitted.
const arrowArm = [
  'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C3', 'R8C4', 'R9C5',
  'R8C6', 'R7C7', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R2C9',
];

return [
  new Shape('9x9'),
  ...cages,
  ...xPairs,
  ...vPairs,
  new PillArrow(2, 'R1C1', 'R2C1', ...arrowArm),
];
