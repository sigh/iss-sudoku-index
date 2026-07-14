// Title: The Two Wings of the Eagle Totem
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=GquVyu6HazM
// Source: https://sudokupad.app/u5ej36c38t

// Gray lines split into contiguous sum-10 segments. The final path uses ISS's
// LOOP sentinel so its last and first cells are adjacent without double-counting.
const sumLines = [
  ['R3C4', 'R3C5', 'R3C6', 'R2C6'],
  ['R4C2', 'R5C2'],
  ['R7C5', 'R7C6'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'],
  ['R4C7', 'R5C7', 'R5C8', 'R5C9', 'R4C9', 'R4C8', 'LOOP'],
];

// Pink lines are non-repeating consecutive sets in any order.
const renbans = [
  ['R4C1', 'R5C1'],
  ['R4C3', 'R5C3'],
  ['R6C4', 'R6C5', 'R6C6', 'R7C6'],
  ['R8C4', 'R8C5', 'R8C6'],
  ['R8C9', 'R9C8'],
  ['R7C2', 'R8C1'],
];

// Adjacent digits on green lines differ by at least 5.
const whispers = [
  [
    'R4C6', 'R4C5', 'R4C4', 'R3C4', 'R2C4', 'R2C3',
    'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6',
  ],
  ['R4C8', 'R5C8'],
];

return [
  new Shape('9x9'),
  ...sumLines.map(cells => new SumLine(10, ...cells)),
  ...renbans.map(cells => new Renban(...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
