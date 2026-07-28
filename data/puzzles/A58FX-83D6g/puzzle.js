// Title: Putting Green 2
// Author: Brinel
// Video: https://www.youtube.com/watch?v=A58FX-83D6g
// Source: https://sudokupad.app/n13kcw13ck

// Normal sudoku rules apply. The purple line is a renban; adjacent green and
// orange-line digits differ by at least 5 and 4 respectively; the white dot
// joins consecutive digits. The circled 1 occurs in at least one cell of its
// surrounding 2x2 square.

const greenLines = [
  ['R4C5', 'R4C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R4C1', 'R5C1',
    'R6C1', 'R7C1', 'R8C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7',
    'R9C8', 'R8C8', 'R7C7', 'R6C6', 'R5C6', 'R4C6'],
  ['R4C2', 'R4C1'],
  ['R5C2', 'R5C1'],
  ['R6C5', 'R6C4', 'R6C3', 'R6C2', 'R6C1'],
  ['R7C7', 'R7C6'],
  ['R7C3', 'R7C2', 'R7C1'],
  ['R8C3', 'R8C2'],
  ['R5C4', 'R5C5', 'R5C6'],
];

const orangeLines = [
  ['R1C1', 'R1C2', 'R2C2', 'R3C1'],
  ['R2C9', 'R2C8', 'R3C8', 'R4C7', 'R5C7', 'R6C8', 'R6C9'],
];

return [
  new Shape('9x9'),

  // Line cells transcribed from the coloured strokes.
  new Renban('R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3', 'R1C4', 'R2C4'),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...orangeLines.map(cells => new Whisper(4, ...cells)),

  new WhiteDot('R7C4', 'R7C5'),
  new Quad('R1C3', 1),
];
