// Title: Breaking Out of Authors Block With Little Killers, Arrows, Palindromes
// Author: Arun Iyer
// Video: https://www.youtube.com/watch?v=xvPRm0wx8IU
// Source: https://app.crackingthecryptic.com/sudoku/6GN92JG8H9

// Normal sudoku rules apply (standard rows/cols/3x3 boxes, digits 1-9).
// Little killer diagonals: sum of digits along the indicated diagonal;
// repeats allowed along the diagonal.
// Arrows: digits along the arm sum to the digit in the circled bulb cell;
// repeats allowed along the arm.
// Grey lines: palindrome (sequence reads the same forwards and backwards).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  new Given('R7C2', 3),
  new Given('R8C3', 4),

  // Little killer diagonals (drawn as off-grid arrows in the payload; the
  // arrow's own direction fixes which diagonal each outside total reads,
  // confirmed against the paired overlay text).
  LittleKiller.fromCells(3, graph.ray('R2C9', -1, -1), geometry),
  LittleKiller.fromCells(33, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(36, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(3, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(33, graph.ray('R9C4', -1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R4C9', -1, -1), geometry),

  // Arrows: bulb cell first (matches the drawn circle underlay), then arm.
  new Arrow('R3C2', 'R2C1', 'R1C2', 'R2C3'),
  new Arrow('R2C8', 'R3C7', 'R4C7'),
  new Arrow('R5C4', 'R4C5', 'R5C6', 'R6C5'),
  new Arrow('R7C8', 'R8C9', 'R9C8', 'R8C7'),

  // Palindrome lines (grey lines).
  new Palindrome('R3C1', 'R4C2', 'R4C3'),
  new Palindrome('R3C4', 'R3C5', 'R4C6'),
  new Palindrome('R6C4', 'R7C5', 'R7C6'),
  new Palindrome('R6C7', 'R6C8', 'R7C9'),
];
