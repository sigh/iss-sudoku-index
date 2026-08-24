// Title: Love Heart
// Author: kuraban
// Video: https://www.youtube.com/watch?v=3Yig5C4Ax2A
// Source: https://app.crackingthecryptic.com/sudoku/hdmtBhD6jQ

// Normal sudoku (standard 3x3 boxes). Thermometers increase from the bulb.
// Cages sum to the total shown, no repeats within a cage. Arrows sum their
// arm to the bulb/pill digit(s), pill read top-down. X marks between two
// cells force that pair to sum to 10; not all Xs are given, so unmarked
// pairs are unconstrained.
//
// lines[9] (the row-9 thermometer) is one bulb at R9C5 with two increasing
// arms, R9C5->R9C4->R9C3 and R9C5->R9C6->R9C7: its own waypoints run
// R9C5->R9C3 then R9C5->R9C7 (not a single monotone sweep across the row),
// and only one bulb circle is drawn, at R9C5. Encoded as two Thermo
// constraints sharing the bulb cell, per the drawn branch.
//
// The thin purple closed line (lines[10]) retraces the union of
// thermometers 0-6 (plus one closing edge) as a heart outline. It carries
// no rule text and is decoration for the title.

const cages = [
  [23, 'R2C2', 'R2C3', 'R2C4', 'R2C5'],
  [9, 'R2C7', 'R2C8'],
  [12, 'R3C2', 'R3C3'],
  [12, 'R3C6', 'R3C7', 'R3C8'],
  [25, 'R4C2', 'R4C3', 'R4C4', 'R4C5'],
  [15, 'R4C6', 'R4C7', 'R4C8'],
  [21, 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'],
  [13, 'R6C2', 'R6C3'],
  [1, 'R6C4'],
  [18, 'R6C5', 'R6C6', 'R6C7', 'R6C8'],
  [18, 'R7C2', 'R7C3', 'R7C4'],
  [25, 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R8C8'],
  [13, 'R8C2', 'R8C3', 'R8C4'],
  [5, 'R8C6', 'R8C7'],
];

const thermos = [
  ['R2C3', 'R2C4'],
  ['R2C6', 'R3C5'],
  ['R3C8', 'R2C7'],
  ['R4C8', 'R5C8'],
  ['R6C7', 'R7C6', 'R8C5'],
  ['R7C4', 'R6C3', 'R5C2'],
  ['R4C2', 'R3C2'],
  ['R5C1', 'R4C1', 'R3C1'],
  ['R9C2', 'R9C1', 'R8C1'],
  // Forked bulb at R9C5: two arms, both starting at the shared bulb.
  ['R9C5', 'R9C4', 'R9C3'],
  ['R9C5', 'R9C6', 'R9C7'],
];

const arrows = [
  ['R1C6', 'R1C5', 'R1C4', 'R1C3'],
  ['R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R6C1', 'R7C1', 'R8C1'],
];

const pillArrow = ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'];

const xPairs = [
  ['R4C5', 'R5C5'],
  ['R8C3', 'R9C3'],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  new PillArrow(2, ...pillArrow),
  ...xPairs.map(cells => new X(...cells)),
];
