// Title: Ho Ho Ho Sudoku
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=hk5VMSv8txk
// Source: https://cracking-the-cryptic.web.app/sudoku/nLjq4d3ND3
//
// Normal sudoku rules apply. Digits increase along thermometers from the
// bulb to the end(s). The black dot marks a pair of neighbouring cells with
// a ratio of 2:1; other such pairs may be unmarked, so no negative/StrictKropki
// constraint is added over the rest of the grid.
//
// Three thermometers (brown, #EB7532) are simple bulb-to-end paths.
// Three thermometers (yellowgreen, #A3E048) are each drawn as three
// separate strokes sharing cells, forming a branching tree with one bulb
// and two leaves: every value must be greater than its parent toward the
// bulb along each arm. One drawn stroke per green group runs leaf-to-leaf
// through the shared branch cell in the middle of its own waypoint list
// (not bulb-to-end order), so it is split into two 2-cell Thermos on the
// branch cell rather than encoded as a single 3-cell run in payload order.
// The branch structure was derived from which cells the three strokes of
// each group actually share, not from any one stroke's own listed direction.

return [
  new Shape('9x9'),

  // Brown thermometers: single bulb-to-end paths, in bulb-first order.
  new Thermo('R3C4', 'R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6', 'R3C5'),
  new Thermo('R5C7', 'R6C7', 'R6C8', 'R6C9', 'R5C9', 'R4C9', 'R4C8', 'R4C7'),
  // Drawn tip-first (bulb circle sits on the last drawn cell R8C6); encoded
  // reversed so the list itself runs bulb-to-end.
  new Thermo('R8C6', 'R9C6', 'R9C5', 'R9C4', 'R8C4', 'R7C4', 'R7C5', 'R7C6'),

  // Green branching thermometer 1, bulb R1C1.
  // Trunk R1C1-R2C1-R2C2-R2C3, combining the two drawn strokes that already
  // run bulb-to-end in their own listed order (R1C1-R2C1-R3C1 and
  // R2C1-R2C2-R2C3), sharing cell R2C1.
  new Thermo('R1C1', 'R2C1', 'R2C2', 'R2C3'),
  // Leaf at the R2C1 fork.
  new Thermo('R2C1', 'R3C1'),
  // Fork at R2C3 into two leaves (drawn as one stroke R1C3-R2C3-R3C3, i.e.
  // leaf-to-leaf through the branch cell in the middle: split it).
  new Thermo('R2C3', 'R1C3'),
  new Thermo('R2C3', 'R3C3'),

  // Green branching thermometer 2, bulb R4C6.
  // Trunk R4C6-R5C6-R5C5-R5C4 (drawn stroke R5C4-R5C5-R5C6 runs the reverse
  // direction, away from the bulb, so it is reversed here).
  new Thermo('R4C6', 'R5C6', 'R5C5', 'R5C4'),
  new Thermo('R5C6', 'R6C6'),
  // Fork at R5C4 (drawn stroke R4C4-R5C4-R6C4 runs leaf-to-leaf through the
  // branch cell in the middle: split it).
  new Thermo('R5C4', 'R4C4'),
  new Thermo('R5C4', 'R6C4'),

  // Green branching thermometer 3, bulb R7C3.
  // Trunk R7C3-R8C3-R8C2-R8C1 (drawn stroke R8C1-R8C2-R8C3 runs the reverse
  // direction, away from the bulb, so it is reversed here).
  new Thermo('R7C3', 'R8C3', 'R8C2', 'R8C1'),
  new Thermo('R8C3', 'R9C3'),
  // Fork at R8C1 (drawn stroke R7C1-R8C1-R9C1 runs leaf-to-leaf through the
  // branch cell in the middle: split it).
  new Thermo('R8C1', 'R7C1'),
  new Thermo('R8C1', 'R9C1'),

  // Black (Kropki) dot: R7C8 and R8C8 are in a 2:1 ratio.
  new BlackDot('R7C8', 'R8C8'),
];
