// Title: Around the block
// Author: Arbitrary
// Video: https://www.youtube.com/watch?v=AoesDnBoS1s
// Source: https://app.crackingthecryptic.com/TB93qrfhjq

// Rules encoded:
// - Normal 9x9 Sudoku with standard 3x3 boxes.
// - Each arrow's arm sums to its connected circle.
// - Adjacent digits along every green stroke differ by at least 5.

// Arrow paths, from each source-drawn circle through its arm.
const arrows = [
  ['R6C1', 'R7C2', 'R7C3'],
  ['R8C6', 'R7C5', 'R7C4'],
  ['R6C6', 'R6C5', 'R6C4'],
];

// Connected paths from the source's 32 green stroke entries. Closed paths
// repeat their first cell to retain the drawn closing edge.
const greenLines = [
  ['R8C2', 'R9C2', 'R9C3', 'R8C3', 'R8C2'],
  ['R8C4', 'R9C4', 'R9C5', 'R8C5', 'R8C4'],
  ['R9C7', 'R9C8'],
  ['R8C8', 'R7C8', 'R7C9', 'R8C9'],
  ['R5C8', 'R6C8', 'R6C9', 'R5C9'],
  ['R4C4', 'R5C4', 'R5C5', 'R4C5', 'R4C4'],
  ['R4C2', 'R5C2', 'R5C3', 'R4C3', 'R4C2'],
  ['R2C3', 'R3C3', 'R3C4', 'R2C4', 'R2C3'],
  ['R2C2', 'R2C1', 'R3C1', 'R3C2'],
  ['R1C8', 'R2C8', 'R2C9', 'R1C9', 'R1C8'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
];
