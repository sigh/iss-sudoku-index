// Title: "SIGMA"tized
// Author: Purab Pal
// Video: https://www.youtube.com/watch?v=sZ-KRO-82og
// Source: https://sudokupad.app/yffxa7cuz1

// Normal sudoku; digits on both marked main diagonals do not repeat. On a
// black dot one digit is double the other; on a white dot the digits are
// consecutive (dots have no negative constraint). Digits separated by a V
// sum to 5, and all V dominoes are given (the negative V constraint is
// encoded); X pairs sum to 10, but not all Xs are given. Adjacent digits on
// green lines differ by at least 5, exactly 5 on 2-cell green lines. Purple
// renban lines hold non-repeating consecutive digits in any order.

const givens = [];

const xMarks = [
  ['R1C1', 'R1C2'],
  ['R2C3', 'R3C3'],
  ['R2C7', 'R3C7'],
  ['R2C8', 'R2C9'],
  ['R7C8', 'R7C9'],
  ['R8C7', 'R9C7'],
  ['R9C8', 'R9C9'],
];

const vMarks = [
  ['R2C9', 'R3C9'],
  ['R3C7', 'R3C8'],
  ['R4C2', 'R4C3'],
  ['R4C5', 'R4C6'],
  ['R5C9', 'R6C9'],
  ['R6C8', 'R7C8'],
];

const blackDots = [
  ['R1C2', 'R2C2'],
  ['R2C2', 'R2C3'],
  ['R4C5', 'R5C5'],
  ['R5C5', 'R6C5'],
  ['R7C7', 'R8C7'],
  ['R9C4', 'R9C5'],
];

const whiteDots = [
  ['R5C5', 'R5C6'],
];

const renbans = [
  ['R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C5', 'R1C6', 'R1C5'],
  ['R4C3', 'R4C2', 'R4C1', 'R5C2', 'R6C1', 'R6C2', 'R6C3'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C8', 'R6C9', 'R6C8', 'R6C7'],
];

const twoCellGreenLines = [
  ['R1C8', 'R2C9'],
  ['R2C8', 'R3C9'],
  ['R2C7', 'R3C8'],
  ['R2C1', 'R2C2'],
];

const longGreenLines = [
  ['R6C6', 'R6C5', 'R7C4', 'R7C3', 'R8C4', 'R8C5', 'R8C6'],
  ['R8C1', 'R8C2', 'R8C3', 'R9C2', 'R9C1'],
];

const edgeKey = (a, b) => [a, b].sort().join('/');
const vEdges = new Set(vMarks.map(edge => edgeKey(...edge)));

const notVKey = Pair.fnToKey((a, b) => a + b !== 5, 9);
const exactFiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 5, 9);
const graph = cellGraph('9x9');

const nonVEdges = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cell = makeCellId(r, c);
    for (const [dr, dc] of [[1, 0], [0, 1]]) {
      if (r + dr > 9 || c + dc > 9) continue;
      const other = makeCellId(r + dr, c + dc);
      if (!vEdges.has(edgeKey(cell, other))) {
        nonVEdges.push([cell, other]);
      }
    }
  }
}

const nonVConstraints = [
  graph.makeReplicate(
    [new Pair(notVKey, 'not a hidden V', 'R1C1', 'R1C2')],
    nonVEdges.filter(([a, b]) => parseCellId(a).row === parseCellId(b).row).map(([a]) => a)),
  graph.makeReplicate(
    [new Pair(notVKey, 'not a hidden V', 'R1C1', 'R2C1')],
    nonVEdges.filter(([a, b]) => parseCellId(a).col === parseCellId(b).col).map(([a]) => a)),
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Diagonal(1),
  new Diagonal(-1),
  ...xMarks.map(edge => new X(...edge)),
  ...vMarks.map(edge => new V(...edge)),
  ...blackDots.map(edge => new BlackDot(...edge)),
  ...whiteDots.map(edge => new WhiteDot(...edge)),
  ...nonVConstraints,
  ...twoCellGreenLines.map(edge => new Pair(exactFiveKey, 'exactly 5 apart', ...edge)),
  ...longGreenLines.map(line => new Whisper(5, ...line)),
  ...renbans.map(line => new Renban(...line)),
];
