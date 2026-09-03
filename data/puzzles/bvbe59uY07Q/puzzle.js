// Title: Unknown
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=bvbe59uY07Q
// Source: https://cracking-the-cryptic.web.app/sudoku/DRHTDLnq7f

// The source carries no rules text at all, so the rules below are read off the
// drawn board:
//   - Normal Sudoku (the drawn regions are exactly the nine standard boxes).
//   - Digits do not repeat on either long diagonal: two deepskyblue strokes are
//     drawn corner to corner across the whole board, and the video titles the
//     puzzle "x + 9z" -- X for the diagonals, 9Z for the nine Z-pentominoes.
//   - Digits do not repeat within each of the nine drawn 5-cell pentomino
//     cages. Each cage is outlined with no printed total, which is the usual
//     no-repeat cage.
// Omitted: whatever else the nine pentominoes require. Nothing drawn or written
// states a rule for them beyond the no-total cage convention, and this encoding
// claims none.

// Provenance: the nine drawn 5-cell cages, each with no printed total, whose
// cells are also the board's light-grey filled cells.
const cages = [
  ['R1C1', 'R1C2', 'R2C2', 'R3C2', 'R3C3'],
  ['R1C7', 'R1C8', 'R2C8', 'R3C8', 'R3C9'],
  ['R2C6', 'R2C7', 'R3C7', 'R4C7', 'R4C8'],
  ['R3C5', 'R3C6', 'R4C6', 'R5C6', 'R5C7'],
  ['R4C4', 'R4C5', 'R5C5', 'R6C5', 'R6C6'],
  ['R5C3', 'R5C4', 'R6C4', 'R7C4', 'R7C5'],
  ['R6C2', 'R6C3', 'R7C3', 'R8C3', 'R8C4'],
  ['R7C1', 'R7C2', 'R8C2', 'R9C2', 'R9C3'],
  ['R7C8', 'R7C9', 'R8C8', 'R9C7', 'R9C8'],
];

return [
  new Shape('9x9'),

  // Provenance: the five printed digits.
  new Given('R2C1', 8),
  new Given('R6C6', 1),
  new Given('R6C7', 8),
  new Given('R9C1', 6),
  new Given('R9C7', 2),

  // Diagonal(-1) is the main diagonal R1C1..R9C9; Diagonal(1) is the
  // anti-diagonal R1C9..R9C1.
  new Diagonal(-1),
  new Diagonal(1),

  // A cage total of 0 is "no total": all-different only.
  ...cages.map(cells => new Cage(0, ...cells)),
];
