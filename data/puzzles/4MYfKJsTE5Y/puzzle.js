// Title: Typhoons
// Author: ChinoDarkar
// Video: https://www.youtube.com/watch?v=4MYfKJsTE5Y
// Source: https://app.crackingthecryptic.com/sudoku/34mQHMGgFF

// Normal sudoku. Anti-knight: digits a knight's move apart differ. Four
// arrows: the circle digit equals the sum of its arm digits (repeats allowed
// on the arm). Eight grey lines, each an independent 3-cell palindrome.
// A ninth `lines` source entry carries no waypoints and resolves to no
// cells; omitted as inert source noise, not a clue.

return [
  new Shape('9x9'),
  new Given('R7C6', 4),

  new AntiKnight(),

  // Circle cell first, then arm cells in path order. Cells recovered by
  // interpolating each arrow's wayPoints to cell centres; circle cells
  // cross-checked against the `overlays` markers, which sit on each arrow's
  // first waypoint.
  new Arrow('R3C4', 'R4C5', 'R5C5'),
  new Arrow('R3C7', 'R4C6', 'R5C5', 'R6C5'),
  new Arrow('R6C3', 'R5C4', 'R5C5', 'R6C5'),
  new Arrow('R7C7', 'R6C6', 'R5C5', 'R6C5'),

  new Palindrome('R3C3', 'R2C4', 'R1C5'),
  new Palindrome('R4C3', 'R3C4', 'R2C5'),
  new Palindrome('R3C6', 'R4C7', 'R5C8'),
  new Palindrome('R3C7', 'R4C8', 'R5C9'),
  new Palindrome('R5C1', 'R6C2', 'R7C3'),
  new Palindrome('R5C2', 'R6C3', 'R7C4'),
  new Palindrome('R8C5', 'R7C6', 'R6C7'),
  new Palindrome('R9C5', 'R8C6', 'R7C7'),
];
