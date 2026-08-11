// Title: Railcars
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=CLmbNVDbWbY
// Source: https://app.crackingthecryptic.com/sudoku/GLQDDLDDbT

// Normal sudoku rules apply. Each purple line must contain a set of
// consecutive, non-repeating digits, in any order (Renban), and for each
// line, digits on it have an equal sum N within each box it passes through
// (RegionSumLine) -- matching the puzzle's own worked example (line #0
// below is exactly the "r1c6 = r1c7 + r2c7" case named in the rules text).
// Cell order below follows each line's drawn path, walked waypoint to
// waypoint.
const purpleLines = [
  ['R1C6', 'R1C7', 'R2C7'],
  ['R4C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5'],
  ['R4C2', 'R4C3', 'R4C4', 'R4C5', 'R3C6', 'R4C7', 'R4C8', 'R3C9', 'R2C9'],
  ['R5C4', 'R6C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R6C9'],
  ['R8C1', 'R7C1', 'R6C2', 'R6C3', 'R7C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R7C3', 'R8C3', 'R9C3', 'R9C4', 'R9C5'],
];

return [
  new Shape('9x9'),
  ...purpleLines.flatMap(cells => [
    new Renban(...cells),
    new RegionSumLine(...cells),
  ]),
];
