// Title: 20/11/21: Return of the Clones
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=8Dt_fnJaQJs
// Source: https://tinyurl.com/v844n3ee

// Normal sudoku rules apply. Blue regions are clones, and must contain the
// same digits in the same relative positions. Digits along thermometers must
// strictly increase from bulb to tip.
// Nothing is omitted.

const givens = [
  new Given('R3C6', 6), new Given('R4C8', 8), new Given('R5C1', 1),
  new Given('R5C9', 9), new Given('R6C2', 2), new Given('R7C4', 7),
];

// Four blue 2x2 clone regions (payload cell colour #D0D0FF), transcribed from
// the grid's `c` fields. All four are drawn in the same top-left/top-right/
// bottom-left/bottom-right orientation -- no rotation or reflection between
// any pair -- so each region's array below lists its cells in that shared
// order and the arrays line up index-by-index across all four regions.
const regionA = ['R1C8', 'R1C9', 'R2C8', 'R2C9'];
const regionB = ['R3C3', 'R3C4', 'R4C3', 'R4C4'];
const regionC = ['R6C6', 'R6C7', 'R7C6', 'R7C7'];
const regionD = ['R8C1', 'R8C2', 'R9C1', 'R9C2'];

// One SameValues(4, ...) per shared offset: four singleton sets forces that
// one position's value to agree across all four regions, i.e. positional
// equality at that offset. (A single SameValues over the whole 4-cell regions
// would only require the four regions' value multisets to match, not that
// each position agrees, so the regions are paired one cell at a time.)
const clones = regionA.map((a, i) =>
  new SameValues(4, a, regionB[i], regionC[i], regionD[i]));

const thermos = [
  new Thermo('R2C3', 'R2C4', 'R3C5', 'R4C5', 'R5C4', 'R5C3', 'R4C2', 'R3C2'),
  new Thermo('R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9'),
  new Thermo('R9C3', 'R8C3', 'R7C3', 'R7C2', 'R7C1'),
  new Thermo('R7C5', 'R8C6', 'R8C7'),
  new Thermo('R7C8', 'R6C8', 'R5C7', 'R5C6', 'R6C5'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...clones,
  ...thermos,
];
