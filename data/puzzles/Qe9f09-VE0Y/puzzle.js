// Title: The Twin's Response: Blue Thermometer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Qe9f09-VE0Y
// Source: https://cracking-the-cryptic.web.app/sudoku/6MgQ7783HF

// Normal sudoku rules apply (standard 3x3 boxes). Digits increase along
// thermometers from the bulb -- encoded with Thermo, bulb cell first. Two
// thermometers fork: a single grey stroke widens into one shared bulb, then
// splits into two arms. Each arm is its own Thermo call starting at the
// shared bulb cell (R3C5 or R7C5).
//
// Four cells (R3C5, R6C1, R6C9, R7C5) have a solid blue background. One of
// them is the sum of the other three; the rules do not say which, so this is
// a disjunction over all four candidates. Arrow(cell, ...rest) enforces
// cell == sum(rest) -- used here purely for that summation semantics, with
// no drawn arrow shaft on the board.

return [
  new Shape('9x9'),

  new Given('R5C5', 4),

  // Thermometers (grey stroke, round bulb; bulb cell listed first, digits
  // increase away from it). Items 4/5 and 7/8 are the two arms of a single
  // forked thermometer sharing one bulb.
  new Thermo('R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2'),
  new Thermo('R4C1', 'R5C1'),
  new Thermo('R1C4', 'R1C5'),
  new Thermo('R3C5', 'R3C4', 'R3C3', 'R4C3'),
  new Thermo('R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7'),
  new Thermo('R1C8', 'R2C9', 'R1C9', 'R2C8'),
  new Thermo('R7C5', 'R7C6', 'R7C7', 'R6C7', 'R6C8', 'R6C9'),
  new Thermo('R7C5', 'R7C4', 'R7C3', 'R6C3', 'R6C2', 'R6C1'),
  new Thermo('R7C8', 'R7C9'),
  new Thermo('R8C9', 'R9C9'),
  new Thermo('R8C6', 'R8C7', 'R9C7'),
  new Thermo('R9C4', 'R9C3'),

  // Blue cells: R3C5, R6C1, R6C9, R7C5. One equals the sum of the other
  // three; disjoin over which one, since nothing in the rules or art fixes
  // the assignment.
  new Or([
    new Arrow('R3C5', 'R6C1', 'R6C9', 'R7C5'),
    new Arrow('R6C1', 'R3C5', 'R6C9', 'R7C5'),
    new Arrow('R6C9', 'R3C5', 'R6C1', 'R7C5'),
    new Arrow('R7C5', 'R3C5', 'R6C1', 'R6C9'),
  ]),
];
