// Title: Clueless
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=siyJEk7qCnc
// Source: https://app.crackingthecryptic.com/webapp/rDJd7g76N9

// Normal sudoku rules on the 9x9 grid (default rows/columns/boxes). No givens.
// Along each thermometer, digits increase from the bulb end (Thermo).
//
// Three thermometers branch: a run from the bulb reaches a junction cell, and
// two or three separate arms continue from there, each increasing
// independently from the bulb. Each arm is its own Thermo sharing the
// bulb..junction prefix, which enforces bulb < junction < each arm exactly
// once per arm (matches the pattern used for other branching thermometers in
// this pipeline, e.g. wIAkfaSRZqE).

return [
  new Shape('9x9'),

  // Simple (non-branching) thermometers, bulb cell first.
  new Thermo('R1C2', 'R1C1', 'R2C1'),
  new Thermo('R1C6', 'R2C6', 'R2C5'),
  new Thermo('R1C7', 'R1C8', 'R2C8', 'R2C9', 'R3C9'),
  new Thermo('R3C5', 'R3C4', 'R4C4', 'R4C3', 'R5C3', 'R5C2', 'R6C2', 'R6C1'),
  new Thermo('R7C1', 'R8C1', 'R8C2', 'R9C2', 'R9C3'),
  new Thermo('R7C6', 'R6C6', 'R6C7', 'R5C7', 'R5C8', 'R4C8', 'R4C9'),
  new Thermo('R8C9', 'R9C9', 'R9C8'),
  new Thermo('R9C4', 'R8C4', 'R8C5', 'R7C5'),

  // Branching thermometer: bulb R3C8 -> junction R3C7 -> three arms.
  new Thermo('R3C8', 'R3C7', 'R3C6'),
  new Thermo('R3C8', 'R3C7', 'R2C7'),
  new Thermo('R3C8', 'R3C7', 'R4C7'),

  // Branching thermometer: bulb R8C3 -> junction R7C3 -> three arms.
  new Thermo('R8C3', 'R7C3', 'R6C3'),
  new Thermo('R8C3', 'R7C3', 'R7C2'),
  new Thermo('R8C3', 'R7C3', 'R7C4'),

  // Branching thermometer: bulb R5C5 -> two arms directly (no shared run).
  new Thermo('R5C5', 'R4C5', 'R4C6', 'R5C6'),
  new Thermo('R5C5', 'R6C5', 'R6C4', 'R5C4'),
];
