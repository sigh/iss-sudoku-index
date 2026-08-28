// Title: Hot Summer Knights
// Author: Jon Ciolfi
// Video: https://www.youtube.com/watch?v=PBQug434mEE
// Source: https://cracking-the-cryptic.web.app/sudoku/g7ppbnGL3G

// Normal sudoku rules (rows, columns, 3x3 boxes). Identical digits cannot be
// a knight's move apart. Cages sum to their total with no repeated digit.
// Thermometers increase strictly from their bulb (circle-marked) to their
// unmarked tip.

const cages = [
  new Cage(9, 'R1C5', 'R2C5'),
  new Cage(13, 'R1C6', 'R2C6', 'R3C6'),
  new Cage(18, 'R4C7', 'R4C8', 'R4C9'),
  new Cage(5, 'R8C5', 'R9C5'),
  new Cage(15, 'R5C8', 'R5C9'),
  new Cage(18, 'R7C4', 'R8C4', 'R9C4'),
  new Cage(20, 'R6C1', 'R6C2', 'R6C3'),
  new Cage(15, 'R5C1', 'R5C2'),
];

// Four thermometers cross at R5C5. A single bulb circle sits on the shared
// center cell (not at either far end), so the drawn line is not one monotone
// chain -- each of the 8 arms is its own Thermo rooted at R5C5, per the
// bulb-circle placement (source overlay at R5C5).
const centerArms = [
  new Thermo('R5C5', 'R6C4', 'R7C3', 'R8C2'),
  new Thermo('R5C5', 'R4C6', 'R3C7', 'R2C8'),
  new Thermo('R5C5', 'R4C5', 'R3C5'),
  new Thermo('R5C5', 'R6C5', 'R7C5'),
  new Thermo('R5C5', 'R5C6', 'R5C7'),
  new Thermo('R5C5', 'R5C4', 'R5C3'),
  new Thermo('R5C5', 'R6C6'),
  new Thermo('R5C5', 'R4C4'),
];

// Four short two-cell thermometers, each with its own bulb circle.
const simpleThermos = [
  new Thermo('R2C3', 'R1C3'),
  new Thermo('R2C7', 'R1C7'),
  new Thermo('R9C7', 'R8C7'),
  new Thermo('R9C3', 'R8C3'),
];

// Two more junction shapes: two bulb-marked arms rise into a shared cell,
// which keeps rising into one more unmarked cell. The source draws this as
// two separate line entries touching at a vertex (R2C2 / R8C8); every other
// thermometer's low end carries a bulb circle and its high end does not, so
// by that same convention the unmarked-at-both-ends segment (R2C2-R2C1 /
// R8C8-R8C9) continues rising away from the marked junction, not into it.
const junctionThermos = [
  new Thermo('R1C2', 'R2C2'),
  new Thermo('R3C2', 'R2C2'),
  new Thermo('R2C2', 'R2C1'),
  new Thermo('R7C8', 'R8C8'),
  new Thermo('R9C8', 'R8C8'),
  new Thermo('R8C8', 'R8C9'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...centerArms,
  ...simpleThermos,
  ...junctionThermos,
  new AntiKnight(),
];
