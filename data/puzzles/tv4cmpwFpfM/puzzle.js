// Title: Battlefield Sudoku - Use the Force
// Author: DiMono
// Video: https://www.youtube.com/watch?v=tv4cmpwFpfM
// Source: https://app.crackingthecryptic.com/sudoku/87b3n8FJFN

// Normal sudoku rules apply.
//
// Battlefield: for each row and column, let X be the digit in its first cell
// and Y the digit in its last cell. Consider the first X cells and the last Y
// cells of that row/column (both counted from the row/column's own ends).
// These two spans either overlap (when X+Y>9, over positions (10-Y)..X) or
// leave a gap (when X+Y<9, over positions (X+1)..(9-Y)); when X+Y==9 the
// spans meet exactly, with neither an overlap nor a gap, and the sum is 0.
// Outside clues give this sum for every row (1-9) and for columns 1, 4, 5, 6
// and 9.

const N = 9;

const rowCells = r => Array.from({ length: N }, (_, i) => makeCellId(r, i + 1));
const colCells = c => Array.from({ length: N }, (_, i) => makeCellId(i + 1, c));

// [row-or-column number (1-indexed), outside sum] -- read as the overlay text
// at the border, e.g. the left clue "13" against row 1.
const rowClues = [
  [1, 13], [2, 34], [3, 2], [4, 39], [5, 5], [6, 37], [7, 17], [8, 0], [9, 31],
];
const colClues = [[1, 21], [4, 15], [5, 7], [6, 9], [9, 18]];

// The overlap ('from'..'to' with sign '+') or gap (sign '-') position range
// for a line whose first/last cell digits are x/y, or null when x+y==N
// (spans meet exactly; no overlap, no gap, sum 0).
const battlefieldRange = (x, y) => {
  if (x + y > N) return { from: N + 1 - y, to: x };
  if (x + y < N) return { from: x + 1, to: N - y };
  return null;
};

// One outside-sum clue: an Or over every (x, y) digit pair for the line's
// first/last cells that is consistent with `sum`, each branch pinning those
// two cells and, when the resulting region is non-empty, requiring it to sum
// to `sum`. A meet-exactly pairing (x+y==N, empty region) is only consistent
// with sum==0, and needs no Sum constraint since there are no region cells.
const battlefieldSumClue = (cells, sum) => {
  const branches = [];
  for (let x = 1; x <= N; x++) {
    for (let y = 1; y <= N; y++) {
      const range = battlefieldRange(x, y);
      const pins = [new Given(cells[0], x), new Given(cells[N - 1], y)];
      if (range === null) {
        if (sum === 0) branches.push(new And(pins));
        continue;
      }
      const region = cells.slice(range.from - 1, range.to);
      branches.push(new And([...pins, new Sum(sum, ...region)]));
    }
  }
  return new Or(branches);
};

const battlefieldSumClues = [
  ...rowClues.map(([r, sum]) => battlefieldSumClue(rowCells(r), sum)),
  ...colClues.map(([c, sum]) => battlefieldSumClue(colCells(c), sum)),
];

return [
  new Shape('9x9'),
  ...battlefieldSumClues,
];
