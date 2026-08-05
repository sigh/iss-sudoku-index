// Title: BYO Renbanmometers
// Author: Memeristor
// Video: https://www.youtube.com/watch?v=jj7Ib9ESaL0
// Source: https://app.crackingthecryptic.com/sudoku/tgLhMqqHrm

// Normal Sudoku and the given R4C4=8 apply. Each bulb-to-tip pair belongs to an
// increasing consecutive renbanometer; the undiscovered routes, including their
// movement and non-crossing requirements, are omitted. The retained endpoint fact
// is that every matching tip is greater than its bulb.
const increasing = Pair.fnToKey((bulb, tip) => bulb < tip, 9);

// Matching lettered and coloured bulb/tip markers transcribed from the drawing.
const endpoints = [
  ['R1C4', 'R2C2'], ['R2C4', 'R4C7'], ['R3C3', 'R5C5'],
  ['R4C2', 'R7C4'], ['R4C6', 'R6C5'], ['R5C6', 'R5C4'],
  ['R7C9', 'R6C9'], ['R8C9', 'R7C7'], ['R9C5', 'R5C3'],
];

return [
  new Shape('9x9'),
  new Given('R4C4', 8),
  ...endpoints.map(([bulb, tip]) => new Pair(increasing, 'bulb-to-tip', bulb, tip)),
];
