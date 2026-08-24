// Title: Unique
// Author: Totally Normal Cat
// Video: https://www.youtube.com/watch?v=E06xzkFJTuA
// Source: https://app.crackingthecryptic.com/sudoku/jBDjqmRdpg

// Normal sudoku rules (default rows/cols/boxes). Killer cages: digits sum to
// the total shown, and cannot repeat within a cage -- exactly `Cage`'s
// semantics. No given digits.

// Cage cells and totals transcribed from the drawn `cages` array (17 real
// entries; one further array entry has no cells and is a metadata stub, not
// a cage).
const cages = [
  [19, 'R1C1', 'R1C2', 'R2C1'],
  [22, 'R1C6', 'R1C7', 'R2C6', 'R3C6'],
  [17, 'R2C7', 'R3C7', 'R3C8'],
  [17, 'R1C8', 'R1C9', 'R2C9'],
  [27, 'R3C9', 'R4C7', 'R4C8', 'R4C9'],
  [8, 'R5C8', 'R5C9'],
  [6, 'R6C8', 'R6C9'],
  [6, 'R6C5', 'R7C5'],
  [15, 'R8C5', 'R9C5'],
  [13, 'R8C7', 'R9C7', 'R9C8'],
  [20, 'R8C3', 'R9C3', 'R9C4'],
  [19, 'R8C1', 'R8C2', 'R9C2'],
  [20, 'R6C1', 'R7C1', 'R7C2'],
  [15, 'R5C1', 'R5C2'],
  [6, 'R5C3', 'R5C4'],
  [13, 'R3C2', 'R3C3', 'R4C2'],
  [19, 'R3C4', 'R4C3', 'R4C4'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
