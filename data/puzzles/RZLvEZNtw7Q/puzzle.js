// Title: Group Sum / Renban Hybrid #8
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=RZLvEZNtw7Q
// Source: https://app.crackingthecryptic.com/ih1mkn7vk1

// Normal Sudoku rules apply. Each numbered white circle gives the sum of its
// four surrounding cells; repeats are allowed. Each purple line is a Renban:
// a set of consecutive, non-repeating digits in any order.

// The circle table is transcribed from the numbered 2x2 circles.
const circleSums = [
  [26, ['R2C4', 'R2C5', 'R3C4', 'R3C5']],
  [13, ['R2C5', 'R2C6', 'R3C5', 'R3C6']],
  [15, ['R3C3', 'R3C4', 'R4C3', 'R4C4']],
  [18, ['R4C4', 'R4C5', 'R5C4', 'R5C5']],
  [18, ['R6C3', 'R6C4', 'R7C3', 'R7C4']],
  [19, ['R5C5', 'R5C6', 'R6C5', 'R6C6']],
  [14, ['R6C6', 'R6C7', 'R7C6', 'R7C7']],
  [11, ['R3C6', 'R3C7', 'R4C6', 'R4C7']],
  [11, ['R7C4', 'R7C5', 'R8C4', 'R8C5']],
  [25, ['R7C5', 'R7C6', 'R8C5', 'R8C6']],
];

// The purple strokes are listed as drawn; joined stroke entries are one line.
const renbans = [
  ['R1C4', 'R1C5', 'R1C6', 'R2C5'],
  ['R1C1', 'R2C2', 'R3C3'],
  ['R3C7', 'R2C8', 'R1C9'],
  ['R3C8', 'R4C8'],
  ['R5C9', 'R5C8'],
  ['R6C8', 'R7C8'],
  ['R9C9', 'R8C8', 'R7C7'],
  ['R8C5', 'R9C5', 'R9C6', 'R9C4'],
  ['R9C1', 'R8C2', 'R7C3'],
  ['R7C2', 'R6C2'],
  ['R5C1', 'R5C2'],
  ['R3C2', 'R4C2'],
];

return [
  new Shape('9x9'),
  ...circleSums.map(([sum, cells]) => new Sum(sum, ...cells)),
  ...renbans.map((cells) => new Renban(...cells)),
];
