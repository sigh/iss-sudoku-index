// Title: Full Circle
// Author: Qodec
// Video: https://www.youtube.com/watch?v=CgUZsL0RULw
// Source: https://sudokupad.app/g248qi5g6d

// VI1..VI81 mark cells in row-major order: 1 = ordinary, 2 = row indexer,
// 3 = column indexer. Each line machine reads alternating marker and grid digit.
const ORDINARY = 1;
const ROW_INDEXER = 2;
const COLUMN_INDEXER = 3;

const graph = cellGraph('9x9');
const indexers = graph.makeOverlay('VI');

const cages = [
  { total: 12, cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'] },
  { total: null, cells: ['R1C5', 'R1C6', 'R2C5', 'R2C6'] },
  { total: null, cells: ['R1C8', 'R1C9', 'R2C8', 'R2C9'] },
  { total: null, cells: ['R3C1'] },
  { total: 25, cells: ['R5C1', 'R5C2', 'R6C1', 'R6C2'] },
  { total: 27, cells: ['R5C5', 'R5C6', 'R6C5', 'R6C6'] },
  { total: null, cells: ['R7C1', 'R7C2'] },
  { total: null, cells: ['R9C1', 'R9C2'] },
  { total: null, cells: ['R9C9'] },
];

// Exactly one marker of each requested type occurs in a line. The digit in the
// target marker must equal the 1-based position of the other marker.
const makeIndexerMachine = (targetMarker, positionMarker) => NFA.encodeSpec({
  startState: {
    phase: 'marker',
    position: 1,
    targetSeen: false,
    positionSeen: false,
    pendingTargetDigit: false,
    targetDigit: null,
    markedPosition: null,
  },
  transition: (state, value) => {
    if (state.phase === 'marker') {
      if (value !== ORDINARY && value !== ROW_INDEXER && value !== COLUMN_INDEXER) {
        return undefined;
      }
      if (value === targetMarker && state.targetSeen) return undefined;
      if (value === positionMarker && state.positionSeen) return undefined;
      return {
        ...state,
        phase: 'digit',
        targetSeen: state.targetSeen || value === targetMarker,
        positionSeen: state.positionSeen || value === positionMarker,
        pendingTargetDigit: value === targetMarker,
        markedPosition: value === positionMarker ? state.position : state.markedPosition,
      };
    }

    return {
      ...state,
      phase: 'marker',
      position: state.position + 1,
      pendingTargetDigit: false,
      targetDigit: state.pendingTargetDigit ? value : state.targetDigit,
    };
  },
  accept: state => state.phase === 'marker' &&
    state.position === 10 &&
    state.targetSeen &&
    state.positionSeen &&
    state.targetDigit === state.markedPosition,
  maxDepth: 18, // Nine alternating marker/digit pairs.
}, 9);

const rowMachine = makeIndexerMachine(ROW_INDEXER, COLUMN_INDEXER);
const columnMachine = makeIndexerMachine(COLUMN_INDEXER, ROW_INDEXER);
const indexedLine = line => line.flatMap(cell => [indexers.at(cell), cell]);

const markerDomain = indexers.makeReplicate(
  new Given(indexers.cells()[0], ORDINARY, ROW_INDEXER, COLUMN_INDEXER),
);
const rowRules = graph.rows().map(row =>
  new NFA(rowMachine, 'row index', ...indexedLine(row))
);
const columnRules = graph.columns().map(column =>
  new NFA(columnMachine, 'column index', ...indexedLine(column))
);
const boxRules = graph.boxes().flatMap(box => [
  new ContainExact(`${ROW_INDEXER}`, ...indexers.at(box)),
  new ContainExact(`${COLUMN_INDEXER}`, ...indexers.at(box)),
]);
const cageSums = cages
  .filter(cage => cage.total !== null)
  .map(cage => new Cage(cage.total, ...cage.cells));
const cageExclusions = cages.flatMap(cage => cage.cells)
  .map(cell => new Given(indexers.at(cell), ORDINARY));

return [
  new Shape('9x9'),
  indexers.toVar('Indexer type'),
  markerDomain,
  ...rowRules,
  ...columnRules,
  ...boxRules,
  ...cageSums,
  ...cageExclusions,
];
