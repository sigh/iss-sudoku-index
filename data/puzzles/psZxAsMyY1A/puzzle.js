// Title: Creative Title Final Version?
// Author: Schwupel
// Video: https://www.youtube.com/watch?v=psZxAsMyY1A
// Source: https://app.crackingthecryptic.com/sudoku/Rqh6BL2Rt7

// Normal sudoku rules apply on the standard 9x9 grid with standard 3x3 box
// regions. Green lines are difference lines: neighbouring digits along a
// green line must differ by at least 5 (Whisper(5)). White dots mark
// consecutive digits (WhiteDot); black dots mark a 2:1 ratio (BlackDot).
// The rules state not all dots are given, so an adjacent pair carrying no
// dot implies nothing -- no negative constraint is encoded for undotted
// pairs.

const whispers = [
  // Green line, top-right box.
  new Whisper(5, 'R1C7', 'R2C7', 'R3C7', 'R2C8', 'R1C9', 'R2C9', 'R3C8'),
  // Green line, top-left box.
  new Whisper(5, 'R1C3', 'R2C2', 'R3C3', 'R4C2', 'R3C1'),
  // Green line, centre band, crossing into the right-middle/bottom box.
  new Whisper(5, 'R4C3', 'R5C4', 'R6C4', 'R7C4', 'R8C5', 'R8C6'),
  // Green line, bottom-right box.
  new Whisper(5, 'R6C7', 'R7C7', 'R8C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9'),
  // Green line, bottom-left box.
  new Whisper(5, 'R6C1', 'R6C2', 'R7C2', 'R8C2', 'R9C2', 'R9C3'),
];

// One WhiteDot/BlackDot per drawn dot, kept separate rather than merged
// into a single call over all dot cells: WhiteDot/BlackDot bind by grid
// adjacency, so lumping cells together would silently add a dot between
// any two cells from different dots that happen to be grid-adjacent to
// each other (e.g. the R4C6 end of one white dot and the R4C7 end of
// another are themselves adjacent, but undotted).
const whiteDots = [
  new WhiteDot('R1C5', 'R2C5'),
  new WhiteDot('R2C9', 'R3C9'),
  new WhiteDot('R4C7', 'R5C7'),
  new WhiteDot('R4C5', 'R4C6'),
  new WhiteDot('R5C3', 'R6C3'),
  new WhiteDot('R6C3', 'R6C4'),
];

const blackDots = [
  new BlackDot('R4C5', 'R5C5'),
  new BlackDot('R8C6', 'R8C7'),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...whiteDots,
  ...blackDots,
];
