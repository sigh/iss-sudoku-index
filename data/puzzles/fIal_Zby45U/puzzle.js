// Title: Sinking City
// Author: MonkeyApprentice
// Video: https://www.youtube.com/watch?v=fIal_Zby45U
// Source: https://sudokupad.app/tsxhzpwal7

// Sudoku uses the digits 0-8. Exactly one cell in every row, column, and box
// is condemned, and the nine condemned cells contain the digits 0-8 exactly
// once. A condemned cell has effective height 0 for skyscraper clues.

const shape = new Shape('9x9', '0-8');
const graph = cellGraph(shape);
const condemned = graph.makeOverlay('VC');

// All condemned flags are Boolean. Replicate expresses the same domain at
// every translated overlay position without listing 81 equivalent Givens.
const flagDomain = condemned.makeReplicate(new Given(condemned.at('R1C1'), 0, 1));

// Each row, column, and box contains exactly one condemned cell.
const condemnedHouseCounts = graph.rowsColumnsBoxes().map(house =>
  new Sum(1, ...condemned.at(house))
);

// For each digit 0-8, exactly one flagged cell contains that digit. Together
// with the house counts, this states that the condemned digits are the full
// set 0-8. The scan reads [digit, flag] for every cell.
const digitAndFlagCells = graph.cells().flatMap(cell => [cell, condemned.at(cell)]);
const condemnedDigitCounts = [];
for (let target = 0; target <= 8; target++) {
  const machine = NFA.encodeSpec({
    startState: { phase: 0, matches: false, count: 0 },
    transition(state, value) {
      if (state.phase === 0) {
        return { phase: 1, matches: value === target, count: state.count };
      }
      if (value !== 0 && value !== 1) return undefined;
      const count = state.count + (state.matches && value === 1 ? 1 : 0);
      return count <= 1
        ? { phase: 0, matches: false, count }
        : undefined;
    },
    accept: state => state.phase === 0 && state.count === 1,
    maxDepth: digitAndFlagCells.length,
  }, shape);
  condemnedDigitCounts.push(new NFA(
    machine,
    `condemned digit ${target} exactly once`,
    ...digitAndFlagCells,
  ));
}

// A skyscraper clue scans [digit, condemnedFlag] pairs from the clue inward.
// Effective height is 0 for condemned cells and otherwise the grid digit.
// Height 0 is never visible, including an ordinary grid digit 0.
function sinkingSkyscraper(clue, cells, label) {
  const inputs = cells.flatMap(cell => [cell, condemned.at(cell)]);
  const machine = NFA.encodeSpec({
    startState: { phase: 0, pending: null, maxHeight: 0, visible: 0 },
    transition(state, value) {
      if (state.phase === 0) {
        return {
          phase: 1,
          pending: value,
          maxHeight: state.maxHeight,
          visible: state.visible,
        };
      }
      if (value !== 0 && value !== 1) return undefined;
      const height = value === 1 ? 0 : state.pending;
      const isVisible = height > state.maxHeight;
      const visible = state.visible + (isVisible ? 1 : 0);
      if (visible > clue) return undefined;
      return {
        phase: 0,
        pending: null,
        maxHeight: Math.max(state.maxHeight, height),
        visible,
      };
    },
    accept: state => state.phase === 0 && state.visible === clue,
    maxDepth: inputs.length,
  }, shape);
  return new NFA(machine, label, ...inputs);
}

const skyscrapers = [
  sinkingSkyscraper(3, graph.column(2), 'top C2 skyscraper'),
  sinkingSkyscraper(8, graph.column(5).reverse(), 'bottom C5 skyscraper'),
  sinkingSkyscraper(2, graph.row(1), 'left R1 skyscraper'),
  sinkingSkyscraper(4, graph.row(1).reverse(), 'right R1 skyscraper'),
  sinkingSkyscraper(1, graph.row(5), 'left R5 skyscraper'),
  sinkingSkyscraper(4, graph.row(9), 'left R9 skyscraper'),
  sinkingSkyscraper(1, graph.row(9).reverse(), 'right R9 skyscraper'),
];

// Dots also use effective heights, so each four-cell scan reads
// [digitA, flagA, digitB, flagB] and applies its relation after replacing a
// condemned digit by 0.
function effectiveDotMachine(relation) {
  return NFA.encodeSpec({
    startState: { phase: 0, digitA: null, heightA: null, digitB: null },
    transition(state, value) {
      if (state.phase === 0) {
        return { phase: 1, digitA: value, heightA: null, digitB: null };
      }
      if (state.phase === 1) {
        if (value !== 0 && value !== 1) return undefined;
        return {
          phase: 2,
          digitA: null,
          heightA: value === 1 ? 0 : state.digitA,
          digitB: null,
        };
      }
      if (state.phase === 2) {
        return { phase: 3, digitA: null, heightA: state.heightA, digitB: value };
      }
      if (value !== 0 && value !== 1) return undefined;
      const heightB = value === 1 ? 0 : state.digitB;
      return relation(state.heightA, heightB) ? { phase: 4 } : undefined;
    },
    accept: state => state.phase === 4,
    maxDepth: 4,
  }, shape);
}

const whiteDotMachine = effectiveDotMachine((a, b) => Math.abs(a - b) === 1);
const blackDotMachine = effectiveDotMachine((a, b) => a === 2 * b || b === 2 * a);
const dotConstraint = (machine, label, [a, b]) => new NFA(
  machine,
  label,
  a, condemned.at(a), b, condemned.at(b),
);

const whiteDots = [
  ['R1C1', 'R1C2'],
  ['R1C2', 'R1C3'],
  ['R3C2', 'R3C3'],
  ['R3C3', 'R3C4'],
  ['R8C6', 'R9C6'],
  ['R9C1', 'R9C2'],
].map(cells => dotConstraint(whiteDotMachine, 'white dot', cells));

const blackDots = [
  ['R1C7', 'R1C8'],
  ['R1C8', 'R1C9'],
  ['R5C1', 'R5C2'],
  ['R6C7', 'R6C8'],
].map(cells => dotConstraint(blackDotMachine, 'black dot', cells));

return [
  shape,
  condemned.toVar('condemned flags'),
  flagDomain,
  ...condemnedHouseCounts,
  ...condemnedDigitCounts,
  ...skyscrapers,
  new Given('R2C3', 8),
  new Given('R3C9', 3),
  new Given('R4C9', 8),
  new Given('R6C3', 2),
  new Given('R6C4', 7),
  new Given('R8C9', 2),
  ...whiteDots,
  ...blackDots,
];
