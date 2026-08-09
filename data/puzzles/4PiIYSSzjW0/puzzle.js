// Title: Messier 43
// Author: Memeristor ('purpl')
// Video: https://www.youtube.com/watch?v=4PiIYSSzjW0
// Source: https://app.crackingthecryptic.com/sudoku/ThQmPfrLmT

// Normal sudoku applies. The 12 drawn dots are centres of disjoint,
// orthogonally connected, 180-degree rotationally symmetric galaxies. The
// Region Sum Area clause (equal box sums and visits to multiple boxes) is not
// encoded here.
const graph = cellGraph('9x9');
const galaxy = graph.makeOverlay('VG');
const cells = graph.cells();
const GALAXIES = 12;
const BACKGROUND = 13;
const ALL_LABELS = Array.from({ length: BACKGROUND }, (_, i) => i + 1);

// Drawn dot centres, in source [row, column] coordinates; .5 is a cell centre.
const centres = [
  [0.5, 5.5], [2, 8.5], [2, 1.5], [2.5, 3.5],
  [4, 0.5], [4, 4], [4, 6.5], [5.5, 6.5],
  [6.5, 8.5], [8, 6], [7, 4], [8.5, 2.5],
];

function reflected(cell, centre) {
  const { row, col } = parseCellId(cell);
  const targetRow = 2 * centre[0] - row + 1;
  const targetCol = 2 * centre[1] - col + 1;
  return Number.isInteger(targetRow) && Number.isInteger(targetCol) &&
    targetRow >= 1 && targetRow <= 9 && targetCol >= 1 && targetCol <= 9
    ? makeCellId(targetRow, targetCol) : null;
}

// For galaxy n, a cell belongs to it exactly when its half-turn image about
// dot n also belongs to it. Cells whose image falls outside the board cannot
// carry that galaxy label.
const symmetryKeys = centres.map((_, i) => Pair.fnToKey(
  (a, b) => (a === i + 1) === (b === i + 1), 16));
const labelDomains = cells.map(cell => new Given(galaxy.at(cell), ...ALL_LABELS.filter(label =>
  label === BACKGROUND || reflected(cell, centres[label - 1]) !== null)));
const rotationalSymmetry = centres.flatMap((centre, i) => cells.flatMap(cell => {
  const partner = reflected(cell, centre);
  return partner && cell < partner
    ? [new Pair(symmetryKeys[i], `galaxy ${i + 1} symmetry`, galaxy.at(cell), galaxy.at(partner))]
    : [];
}));

return [
  new Shape('9x9', 16),
  // The widened shape holds the 13 galaxy labels; grid cells retain digits 1-9.
  new RegionSize(9),
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  new Given('R2C5', 4),
  new Given('R9C1', 3),
  galaxy.toVar('galaxy membership'),
  ...labelDomains,
  ...Array.from({ length: GALAXIES }, (_, i) => new ConnectedValues('VG', i + 1)),
  ...rotationalSymmetry,
];
