// Title: 5K 5T
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=R2MA1QRIpmw
// Source: https://app.crackingthecryptic.com/sudoku/hfFNPbgfND

// Rules encoded below:
//  - Normal sudoku rules apply (default Shape all-different rows/cols/boxes;
//    the drawn regions are the standard 3x3 boxes).
//  - Killer cage: digits sum to the printed total and cannot repeat within
//    the cage (Cage(sum, ...cells) is exactly distinct + sum-to-total).
//  - Thermometer: digits strictly increase from the bulb end (Thermo's first
//    argument is the bulb; the bulb end of each line below is the first cell
//    listed, which also carries the drawn grey circle in the payload's
//    underlays, confirming which end is the bulb).

// Killer cages (payload `cages` array; cell order as listed in the payload).
const cages = [
  { cells: ['R1C2', 'R1C1', 'R2C1', 'R3C1'], total: 27 },
  { cells: ['R8C1', 'R9C1', 'R9C2', 'R8C2'], total: 14 },
  { cells: ['R7C3', 'R7C4', 'R7C5'], total: 20 },
  { cells: ['R8C6', 'R9C6', 'R9C5'], total: 11 },
  { cells: ['R8C7', 'R9C7', 'R9C8'], total: 21 },
];

// Thermometers (payload `lines` array; bulb = first waypoint of each line,
// matching the grey circle underlay drawn at that same cell).
const thermos = [
  ['R5C1', 'R6C2', 'R5C2', 'R4C3'],
  ['R2C6', 'R3C6', 'R4C5', 'R5C6', 'R6C6', 'R7C7'],
  ['R3C7', 'R4C7'],
  ['R3C9', 'R2C9', 'R1C8', 'R1C7'],
  ['R6C9', 'R5C9', 'R6C8'],
];

return [
  new Shape('9x9'),

  ...cages.map(({ cells, total }) => new Cage(total, ...cells)),

  ...thermos.map((cells) => new Thermo(...cells)),
];
