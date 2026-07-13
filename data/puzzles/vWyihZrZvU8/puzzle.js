// Title: Liar Sudoku
// Author: Czechia GP Authors
// Video: https://www.youtube.com/watch?v=vWyihZrZvU8
// Source: https://sudokupad.app/hti4xerqfw

// Normal sudoku rules apply. 41 cells carry a printed digit ("given"), but
// exactly one given in each row, each column and each 3x3 box is wrong (the
// true digit there differs from what is printed); every other given in that
// row/column/box is correct.
//
// Because the printed digits are not reliable, they cannot be loaded as
// ordinary `Given`s. Instead each printed cell gets an auxiliary flag Var
// (1 = printed digit is correct, 2 = printed digit is wrong), an NFA linking
// the flag to the actual grid digit, and a `ContainExact('2', ...)` over the
// flags of each row/column/box forcing exactly one liar per group.

const givens = [
  ['R1C2', 7], ['R1C3', 5], ['R1C5', 2], ['R1C7', 8], ['R1C8', 1],
  ['R2C1', 6], ['R2C3', 9], ['R2C4', 3], ['R2C6', 1], ['R2C9', 7],
  ['R3C1', 3], ['R3C6', 6], ['R3C8', 5], ['R3C9', 4],
  ['R4C2', 9], ['R4C3', 1], ['R4C4', 5], ['R4C6', 3], ['R4C8', 9],
  ['R5C1', 2], ['R5C5', 4], ['R5C9', 5],
  ['R6C2', 5], ['R6C4', 2], ['R6C6', 9], ['R6C7', 8], ['R6C8', 6],
  ['R7C1', 9], ['R7C2', 4], ['R7C4', 7], ['R7C9', 8],
  ['R8C1', 7], ['R8C4', 1], ['R8C6', 5], ['R8C7', 4], ['R8C9', 6],
  ['R9C2', 1], ['R9C3', 4], ['R9C5', 9], ['R9C7', 5], ['R9C8', 7],
];

// One flag Var per given cell: VL1..VLn. 1 = truthful, 2 = lying.
const flagVar = new Var('L', 'liar flags', givens.length);
const flags = givens.map((_, i) => flagVar.cell(i + 1));

// Link each flag to its cell: flag=1 forces the cell to equal the printed
// digit; flag=2 forces it to differ. This is a 2-cell (flag, cell) relation,
// so use Pair rather than NFA. Cache one key per printed digit, since only
// the digit (not the cell) determines the relation.
const pairKeyByDigit = new Map();
const getLiarPairKey = (digit) => {
  if (!pairKeyByDigit.has(digit)) {
    const fn = (flagValue, cellValue) =>
      (flagValue === 1 && cellValue === digit) ||
      (flagValue === 2 && cellValue !== digit);
    pairKeyByDigit.set(digit, Pair.fnToKey(fn, /* numValues= */ 9));
  }
  return pairKeyByDigit.get(digit);
};

// Exactly one liar per row, column and box, counted only over the printed
// (given) cells that fall in that group.
const groupFlags = new Map(); // key -> flag id array
const addToGroup = (key, flag) => {
  if (!groupFlags.has(key)) groupFlags.set(key, []);
  groupFlags.get(key).push(flag);
};
givens.forEach(([cell, _digit], i) => {
  const { row, col } = parseCellId(cell);
  addToGroup(`row${row}`, flags[i]);
  addToGroup(`col${col}`, flags[i]);
  addToGroup(`box${Math.floor((row - 1) / 3)}_${Math.floor((col - 1) / 3)}`, flags[i]);
});

return [
  new Shape('9x9'),
  flagVar,
  ...flags.map(flag => new Given(flag, 1, 2)),
  ...givens.map(([cell, digit], i) => new Pair(getLiarPairKey(digit), 'Liar', flags[i], cell)),
  ...Array.from(groupFlags.values()).map(flagsInGroup => new ContainExact('2', ...flagsInGroup)),
];
