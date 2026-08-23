// Title: Clock Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=2i4l7DtQFws
// Source: https://app.crackingthecryptic.com/sudoku/bf3bJ4r6HP

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, digits 1-9, no
// zero -- ISS's default 9x9 shape). Eight digital displays are drawn as
// grey-bordered boxes with a colon between their 2nd and 3rd cell; each must
// read HH:MM as a valid 24-hour time (00-23 : 00-59).
//
// With digits restricted to 1-9 (no 0 available), "00 <= HH <= 23" and
// "00 <= MM <= 59" reduce to per-cell/pair restrictions, derived here rather
// than hand-picked so a reviewer can check the arithmetic against the rule:
//   - hoursTens (d1) in 1-9, HH = 10*d1 + d2 <= 23 forces d1 <= 2 (d1 = 3
//     already gives HH >= 31).
//   - d1 = 1 gives HH in 11-19, always <= 23: no restriction on d2 beyond
//     the grid's own 1-9.
//   - d1 = 2 needs d2 <= 3 to keep HH <= 23.
//   - minutesTens (d3) in 1-9, MM = 10*d3 + d4 <= 59 forces d3 <= 5 (d3 = 6
//     already gives MM >= 61); with d3 <= 5 the max MM is 10*5+9 = 59, so d4
//     needs no restriction beyond the grid's own 1-9.
// So each display needs: d1 in {1,2}; if d1=2 then d2 in {1,2,3} (else d2
// unrestricted); d3 in {1,2,3,4,5}; d4 unrestricted.

const displays = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R3C5', 'R3C6', 'R3C7', 'R3C8'],
  ['R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4'],
  ['R7C2', 'R7C3', 'R7C4', 'R7C5'],
  ['R8C4', 'R8C5', 'R8C6', 'R8C7'],
  ['R9C6', 'R9C7', 'R9C8', 'R9C9'],
];

const hourTensRestrictions = displays.map(([d1]) => new Given(d1, 1, 2));
const minuteTensRestrictions = displays.map(([, , d3]) => new Given(d3, 1, 2, 3, 4, 5));
const hourPairRestrictions = displays.map(([d1, d2]) =>
  new Pair(
    Pair.fnToKey((a, b) => a === 1 || (a === 2 && b <= 3), 9),
    'clock-hours',
    d1, d2,
  ));

return [
  new Shape('9x9'),

  new Given('R1C8', 3), new Given('R1C9', 4),
  new Given('R2C9', 5),
  new Given('R3C1', 4), new Given('R3C2', 6),
  new Given('R4C4', 7),
  new Given('R5C5', 8),
  new Given('R6C6', 9),
  new Given('R7C8', 6), new Given('R7C9', 9),
  new Given('R8C1', 5),
  new Given('R9C1', 6), new Given('R9C2', 7),

  ...hourTensRestrictions,
  ...minuteTensRestrictions,
  ...hourPairRestrictions,
];
