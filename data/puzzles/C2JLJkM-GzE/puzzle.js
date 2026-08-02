// Title: Swatting Flies
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=C2JLJkM-GzE
// Source: https://app.crackingthecryptic.com/64DGMDBhFf

// Normal Sudoku applies. Blue lines have equal sums in the boxes they visit; arrow arms sum to
// their circles. Black dots are 1:2 ratios and white dots are consecutive.
// Each group lists the blue cells in one 3x3 box, transcribed from the two
// drawn blue structures. Repeated junction cells occur once in their box sum.
const blueLines = [
  new EqualSum(['R1C7'], ['R2C6', 'R3C5', 'R3C4'], ['R4C5', 'R5C4'], ['R4C3']),
  new EqualSum(['R9C3'], ['R8C4', 'R7C5', 'R7C6'], ['R6C5', 'R5C6'], ['R6C7']),
];

// Arrow paths are transcribed from the two circle-and-arrow drawings.
const arrows = [
  new Arrow('R5C2', 'R6C2', 'R6C1', 'R7C2'),
  new Arrow('R5C2', 'R6C2', 'R6C3', 'R7C3', 'R8C4'),
  new Arrow('R5C8', 'R4C8', 'R4C9', 'R3C8'),
  new Arrow('R5C8', 'R4C8', 'R4C7', 'R3C7', 'R2C6'),
];

// Dot positions are transcribed from the four drawn edge marks.
const dots = [
  new BlackDot('R4C3', 'R5C3'),
  new BlackDot('R5C3', 'R5C4'),
  new WhiteDot('R6C7', 'R6C8'),
  new WhiteDot('R5C7', 'R6C7'),
];

return [
  new Shape('9x9'),
  new Given('R1C9', 9),
  new Given('R2C2', 3),
  new Given('R8C8', 5),
  new Given('R9C1', 2),
  ...blueLines,
  ...arrows,
  ...dots,
];
