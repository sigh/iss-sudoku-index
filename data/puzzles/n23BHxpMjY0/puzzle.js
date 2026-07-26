// Title: Decapitated
// Author: Black_Doom
// Video: https://www.youtube.com/watch?v=n23BHxpMjY0
// Source: https://sudokupad.app/dndxixp4qb

// Chaos Construction: the solver deduces nine 9-cell orthogonally-connected
// regions; rows, columns and regions are all-different, with no fixed boxes.
//
// Each arrow encodes three facts about its circle (bulb) digit:
//  1. it equals the sum of the line-cell digits (Arrow);
//  2. the line cells all share one region, and the bulb is in a different
//     region (region-label overlay equality / inequality);
//  3. it also equals the count of the bulb's own-region cells visible from
//     it along its row and column, itself counted once, stopping at the
//     first cell of another region or the grid edge in each of the four
//     directions (ChaosArrow with auto-generated 4-way arms).
//
// Bulb/line cells transcribed from the drawn arrow paths, snapped to cell
// centres (bulb = the waypoint coinciding with the drawn circle).
const ARROWS = [
  { bulb: 'R1C2', line: ['R1C1', 'R2C1', 'R2C2'] },
  { bulb: 'R7C1', line: ['R8C2'] },
  { bulb: 'R1C8', line: ['R2C9', 'R3C8'] },
  { bulb: 'R2C6', line: ['R3C7', 'R2C8'] },
  { bulb: 'R7C9', line: ['R8C9', 'R9C8'] },
  { bulb: 'R7C7', line: ['R7C6', 'R8C6'] },
  { bulb: 'R8C3', line: ['R7C4', 'R6C5'] },
  { bulb: 'R5C3', line: ['R5C2', 'R4C2'] },
  { bulb: 'R5C5', line: ['R6C6'] },
  { bulb: 'R4C6', line: ['R3C5', 'R3C4'] },
];

const cc = cellGraph('9x9').makeOverlay('CC');

// Fact 1: arm digits sum to the bulb digit.
const arrowSums = ARROWS.map(({ bulb, line }) => new Arrow(bulb, ...line));

// Fact 2a: every line cell of a given arrow is in the same region. Only
// meaningful when the line has 2+ cells (single-cell lines need no
// same-region assertion of their own).
const lineSameRegion = ARROWS
  .filter(({ line }) => line.length > 1)
  .map(({ line }) => new SameValues(line.length, ...cc.at(line)));

// Fact 2b: the bulb's region differs from the line's region. The line cells
// are already forced equal above, so comparing the bulb to the first line
// cell is sufficient; AllDifferent over exactly 2 cells is a not-equal.
const bulbDiffersFromLine = ARROWS.map(({ bulb, line }) =>
  new AllDifferent(...cc.at([bulb, line[0]])));

// Fact 3: the bulb digit equals the total run length of its own-region
// cells across all four directions (shared start, i.e. the bulb, counted
// once) -- offset 0 keeps that shared cell in the total.
const sightCounts = ARROWS.map(({ bulb }) => new ChaosArrow(bulb, 0));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...arrowSums,
  ...lineSameRegion,
  ...bulbDiffersFromLine,
  ...sightCounts,
];
