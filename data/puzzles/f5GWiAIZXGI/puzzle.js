// Title: A Dutch Masterpiece
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=f5GWiAIZXGI
// Source: https://cracking-the-cryptic.web.app/sudoku/83HP7BndnL

// No rules text exists anywhere in the payload or the video description.
// Everything below is recovered from the payload's own structural data: an
// irregular (jigsaw) region partition, two undecorated corner-to-corner
// diagonals, and 8 given digits. Nothing is omitted.
//   Irregular Sudoku - 1-9 once each in every row, column and outlined region.
//   Diagonal Sudoku - both main diagonals also contain 1-9 without repetition.

const GIVENS = [
  ['R2C9', 3], ['R3C4', 4], ['R3C6', 1], ['R4C5', 5],
  ['R5C4', 9], ['R6C1', 6], ['R7C7', 2], ['R8C4', 7],
];

// The nine regions. Eight (A-H) are drawn directly as 9-cell region
// outlines. The ninth (I) is not drawn as an outline at all: it is the 9
// grey-shaded cells, which are exactly the cells left uncovered once A-H are
// removed from the grid -- confirmed by set arithmetic over the drawn
// geometry, not guessed.
const REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R3C4'], // A
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C5', 'R4C5', 'R4C6'], // B
  ['R1C7', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R4C7'], // C
  ['R4C8', 'R4C9', 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C6', 'R6C8', 'R6C9'], // D
  ['R4C1', 'R4C2', 'R4C4', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R6C1', 'R6C2'], // E
  ['R6C3', 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C3'], // F
  ['R6C4', 'R6C5', 'R7C5', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'], // G
  ['R7C6', 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R9C7', 'R9C8', 'R9C9'], // H
  ['R1C8', 'R2C1', 'R3C6', 'R4C3', 'R5C5', 'R6C7', 'R7C4', 'R8C9', 'R9C2'], // I (grey)
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...REGIONS.map(cells => new Jigsaw('9x9', ...cells)),
  new Diagonal(1),
  new Diagonal(-1),
];
