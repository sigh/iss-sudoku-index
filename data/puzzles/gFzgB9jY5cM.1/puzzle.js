// Title: Nayru's Pearl
// Author: Wei-Hwa Huang
// Video: https://www.youtube.com/watch?v=gFzgB9jY5cM
// Source: https://sudokupad.app/rn6k0lxtzd
//
// Normal sudoku (default row/column/box all-different). Each cage's digits
// are distinct and sum to its shown total -- `Cage` gives both properties.
// The 19 cages below partition all 81 cells, transcribed from the puzzle's
// drawn cage geometry. The puzzle also draws a single-color background fill
// over some cells in a spiral/pearl pattern; the rules text gives coloring
// no meaning, so it is decorative artwork and is not encoded.

const cages = [
  [21, 'R8C1', 'R9C1', 'R9C2'],
  [17, 'R8C9', 'R9C9', 'R9C8'],
  [13, 'R7C7', 'R8C7', 'R8C8', 'R7C8'],
  [11, 'R7C2', 'R8C2', 'R8C3', 'R7C3'],
  [12, 'R6C2', 'R6C3'],
  [10, 'R6C7', 'R6C8'],
  [25, 'R6C4', 'R7C4', 'R8C4', 'R9C4', 'R9C3'],
  [19, 'R6C6', 'R7C6', 'R8C6', 'R9C6', 'R9C7'],
  [28, 'R5C7', 'R5C8', 'R5C9', 'R6C9', 'R7C9'],
  [29, 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R7C1'],
  [22, 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  [35, 'R4C4', 'R4C6', 'R5C4', 'R5C5', 'R5C6'],
  [27, 'R1C1', 'R1C2', 'R2C1', 'R3C1', 'R4C1', 'R4C2'],
  [9, 'R3C2', 'R3C3', 'R4C3'],
  [22, 'R1C3', 'R1C4', 'R2C2', 'R2C3'],
  [36, 'R1C5', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6', 'R4C5'],
  [26, 'R1C6', 'R1C7', 'R2C7', 'R2C8'],
  [24, 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C8', 'R4C9'],
  [19, 'R3C7', 'R3C8', 'R4C7'],
];

return [
  new Shape('9x9'),
  new Given('R3C5', 3),
  new Given('R8C2', 1),
  new Given('R8C8', 2),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
