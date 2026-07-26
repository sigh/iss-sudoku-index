// Title: Sydney Harbour Bridge
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=hFwWDo1228M
// Source: https://sudokupad.app/ga32uqsobl

// Normal sudoku, one given. Orange lines: adjacent digits differ by >= 4
// (Whisper(4)). Blue lines: RegionSumLine (equal sum per box-crossed
// segment). Purple line: Renban (consecutive set, any order). X marks:
// the two named cells sum to 10 (not all Xs are given, so absence of a
// mark carries no information).
//
// Two orange strokes are drawn as one polyline that revisits an earlier
// waypoint, i.e. they branch: R7C5 (arms to R6C4, R8C5, R6C6, across two
// stroke entries) and R4C8 (arms to R3C7 and R4C9, plus the closed loop
// R4C8-R5C8-R6C8-R6C9-R5C9-R4C9-R4C8, all one stroke entry). Whisper only
// constrains consecutive pairs in its cell list, so the raw interpolated
// path -- including the repeated branch cell -- is passed through as-is;
// this reproduces exactly the drawn adjacent pairs, including the closed
// loop's wrap-around edge.

const whispers = [
  ['R7C3', 'R7C2', 'R8C2', 'R8C3', 'R9C3', 'R9C2'],
  ['R6C4', 'R7C5', 'R8C5'],
  ['R7C5', 'R6C6'],
  ['R8C9', 'R9C8', 'R9C7', 'R8C7', 'R7C7', 'R7C8', 'R8C9'],
  ['R2C4', 'R2C5', 'R2C6', 'R3C7', 'R4C8', 'R5C8', 'R6C8', 'R6C9', 'R5C9', 'R4C9', 'R4C8'],
  ['R2C4', 'R3C3', 'R4C2', 'R5C2', 'R6C2', 'R6C1', 'R5C1', 'R4C1', 'R4C2'],
];

const regionSumLines = [
  ['R3C3', 'R4C3', 'R5C3'],
  ['R2C4', 'R3C4', 'R4C4', 'R5C4'],
  ['R2C5', 'R3C5', 'R4C5', 'R5C5'],
  ['R2C6', 'R3C6', 'R4C6', 'R5C6'],
  ['R3C7', 'R4C7', 'R5C7'],
];

const xPairs = [
  ['R2C3', 'R3C3'],
  ['R4C8', 'R4C9'],
  ['R3C7', 'R4C7'],
];

return [
  new Shape('9x9'),
  new Given('R9C5', 8),
  ...whispers.map(cells => new Whisper(4, ...cells)),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  new Renban('R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8'),
  ...xPairs.map(cells => new X(...cells)),
];
