// Title: Region Sum Lines
// Author: Qodec
// Video: https://www.youtube.com/watch?v=RXOxRJdEP60
// Source: https://app.crackingthecryptic.com/sudoku/PLhnmLPH8b

// Normal sudoku rules (default rows/cols/boxes). No givens. Nine purple
// lines: digits on each line have an equal sum N within each box the line
// passes through, and a box the same line revisits gets its own separate
// equal-sum segment (N may differ line to line). This is exactly
// RegionSumLine's semantics, so each line is one RegionSumLine call over its
// cells in drawn walk order; RegionSumLine splits a cell list into segments
// itself whenever consecutive cells change box, including a repeat visit to
// an earlier box, so no manual segmentation is needed here.

// Line cells transcribed from the drawn line waypoints, interpolated at
// cell centres (the puzzle's first nine drawn lines; a tenth carries no
// waypoints and renders nothing, so it is excluded).
const lines = [
  // 0: revisits box4 three times and box7 twice.
  ['R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R3C2', 'R4C2', 'R5C2',
    'R6C2', 'R7C2', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C4', 'R3C5'],
  // 1
  ['R3C3', 'R2C2', 'R1C2', 'R2C3', 'R1C4', 'R1C5', 'R2C5', 'R2C6', 'R2C7',
    'R1C7', 'R1C8', 'R2C8', 'R3C8'],
  // 2
  ['R4C6', 'R5C7', 'R5C8'],
  // 3
  ['R5C6', 'R6C7', 'R7C6', 'R7C5'],
  // 4
  ['R8C6', 'R7C7', 'R7C8', 'R6C9'],
  // 5
  ['R9C1', 'R9C2', 'R8C3', 'R9C4'],
  // 6
  ['R8C2', 'R9C3', 'R8C4'],
  // 7: both segments are single cells (R6C8 in box6, R7C9 in box9), so this
  // pins R6C8 = R7C9.
  ['R6C8', 'R7C9'],
  // 8
  ['R7C4', 'R6C4', 'R6C5', 'R6C6'],
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new RegionSumLine(...cells)),
];
