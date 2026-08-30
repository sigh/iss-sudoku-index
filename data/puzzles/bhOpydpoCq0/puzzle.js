// Title: First Seen Odd/Even Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=bhOpydpoCq0
// Source: https://cracking-the-cryptic.web.app/sudoku/7jjMpG82d9

// Normal sudoku (standard 3x3 boxes, no givens). Numbers outside the grid
// show, if odd, the first odd number seen scanning into the grid from that
// direction, and if even, the first even number seen scanning into the grid
// from that direction: each clue's own parity says which quantity it names.
//
// Left/right lanes each carry two stacked clues (one odd, one even, in either
// printed order); top/bottom lanes carry one clue each.

const graph = cellGraph('9x9');

// One machine per printed clue. State tracks only whether a cell matching the
// clue's own parity has been seen yet ("found"); before that, every cell must
// have the opposite parity, and the first matching-parity cell must equal the
// clue. Once found, later cells are unconstrained. `cells` must already be
// ordered outward from the viewer (the side the clue is printed on).
const firstSeenNFA = (clue, cells) => {
  const wantOdd = clue % 2 === 1;
  const spec = NFA.encodeSpec({
    startState: { found: false },
    transition: ({ found }, value) => {
      if (found) return { found: true };
      if ((value % 2 === 1) !== wantOdd) return { found: false };
      return value === clue ? { found: true } : undefined;
    },
    accept: ({ found }) => found,
  }, 9);
  return new NFA(spec, 'firstSeen', ...cells);
};

// Row -> [clue, clue] printed to the left of that row (one odd, one even).
const leftClues = {
  1: [5, 6], 2: [3, 4], 3: [7, 8], 4: [9, 4],
  5: [7, 2], 6: [5, 4], 7: [3, 2], 8: [1, 4],
};
// Row -> [clue, clue] printed to the right of that row (one odd, one even).
const rightClues = {
  2: [8, 1], 3: [2, 9], 4: [6, 5], 5: [4, 3],
  6: [2, 7], 7: [8, 5], 8: [6, 9], 9: [4, 1],
};
// Col -> clue printed above that column.
const topClues = { 1: 7, 2: 5, 3: 9, 4: 1, 5: 5, 6: 9, 7: 7, 8: 9 };
// Col -> clue printed below that column.
const bottomClues = { 2: 2, 3: 4, 4: 6, 5: 2, 6: 4, 7: 4, 8: 6, 9: 4 };

const rowNFAs = [];
for (let row = 1; row <= 9; row++) {
  const leftToRight = graph.row(row);
  for (const clue of leftClues[row] ?? []) {
    rowNFAs.push(firstSeenNFA(clue, leftToRight));
  }
  for (const clue of rightClues[row] ?? []) {
    rowNFAs.push(firstSeenNFA(clue, leftToRight.slice().reverse()));
  }
}

const colNFAs = [];
for (let col = 1; col <= 9; col++) {
  const topToBottom = graph.column(col);
  if (col in topClues) colNFAs.push(firstSeenNFA(topClues[col], topToBottom));
  if (col in bottomClues) {
    colNFAs.push(firstSeenNFA(bottomClues[col], topToBottom.slice().reverse()));
  }
}

return [
  new Shape('9x9'),
  ...rowNFAs,
  ...colNFAs,
];
