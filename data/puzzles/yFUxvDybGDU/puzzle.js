// Title: Rainbow Sandwich
// Author: Myxo
// Video: https://www.youtube.com/watch?v=yFUxvDybGDU
// Source: https://sudokupad.app/0tmwonfa8x

// Normal Sudoku, plus Rainbow Sandwiches: two hidden colors (their identity is
// not given) each occupy exactly one cell of every row, column and box, and
// digits do not repeat among the cells of one color. An outside clue gives the
// sum of the digits strictly between a row's or column's two colored cells,
// wherever the solver places them. Not every row/column carries a clue.

const NONE = 1;
const COLOR_A = 2;
const COLOR_B = 3;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const colors = graph.makeOverlay('VC');

// Exactly one cell of each color in every row, column and box.
const houseRules = [...graph.rows(), ...graph.columns(), ...graph.boxes()]
  .map(cells => new ContainExact(`${COLOR_A}_${COLOR_B}`, ...colors.at(cells)));

// Digits don't repeat within a color: scan every (color, digit) pair in the
// grid and reject a repeated digit at cells of the target color. The state is
// just a bitmask of digits already seen at that color, so it is
// order-independent -- the scan can walk the grid in any fixed order. The
// flag reading collapses immediately to a same/other-color boolean rather
// than storing the raw 1-9 flag value, which would otherwise multiply the
// compiled state count by the full value range and blow the NFA state cap.
function noRepeatMachine(color) {
  return NFA.encodeSpec({
    startState: { phase: 'flag', mask: 0 },
    transition: (state, value) => {
      if (state.phase === 'flag') {
        return { phase: 'digit', mask: state.mask, isColor: value === color };
      }
      if (!state.isColor) return { phase: 'flag', mask: state.mask };
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;
      return { phase: 'flag', mask: state.mask | bit };
    },
    accept: state => state.phase === 'flag',
  }, geometry.numValues);
}
const interleavedGrid = graph.cells().flatMap(cell => [colors.at(cell), cell]);
const noRepeatRules = [COLOR_A, COLOR_B].map(color => new NFA(
  noRepeatMachine(color), `rainbow-distinct-${color}`, ...interleavedGrid));

// Sandwich sum: scan a row/column's (color, digit) pairs, accumulate the sum
// while strictly between the first and second colored cell encountered (in
// either color order), and check the total once both have appeared. A running
// sum that exceeds the target is a dead branch, which keeps the state bounded.
// As above, the flag reading collapses to a marker/non-marker boolean
// immediately, rather than storing the raw flag value.
function sandwichMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'flag', stage: 'before', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'flag') {
        return {
          phase: 'digit', stage: state.stage, sum: state.sum,
          isMarker: value === COLOR_A || value === COLOR_B,
        };
      }
      const isMarker = state.isMarker;
      if (state.stage === 'before') {
        return { phase: 'flag', stage: isMarker ? 'between' : 'before', sum: 0 };
      }
      if (state.stage === 'between') {
        if (isMarker) return { phase: 'flag', stage: 'after', sum: state.sum };
        const sum = state.sum + value;
        return sum > target ? undefined : { phase: 'flag', stage: 'between', sum };
      }
      return { phase: 'flag', stage: 'after', sum: state.sum };
    },
    accept: state => state.stage === 'after' && state.sum === target,
  }, geometry.numValues);
}
function sandwichRule(target, cells) {
  return new NFA(sandwichMachine(target), 'rainbow-sandwich',
    ...cells.flatMap(cell => [colors.at(cell), cell]));
}

// Row clues (row, total), read from the badges left of the grid. Row 5 has
// no clue.
const rowClues = [[1, 27], [2, 22], [3, 2], [4, 15], [6, 29], [7, 5], [8, 24], [9, 28]];
// Column clues (column, total), read from the badges above the grid.
const colClues = [[1, 9], [5, 35], [9, 2]];

const sandwichRules = [
  ...rowClues.map(([row, total]) => sandwichRule(total, graph.row(row))),
  ...colClues.map(([col, total]) => sandwichRule(total, graph.column(col))),
];

return [
  new Shape('9x9'),
  colors.toVar('rainbow colors'),
  colors.makeReplicate(new Given(colors.cells()[0], NONE, COLOR_A, COLOR_B)),
  ...houseRules,
  ...noRepeatRules,
  ...sandwichRules,
];
