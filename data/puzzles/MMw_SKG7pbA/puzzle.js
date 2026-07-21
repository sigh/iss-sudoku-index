// Title: Is that a 3 in the corner?
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=MMw_SKG7pbA
// Source: https://sudokupad.app/d7x6vy9n5s

// Normal Sudoku rules apply. Digits on a grey line lie strictly between its
// circled endpoints. Horizontally adjacent digits differ by at least 4.
const betweenLines = [
  ['R1C4', 'R1C3', 'R1C2', 'R1C1'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
];

const rows = cellGraph('9x9').rows();

return [
  new Shape('9x9'),
  new Given('R9C9', 3),
  ...betweenLines.map(cells => new Between(...cells)),
  ...rows.map(cells => new Whisper(4, ...cells)),
];
