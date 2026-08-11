// Title: Bastille Day
// Author: Full Deck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=auoA3jEx75Y
// Source: https://app.crackingthecryptic.com/sudoku/PNnGjgLp2Q

// Normal sudoku rules apply. Blue (fortress) cells must be larger than
// orthogonally adjacent non-blue cells. Digits on thermometers must increase
// from bulb to tip, not necessarily consecutively; a red circle marks each
// bulb (ISS's own Thermo display convention puts its start marker on cell 0).
// Several thermometers are drawn as two strokes meeting at a shared interior
// cell -- per the SudokuPad payload schema this is one branching figure, not
// two independent lines -- so each is read outward from its single marked
// bulb through the shared cell: boxes 1 and 9 each carry a 4-armed
// "firework" from a centre bulb (matching the rules' "firework explosions"),
// boxes 3 and 7 a 3-tipped "fleur-de-lis" from an off-centre bulb through a
// shared stem cell (matching the rules' "fleur-de-lis"), and the four
// thermometers framing box 5 are bent 2-armed thermometers with the bulb at
// the bend.

const givens = [
  ['R1C5', 1], ['R1C6', 4], ['R1C9', 7],
  ['R6C1', 5],
  ['R9C4', 1], ['R9C5', 7], ['R9C6', 8], ['R9C7', 9],
];

// Bulb-rooted thermometer arms, each starting at its bulb and ending at its
// tip. Transcribed from the drawn line paths and the red circles marking
// each bulb cell.
const thermoArms = [
  // Box 1 firework: bulb R2C2 (box centre), 4 length-1 arms.
  ['R2C2', 'R1C2'], ['R2C2', 'R3C2'], ['R2C2', 'R2C1'], ['R2C2', 'R2C3'],
  // Box 9 firework: bulb R8C8 (box centre), 4 length-1 arms.
  ['R8C8', 'R7C8'], ['R8C8', 'R9C8'], ['R8C8', 'R8C7'], ['R8C8', 'R8C9'],
  // Box 3 fleur-de-lis: bulb R3C8, shared stem R2C8, 3 tips.
  ['R3C8', 'R2C8', 'R1C8'], ['R3C8', 'R2C8', 'R1C7'], ['R3C8', 'R2C8', 'R1C9'],
  // Box 7 fleur-de-lis: bulb R9C2, shared stem R8C2, 3 tips.
  ['R9C2', 'R8C2', 'R7C2'], ['R9C2', 'R8C2', 'R7C1'], ['R9C2', 'R8C2', 'R7C3'],
  // Box-5-framing bent thermometers: bulb at the bend, 2 arms each.
  ['R6C4', 'R6C3', 'R6C2'], ['R6C4', 'R7C4', 'R8C4'],
  ['R6C6', 'R6C7', 'R6C8'], ['R6C6', 'R7C6', 'R8C6'],
  ['R4C6', 'R4C7', 'R4C8'], ['R4C6', 'R3C6', 'R2C6'],
  ['R4C4', 'R4C3', 'R4C2'], ['R4C4', 'R3C4', 'R2C4'],
];

// Fortress (blue) cells, transcribed from the drawn blue cell shading.
const fortressCells = [
  'R2C4', 'R3C4', 'R4C3', 'R4C2', 'R2C6', 'R3C6', 'R4C7', 'R4C8',
  'R6C8', 'R6C7', 'R7C6', 'R8C6', 'R8C4', 'R7C4', 'R6C3', 'R6C2',
];
const fortressSet = new Set(fortressCells);

// Each fortress cell must be greater than its orthogonally-adjacent non-blue
// neighbours. GreaterThan(a, b, c, ...) enforces a > (each later cell that is
// adjacent to an earlier one), so listing the fortress cell first gives
// exactly "blue > each non-blue neighbour". Each fortress cell's one blue
// neighbour (its arm partner) is left out of its own list: the rule only
// compares blue cells against non-blue neighbours, and is silent on
// blue-blue adjacency.
const graph = cellGraph('9x9');
const fortress = fortressCells.map(cell => new GreaterThan(
  cell, ...graph.neighbours(cell).filter(n => !fortressSet.has(n))
));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...thermoArms.map(cells => new Thermo(...cells)),
  ...fortress,
];
