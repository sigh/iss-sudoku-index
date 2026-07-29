// Title: The Rabbit of Caerbannog
// Author: Olli Wright
// Video: https://www.youtube.com/watch?v=1hECaKWWVX0
// Source: https://app.crackingthecryptic.com/jclyzlvxa5

// Normal sudoku rules apply (default row/column/box all-different). Adjacent
// cells on each drawn green line differ by at least 5. The white and black
// dots respectively mark consecutive and 1:2-ratio pairs; dots are not
// exhaustive, so no negative-dot rule is added.

// Green-line cell sequences transcribed from the drawn polylines.
const greenLines = [
  ['R7C3', 'R8C3', 'R9C3', 'R9C4', 'R8C5', 'R9C6', 'R9C7', 'R8C7',
    'R7C8', 'R6C9', 'R5C9', 'R4C8', 'R5C7', 'R5C6', 'R6C6', 'R6C5',
    'R6C4', 'R5C4', 'R5C3', 'R4C2', 'R5C1', 'R6C1', 'R7C2', 'R8C3'],
  ['R8C5', 'R7C5'],
  ['R8C7', 'R7C7'],
  ['R4C8', 'R3C7', 'R3C6', 'R4C5', 'R5C6'],
  ['R5C4', 'R4C5', 'R3C4', 'R3C3', 'R4C2'],
  ['R3C7', 'R2C8', 'R3C9', 'R2C9', 'R1C8', 'R1C7', 'R2C6', 'R3C5',
    'R2C4', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R2C2', 'R3C3'],
  ['R4C5', 'R3C5'],
];

return [
  new Shape('9x9'),
  new Given('R5C5', 4),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  new WhiteDot('R4C3', 'R4C4'),
  new BlackDot('R4C6', 'R4C7'),
];
