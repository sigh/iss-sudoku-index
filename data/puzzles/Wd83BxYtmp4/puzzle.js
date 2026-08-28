// Title: Jellyfish Sudoku
// Author: Sammi Shi
// Video: https://www.youtube.com/watch?v=Wd83BxYtmp4
// Source: https://cracking-the-cryptic.web.app/sudoku/h9Th7b647r

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no jigsaw; no
// givens). Along thermometers, digits must increase from the bulb end.
//
// The payload draws 7 grey lines, each with a matching grey bulb-circle
// underlay marking a bulb cell. Five bulbs sit at a line endpoint (a single
// increasing run). Two bulbs sit mid-path, splitting that line into two
// increasing runs sharing the bulb cell -- a `Thermo` is monotonic along its
// whole cell list, so a bulb in the middle of the drawn path cannot be one
// run; it is encoded as two Thermo constraints that both start at the shared
// bulb cell.

// Simple thermometers, one bulb-circle underlay per line, cell order taken
// from the drawn waypoints (bulb-first). One line (bulb R4C2) is drawn
// tip-first in the payload -- its bulb underlay sits on the LAST waypoint --
// so its cell order below is reversed from the raw wayPoints list.
const simpleThermos = [
  new Thermo('R4C2', 'R5C2', 'R6C3', 'R7C4', 'R8C4'),
  new Thermo('R8C2', 'R8C3'),
  new Thermo('R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C7'),
  new Thermo('R8C8', 'R8C9'),
  new Thermo('R1C7', 'R1C8'),
];

// Branching thermometers: the bulb-circle underlay sits mid-path, so the
// drawn line is two increasing runs sharing that bulb cell as their first
// cell. Cell order taken from the drawn waypoints on each side of the bulb.
const branchingThermos = [
  new Thermo('R2C2', 'R1C3', 'R1C4', 'R1C5', 'R2C6'),
  new Thermo('R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C2'),
  new Thermo('R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R6C8'),
  new Thermo('R2C3', 'R2C4', 'R2C5', 'R3C6', 'R3C7', 'R4C8'),
];

return [
  new Shape('9x9'),
  ...simpleThermos,
  ...branchingThermos,
];
