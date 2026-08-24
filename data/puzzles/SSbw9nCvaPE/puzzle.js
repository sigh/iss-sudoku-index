// Title: Fun with Thermos
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=SSbw9nCvaPE
// Source: https://app.crackingthecryptic.com/sudoku/NB4PdB4LHR

// Normal sudoku rules apply. Along thermometers, digits increase from the
// bulb to the tip; Thermo() takes cells bulb-first and enforces strict
// increase along consecutive pairs.
//
// Cell lists below are transcribed bulb-first from the drawn thermometer
// strokes (some lines are drawn tip-first in the payload and were reversed
// to bulb-first order per the bulb overlay circle on each thermometer).
//
// The thermometer at R8C9 is drawn as two separate strokes that share their
// start point (R8C9), with a single bulb-circle overlay there and no bulb
// overlay on any other cell of either stroke: a forked thermometer with one
// bulb and two arms. Each arm is encoded as its own Thermo starting at the
// shared bulb cell, so digits increase independently along each arm from
// R8C9.

return [
  new Shape('9x9'),

  new Thermo('R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2'),
  new Thermo('R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8', 'R3C8'),
  new Thermo('R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'),
  new Thermo('R3C6', 'R3C7'),
  new Thermo('R5C2', 'R6C2'),
  new Thermo('R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2'),
  new Thermo('R9C1', 'R8C1', 'R7C1', 'R6C1'),
  new Thermo('R8C2', 'R8C3'),
  new Thermo('R9C4', 'R9C3', 'R9C2'),
  new Thermo('R9C5', 'R9C6', 'R9C7'),
  new Thermo('R8C6', 'R8C7', 'R8C8'),
  new Thermo('R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'),
  // Forked thermometer, shared bulb R8C9 (see note above).
  new Thermo('R8C9', 'R7C8', 'R7C9'),
  new Thermo('R8C9', 'R9C9'),
];
