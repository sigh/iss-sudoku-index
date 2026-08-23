// Title: Dark Ages Carnival
// Author: BMEP
// Video: https://www.youtube.com/watch?v=8714zAywJI0
// Source: https://app.crackingthecryptic.com/sudoku/TGJ629Qqm4

// Normal sudoku rules apply. One arrow: R3C5+R2C5 sum to the circled digit at
// R4C5 (bulb R4C5, confirmed by the underlay circle drawn there; the
// payload's second arrows entry has no waypoints and draws nothing, so it is
// not encoded). One white dot, R4C5/R5C5, marks a consecutive pair -- not all
// white dots are given, so no exhaustiveness applies to dots. Ten X marks (sum
// to 10) and five V marks (sum to 5) are drawn on cell edges; "ALL Xs and Vs
// are given" makes that list exhaustive, so StrictXV additionally forbids the
// X/V relation on every other adjacent pair in the grid.

const arrow = ['R4C5', 'R3C5', 'R2C5'];

const whiteDots = [
  ['R4C5', 'R5C5'],
];

// Edge provenance: text overlays "X" drawn on the shared cell edge.
const xPairs = [
  ['R1C7', 'R1C8'],
  ['R3C6', 'R4C6'],
  ['R4C2', 'R4C3'],
  ['R4C1', 'R5C1'],
  ['R7C1', 'R8C1'],
  ['R9C3', 'R9C4'],
  ['R9C8', 'R9C9'],
  ['R6C7', 'R7C7'],
  ['R5C7', 'R5C8'],
  ['R4C4', 'R5C4'],
];

// Edge provenance: text overlays "V" drawn on the shared cell edge.
const vPairs = [
  ['R2C8', 'R2C9'],
  ['R3C1', 'R3C2'],
  ['R4C6', 'R5C6'],
  ['R4C9', 'R5C9'],
  ['R4C1', 'R4C2'],
];

return [
  new Shape('9x9'),
  new Arrow(...arrow),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...xPairs.map(cells => new X(...cells)),
  ...vPairs.map(cells => new V(...cells)),
  new StrictXV(),
];
