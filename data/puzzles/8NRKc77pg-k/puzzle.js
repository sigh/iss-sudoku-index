// Title: Just Sum Ambiguity
// Author: SSG
// Video: https://www.youtube.com/watch?v=8NRKc77pg-k
// Source: https://app.crackingthecryptic.com/sudoku/NJgTqnNp9j

// Normal sudoku rules apply. Four lines are drawn (no givens, no other
// clues). Each line must satisfy both: (1) RegionSumLine's rule -- equal
// sum within each 3x3 box segment the line passes through; and (2) exactly
// one of Entropic or Modular(3), applied to the whole line. The rules do not
// say which lines are entropic and which are modular -- that is solver-
// discovered, so each line gets its own independent Or(Entropic, Modular(3)).
// All four lines are drawn identically (same colour/thickness); cell order
// below follows the payload's wayPoints order for each -- direction along a
// line is not distinguished by the rule, so it does not matter which end is
// listed first.

const lineA = ['R5C9', 'R4C9', 'R3C8', 'R2C8', 'R2C7', 'R3C7', 'R3C6', 'R3C5', 'R2C5', 'R1C5', 'R1C4'];
const lineB = ['R2C2', 'R3C2', 'R4C1', 'R5C2', 'R4C3', 'R5C4', 'R6C4'];
const lineC = ['R6C6', 'R7C6', 'R8C6', 'R8C7', 'R9C8', 'R9C9'];
const lineD = ['R8C5', 'R9C4', 'R8C3', 'R9C2', 'R9C1'];

const lines = [lineA, lineB, lineC, lineD];

return [
  new Shape('9x9'),
  ...lines.map(cells => new RegionSumLine(...cells)),
  ...lines.map(cells => new Or([new Entropic(...cells), new Modular(3, ...cells)])),
];
