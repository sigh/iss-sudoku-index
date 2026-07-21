// Title: Two-step whispers
// Author: Grant McLean
// Video: https://www.youtube.com/watch?v=7xiLo-oAha8
// Source: https://sudokupad.app/0a563g5sdd

// Normal Sudoku rules apply. Green German whispers differ by at least 5;
// orange Dutch whispers differ by at least 4. The thermometer increases
// strictly from its bulb at R4C4.
const germanWhisper = [
  'R7C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8',
  'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R2C5', 'R2C4',
  'R2C3', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C1', 'R8C1',
  'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R8C8',
  'R7C8', 'R7C9', 'R6C9', 'R5C9', 'R4C8', 'R5C8',
];

const dutchWhispers = [
  ['R8C3', 'R7C3', 'R7C4', 'R6C4', 'R6C5'],
  ['R5C6', 'R5C7', 'R4C7'],
  ['R2C5', 'R2C6', 'R1C6'],
].map(cells => new Whisper(4, ...cells));

return [
  new Shape('9x9'),
  new Whisper(5, ...germanWhisper),
  ...dutchWhispers,
  new Thermo('R4C4', 'R4C5', 'R4C6', 'R3C7'),
];
