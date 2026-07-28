// Title: Under the Influence
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=wbeaq3sqDm8
// Source: https://sudokupad.app/m408yajamc

// Marker 0 means ordinary; marker d means an influencer containing digit d.
// Thus an adjacent marker is exactly that influencer's contribution to value.
const ORDINARY = 0;
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const markers = graph.makeOverlay('VI');
const gridCells = graph.cells();

const gridDigitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

const markerKey = Pair.fnToKey(
  (digit, marker) => marker === ORDINARY || marker === digit,
  shape);
const markerDigitLinks = gridCells.map(cell => new Pair(
  markerKey,
  'influencer marker',
  cell,
  markers.at(cell)));

const eightOrdinary = Array(8).fill(ORDINARY).join('_');
const oneInfluencerPerHouse = graph.rowsColumnsBoxes().map(
  cells => new ContainExact(eightOrdinary, ...markers.at(cells)));

// Marker values 1..9 encode influencer digits 1..9. Requiring each exactly
// once makes the nine influencer digits all different.
const distinctInfluencerDigits = Array.from(
  { length: 9 },
  (_, index) => new ContainExact(String(index + 1), ...markers.cells()));

// Every cell contributes its digit and the marker of each orthogonal neighbour.
// Repeated markers are intentional when one influencer neighbours multiple
// cells in the same cage or line segment.
function effectiveTerms(cells) {
  return [
    ...cells,
    ...cells.flatMap(cell => markers.at(graph.neighbours(cell))),
  ];
}

function effectiveSum(total, cells) {
  return new Sum(total, ...effectiveTerms(cells));
}

function equalEffectiveSegments(segments) {
  return new EqualSum(...segments.map(effectiveTerms));
}

const cages = [
  effectiveSum(9, ['R2C8']),
  effectiveSum(6, ['R2C1', 'R2C2']),
  effectiveSum(6, ['R3C2']),
  effectiveSum(6, ['R1C3', 'R2C3']),
  effectiveSum(6, ['R3C1']),
  effectiveSum(8, ['R7C1']),
  effectiveSum(12, ['R8C7', 'R8C8']),
];

const regionSumLines = [
  [
    ['R1C8', 'R2C8', 'R2C9', 'R3C9', 'R3C8', 'R3C7'],
    ['R3C6'],
    ['R4C6', 'R4C5'],
  ],
  [['R5C3', 'R6C3'], ['R7C3']],
  [['R8C3', 'R9C3'], ['R8C4', 'R9C4']],
  [['R6C6'], ['R7C6'], ['R6C7']],
  [['R3C4'], ['R4C3'], ['R4C4']],
].map(equalEffectiveSegments);

return [
  shape,
  markers.toVar('influencer marker'),
  gridDigitDomain,
  ...markerDigitLinks,
  ...oneInfluencerPerHouse,
  ...distinctInfluencerDigits,
  ...cages,
  ...regionSumLines,
];
