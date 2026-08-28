// Title: Thermonuclear Sudoku
// Author: Dennis Parkes
// Video: https://www.youtube.com/watch?v=_ufKz5eLtNM
// Source: https://cracking-the-cryptic.web.app/sudoku/RNpLLpqdGD

// Normal sudoku rules apply. Digits along each thermometer increase from the
// bulb (round end) to the tip.
//
// The drawn geometry has a bulb mark sitting at an interior cell (not an
// endpoint) of several drawn lines, and some lines share cells with each
// other. A strictly-increasing thermometer cannot have its minimum in the
// middle of a plain chain, so each such bulb forces a branch at the cell it
// sits on; a headless line ending exactly on another line's interior cell is
// the same branching figure continued, not a second thermometer. That
// recovers two 2-armed corner thermometers, six ordinary single-tip
// thermometers, and one 6-armed star centred on R5C5 (three trunks out of
// the bulb, each forking into two tips).

// Corner bulbs: a bulb underlay sits at the bend of a 3-cell drawn line, so
// each line is really two 2-cell arms sharing that bulb.
const cornerThermos = [
  new Thermo('R1C1', 'R1C2'),
  new Thermo('R1C1', 'R2C1'),
  new Thermo('R9C9', 'R8C9'),
  new Thermo('R9C9', 'R9C8'),
];

// Ordinary thermometers: one bulb at a true path endpoint each.
const plainThermos = [
  new Thermo('R2C9', 'R1C9', 'R1C8'),
  new Thermo('R8C1', 'R9C1', 'R9C2'),
  new Thermo('R6C3', 'R5C3'),
  new Thermo('R4C3', 'R3C4'),
  new Thermo('R6C7', 'R7C6', 'R7C5', 'R7C4'),
  new Thermo('R3C5', 'R3C6', 'R4C7', 'R5C7'),
];

// Central hub: bulb R5C5, three trunks, each forking into two tips. Each
// Thermo below is one root-to-tip path; R5C5 and each trunk's branch cell
// are deliberately repeated across the two paths that share them, since
// Thermo only expresses one linear chain.
const hubThermos = [
  new Thermo('R5C5', 'R6C5', 'R7C5', 'R8C4', 'R8C3', 'R7C2'),
  new Thermo('R5C5', 'R6C5', 'R7C5', 'R8C6', 'R8C7', 'R7C8'),
  new Thermo('R5C5', 'R4C4', 'R3C3', 'R2C3', 'R1C4'),
  new Thermo('R5C5', 'R4C4', 'R3C3', 'R4C2', 'R5C1', 'R6C1'),
  new Thermo('R5C5', 'R4C6', 'R3C7', 'R2C7', 'R1C6'),
  new Thermo('R5C5', 'R4C6', 'R3C7', 'R4C8', 'R5C9', 'R6C9'),
];

return [
  new Shape('9x9'),
  new Given('R8C5', 8),
  ...cornerThermos,
  ...plainThermos,
  ...hubThermos,
];
