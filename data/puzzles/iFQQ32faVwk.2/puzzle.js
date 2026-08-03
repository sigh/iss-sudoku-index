// Title: Remember Me
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=iFQQ32faVwk
// Source: https://tinyurl.com/ynfsxjy7

// Normal sudoku rules apply. Every arrow's bulb here is a 2-cell pill (a
// left-to-right or top-to-bottom two-digit number, per the ruleset's "reading
// from left to right"); the arm digits must sum to it. `PillArrow` takes the
// two pill cells (its own row-major sort fixes tens/ones) followed by the arm
// cells; the source's raw line array repeats the pill cell nearest the arm as
// its own first entry, so that repeat is dropped from each arm below.

const givens = [
  new Given('R2C5', 2),
  new Given('R5C3', 6),
  new Given('R5C5', 4),
  new Given('R5C7', 3),
  new Given('R8C5', 5),
];

const arrows = [
  new PillArrow(2, 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'),
  new PillArrow(2, 'R9C8', 'R9C9', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'),
  new PillArrow(2, 'R2C1', 'R2C2', 'R3C3', 'R3C4'),
  new PillArrow(2, 'R3C1', 'R3C2', 'R4C2', 'R4C3', 'R4C4'),
  new PillArrow(2, 'R7C8', 'R7C9', 'R6C7', 'R6C6', 'R6C5'),
  new PillArrow(2, 'R8C8', 'R8C9', 'R8C7', 'R7C6'),
  new PillArrow(2, 'R6C2', 'R6C3', 'R5C1', 'R4C1'),
  new PillArrow(2, 'R4C7', 'R4C8', 'R5C9', 'R6C9'),
  new PillArrow(2, 'R3C6', 'R3C7', 'R2C8', 'R3C9'),
  new PillArrow(2, 'R7C3', 'R8C3', 'R7C2', 'R8C1'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...arrows,
];
