// Title: Pluto (Dwarf Planet)
// Author: Blobz
// Video: https://www.youtube.com/watch?v=XFPaeHQsgHs
// Source: https://app.crackingthecryptic.com/sudoku/f7663Bj2bL

// Normal sudoku on a 4x4 grid with default 2x2 boxes (Shape('4x4')).
// Region Sum Lines: digits along a blue line sum to an equal value N within
// each 2x2 box the line passes through; different lines may use different N.
// The three lines below are transcribed from the drawn wayPoints.
return [
  new Shape('4x4'),

  // Line cells transcribed from the drawn line waypoints.
  new RegionSumLine('R1C1', 'R2C2', 'R3C1'),
  new RegionSumLine('R1C3', 'R2C3', 'R3C2'),
  new RegionSumLine('R2C4', 'R3C3', 'R4C2'),
];
