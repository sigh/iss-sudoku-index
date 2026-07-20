// Title: Chaotic Zippers
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=zs0gkry-4Wg
// Source: https://sudokupad.app/6k7r2bex5r

// The CC overlay stores the solver-discovered region label of every grid cell.
const cc = cellGraph('9x9').makeOverlay('CC');

const ZIPPER_LINES = [
  ['R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C7', 'R5C7', 'R6C6', 'R7C5'],
  ['R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1', 'R8C1', 'R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6'],
  ['R9C3', 'R9C4', 'R8C4'],
];

const zippers = ZIPPER_LINES.map(cells => new Zipper(...cells));

// Each line's middle grid digit equals the number of distinct CC labels it touches.
const lots = ZIPPER_LINES.map(cells => {
  const center = cells[(cells.length - 1) / 2];
  return new CountDistinct(center, ...cc.at(cells));
});

// A drawn border forces the chaos-region labels on its two sides to differ.
const givenBorders = [
  ['R1C1', 'R1C2'],
  ['R8C1', 'R9C1'],
].map(cells => new AllDifferent(...cc.at(cells)));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...zippers,
  ...lots,
  ...givenBorders,
];
