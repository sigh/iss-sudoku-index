// Title: Pre-bifurcated for Mark
// Author: Olima
// Video: https://www.youtube.com/watch?v=mgHTD1p6tw4
// Source: https://app.crackingthecryptic.com/sudoku/NmMb9Q2Rpb

// Normal sudoku rules apply, plus:
// - Anti-king: identical digits cannot be within a king's move of each other.
// - Thermometers: digits ascend from the bulb along each drawn line.
// - The marked diagonal (top-right to bottom-left) contains no repeated
//   digits.
//
// Two thermometer bulbs are shared by more than one stroke (forked
// thermometers): R3C3 forks into two rising arms, and R5C7 forks into two
// rising arms, one of which (R5C7-R5C8-R5C9) has a further branch rising
// from R5C8 to R6C8. Each arm is encoded as its own Thermo starting at the
// shared bulb (or, for the R5C8-R6C8 branch, at the shared interior cell),
// so the branching itself is enforced by the cells' shared value rather
// than a single combined constraint. Cell lists are transcribed from the
// drawn waypoints, read bulb-first; five strokes (the short 2-cell thermos
// in row 8-9 with bulbs at R9C1, R9C2, R9C5, R9C6, R9C7) are drawn
// tip-first, so their cell order here is reversed from the drawn waypoint
// order to keep the bulb first.

return [
  new Shape('9x9'),

  new AntiKing(),

  // Anti-diagonal, top-right (R1C9) to bottom-left (R9C1): direction 1 is
  // '/' per SudokuConstraint.Diagonal's ARGUMENT_CONFIG.
  new Diagonal(1),

  // Thermometers, bulb cell first, strictly ascending.
  new Thermo('R2C1', 'R1C2', 'R2C2', 'R2C3', 'R3C2'),
  new Thermo('R3C3', 'R3C4'),
  new Thermo('R3C3', 'R2C4', 'R2C5', 'R3C5', 'R4C4'),
  new Thermo('R4C5', 'R3C6', 'R3C7', 'R4C7', 'R4C6', 'R5C6'),
  new Thermo('R5C7', 'R4C8'),
  new Thermo('R5C7', 'R5C8', 'R5C9'),
  new Thermo('R5C8', 'R6C8'),
  new Thermo('R3C1', 'R4C2', 'R4C3', 'R5C4', 'R5C5', 'R6C6', 'R6C7', 'R7C8'),
  new Thermo('R9C1', 'R8C1'),
  new Thermo('R9C2', 'R8C2'),
  new Thermo('R8C3', 'R9C3'),
  new Thermo('R8C4', 'R9C4'),
  new Thermo('R9C5', 'R8C5'),
  new Thermo('R9C6', 'R8C6'),
  new Thermo('R9C7', 'R8C7'),
  new Thermo('R8C8', 'R9C8'),
  new Thermo('R2C7', 'R3C8'),
];
