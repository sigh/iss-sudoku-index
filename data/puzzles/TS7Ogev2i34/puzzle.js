// Title: Chained Killer Sudoku
// Author: Shinya
// Video: https://www.youtube.com/watch?v=TS7Ogev2i34
// Source: https://cracking-the-cryptic.web.app/sudoku/drTGfJmMQm

// Rules encoded: normal sudoku (rows, columns and 3x3 boxes hold 1-9 once
// each), and 23 killer cages partitioning all 81 cells, each drawn with an
// empty total, so a cage only forbids repeats inside itself. The grid carries
// no given digits.
//
// Omitted: the 18 white capsules drawn across cage boundaries and the 6 black
// arrows drawn across cell edges. The source publishes no rules text, so
// neither mark family has a stated meaning; five of the six arrows join two
// cells of a single cage, which rules out reading an arrow as a relation
// between two cages, and no reading of the capsules is fixed by the drawing.
// Both families are described but not encoded.

// Cage cells transcribed from the 23 drawn cages, in the drawn order; the
// letters match the cage map in the puzzle description.
const CAGES = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'],  // A
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9'],                  // B
  ['R2C8', 'R3C8', 'R4C8', 'R5C8'],                                  // C
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8'],                  // D
  ['R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'],                  // E
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1'],                  // F
  ['R2C2', 'R3C2', 'R4C2', 'R5C2'],                                  // G
  ['R6C2', 'R7C2'],                                                  // H
  ['R8C2'],                                                          // I
  ['R8C3', 'R8C4', 'R8C5'],                                          // J
  ['R8C6', 'R8C7', 'R8C8'],                                          // K
  ['R6C8', 'R7C8', 'R7C7'],                                          // L
  ['R7C6', 'R7C5', 'R7C4'],                                          // M
  ['R7C3', 'R6C3', 'R5C3'],                                          // N
  ['R4C3', 'R3C3'],                                                  // O
  ['R2C3'],                                                          // P
  ['R2C4', 'R3C4'],                                                  // Q
  ['R2C5', 'R2C6', 'R2C7'],                                          // R
  ['R3C5', 'R3C6'],                                                  // S
  ['R3C7', 'R4C7', 'R5C7', 'R6C7'],                                  // T
  ['R4C4', 'R4C5', 'R4C6', 'R5C6'],                                  // U
  ['R5C4', 'R5C5'],                                                  // V
  ['R6C4', 'R6C5', 'R6C6'],                                          // W
];

// Total 0 is "no total": the cage contributes its all-different only.
const cages = CAGES.map((cells) => new Cage(0, ...cells));

return [
  new Shape('9x9'),
  ...cages,
];
