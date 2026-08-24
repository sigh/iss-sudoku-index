// Title: I am 2CTacus
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=KWFHQVBo7EA
// Source: https://app.crackingthecryptic.com/sudoku/jNj6NhQJQ2

// Normal sudoku rules apply. Digits along thermometers must increase from
// bulb to tip. The payload draws 40 two-cell thermometers (each a bare
// bulb-to-tip domino, no straight run beyond the two endpoints); the circle
// overlays are the bulb markers on those same 40 lines, not a separate clue.
// Each pair below is (bulb, tip): bulb cell first per the payload's
// `bulbCell`, taken from the drawn waypoints -- most lines are drawn
// bulb-first, but several are drawn tip-first (bulb is the LAST waypoint),
// so the pairs are given in bulb-first order regardless of draw order.
const thermoPairs = [
  ['R1C1', 'R1C2'],
  ['R1C3', 'R2C2'],
  ['R2C3', 'R1C4'],
  ['R2C5', 'R1C5'],
  ['R1C6', 'R2C6'],
  ['R1C7', 'R1C8'],
  ['R2C9', 'R1C9'],
  ['R3C1', 'R2C1'],
  ['R3C3', 'R2C4'],
  ['R3C6', 'R2C7'],
  ['R3C9', 'R2C8'],
  ['R4C3', 'R3C2'],
  ['R3C4', 'R4C5'],
  ['R3C5', 'R4C6'],
  ['R3C7', 'R4C8'],
  ['R3C8', 'R4C9'],
  ['R4C1', 'R4C2'],
  ['R5C3', 'R4C4'],
  ['R4C7', 'R5C6'],
  ['R5C1', 'R5C2'],
  ['R6C3', 'R5C4'],
  ['R6C4', 'R5C5'],
  ['R5C7', 'R6C6'],
  ['R5C9', 'R5C8'],
  ['R7C2', 'R6C1'],
  ['R7C3', 'R6C2'],
  ['R6C7', 'R7C8'],
  ['R6C9', 'R6C8'],
  ['R7C1', 'R8C2'],
  ['R7C4', 'R8C3'],
  ['R7C6', 'R7C5'],
  ['R7C7', 'R8C6'],
  ['R7C9', 'R8C9'],
  ['R8C1', 'R9C1'],
  ['R9C4', 'R8C4'],
  ['R9C5', 'R8C5'],
  ['R8C7', 'R9C6'],
  ['R9C7', 'R8C8'],
  ['R9C3', 'R9C2'],
  ['R9C9', 'R9C8'],
];

const thermos = thermoPairs.map(
  ([bulb, tip]) => new Thermo(bulb, tip)
);

return [new Shape('9x9'), ...thermos];
