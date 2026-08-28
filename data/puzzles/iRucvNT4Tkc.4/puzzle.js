// Title: Outside Parity
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=iRucvNT4Tkc
// Source: https://tinyurl.com/rrbebjn5

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once.
//
// Outside parity clue (7 printed on the board): reading inward from
// the clue's side, the first N digits share one parity and digit N+1 is the
// other parity -- N is the length of the leading same-parity run before the
// first parity change. Encoded per clue as a same-parity chain over the
// clue's first N cells (adjacent pairs within one Pair(...) cell list chain
// transitively to "all N cells share parity") plus one different-parity
// Pair between cell N and cell N+1.
const givens = [
  ['R1C2', 2], ['R1C8', 3],
  ['R2C1', 1], ['R2C9', 4],
  ['R3C4', 2], ['R3C6', 3],
  ['R4C3', 1], ['R4C7', 4],
  ['R6C3', 8], ['R6C7', 5],
  ['R7C4', 7], ['R7C6', 6],
  ['R8C1', 8], ['R8C9', 5],
  ['R9C2', 7], ['R9C8', 6],
];

const samePar = Pair.fnToKey((a, b) => (a % 2) === (b % 2), 9);
const diffPar = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);

// Each entry: [label, N, (N+1) cells running from the clue's side inward --
// the N-cell run followed by the one breaking cell]. Transcribed from the
// seven printed outside digits, one clue per row/column side that has one.
const outsideClues = [
  ['row3-left', 2, ['R3C1', 'R3C2', 'R3C3']],
  ['row3-right', 2, ['R3C9', 'R3C8', 'R3C7']],
  ['row4-left', 2, ['R4C1', 'R4C2', 'R4C3']],
  ['row5-left', 5, ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6']],
  ['row7-right', 3, ['R7C9', 'R7C8', 'R7C7', 'R7C6']],
  ['col3-top', 2, ['R1C3', 'R2C3', 'R3C3']],
  ['col5-top', 5, ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5']],
];

const outsideConstraints = outsideClues.flatMap(([label, n, cells]) => {
  const run = cells.slice(0, n);
  const breakPair = cells.slice(n - 1, n + 1);
  return [
    ...(run.length > 1
      ? [new Pair(samePar, `${label} same-parity run`, ...run)]
      : []),
    new Pair(diffPar, `${label} parity change`, ...breakPair),
  ];
});

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...outsideConstraints,
];
