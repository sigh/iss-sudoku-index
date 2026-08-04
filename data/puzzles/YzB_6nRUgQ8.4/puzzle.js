// Title: Prime Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=YzB_6nRUgQ8
// Source: https://tinyurl.com/4nrf33us

// Normal Sudoku rules (rows, columns, boxes all-different) apply by default.
// Every black dot (26 total, from the payload's `circle` entries, all
// baseC #000000) joins two orthogonally adjacent cells whose digits must sum
// to a prime number. There are no white dots. Every dot pair is adjacent, so
// normal Sudoku already forces the two digits to differ; possible sums 3..17
// are prime at 3, 5, 7, 11, 13, 17.

const isPrimeSum = (a, b) => {
  const s = a + b;
  return s === 3 || s === 5 || s === 7 || s === 11 || s === 13 || s === 17;
};
const primeDotKey = Pair.fnToKey(isPrimeSum, 9);

// Dot edges transcribed from the puzzle's drawn black-dot markers (26 total).
const dotEdges = [
  // Row 1: a dot on every adjacent pair, spanning the whole row.
  ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R1C3', 'R1C4'], ['R1C4', 'R1C5'],
  ['R1C5', 'R1C6'], ['R1C6', 'R1C7'], ['R1C7', 'R1C8'], ['R1C8', 'R1C9'],
  // Row 9: a dot on every adjacent pair, spanning the whole row.
  ['R9C1', 'R9C2'], ['R9C2', 'R9C3'], ['R9C3', 'R9C4'], ['R9C4', 'R9C5'],
  ['R9C5', 'R9C6'], ['R9C6', 'R9C7'], ['R9C7', 'R9C8'], ['R9C8', 'R9C9'],
  // Interior dots.
  ['R3C5', 'R3C6'],
  ['R4C2', 'R4C3'], ['R4C4', 'R4C5'], ['R4C7', 'R4C8'],
  ['R4C6', 'R5C6'], ['R5C4', 'R6C4'],
  ['R6C2', 'R6C3'], ['R6C5', 'R6C6'], ['R6C7', 'R6C8'],
  ['R7C4', 'R7C5'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C3', 3), new Given('R1C5', 5),
  new Given('R1C7', 7), new Given('R1C9', 9),
  new Given('R3C5', 2),
  new Given('R4C2', 4), new Given('R4C4', 1), new Given('R4C6', 5),
  new Given('R4C8', 3),
  new Given('R5C1', 5), new Given('R5C3', 8), new Given('R5C5', 3),
  new Given('R5C7', 9), new Given('R5C9', 1),
  new Given('R6C2', 6), new Given('R6C4', 7), new Given('R6C6', 9),
  new Given('R6C8', 5),
  new Given('R7C5', 9),
  new Given('R9C2', 8), new Given('R9C4', 6), new Given('R9C6', 4),
  new Given('R9C8', 2),
  ...dotEdges.map(([a, b]) => new Pair(primeDotKey, '', a, b)),
];
