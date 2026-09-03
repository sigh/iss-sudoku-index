// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=1fqIcMHLENo
// Source: https://cracking-the-cryptic.web.app/sudoku/pGd4fnH6hR

// The source page carries no rules text. Every rule below is read off the drawn
// art, and all of it is encoded; nothing is omitted.
//
//  - Normal Sudoku rules apply over the standard 3x3 boxes. There are no given
//    digits.
//  - Digits in a dashed cage sum to the small total printed in the cage's
//    top-left corner, and may not repeat within the cage. Eleven cages carry a
//    printed total.
//  - Four further dashed cages are shaded grey and carry no printed total. The
//    text printed under the grid, "Sum Of Grey cages = 93", gives their combined
//    total.
//  - Two thin light-blue strokes are drawn corner to corner across both main
//    diagonals. Digits may not repeat along either main diagonal.

// The eleven cages that carry a printed total: [total, ...cells], transcribed
// from the dashed cage outlines and the total drawn in each cage's corner.
const totalledCages = [
  [20, 'R1C1', 'R1C2', 'R2C1'],
  [21, 'R1C8', 'R1C9', 'R2C9'],
  [21, 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R3C2'],
  [20, 'R3C3', 'R3C4', 'R3C5', 'R3C6'],
  [23, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'],
  [12, 'R4C7', 'R4C8'],
  [12, 'R6C2', 'R6C3'],
  [18, 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
  [19, 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
  [19, 'R8C9', 'R9C8', 'R9C9'],
  [17, 'R8C1', 'R9C1', 'R9C2'],
];

// The four grey-shaded cages, transcribed from the dashed outlines drawn around
// the grey cells. Each runs along one edge of the grid.
const greyCages = [
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
];

return [
  new Shape('9x9'),

  ...totalledCages.map(([total, ...cells]) => new Cage(total, ...cells)),

  // A cage with no printed total keeps only the no-repeat half of the cage
  // rule, which `Cage` emits for a total of 0.
  ...greyCages.map((cells) => new Cage(0, ...cells)),

  // "Sum Of Grey cages = 93" over the twenty cells of the four grey cages.
  new Sum(93, ...greyCages.flat()),

  // The two corner-to-corner strokes: 1 is the R9C1-R1C9 diagonal, -1 the
  // R1C1-R9C9 diagonal.
  new Diagonal(1),
  new Diagonal(-1),
];
