// Title: Missing Bulbs
// Author: Ben Needham
// Video: https://www.youtube.com/watch?v=a7WDneSM7u0
// Source: https://app.crackingthecryptic.com/sudoku/p8d8bpffq6
//
// Normal sudoku rules (standard 3x3 boxes; no givens). Nine thermometers:
// digits increase from the bulb. Three of the nine (drawn as a filled
// circle at one end) have their bulb shown; the other six do not, and which
// end is the bulb is left for solving logic to determine, so each of those
// is encoded as an Or of both directions.

function thermo(cells) {
  return new Thermo(...cells);
}

function eitherDirectionThermo(cells) {
  return new Or([
    new Thermo(...cells),
    new Thermo(...cells.slice().reverse()),
  ]);
}

// Bulb shown (bulb-first order; two of the three are drawn tip-first in the
// payload, bulb circle on the last waypoint cell, so reversed here).
const bulbedThermos = [
  thermo(['R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3']),
  thermo(['R8C2', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1']),
  thermo(['R8C8', 'R7C9', 'R7C8', 'R7C7', 'R8C7', 'R8C6']),
];

// Bulb not shown: either end may be the bulb.
const unbulbedThermos = [
  eitherDirectionThermo(['R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2']),
  eitherDirectionThermo(['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R3C4']),
  eitherDirectionThermo(['R2C7', 'R2C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9']),
  eitherDirectionThermo(['R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8']),
  eitherDirectionThermo(['R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5']),
  eitherDirectionThermo(['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8']),
];

return [
  new Shape('9x9'),
  ...bulbedThermos,
  ...unbulbedThermos,
];
