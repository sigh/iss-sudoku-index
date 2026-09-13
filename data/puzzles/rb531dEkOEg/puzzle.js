// Title: Blue Waves
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=rb531dEkOEg
// Source: https://sudokupad.app/yp4utzkw3i

// Normal sudoku rules apply on the default 3x3 boxes (the payload's own
// region list is exactly those boxes). Six cyan thermometers require digits
// to strictly increase from the bulb. Three blue lines each cross one box
// border; the box border splits each into two segments that must sum equally
// (RegionSumLine's box-segment semantics match this rule exactly).

// Thermometers, bulb cell first. #4 is drawn tip-first in the payload -- its
// bulb underlay sits on R9C3, the stroke's last waypoint -- so it is listed
// bulb-first here as R9C3, R8C4.
const thermometers = [
  new Thermo('R5C2', 'R5C3', 'R4C4', 'R4C5', 'R4C6'),
  new Thermo('R2C1', 'R2C2', 'R2C3', 'R1C4', 'R1C5'),
  new Thermo('R9C2', 'R8C3', 'R7C4'),
  new Thermo('R9C3', 'R8C4'),
  new Thermo('R7C7', 'R8C8', 'R7C9', 'R8C9'),
  new Thermo('R7C2', 'R8C1'),
];

const regionSumLines = [
  new RegionSumLine('R3C6', 'R2C7', 'R2C8'),
  new RegionSumLine('R6C6', 'R5C7', 'R5C8'),
  new RegionSumLine('R8C6', 'R9C7', 'R9C8'),
];

return [
  new Shape('9x9'),
  ...thermometers,
  ...regionSumLines,
];
