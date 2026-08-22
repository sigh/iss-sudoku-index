// Title: Renban vs Whispers
// Author: Crusader175
// Video: https://www.youtube.com/watch?v=pGYrlDIQx80
// Source: https://app.crackingthecryptic.com/sudoku/gmG2d2P9dD
//
// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Purple lines: digits form a consecutive, non-repeating set in any order
// (Renban). Circles: every listed digit must appear at least once in the
// touched 2x2 block (Quad). Green lines: adjacent digits differ by at least 5
// (Whisper). Cages: digits sum to the small top-left total, no repeats
// (Cage).

const cages = [
  // Center pinwheel of four 2-cell cages, from the cages array (top-left totals).
  new Cage(17, 'R3C5', 'R4C5'),
  new Cage(17, 'R5C6', 'R5C7'),
  new Cage(3, 'R5C4', 'R5C3'),
  new Cage(3, 'R6C5', 'R7C5'),
];

const whispers = [
  // Green lines, from the lines array (colour #a3e048, thickness 5).
  new Whisper(5, 'R1C3', 'R1C4'),
  new Whisper(5, 'R1C6', 'R1C7'),
  new Whisper(5, 'R2C3', 'R2C4'),
  new Whisper(5, 'R2C6', 'R2C7'),
  new Whisper(5, 'R8C6', 'R8C7'),
  new Whisper(5, 'R9C6', 'R9C7'),
  new Whisper(5, 'R8C3', 'R8C4'),
  new Whisper(5, 'R9C3', 'R9C4'),
  new Whisper(5, 'R2C2', 'R3C3'),
  new Whisper(5, 'R7C7', 'R8C8'),
];

const renbans = [
  // Two-cell purple lines, from the lines array (colour #d23be7, thickness 5).
  new Renban('R3C7', 'R2C8'),
  new Renban('R7C3', 'R8C2'),
  // Purple loops drawn as closed 2x2 diamonds. Renban is a set constraint
  // (unordered), so the drawn cyclic walk and its start cell carry no extra
  // meaning: each loop is encoded as the set of the four distinct cells it
  // covers.
  new Renban('R3C1', 'R4C1', 'R4C2', 'R3C2'),
  new Renban('R3C8', 'R4C8', 'R4C9', 'R3C9'),
  new Renban('R6C1', 'R7C1', 'R7C2', 'R6C2'),
  new Renban('R6C8', 'R7C8', 'R7C9', 'R6C9'),
];

const quads = [
  // Circles, from the overlays array. Quad(topLeftCell, ...values) requires
  // every listed digit to appear at least once in that cell's 2x2 block,
  // matching "digits in circles must appear at least once in the four cells".
  new Quad('R1C3', 3, 7),
  new Quad('R8C6', 3, 7),
  new Quad('R1C6', 1, 9),
  new Quad('R8C3', 1, 9),
  new Quad('R6C1', 7),
  new Quad('R6C8', 7),
  new Quad('R3C1', 3),
  new Quad('R3C8', 3),
  new Quad('R4C7', 2),
  new Quad('R5C2', 8),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
  ...renbans,
  ...quads,
];
