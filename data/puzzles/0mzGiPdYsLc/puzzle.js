// Title: Complimentary Interconnected Forces
// Author: HalfBakedLunatic (aka David Workman)
// Video: https://www.youtube.com/watch?v=0mzGiPdYsLc
// Source: https://sudokupad.app/4w0t03s87w

// Full encoding. Standard sudoku (default row/col/box groups match the
// payload's regions). Thermometers increase from the bulb. Cages sum to
// their printed total with all-different digits (the single-cell R1C9 cage
// has no total, so it needs no local Cage/AllDifferent constraint).
//
// Yin-Yang: a shade overlay Var forms the two-colour split (global
// connectivity via ConnectedValues, one per shade; no monochrome 2x2 via a
// replicated NFA). Two more rules tie each cage/thermometer cell's own
// digit parity to its own shade: cage cells shade with even digits, thermo
// cells shade with odd digits -- encoded as a per-cell Pair between the grid
// digit and the shade Var at the same cell.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// Thermometers: bulb cell first. The drawn bulb circle (payload underlay)
// matches each line's first waypoint, except the R8C8/R9C7 thermometer,
// whose circle sits on R9C7 -- the *last* waypoint of that line entry -- so
// its cells are listed bulb-first here as R9C7, R8C8 (reversed from the
// line's own array order).
const thermometers = [
  ['R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5'],
  ['R7C1', 'R6C2', 'R5C1', 'R4C2', 'R3C1'],
  ['R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8'],
  ['R8C4', 'R8C5'],
  ['R5C2', 'R5C3'],
  ['R3C3', 'R3C4'],
  ['R1C7', 'R2C7'],
  ['R9C7', 'R8C8'],
  ['R6C3', 'R7C2'],
];
const thermoConstraints = thermometers.map(cells => new Thermo(...cells));

// Cages: [cells, total|null]. Total omitted for the single-cell R1C9 cage.
const cages = [
  [['R8C2', 'R8C3'], 4],
  [['R1C2', 'R2C2', 'R3C2'], 11],
  [['R3C6', 'R3C7', 'R4C6', 'R4C7'], 30],
  [['R6C4', 'R7C3', 'R7C4'], 23],
  [['R6C9', 'R7C9', 'R8C9', 'R9C9'], 23],
  [['R7C6', 'R7C7', 'R8C6', 'R8C7'], 22],
  [['R5C6', 'R5C7', 'R6C6', 'R6C7'], 14],
  [['R2C8', 'R2C9'], 16],
  [['R1C4', 'R2C4'], 5],
  [['R4C4', 'R5C4'], 11],
  [['R1C9'], null],
];
// A single-cell cage with no total adds no local constraint (uniqueness is
// vacuous and there is no sum to check); it still counts for the
// digit-parity rule below.
const cageConstraints = cages
  .filter(([cells, total]) => total !== null)
  .map(([cells, total]) => new Cage(total, ...cells));

// Cage-cell parity: even digit -> shaded, odd digit -> unshaded.
const cageEvenShadedKey = Pair.fnToKey(
  (digit, s) => (digit % 2 === 0) === (s === SHADED), geometry.numValues);
const cageCells = cages.flatMap(([cells]) => cells);
const cageParityRules = cageCells.map(cell =>
  new Pair(cageEvenShadedKey, 'cage-parity', cell, shade.at(cell)));

// Thermometer-cell parity: odd digit -> shaded, even digit -> unshaded
// (opposite polarity from the cage rule above).
const thermoOddShadedKey = Pair.fnToKey(
  (digit, s) => (digit % 2 === 1) === (s === SHADED), geometry.numValues);
const thermoCells = thermometers.flat();
const thermoParityRules = thermoCells.map(cell =>
  new Pair(thermoOddShadedKey, 'thermo-parity', cell, shade.at(cell)));

// No 2x2 block may be all shaded or all unshaded: one NFA on the grid's
// top-left 2x2 window, replicated to every possible 2x2 window origin (not
// just box-aligned ones).
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  ...thermoConstraints,
  ...cageConstraints,
  ...cageParityRules,
  ...thermoParityRules,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
];
