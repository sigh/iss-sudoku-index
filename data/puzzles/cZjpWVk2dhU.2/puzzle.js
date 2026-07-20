// Title: Queens
// Author: Bartok_the_Magnificent
// Video: https://www.youtube.com/watch?v=cZjpWVk2dhU
// Source: https://sudokupad.app/f7vz1zvw81

// VQ is a parallel marker layer: 1 means queen and 2 means non-queen.
// Each row, column, and jigsaw region contains exactly one queen marker.

const QUEEN = 1;
const NON_QUEEN = 2;

const graph = cellGraph('6x6');
const queens = graph.makeOverlay('VQ');
const cells = graph.cells();

const regions = [
  ['R1C1', 'R1C2', 'R2C1', 'R3C1', 'R3C2', 'R4C1'],
  ['R1C3', 'R2C2', 'R2C3', 'R2C4', 'R3C3', 'R3C4'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6', 'R4C6'],
  ['R4C2', 'R4C3', 'R4C4', 'R5C1', 'R5C2', 'R5C3'],
  ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6'],
  ['R2C5', 'R3C5', 'R4C5', 'R5C4', 'R5C5', 'R5C6'],
];

const blackDots = [
  ['R1C2', 'R1C3'],
  ['R1C6', 'R2C6'],
  ['R2C3', 'R3C3'],
  ['R3C6', 'R4C6'],
  ['R4C4', 'R4C5'],
  ['R4C5', 'R5C5'],
  ['R5C2', 'R6C2'],
];

const exactlyOneQueen = group => new ContainExact('1', ...queens.at(group));
const queenCounts = [
  ...Array.from({ length: 6 }, (_, i) => exactlyOneQueen(graph.row(i + 1))),
  ...Array.from({ length: 6 }, (_, i) => exactlyOneQueen(graph.column(i + 1))),
  ...regions.map(exactlyOneQueen),
];

const noTouchKey = Pair.fnToKey(
  (a, b) => a !== QUEEN || b !== QUEEN,
  6,
);
const queenNoTouch = cells.flatMap(cell => graph.kingNeighbours(cell)
  .filter(other => cells.indexOf(cell) < cells.indexOf(other))
  .map(other => new Pair(noTouchKey, 'queens do not touch',
    queens.at(cell), queens.at(other))));

// Reads queen marker, digit, queen marker, digit for an orthogonal pair.
// If either endpoint is a queen, its digit must be neither consecutive to nor
// in a 2:1 ratio with the other endpoint's digit.
const queenAdjacencyMachine = NFA.encodeSpec({
  startState: { phase: 'a-marker' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'a-marker':
        return { phase: 'a-digit', aQueen: value === QUEEN };
      case 'a-digit':
        return { phase: 'b-marker', aQueen: state.aQueen, aDigit: value };
      case 'b-marker':
        return {
          phase: 'b-digit',
          aQueen: state.aQueen,
          aDigit: state.aDigit,
          bQueen: value === QUEEN,
        };
      case 'b-digit': {
        const related = Math.abs(state.aDigit - value) === 1
          || state.aDigit === 2 * value
          || value === 2 * state.aDigit;
        return (state.aQueen || state.bQueen) && related
          ? undefined
          : { phase: 'done' };
      }
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'done',
}, 6);

const queenDigitRules = cells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(queenAdjacencyMachine, 'queen adjacency',
    queens.at(cell), cell, queens.at(other), other)));

return [
  new Shape('6x6'),
  new NoBoxes(),
  ...regions.map(region => new Jigsaw('6x6', ...region)),
  new Given('R3C4', 3),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  queens.toVar('queen markers'),
  queens.makeReplicate(new Given(queens.cells()[0], QUEEN, NON_QUEEN)),
  ...queenCounts,
  ...queenNoTouch,
  ...queenDigitRules,
];
