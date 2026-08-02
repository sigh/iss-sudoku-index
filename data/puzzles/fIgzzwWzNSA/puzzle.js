// Title: Labyrinth
// Author: Calculo
// Video: https://www.youtube.com/watch?v=fIgzzwWzNSA
// Source: https://app.crackingthecryptic.com/4tLGTG4J2F

// Normal sudoku rules apply (rows, columns, and 3x3 boxes). There are no
// given digits. Digits increase from each grey thermometer bulb; the R6C4
// bulb has two drawn arms. Adjacent digits on every green line differ by at
// least five.

const thermometers = [
  // Grey strokes and their filled-circle bulbs from the drawn geometry.
  new Thermo('R6C4', 'R6C5', 'R6C6', 'R6C7'),
  new Thermo('R6C4', 'R7C4', 'R8C4', 'R9C4'),
  new Thermo('R9C3', 'R8C3', 'R7C3', 'R6C3'),
];

const greenLines = [
  // Green line paths from the source drawing.
  ['R9C3', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R5C3', 'R5C4', 'R6C4'],
  ['R7C3', 'R7C4'],
  ['R7C6', 'R6C6', 'R5C6'],
  ['R3C9', 'R3C8', 'R3C7', 'R2C7'],
  ['R2C6', 'R3C6'],
  ['R4C5', 'R4C6'],
  ['R3C3', 'R3C4'],
  ['R2C2', 'R3C1'],
  ['R3C2', 'R4C3'],
  ['R8C7', 'R8C8'],
  ['R5C8', 'R6C9'],
].map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  ...thermometers,
  ...greenLines,
];
