// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Kgw2d0X5vDU
// Source: https://cracking-the-cryptic.web.app/sudoku/rttQ3883Fn

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no jigsaw).
// Along thermometers, digits increase from the bulb end. Nine thermometers
// are drawn (grey lines), each bulb marked by a matching grey circle
// underlay at the line's first waypoint. Two of the nine (the third and
// fourth below) share a single bulb cell R2C5: the payload draws that
// bulb's two arms as two separate strokes fused at R2C5, so each drawn
// segment is encoded as its own Thermo, both increasing away from the
// shared bulb.

// Thermo(...cells): first cell is the bulb; values strictly increase from
// there. Paths taken from the drawn waypoints (grid cell centres at
// half-integers); each path's first cell matches a drawn grey circle
// underlay (the bulb).
const thermos = [
  new Thermo('R4C2', 'R4C3', 'R3C3', 'R2C3', 'R1C3', 'R1C2'),
  new Thermo('R4C1', 'R3C1', 'R2C1', 'R2C2'),
  new Thermo('R2C5', 'R1C5', 'R1C6', 'R1C7', 'R1C8'),
  new Thermo('R2C5', 'R2C6', 'R2C7', 'R2C8'),
  new Thermo('R4C4', 'R5C4'),
  new Thermo('R7C5', 'R6C5', 'R6C6', 'R6C7'),
  new Thermo('R7C2', 'R8C2', 'R9C2', 'R9C3', 'R8C3'),
  new Thermo('R9C9', 'R9C8', 'R9C7', 'R9C6', 'R8C6', 'R8C7'),
  new Thermo('R7C7', 'R7C8', 'R7C9', 'R8C9', 'R8C8'),
];

return [
  new Shape('9x9'),
  ...thermos,
];
