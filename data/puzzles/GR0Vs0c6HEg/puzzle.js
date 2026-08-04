// Title: The Chromatic Windmill
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=GR0Vs0c6HEg
// Source: https://app.crackingthecryptic.com/sudoku/MGJ22FHQT6

// Normal sudoku rules apply (default rows/cols/3x3 boxes, no givens).
// Four outside diagonal clues give the sum of digits along the indicated
// diagonal, walked from the grid-edge entry cell to where it exits again.
// Four undrawn-total cages: digits cannot repeat within a cage (no sum).
// Four grey lines are palindromes.
// White dots join cells that must be consecutive; black dots join cells in
// a 1:2 ratio. The rules state not all dots are given, i.e. no negative
// constraint is implied by the absence of a dot elsewhere -- nothing extra
// to encode for that clause.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Windmill cages (no total): cell lists transcribed from the drawn cage
// geometry (the puzzle's metadata stubs are not real cages).
const windmillCages = [
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C7', 'R2C8'],
  ['R2C1', 'R2C2', 'R3C1', 'R3C2', 'R4C1', 'R4C2', 'R5C1', 'R6C1', 'R7C1'],
  ['R8C2', 'R8C3', 'R8C4', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C8', 'R6C9', 'R7C8', 'R7C9', 'R8C8', 'R8C9'],
];

// Grey palindrome lines: cell paths transcribed from the drawn line geometry.
const palindromeLines = [
  ['R5C4', 'R4C4', 'R3C4', 'R2C3', 'R1C2', 'R1C1'],
  ['R4C5', 'R4C6', 'R4C7', 'R3C8', 'R2C9', 'R1C9'],
  ['R5C6', 'R6C6', 'R7C6', 'R8C7', 'R9C8', 'R9C9'],
  ['R6C5', 'R6C4', 'R6C3', 'R7C2', 'R8C1', 'R9C1'],
];

return [
  new Shape('9x9'),

  ...windmillCages.map(cells => new AllDifferent(...cells)),

  ...palindromeLines.map(cells => new Palindrome(...cells)),

  // Dot overlays, transcribed from the drawn edge-mark positions.
  new WhiteDot('R1C3', 'R1C4'),
  new WhiteDot('R6C1', 'R7C1'),
  new BlackDot('R9C6', 'R9C7'),
  new BlackDot('R3C9', 'R4C9'),

  // Outside diagonal-sum clues (little killer). Each ray starts at the
  // grid-edge entry cell derived from the arrow's off-grid waypoints and
  // walks to the grid boundary on the far side.
  LittleKiller.fromCells(23, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(28, graph.ray('R6C9', -1, -1), geometry),
  LittleKiller.fromCells(19, graph.ray('R9C6', -1, 1), geometry),
];
