// Title: Gross Misconduct
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=ovyYdEsYvZo
// Source: https://sudokupad.app/rvzdb6nk86

// The main grid uses 1-9 for the digits and 10/11/12 for R/B/C. Every clue
// acts on a derived value: digits retain their value, R takes the row number,
// B the 3x4 box number, and C the column number.
const graph = cellGraph('12x12');
const boxOf = (row, col) =>
  3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 4) + 1;

const dots = [
  ['RcC1', 'RcC2'], ['RcC3', 'RcC4'], ['RcC5', 'RcC6'],
  ['RcC7', 'RcC8'], ['RcC9', 'RcCa'], ['R5C2', 'R5C3'],
  ['R4C2', 'R4C3'], ['R4C3', 'R4C4'], ['R5C3', 'R5C4'],
  ['R4C1', 'R4C2'], ['R4C4', 'R4C5'], ['R9C4', 'R9C5'],
  ['R4C2', 'R5C2'], ['R4C4', 'R5C4'], ['R4C3', 'R5C3'],
  ['R8C5', 'R9C5'], ['R1C1', 'R2C1'], ['R2C7', 'R3C7'],
  ['R2C8', 'R3C8'],
];

const whisperLines = [
  ['R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8',
    'R3C9', 'R3Ca', 'R3Cb', 'R3Cc'],
  ['RbCc', 'RaCc', 'RbCb', 'RaCa', 'RbCa', 'RbC9', 'RcC9'],
  ['R7Ca', 'R6Ca', 'R5Ca', 'R4Ca'],
  ['R6C5', 'R7C5', 'R7C6', 'R6C6', 'R6C5'],
];

const renbanLines = [
  ['RcC1', 'RbC1', 'RaC1', 'R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1'],
  ['RbC3', 'RbC4', 'RaC4', 'R9C4'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R4Cb', 'R5Cb', 'R5Cc'],
  ['R9C6', 'RaC6', 'RaC7', 'R9C7'],
];

const sameDifferenceLines = [
  ['R2C9', 'R2Ca', 'R2Cb', 'R2Cc', 'R1Cc'],
  ['R1C8', 'R1C9', 'R1Ca', 'R1Cb'],
  ['RbC5', 'RbC6', 'RbC7', 'RaC8', 'R9C9', 'R8Ca', 'R7Cb', 'R6Cc'],
  ['R5C8', 'R5C9', 'R4C9'],
  ['R2C2', 'R2C3', 'R2C4'],
  ['R7C7', 'R8C7', 'R8C8', 'R7C8', 'R7C7'],
];

const arrowLines = [
  ['R3C6', 'R2C5', 'R1C4'],
  ['R1C5', 'R1C6', 'R1C7'],
  ['R9C3', 'R8C4', 'R7C3', 'R6C2', 'R5C3'],
  ['R9C2', 'R8C3', 'R7C2'],
  ['R9Cc', 'R9Cb', 'R9Ca', 'RaCb'],
  ['R7C4', 'R6C3'],
  ['RaC5', 'RaC4', 'RaC3'],
];

// Only cells participating in arithmetic clues need parallel value Vars.
const clueCells = [...new Set([
  ...dots.flat(),
  ...whisperLines.flat(),
  ...renbanLines.flat(),
  ...sameDifferenceLines.flat(),
  ...arrowLines.flat(),
])].sort((a, b) => {
  const ca = parseCellId(a);
  const cb = parseCellId(b);
  return ca.row - cb.row || ca.col - cb.col;
});
const values = graph.makeOverlay('VV', clueCells);

const valueBindings = clueCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const box = boxOf(row, col);
  const key = Pair.fnToKey(
    (symbol, value) => value === (
      symbol === 10 ? row : symbol === 11 ? box : symbol === 12 ? col : symbol),
    12);
  return new Pair(key, 'derived value', cell, values.at(cell));
});

const doubleKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 12);
const blackDots = dots.map(([a, b]) =>
  new Pair(doubleKey, 'black dot', values.at(a), values.at(b)));

const sameDifferenceSpec = NFA.encodeSpec({
  startState: { prev: null, diff: null },
  transition: ({ prev, diff }, value) => {
    if (prev === null) return { prev: value, diff: null };
    const nextDiff = Math.abs(value - prev);
    if (diff === null) return { prev: value, diff: nextDiff };
    if (nextDiff !== diff) return undefined;
    return { prev: value, diff };
  },
  accept: () => true,
}, 12);

return [
  new Shape('12x12'),
  new RegionSize(12),
  values.toVar('derived clue value'),
  ...valueBindings,
  ...blackDots,
  ...whisperLines.map(cells => new Whisper(5, ...values.at(cells))),
  ...renbanLines.map(cells => new Renban(...values.at(cells))),
  ...sameDifferenceLines.map(cells =>
    new NFA(sameDifferenceSpec, 'same-difference', ...values.at(cells))),
  ...arrowLines.map(cells => new Arrow(...values.at(cells))),
];
