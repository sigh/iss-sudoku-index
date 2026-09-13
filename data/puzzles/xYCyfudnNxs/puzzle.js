// Title: Algae
// Author: Evan
// Video: https://www.youtube.com/watch?v=xYCyfudnNxs
// Source: https://sudokupad.app/y82dvel3ul

// Normal sudoku rules (default rows/cols/boxes, no jigsaw regions). One
// given. Seven green lines, each drawn as a straight horizontal run of
// cells: along each, adjacent digits differ by at least 5 (Whisper(5)).

const lines = [
  ['R4C3', 'R4C4', 'R4C5', 'R4C6'],
  ['R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'],
  ['R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9'],
  ['R3C5', 'R3C6', 'R3C7', 'R3C8'],
  ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8'],
  ['R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'],
];

return [
  new Shape('9x9'),
  new Given('R3C4', 1),
  ...lines.map((cells) => new Whisper(5, ...cells)),
];
