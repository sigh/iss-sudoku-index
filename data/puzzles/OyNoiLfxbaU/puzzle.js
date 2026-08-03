// Title: Deuces Wild
// Author: Wolff
// Video: https://www.youtube.com/watch?v=OyNoiLfxbaU
// Source: https://app.crackingthecryptic.com/sudoku/RfjqGgLRht

// Normal sudoku rules apply. Green line: adjacent digits differ by >= 5.
// Arrows: arm digits sum to the circled digit. Thermometer: digits increase
// from the bulb. Black dots: 2:1 ratio. White dots: consecutive. Cages: digits
// sum to the corner total. Purple lines: the digits form a consecutive,
// non-repeating set (in any order).
//
// Wildcard rule: "twos are wild" -- for the purposes of any clue above
// (not for a Given), a cell holding digit 2 may be read as any value 1-9,
// but across the whole grid each value is used by at most one wild 2 (the
// clue text's cage example confirms a wild 2 may coincide with an unrelated
// real digit elsewhere, so the "used once" cap applies only among the wild
// 2s themselves, not against ordinary digits). Modelled with a parallel
// "effective value" Var per cell (VE#): equal to the digit when the digit
// isn't 2, and free 1-9 when it is 2. All clue constraints below read the
// effective-value cells; cages additionally keep an AllDifferent on the raw
// digits, since the rule text calls out that digits (not values) may not
// repeat in a cage.
//
// Exactly one cell per row holds digit 2 (standard sudoku), so the other 8
// cells' effective values are exactly that row's digits minus the 2, which
// always sum to 43. Each row's wild cell's effective value is therefore
// (sum of the row's effective values) - 43, with no need to know which cell
// it is; a Var per row (VW#) captures it via that linear identity, and
// AllDifferent over the 9 row Vars encodes "each value used once".

const graph = cellGraph('9x9');
const effOverlay = graph.makeOverlay('VE');
const eff = cell => effOverlay.at(cell);

// Tie each cell's effective value to its digit: free when the digit is 2,
// otherwise forced equal to the digit.
const wildTies = graph.cells().map(cell =>
  new Pair(
    Pair.fnToKey((d, e) => d === 2 ? true : d === e, 9),
    'wildcard tie', cell, eff(cell)));

// Row wild-value Vars and the linear identity that derives them.
const rowWild = new Var('W', 'row wild-2 effective value', 9);
const rowWildSums = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r =>
  new Sum(43, [rowWild.cell(r), -1], ...effOverlay.row(r)));

// Killer cages (drawn totals; distinctness is on raw digits, sum is on
// effective values per the wildcard-cage note above).
const cages = [
  { cells: ['R4C3', 'R5C2', 'R5C3', 'R6C3'], total: 22 },
  { cells: ['R4C7', 'R4C8', 'R4C9'], total: 7 },
  // Whole box 2 (R1C4-R3C6): raw-digit distinctness already comes from the
  // box group, so only the effective-value sum is added.
  {
    cells: ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6'],
    total: 45, boxDistinctAlready: true,
  },
  // Single-cell cage: real, easy to overlook.
  { cells: ['R3C8'], total: 1 },
];
const cageConstraints = cages.flatMap(({ cells, total, boxDistinctAlready }) => [
  ...(cells.length > 1 && !boxDistinctAlready ? [new AllDifferent(...cells)] : []),
  new Sum(total, ...effOverlay.at(cells)),
]);

// Green line (yellowgreen): zigzag path, list-order adjacency.
const greenLine = [
  'R1C1', 'R2C2', 'R3C1', 'R4C2', 'R5C1', 'R6C2', 'R7C1', 'R8C2', 'R9C1',
];
const greenLineConstraint = new Whisper(5, ...effOverlay.at(greenLine));

// Purple lines: two closed 4-cell loops, each fully inside one box, so a
// set-based Renban needs no wrap-around repeat.
const purpleLoopA = ['R4C5', 'R5C4', 'R5C5', 'R5C6'];
const purpleLoopB = ['R5C7', 'R5C8', 'R5C9', 'R6C8'];
const purpleLineConstraints = [
  new Renban(...effOverlay.at(purpleLoopA)),
  new Renban(...effOverlay.at(purpleLoopB)),
];

// Thermometer (grey): bulb first.
const thermoConstraint = new Thermo(...effOverlay.at(['R8C5', 'R9C5', 'R9C4']));

// Arrows: circle cell first, then arm cells.
const arrowConstraints = [
  new Arrow(...effOverlay.at(['R9C6', 'R9C7', 'R8C8', 'R7C9'])),
  new Arrow(...effOverlay.at(['R6C5', 'R7C6', 'R7C7'])),
];

// Dots: bind by explicit edge, not grid adjacency, since they read
// effective-value Vars rather than grid cells.
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const ratioKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);
const dotConstraints = [
  new Pair(consecutiveKey, 'white dot', eff('R7C3'), eff('R8C3')),
  new Pair(consecutiveKey, 'white dot', eff('R8C3'), eff('R9C3')),
  new Pair(ratioKey, 'black dot', eff('R1C7'), eff('R1C8')),
  new Pair(ratioKey, 'black dot', eff('R1C8'), eff('R1C9')),
];

return [
  new Shape('9x9'),
  new Given('R9C9', 7),

  effOverlay.toVar('effective value (wildcard-adjusted)'),
  rowWild,
  ...wildTies,
  ...rowWildSums,
  new AllDifferent(...rowWild.cells()),

  ...cageConstraints,
  greenLineConstraint,
  ...purpleLineConstraints,
  thermoConstraint,
  ...arrowConstraints,
  ...dotConstraints,
];
