// Title: Island Sum Lines
// Author: yttrio
// Video: https://www.youtube.com/watch?v=tAASGi1p1Vo
// Source: https://sudokupad.app/f9wcvtflo1

// The VS overlay uses 1 for water and one anchored label (2-8) for each
// island. Connectivity plus the adjacency rule makes every label exactly one
// island and prevents two differently labelled islands from touching.

const WATER = 1;
const ISLAND_LABELS = [2, 3, 4, 5, 6, 7, 8];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const state = graph.makeOverlay('VS');
const stateCells = state.cells();

const circles = [
  'R2C1', 'R3C2', 'R8C4', 'R6C5', 'R2C6', 'R8C7', 'R2C8',
];

const lines = [
  [
    'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1',
    'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2',
  ],
  [
    'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5',
    'R1C6', 'R1C7', 'R1C8', 'R1C9',
  ],
  ['R2C4', 'R3C4', 'R4C4'],
  ['R9C5', 'R9C4', 'R9C3'],
  ['R5C9', 'R6C9', 'R7C9'],
];

// Every state cell is water or one of the seven island labels.
const stateDomain = state.makeReplicate(
  new Given(stateCells[0], WATER, ...ISLAND_LABELS));

// Orthogonally adjacent land cells belong to the same island. A Pair over each
// row and column covers every orthogonal edge exactly once.
const compatibleStateKey = Pair.fnToKey(
  (a, b) => a === WATER || b === WATER || a === b,
  geometry.numValues);
const islandBoundaries = [
  ...Array.from({ length: 9 }, (_, i) =>
    new Pair(compatibleStateKey, 'island-boundary', ...state.at(graph.row(i + 1)))),
  ...Array.from({ length: 9 }, (_, i) =>
    new Pair(compatibleStateKey, 'island-boundary', ...state.at(graph.column(i + 1)))),
];

// No 2x2 block is entirely water.
const noWater2x2Machine = NFA.encodeSpec({
  startState: { waterCount: 0, seen: 0 },
  transition: ({ waterCount, seen }, value) => {
    const nextSeen = seen + 1;
    const nextWaterCount = waterCount + (value === WATER ? 1 : 0);
    if (nextSeen === 4 && nextWaterCount === 4) return undefined;
    return { waterCount: nextWaterCount, seen: nextSeen };
  },
  accept: ({ seen }) => seen === 4,
  maxDepth: 4,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noWater2x2 = state.makeReplicate(
  new NFA(
    noWater2x2Machine,
    'no-water-2x2',
    ...state.at(graph.block(gridCells[0], 2, 2))),
  state.at(blockOrigins));

// The clue digit is exactly the number of cells carrying its island label.
function islandSizeConstraint(circle, label) {
  const machine = NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (target === null) return { target: value, count: 0 };
      const nextCount = count + (value === label ? 1 : 0);
      if (nextCount > target) return undefined;
      return { target, count: nextCount };
    },
    accept: ({ target, count }) => target !== null && count === target,
    maxDepth: 82,
  }, geometry.numValues);
  return new NFA(machine, `island-${label}-size`, circle, ...stateCells);
}

// Scan label/digit pairs. For each island, remember the digits already used and
// reject a second occurrence while that label is active.
function islandDistinctConstraint(label) {
  const machine = NFA.encodeSpec({
    startState: { phase: 'label', active: false, used: 0 },
    transition: (machineState, value) => {
      if (machineState.phase === 'label') {
        return {
          phase: 'digit',
          active: value === label,
          used: machineState.used,
        };
      }
      if (!machineState.active) {
        return { phase: 'label', active: false, used: machineState.used };
      }
      const bit = 1 << (value - 1);
      if (machineState.used & bit) return undefined;
      return {
        phase: 'label',
        active: false,
        used: machineState.used | bit,
      };
    },
    accept: machineState => machineState.phase === 'label',
    maxDepth: 162,
  }, geometry.numValues);
  const inputs = gridCells.flatMap(cell => [state.at(cell), cell]);
  return new NFA(machine, `island-${label}-distinct`, ...inputs);
}

// A line alternates state and digit cells. For each feasible common sum, one
// compact machine requires every completed segment to hit that sum; the Or lets
// the solver discover which sum applies to this line.
function equalSegmentSumConstraint(line, lineIndex) {
  const inputs = line.flatMap(cell => [state.at(cell), cell]);
  // At least two non-empty segments exist, so their common sum cannot exceed
  // nine times the shorter side of a split of this line.
  const maxTarget = 9 * Math.floor(line.length / 2);
  const targets = Array.from({ length: maxTarget }, (_, i) => i + 1);

  return new Or(targets.map(targetSum => {
    const machine = NFA.encodeSpec({
      startState: {
        phase: 'state',
        pendingShade: null,
        lastShade: null,
        segmentSum: 0,
        switched: false,
      },
      transition: (machineState, value) => {
        if (machineState.phase === 'state') {
          return {
            ...machineState,
            phase: 'digit',
            pendingShade: value === WATER ? WATER : 2,
          };
        }

        const changed = machineState.lastShade !== null &&
          machineState.pendingShade !== machineState.lastShade;
        if (changed && machineState.segmentSum !== targetSum) return undefined;
        const nextSum = changed ? value : machineState.segmentSum + value;
        if (nextSum > targetSum) return undefined;

        return {
          phase: 'state',
          pendingShade: null,
          lastShade: machineState.pendingShade,
          segmentSum: nextSum,
          switched: machineState.switched || changed,
        };
      },
      accept: machineState =>
        machineState.phase === 'state' &&
        machineState.switched &&
        machineState.segmentSum === targetSum,
      maxDepth: 2 * line.length,
    }, geometry.numValues);
    return new NFA(
      machine,
      `line-${lineIndex}-equal-segments`,
      ...inputs);
  }));
}

return [
  new Shape('9x9'),
  state.toVar('water and island labels'),
  stateDomain,
  // The water and all seven anchored islands are separately connected.
  new ConnectedValues('VS', WATER),
  ...ISLAND_LABELS.map(label => new ConnectedValues('VS', label)),
  ...islandBoundaries,
  noWater2x2,
  ...circles.map((circle, i) => new Given(state.at(circle), ISLAND_LABELS[i])),
  ...circles.map((circle, i) => islandSizeConstraint(circle, ISLAND_LABELS[i])),
  ...ISLAND_LABELS.map(islandDistinctConstraint),
  ...lines.map((line, i) => equalSegmentSumConstraint(line, i + 1)),
];
