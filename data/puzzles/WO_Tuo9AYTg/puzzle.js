// Title: Boundaries
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=WO_Tuo9AYTg
// Source: https://sudokupad.app/8grq4908um

// Normal sudoku rules apply (default row/column/box all-different). No givens.
//
// Killer cages: digits sum to the small top-left total; digits in a cage
// repeat no digit.
//
// Arrows: digits along the arrow (excluding the bulb) sum to the digit in
// the circled bulb cell.
//
// Blue line: box borders divide it into segments, each segment summing to
// the same total (RegionSumLine's exact semantics).
//
// Green lines: adjacent digits along the line differ by at least 5 (German
// Whispers; the payload's explicit difference value is 5, matching the
// default).

const cages = [
  [5, 'R4C4', 'R5C4'],
  [10, 'R5C6', 'R6C6'],
  [11, 'R6C1', 'R7C1'],
  [11, 'R3C9', 'R4C9'],
  [17, 'R8C1', 'R9C1', 'R9C2'],
  [17, 'R1C8', 'R1C9', 'R2C9'],
  [15, 'R1C3', 'R1C4'],
  [15, 'R9C6', 'R9C7'],
];

// Bulb cell first, followed by arm cells (payload's arrow `lines` path
// already starts at the circle cell).
const arrows = [
  ['R3C5', 'R3C4', 'R3C3', 'R3C2'],
  ['R7C5', 'R7C6', 'R7C7', 'R7C8'],
];

const whispers = [
  ['R6C8', 'R6C9', 'R7C8'],
  ['R3C2', 'R4C1', 'R4C2'],
  ['R9C3', 'R8C3'],
  ['R1C7', 'R2C7'],
];

const regionSumLine = ['R6C2', 'R6C3', 'R6C4', 'R5C5', 'R4C6', 'R4C7', 'R4C8'];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  new RegionSumLine(...regionSumLine),
];
