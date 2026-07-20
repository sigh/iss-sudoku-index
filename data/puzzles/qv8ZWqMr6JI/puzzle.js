// Title: Grebbe Line
// Author: Altai
// Video: https://www.youtube.com/watch?v=qv8ZWqMr6JI
// Source: https://sudokupad.app/a9bboi6pi1

// Normal Sudoku. Killer cages are distinct and sum to their totals. The blue
// line has equal sums in each box segment; the grey line is a palindrome.
// Adjacent digits differ by at least 5 on green and at least 4 on orange.

const cages = [
  [10, 'R1C1', 'R1C2', 'R2C1'],
  [5, 'R1C3', 'R2C3'],
  [19, 'R1C4', 'R1C5', 'R2C5'],
  [40, 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C6', 'R2C7', 'R2C8', 'R2C9'],
  [17, 'R8C1', 'R8C2', 'R9C2'],
  [19, 'R8C4', 'R8C5', 'R9C4', 'R9C5'],
  [40, 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  [5, 'R8C3', 'R9C3'],
];

const regionSumLine = [
  'R2C1', 'R3C2', 'R4C3', 'R4C4', 'R5C5',
  'R6C6', 'R6C7', 'R7C8', 'R8C8', 'R9C9',
];
const palindrome = [
  'R6C8', 'R6C9', 'R7C8', 'R8C7', 'R8C6',
  'R9C5', 'R9C4', 'R9C3', 'R9C2',
];
const germanWhisper = [
  'R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R5C8', 'R5C9',
];
const dutchWhisper = [
  'R4C1', 'R5C2', 'R6C2', 'R7C3', 'R7C4', 'R7C5', 'R8C6', 'R9C7',
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new RegionSumLine(...regionSumLine),
  new Palindrome(...palindrome),
  new Whisper(5, ...germanWhisper),
  new Whisper(4, ...dutchWhisper),
];
