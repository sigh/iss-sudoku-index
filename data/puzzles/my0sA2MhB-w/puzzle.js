// Title: Doppler Effect
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=my0sA2MhB-w
// Source: https://sudokupad.app/F9fHgrQqQF

// Normal Sudoku rules apply. Red and blue galaxy memberships are symmetric
// connected sets which overlap only at R5C5; no 2x2 is wholly in either set.
// Red values are digit + 1 and blue values are digit - 1. Arrows and cages use
// values; cage digits are distinct.

const RED = 1;
const BLUE = 1;
const OUT = 2;
const graph = cellGraph('9x9');
const gridCells = graph.cells();
const red = graph.makeOverlay('VR');
const blue = graph.makeOverlay('VB');
const value = graph.makeOverlay('VV');
const center = 'R5C5';
const shape = new Shape('9x9', '0-10');

const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const membershipDomain = red.makeReplicate(
  new Given(red.cells()[0], RED, OUT));
const membershipDomains = [
  membershipDomain,
  blue.makeReplicate(new Given(blue.cells()[0], BLUE, OUT)),
];

const rotations = gridCells
  .map(cell => {
    const { row, col } = parseCellId(cell);
    return [cell, makeCellId(10 - row, 10 - col)];
  })
  .filter(([a, b]) => a < b);
const rotationalSymmetry = rotations.flatMap(([a, b]) => [
  new SameValues(2, ...red.at([a, b])),
  new SameValues(2, ...blue.at([a, b])),
]);
const exclusiveMembership = gridCells
  .filter(cell => cell !== center)
  .map(cell => new AllDifferent(...red.at([cell]), ...blue.at([cell])));
const noMono2x2 = gridCells
  .filter(cell => graph.block(cell, 2, 2))
  .flatMap(cell => {
    const block = graph.block(cell, 2, 2);
    return [
      new Or(red.at(block).map(member => new Given(member, OUT))),
      new Or(blue.at(block).map(member => new Given(member, OUT))),
    ];
  });

const redValueKey = Pair.fnToKey(
  (digit, shifted) => shifted === digit + 1, shape);
const blueValueKey = Pair.fnToKey(
  (digit, shifted) => shifted === digit - 1, shape);

// The listed cells are exactly the arrow and cage cells drawn in the payload.
const clueCells = [...new Set([
  'R6C1', 'R7C1', 'R7C2', 'R9C5', 'R9C6', 'R3C9', 'R2C9',
  'R2C5', 'R1C6', 'R2C4', 'R3C3', 'R4C2', 'R4C3', 'R6C7',
  'R6C8', 'R3C6', 'R3C7', 'R4C5', 'R4C6', 'R1C1', 'R2C1',
  'R3C1', 'R8C3', 'R9C1', 'R9C2', 'R9C3', 'R6C4', 'R6C5',
  'R7C3', 'R7C4', 'R7C9', 'R8C9', 'R9C9', 'R5C6', 'R5C7',
  'R5C3', 'R5C4', 'R1C7', 'R1C8', 'R1C9', 'R2C7',
])];
const shiftedValues = clueCells.map(cell => new Or([
  new And([
    new Given(red.at([cell])[0], RED),
    new Pair(redValueKey, 'redshifted value', cell, value.at([cell])[0]),
  ]),
  new And([
    new Given(blue.at([cell])[0], BLUE),
    new Pair(blueValueKey, 'blueshifted value', cell, value.at([cell])[0]),
  ]),
]));

// Cages transcribed from the drawn cage totals.
const cages = [
  [4, ['R4C2', 'R4C3']],
  [16, ['R6C7', 'R6C8']],
  [19, ['R3C6', 'R3C7', 'R4C5', 'R4C6']],
  [12, ['R1C1', 'R2C1', 'R3C1']],
  [24, ['R8C3', 'R9C1', 'R9C2', 'R9C3']],
  [23, ['R6C4', 'R6C5', 'R7C3', 'R7C4']],
  [11, ['R7C9', 'R8C9', 'R9C9']],
  [13, ['R5C6', 'R5C7']],
  [14, ['R5C3', 'R5C4']],
  [25, ['R1C7', 'R1C8', 'R1C9', 'R2C7']],
].flatMap(([sum, cells]) => [
  new Sum(sum, ...value.at(cells)),
  new AllDifferent(...cells),
]);

// Arrows transcribed bulb first, then their drawn shafts.
const arrows = [
  ['R6C1', 'R7C1', 'R7C2'],
  ['R9C5', 'R9C6'],
  ['R3C9', 'R2C9'],
  ['R2C5', 'R1C6'],
  ['R2C4', 'R3C3'],
].map(cells => new Arrow(...value.at(cells)));

return [
  shape,
  red.toVar('red galaxy'),
  blue.toVar('blue galaxy'),
  value.toVar('shifted value'),
  digitDomain,
  ...membershipDomains,
  new Given(red.at([center])[0], RED),
  new Given(blue.at([center])[0], BLUE),
  ...rotationalSymmetry,
  ...exclusiveMembership,
  new ConnectedValues('VR', RED),
  new ConnectedValues('VB', BLUE),
  ...noMono2x2,
  ...shiftedValues,
  ...cages,
  ...arrows,
];
