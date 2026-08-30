// Title: Unknown
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=bvbe59uY07Q
// Source: https://cracking-the-cryptic.web.app/sudoku/DRHTDLnq7f

// Normal sudoku rules apply (standard 3x3 boxes). The payload carries no
// rules text at all. Nine dashed cages are drawn with no printed total,
// encoded per the standard killer convention as all-different-only
// (Cage sum 0). The board also draws two thick corner-to-corner diagonal
// lines (main and anti-diagonal); each cage sits astride one of them, but
// nothing in the payload states what relation, if any, a coloured line
// itself imposes, so they are omitted.

const givens = [
  new Given('R2C1', 8),
  new Given('R6C6', 1),
  new Given('R6C7', 8),
  new Given('R9C1', 6),
  new Given('R9C7', 2),
];

const cages = [
  new Cage(0, 'R1C1', 'R1C2', 'R2C2', 'R3C2', 'R3C3'),
  new Cage(0, 'R1C7', 'R1C8', 'R2C8', 'R3C8', 'R3C9'),
  new Cage(0, 'R2C6', 'R2C7', 'R3C7', 'R4C7', 'R4C8'),
  new Cage(0, 'R3C5', 'R3C6', 'R4C6', 'R5C6', 'R5C7'),
  new Cage(0, 'R4C4', 'R4C5', 'R5C5', 'R6C5', 'R6C6'),
  new Cage(0, 'R5C3', 'R5C4', 'R6C4', 'R7C4', 'R7C5'),
  new Cage(0, 'R6C2', 'R6C3', 'R7C3', 'R8C3', 'R8C4'),
  new Cage(0, 'R7C1', 'R7C2', 'R8C2', 'R9C2', 'R9C3'),
  new Cage(0, 'R7C9', 'R7C8', 'R8C8', 'R9C8', 'R9C7'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
];
