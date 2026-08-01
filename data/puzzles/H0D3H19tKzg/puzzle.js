// Title: XV Binairo
// Author: Panthera
// Video: https://www.youtube.com/watch?v=H0D3H19tKzg
// Source: https://app.crackingthecryptic.com/GqRgj6rq3h

// Normal Sudoku, Binairo parity rules, the drawn thermo, and the drawn XV marks.
// The NFA forbids three consecutive equal parities. Pair disjunctions require
// every pair of rows and every pair of columns to differ in parity somewhere.
const parity = value => value % 2;
const cellsInRow = row => Array.from({length: 9}, (_, col) => makeCellId(row, col + 1));
const cellsInColumn = col => Array.from({length: 9}, (_, row) => makeCellId(row + 1, col));

const noThreeSameParity = NFA.encodeSpec({
  startState: {last: []},
  transition: ({last}, value) => {
    const next = [...last, parity(value)].slice(-2);
    if (last.length === 2 && last[0] === last[1] && last[1] === parity(value)) {
      return undefined;
    }
    return {last: next};
  },
  accept: () => true,
  maxDepth: 9,
}, 9);

const oppositeParityKey = Pair.fnToKey((a, b) => parity(a) !== parity(b), 9);

const rows = Array.from({length: 9}, (_, index) => cellsInRow(index + 1));
const columns = Array.from({length: 9}, (_, index) => cellsInColumn(index + 1));
const parityLines = [...rows, ...columns].map(cells => new NFA(noThreeSameParity, 'no three equal parities', cells));
const parityPairs = groups => groups.flatMap((first, firstIndex) =>
  groups.slice(firstIndex + 1).map(second => new Or(
    first.map((cell, index) => new Pair(
      oppositeParityKey, 'opposite parity', cell, second[index])))));

// XV coordinates are transcribed from the X and V edge markers in the source art.
const xs = [
  ['R6C3', 'R7C3'], ['R6C4', 'R7C4'], ['R3C6', 'R4C6'], ['R3C7', 'R4C7'],
  ['R2C6', 'R2C7'], ['R8C3', 'R8C4'], ['R2C2', 'R2C3'], ['R8C7', 'R8C8'],
  ['R9C7', 'R9C8'], ['R1C2', 'R1C3'], ['R7C1', 'R8C1'], ['R2C9', 'R3C9'],
  ['R1C5', 'R1C6'],
].map(cells => new X(...cells));
const vs = [
  ['R6C7', 'R6C8'], ['R4C2', 'R5C2'], ['R9C3', 'R9C4'], ['R3C1', 'R3C2'],
].map(cells => new V(...cells));

return [
  new Shape('9x9'),
  ...parityLines,
  ...parityPairs(rows),
  ...parityPairs(columns),
  new Thermo('R9C8', 'R8C9'),
  ...xs,
  ...vs,
];
