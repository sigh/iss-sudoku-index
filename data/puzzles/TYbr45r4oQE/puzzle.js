// Title: Unique Aquarium Sudoku
// Author: Sam Knott
// Video: https://www.youtube.com/watch?v=TYbr45r4oQE
// Source: https://app.crackingthecryptic.com/sudoku/8MrQmfqqp4
//
// Normal sudoku rules: rows, columns and the 9 marked (irregular) regions
// below each contain 1-9 once.
//
// Each region is split into 'air' and 'water' cells (a region may be
// entirely one type). Water cells sit below (strictly greater row index
// than) every air cell in the same region, and every cell sharing a row and
// a region shares the same type -- together these force, per region, a
// single row-threshold: some top run of the region's occupied rows is air,
// the rest water. Every water cell's digit in a region is larger than every
// air cell's digit in that region. Each region's count of water cells
// differs from every other region's, and every region has at least one
// water cell.
//
// Along each thermometer, digits strictly increase from the bulb end.

// Regions, from the payload's `regions` array (0-indexed [row, col] pairs
// converted to R#C#), in payload order.
const REGIONS = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R6C1', 'R5C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R1C2', 'R1C3', 'R2C3', 'R2C2', 'R3C2', 'R3C3', 'R4C2', 'R5C2', 'R5C3'],
  ['R6C4', 'R7C4', 'R6C3', 'R7C3', 'R6C2', 'R7C2', 'R8C2', 'R9C2', 'R9C3'],
  ['R8C3', 'R8C4', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5'],
  ['R4C3', 'R4C4', 'R5C4', 'R3C4', 'R2C4', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R1C8', 'R1C9', 'R2C9', 'R2C8', 'R2C7', 'R3C9', 'R4C9', 'R4C8', 'R4C7'],
  ['R2C6', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R5C6', 'R7C6', 'R6C6', 'R8C6'],
  ['R5C7', 'R6C7', 'R6C8', 'R7C7', 'R8C7', 'R9C7', 'R9C6', 'R9C5', 'R9C4'],
  ['R5C8', 'R5C9', 'R6C9', 'R7C9', 'R7C8', 'R8C8', 'R8C9', 'R9C9', 'R9C8'],
];

// Thermometers, bulb cell first: from the payload's grey `lines` entries
// (each a 2-cell segment) paired with the grey circle `underlays` marking
// the bulb end.
const THERMOMETERS = [
  ['R2C2', 'R3C2'],
  ['R2C6', 'R2C7'],
  ['R4C3', 'R4C4'],
  ['R7C3', 'R7C4'],
  ['R7C6', 'R7C7'],
  ['R7C8', 'R8C8'],
  ['R5C9', 'R6C9'],
];

const shape = new Shape('9x9');
const graph = cellGraph('9x9');

// Air/water flag, one per grid cell: 1 = air, 2 = water. The overlay's Var
// group inherits the grid's full 1-9 domain, so every flag cell is
// restricted down to just {1, 2} explicitly.
const flags = graph.makeOverlay('VW');
const flagDomain = flags.makeReplicate(new Given(flags.cells()[0], 1, 2));

// One water-cell-count Var per region.
const waterCounts = new Var('WC', 'region water-cell counts', REGIONS.length);

const rowOf = cellId => parseCellId(cellId).row;

// NFA over one region's cells, read as [digit, flag, digit, flag, ...] in
// any order: tracks the highest digit seen on an air cell and the lowest
// digit seen on a water cell so far, and rejects as soon as an air digit
// would not be smaller than every water digit read up to that point (and
// vice versa). Accepting requires every (digit, flag) pair to have been
// consumed in full.
const AIR = 1, WATER = 2;
const NO_AIR = 0, NO_WATER = 10; // sentinels: outside the 1-9 digit range
const waterAboveAirSpec = {
  startState: { pendingDigit: null, maxAirDigit: NO_AIR, minWaterDigit: NO_WATER },
  transition({ pendingDigit, maxAirDigit, minWaterDigit }, value) {
    if (pendingDigit === null) {
      // `value` is this cell's digit; wait for its flag to arrive next.
      return { pendingDigit: value, maxAirDigit, minWaterDigit };
    }
    // `value` is this cell's flag; classify the pending digit by it.
    if (value === AIR) {
      const newMaxAirDigit = Math.max(maxAirDigit, pendingDigit);
      if (newMaxAirDigit >= minWaterDigit) return undefined;
      return { pendingDigit: null, maxAirDigit: newMaxAirDigit, minWaterDigit };
    } else {
      const newMinWaterDigit = Math.min(minWaterDigit, pendingDigit);
      if (maxAirDigit >= newMinWaterDigit) return undefined;
      return { pendingDigit: null, maxAirDigit, minWaterDigit: newMinWaterDigit };
    }
  },
  accept: ({ pendingDigit }) => pendingDigit === null,
};
const waterAboveAirNFA = NFA.encodeSpec(waterAboveAirSpec, 9);

// `a <= b` over the flag cells: enforces "no water-then-air" between two flag
// cells. The compiled table must span the grid's full 1-9 domain (flags are
// only ever 1 or 2 in practice, via `flagDomain` above, but the solver's
// lookup table is sized by the grid's declared value count regardless).
const noWaterThenAirKey = Pair.fnToKey((a, b) => a <= b, shape);

const regionConstraints = REGIONS.map((cells, i) => {
  const wc = waterCounts.cell(i + 1);
  const cellFlags = flags.at(cells);

  // Cells sharing this region and a row must share a flag (rule: "cells in
  // the same row and region must be coloured the same").
  const byRow = new Map();
  cells.forEach((cell, idx) => {
    const row = rowOf(cell);
    if (!byRow.has(row)) byRow.set(row, []);
    byRow.get(row).push(cellFlags[idx]);
  });
  const sameRowSameFlag = [...byRow.values()]
    .filter(flagGroup => flagGroup.length > 1)
    .map(flagGroup => new SameValues(flagGroup.length, ...flagGroup));

  // One flag cell per occupied row, ordered top-to-bottom: chained with
  // `noWaterThenAirKey` this forbids a lower (greater-row) air cell below a
  // higher (smaller-row) water cell anywhere in the region -- i.e. "all
  // water cells below all air cells".
  const rowsAscending = [...byRow.keys()].sort((a, b) => a - b);
  const rowRepresentativeFlags = rowsAscending.map(row => byRow.get(row)[0]);

  // Digit ordering: every water digit in the region exceeds every air digit.
  const digitFlagSequence = cells.flatMap((cell, idx) => [cell, cellFlags[idx]]);

  return [
    new Jigsaw('9x9', ...cells),
    ...sameRowSameFlag,
    new Pair(noWaterThenAirKey, 'AquariumRowOrder', ...rowRepresentativeFlags),
    new NFA(waterAboveAirNFA, 'AquariumDigitOrder', ...digitFlagSequence),
    // sum(flags) = 9*AIR + waterCount*(WATER - AIR) = 9 + waterCount, so
    // waterCount = sum(flags) - 9.
    new Sum(9, ...cellFlags.map(f => [f, 1]), [wc, -1]),
  ];
});

const thermos = THERMOMETERS.map(cells => new Thermo(...cells));

return [
  shape,
  new NoBoxes(),
  flags.toVar('air(1)/water(2) flag per cell'),
  flagDomain,
  waterCounts,
  ...regionConstraints.flat(),
  new AllDifferent(...REGIONS.map((_, i) => waterCounts.cell(i + 1))),
  ...thermos,
];
