// Title: SVS (293) - Sudoku Switch
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=-IDVvDbj0FM
// Source: https://app.crackingthecryptic.com/webapp/bNbfFpnH7J
//
// Normal sudoku. Each cage sums to the printed total with no repeated digits
// inside it (Cage already enforces both). Each outside clue gives the number
// of parity (odd/even) switches between consecutive digits along its whole
// row or column; rows/columns with no printed clue are unconstrained.

const CAGES = [
  // sum, cells -- transcribed from the payload's `cages` array
  [13, ['R3C1', 'R4C1', 'R3C2', 'R4C2']],
  [21, ['R1C3', 'R2C3', 'R1C4', 'R2C4']],
  [28, ['R3C3', 'R4C3', 'R3C4', 'R4C4']],
  [18, ['R5C3', 'R6C3', 'R5C4', 'R6C4']],
  [15, ['R7C3', 'R8C3', 'R7C4', 'R8C4']],
  [23, ['R6C1', 'R7C1', 'R6C2', 'R7C2']],
  [17, ['R1C6', 'R2C6', 'R1C7', 'R2C7']],
  [29, ['R3C6', 'R4C6', 'R3C7', 'R4C7']],
  [13, ['R5C6', 'R6C6', 'R5C7', 'R6C7']],
  [23, ['R7C6', 'R8C6', 'R7C7', 'R8C7']],
  [16, ['R3C8', 'R4C8', 'R3C9', 'R4C9']],
  [20, ['R6C8', 'R7C8', 'R6C9', 'R7C9']],
];

// Outside parity-switch clues -- transcribed from the payload's `overlays`
// array (position settles row-clue vs column-clue and which line).
const ROW_SWITCHES = { 1: 6, 3: 7, 4: 2, 6: 3, 7: 6, 9: 5 };
const COL_SWITCHES = { 1: 1, 2: 5, 3: 5, 4: 6, 6: 2, 7: 7, 8: 6, 9: 6 };

const graph = cellGraph('9x9');

const cages = CAGES.map(([sum, cells]) => new Cage(sum, ...cells));

// One NFA per distinct target switch-count, scanning all 9 cells of a row or
// column. State carries the previous cell's parity (null before the first
// cell) and the running switch count, clamped at target+1 once the clue can
// only fail.
const switchNFACache = new Map();
const switchNFA = (target) => {
  if (!switchNFACache.has(target)) {
    switchNFACache.set(target, NFA.encodeSpec({
      startState: { prevParity: null, count: 0 },
      transition: ({ prevParity, count }, value) => {
        const parity = value % 2;
        if (prevParity === null) return { prevParity: parity, count: 0 };
        const switched = parity !== prevParity ? 1 : 0;
        return { prevParity: parity, count: Math.min(count + switched, target + 1) };
      },
      accept: ({ count }) => count === target,
    }, 9));
  }
  return switchNFACache.get(target);
};

const rowSwitches = Object.entries(ROW_SWITCHES).map(([row, target]) =>
  new NFA(switchNFA(target), `row ${row} switches=${target}`, ...graph.row(+row)));
const colSwitches = Object.entries(COL_SWITCHES).map(([col, target]) =>
  new NFA(switchNFA(target), `col ${col} switches=${target}`, ...graph.column(+col)));

return [
  new Shape('9x9'),
  ...cages,
  ...rowSwitches,
  ...colSwitches,
];
