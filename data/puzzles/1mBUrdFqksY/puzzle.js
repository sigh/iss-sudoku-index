// Title: Bread and Pie
// Author: Myxo
// Video: https://www.youtube.com/watch?v=1mBUrdFqksY
// Source: https://sudokupad.app/slicedsudoku/breadandpie

// Full encoding. ChaosConstruction discovers the nine connected regions. The
// NFAs link the sandwich interiors and edge-touching "pie" classification to
// the same discovered-region labels.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const cc = graph.makeOverlay('CC');

const sandwichClues = [
  ['C1', 12], ['C4', 16], ['C6', 12], ['C9', 29],
  ['R1', 14], ['R6', 15], ['R9', 27],
];

const lineCells = id => id[0] === 'R'
  ? graph.row(Number(id.slice(1)))
  : graph.column(Number(id.slice(1)));

// Scan [digit, region-label] pairs. Between the first crust (1 or 9) and the
// second, every region label is equal; neither crust has that label.
const sandwichRegionNFA = NFA.encodeSpec({
  startState: { phase: 'before', expect: 'digit' },
  transition(state, value) {
    if (state.expect === 'digit') {
      if (state.phase === 'before') {
        return {
          phase: value === 1 || value === 9 ? 'firstCrust' : 'before',
          expect: 'region',
        };
      }
      if (state.phase === 'needFilling') {
        if (value === 1 || value === 9) return undefined;
        return { ...state, phase: 'firstFilling', expect: 'region' };
      }
      if (state.phase === 'filling') {
        return {
          ...state,
          phase: value === 1 || value === 9 ? 'secondCrust' : 'moreFilling',
          expect: 'region',
        };
      }
      return { phase: 'after', expect: 'region' };
    }

    if (state.phase === 'firstCrust') {
      return { phase: 'needFilling', expect: 'digit', crustRegion: value };
    }
    if (state.phase === 'firstFilling') {
      if (value === state.crustRegion) return undefined;
      return {
        phase: 'filling', expect: 'digit',
        crustRegion: state.crustRegion, fillingRegion: value,
      };
    }
    if (state.phase === 'moreFilling') {
      if (value !== state.fillingRegion) return undefined;
      return { ...state, phase: 'filling', expect: 'digit' };
    }
    if (state.phase === 'secondCrust') {
      if (value === state.fillingRegion) return undefined;
      return { phase: 'after', expect: 'digit' };
    }
    return { phase: state.phase, expect: 'digit' };
  },
  accept: state => state.phase === 'after' && state.expect === 'digit',
  maxDepth: 18,
}, 9);

const sandwichRegions = sandwichClues.map(([id]) => {
  const cells = lineCells(id);
  const digitRegionPairs = cells.flatMap(cell => [cell, cc.at(cell)]);
  return new NFA(sandwichRegionNFA, 'Sandwich regions', ...digitRegionPairs);
});

// TI1..TI9 say whether each chaos-region label is interior (1) or touches the
// grid edge (2). A small NFA scans one flag followed by every boundary label.
const interior = new Var('I', 'region interior flags', 9);
const boundaryCells = graph.cells().filter(cell => {
  const { row, col } = parseCellId(cell);
  return row === 1 || row === 9 || col === 1 || col === 9;
});

const edgeFlagNFA = label => NFA.encodeSpec({
  startState: { flag: null, seen: false },
  transition: ({ flag, seen }, value) => flag === null
    ? { flag: value, seen: false }
    : { flag, seen: seen || value === label },
  accept: ({ flag, seen }) => flag === (seen ? 2 : 1),
}, 9);

const edgeFlags = Array.from({ length: 9 }, (_, i) => new NFA(
  edgeFlagNFA(i + 1),
  `Region ${i + 1} interior`,
  interior.cell(i + 1),
  ...cc.at(boundaryCells),
));

const pieClues = [
  { col: 3, total: 17 },
  { col: 7, total: 23 },
];
const pieCells = new Var('P', 'pie membership in clued columns', 18);

// For each cell in a pie-clued column, map its chaos-region label through the
// nine region flags. The cell flag is 1 exactly for an interior-region cell.
const pieLookupNFA = NFA.encodeSpec({
  startState: { step: 0, region: null, pie: null },
  transition(state, value) {
    if (state.step === 0) return { step: 1, region: value, pie: null };
    if (state.step === 1) return { ...state, step: 2, pie: value };
    if (state.step >= 11) return undefined;
    const flagIndex = state.step - 1;
    if (flagIndex === state.region && value !== state.pie) return undefined;
    return { ...state, step: state.step + 1 };
  },
  accept: state => state.step === 11,
}, 9);

const pieCellDefs = pieClues.flatMap(({ col }, clueIndex) =>
  graph.column(col).map((cell, rowIndex) => ({
    cell,
    flag: pieCells.cell(clueIndex * 9 + rowIndex + 1),
  }))
);

const pieLookups = pieCellDefs.map(({ cell, flag }) => new NFA(
  pieLookupNFA,
  'Pie region lookup',
  cc.at(cell), flag,
  ...Array.from({ length: 9 }, (_, i) => interior.cell(i + 1)),
));

const pieSumNFA = total => NFA.encodeSpec({
  startState: { sum: 0, digit: null },
  transition: ({ sum, digit }, value) => {
    if (digit === null) return { sum, digit: value };
    const next = sum + (value === 1 ? digit : 0);
    if (next > total) return undefined;
    return { sum: next, digit: null };
  },
  accept: ({ sum, digit }) => digit === null && sum === total,
}, 9);

const pieSums = pieClues.map(({ total }, clueIndex) => {
  const defs = pieCellDefs.slice(clueIndex * 9, clueIndex * 9 + 9);
  return new NFA(
    pieSumNFA(total),
    `Pie sum ${total}`,
    ...defs.flatMap(({ cell, flag }) => [cell, flag]),
  );
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  interior,
  pieCells,
  ...Array.from({ length: 9 }, (_, i) => new Given(interior.cell(i + 1), 1, 2)),
  ...Array.from({ length: 18 }, (_, i) => new Given(pieCells.cell(i + 1), 1, 2)),
  ...sandwichClues.map(([id, total]) =>
    Sandwich.fromCells(total, lineCells(id), geometry)),
  ...sandwichRegions,
  ...edgeFlags,
  ...pieLookups,
  ...pieSums,
];
