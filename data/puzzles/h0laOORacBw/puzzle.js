// Title: Ghost Digit
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=h0laOORacBw
// Source: https://app.crackingthecryptic.com/sudoku/rfj7QRQMRG

// Normal sudoku (standard rows/columns/3x3 boxes) plus the given R9C9=9.
// Seven cages show a sum with no repeated digit; three thermometers strictly
// increase from the bulb. One of the digits 1-9 is a solver-determined
// "ghost": it still occupies exactly one cell per row/column/box like any
// digit, but wherever it appears inside a cage or on a thermometer it is
// treated as absent -- excluded from that cage's sum and distinctness check,
// and skipped when checking a thermometer's increasing order. The three grey
// circle overlays sit exactly at the three thermometer bulbs and carry no
// text; they mark the bulb end and add no separate clue.
//
// Modelled by widening the grid's value range to 0-9 (the main digit stays
// restricted to 1-9 per cell) and adding a one-cell Var `G` (also restricted
// to 1-9) holding the ghost's value. A small "effective value" overlay
// exists only on the cells that sit in a cage or on a thermometer: 0 exactly
// where that cell's digit equals G, the digit itself otherwise, linked by a
// 3-symbol NFA (ghost value, this cell's digit, effective value) since the
// result depends on two inputs. Cages then read a plain Sum over the
// effective values (0s contribute nothing) plus an all-pairs PairX that a 0
// always satisfies (letting a repeated ghost coexist and drop out of every
// comparison); thermometers use an NFA that skips 0s and requires the
// remaining values to strictly increase.

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const graph = cellGraph('9x9~0-9');

// Cage cells and totals, transcribed from the payload's `cages` array
// (0-indexed [row,col] converted to 1-indexed R/C).
const CAGES = [
  [8, ['R1C8', 'R1C9']],
  [10, ['R1C1', 'R2C1']],
  [9, ['R8C1', 'R9C1', 'R9C2']],
  [15, ['R2C4', 'R3C4', 'R3C3', 'R4C3', 'R4C2']],
  [12, ['R2C6', 'R3C6', 'R3C7', 'R4C7', 'R4C8']],
  [19, ['R6C8', 'R6C7', 'R7C7', 'R7C6', 'R8C6']],
  [9, ['R8C4', 'R7C4', 'R7C3', 'R6C3', 'R6C2']],
];
// Thermometer cells in bulb-to-tip order, transcribed from the payload's
// `lines` waypoints (each thermometer's overlay circle confirms its bulb).
const THERMOS = [
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9'],
  ['R9C8', 'R9C7', 'R8C7', 'R7C7'],
  ['R9C3', 'R9C4', 'R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5'],
];

// Effective-value overlay, only over the cells a cage or thermometer uses.
const effCells = [...new Set([...CAGES.flatMap(([, cells]) => cells), ...THERMOS.flat()])];
const eff = graph.makeOverlay('VE', effCells);

// Restrict the widened main grid back to real Sudoku digits.
const digitGivens = graph.makeReplicate(new Given('R1C1', ...DIGITS));

// The ghost digit's value: a single cell, restricted to 1-9 (never 0).
const ghost = new Var('G', 'ghost digit', 1);
const ghostCell = ghost.cell(1);
const ghostRestrict = new Given(ghostCell, ...DIGITS);

// digit/ghost -> effective value link. Reads [ghost, digit] then checks the
// effective value: 0 when digit === ghost, the digit itself otherwise.
const linkSpec = NFA.encodeSpec({
  startState: { stage: 0 },
  transition: (s, v) => {
    if (s.stage === 0) return { stage: 1, g: v };
    if (s.stage === 1) return { stage: 2, g: s.g, d: v };
    return v === (s.d === s.g ? 0 : s.d) ? { stage: 3 } : undefined;
  },
  accept: s => s.stage === 3,
}, graph.gridGeometry());
const links = effCells.map(cell =>
  new NFA(linkSpec, 'digit/ghost effective-value link', ghostCell, cell, eff.at(cell)));

// Cage sum (0s don't count) and all-pairs distinctness (a 0 always passes,
// so a repeated ghost is allowed and drops out of every comparison).
const cageSums = CAGES.map(([total, cells]) => new Sum(total, ...eff.at(cells)));
const cageDistinctKey = PairX.fnToKey((a, b) => a === 0 || b === 0 || a !== b, graph.gridGeometry());
const cageDistinct = CAGES.map(([, cells]) =>
  new PairX(cageDistinctKey, 'cage distinct unless ghost', ...eff.at(cells)));

// Thermometer: skip 0s (ghost cells), require the rest to strictly increase.
const thermoSpec = NFA.encodeSpec({
  startState: { prev: null },
  transition: (s, v) => (v === 0 ? s : (s.prev === null || v > s.prev) ? { prev: v } : undefined),
  accept: () => true,
}, graph.gridGeometry());
const thermos = THERMOS.map((cells, i) =>
  new NFA(thermoSpec, `thermo ${i + 1} skip-ghost increase`, ...eff.at(cells)));

return [
  new Shape('9x9', '0-9'),
  digitGivens,
  new Given('R9C9', 9),
  eff.toVar('effective value'),
  ghost,
  ghostRestrict,
  ...links,
  ...cageSums,
  ...cageDistinct,
  ...thermos,
];
