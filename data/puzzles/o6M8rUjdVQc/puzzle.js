// Title: Alien (1979)
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=o6M8rUjdVQc
// Source: https://app.crackingthecryptic.com/sudoku/rpnbLPmGHt

// Normal sudoku rules apply. Two cells directly connected by a line must
// have a difference of at least 5 (Whisper(5)); the rule text does not
// distinguish the two rendering colours (yellow-green, light grey), so both
// sets of lines get the same treatment. One inequality sign (a small black
// arrowhead, not attached to any whisper line) sits between R1C3 and R2C3;
// its point extends into R2C3, so R2C3 is the lower digit (rules text:
// "the inequality sign 'points' to the lower of the two digits").

const whispers = [
  ['R4C1', 'R3C1', 'R2C2', 'R3C3', 'R4C3'],
  ['R2C7', 'R3C7', 'R4C7', 'R4C8', 'R4C9'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2'],
  ['R8C1', 'R8C2'],
  ['R9C7', 'R8C7', 'R7C7', 'R8C8', 'R9C9', 'R8C9', 'R7C9'],
  ['R8C4', 'R9C4'],
  ['R8C6', 'R9C6'],
  ['R1C1', 'R1C2'],
  ['R1C3', 'R1C4'],
  ['R1C6', 'R1C7'],
  ['R1C8', 'R1C9'],
];

return [
  new Given('R3C5', 1),
  new Given('R5C3', 9),
  new Given('R5C7', 7),
  new Given('R7C5', 9),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  new GreaterThan('R1C3', 'R2C3'),
];
