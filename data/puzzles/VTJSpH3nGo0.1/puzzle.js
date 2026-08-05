// Title: Nov 13, 2022: Killer Quads
// Author: clover!
// Video: https://www.youtube.com/watch?v=VTJSpH3nGo0
// Source: https://tinyurl.com/vac9vk9t

// Normal Sudoku rules apply. Each quad's digits occur in its surrounding 2x2
// block. Each killer cage has distinct digits summing to its displayed total.
// Quad data is transcribed from the twelve white circles in the source.
const quads = [
  ['R3C5', [5, 6, 7, 8]], ['R5C6', [4, 5, 6, 7]],
  ['R6C4', [3, 4, 5, 6]], ['R4C3', [2, 3, 4]],
  ['R2C7', [4, 5, 6, 7]], ['R7C2', [2, 3, 4, 5]],
  ['R1C6', [3, 5, 7, 9]], ['R8C3', [3, 5, 6, 7]],
  ['R6C1', [2, 8]], ['R3C8', [2, 3]],
  ['R2C2', [1, 2, 8, 9]], ['R7C7', [1, 3, 7, 8]],
];

// Cage data is transcribed from the three dashed killer-cage outlines.
const cages = [
  [15, ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5']],
  [28, ['R8C1', 'R8C2', 'R9C1', 'R9C2']],
  [12, ['R1C8', 'R1C9', 'R2C8', 'R2C9']],
];

return [
  new Shape('9x9'),
  ...quads.map(([topLeft, values]) => new Quad(topLeft, ...values)),
  ...cages.map(([total, cells]) => new Cage(total, ...cells)),
];
