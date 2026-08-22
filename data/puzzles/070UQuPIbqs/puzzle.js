// Title: Silent Fletching
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=070UQuPIbqs
// Source: https://app.crackingthecryptic.com/sudoku/RpN392fqHF
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Digits along an arrow sum to the digit in the arrow's circle -> one
// Arrow(circle, ...sumPath) per arrow. Adjacent digits on a green line
// must differ by at least 5 -> Whisper(5, ...cells) per green line.

const arrows = [
  ['R1C5', 'R2C5', 'R3C5', 'R4C5'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R4C6', 'R3C6', 'R2C6', 'R1C7'],
  ['R6C5', 'R5C6', 'R5C7'],
  ['R5C8', 'R6C9', 'R7C9'],
  ['R8C9', 'R9C8', 'R9C7'],
  ['R9C6', 'R8C5', 'R7C5'],
  ['R7C1', 'R7C2', 'R7C3'],
];

const whispers = [
  ['R1C4', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4'],
  ['R6C3', 'R7C4'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R3C7', 'R4C8'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
