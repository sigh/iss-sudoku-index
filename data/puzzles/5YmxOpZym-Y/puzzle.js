// Title: Friendly Indexing Miracle
// Author: thoughtbyte
// Video: https://www.youtube.com/watch?v=5YmxOpZym-Y
// Source: https://app.crackingthecryptic.com/sudoku/Pbh6rNGPdg

// Normal sudoku rules apply, plus:
//
// A cell (r, c) is "friendly" if its value equals r, c, or its 3x3 box
// number (boxes numbered 1-9 in reading order). Every friendly cell with
// value v is both a column indexer and a row indexer:
//   column indexing: cell (r, v) holds value c
//   row indexing:    cell (v, c) holds value r
// (worked example: r3c6=2 is friendly via its box number (box 2), and sets
// r3c2=6, r2c6=3 -- matching this reading.) Encoded below as one Pair
// implication per (cell, trigger value, direction): "if this cell holds the
// trigger value, then that target cell holds the fixed value" -- generated
// from each cell's own row/column/box numbers, never hand-enumerated.
//
// "They must index at least one cell other than themselves": a target
// coincides with the source cell itself exactly when v == c (column
// indexing) or v == r (row indexing); both coincide only when r == c == v,
// i.e. a diagonal cell holding its own row/column number. That is
// therefore forbidden, encoded as a per-cell domain restriction on the
// diagonal.
//
// The single drawn line (R1C1-R9C9, the main diagonal) is read as the rule
// text's "indicated diagonal": no repeated digit along it.

function boxOf(r, c) {
  return 3 * Math.floor((r - 1) / 3) + Math.floor((c - 1) / 3) + 1;
}

// One Pair per (source cell, trigger value, direction), reusing the same
// truth-table key whenever the (trigger, target-value) pair recurs.
function friendlyIndexingPairs() {
  const keyCache = new Map();
  const keyFor = (trigger, targetValue) => {
    const cacheKey = `${trigger}_${targetValue}`;
    let key = keyCache.get(cacheKey);
    if (key === undefined) {
      key = Pair.fnToKey((a, b) => a !== trigger || b === targetValue, 9);
      keyCache.set(cacheKey, key);
    }
    return key;
  };

  const pairs = [];
  for (let r = 1; r <= 9; r++) {
    for (let c = 1; c <= 9; c++) {
      const src = makeCellId(r, c);
      const triggers = new Set([r, c, boxOf(r, c)]);
      for (const v of triggers) {
        if (v !== c) {
          // Column indexing: src == v  =>  R{r}C{v} == c.
          pairs.push(new Pair(keyFor(v, c), '', src, makeCellId(r, v)));
        }
        if (v !== r) {
          // Row indexing: src == v  =>  R{v}C{c} == r.
          pairs.push(new Pair(keyFor(v, r), '', src, makeCellId(v, c)));
        }
      }
    }
  }
  return pairs;
}

// No friendly cell on the main diagonal may hold its own row/column number
// (see comment above): exclude that one value from each diagonal cell.
function diagonalNoSelfValue() {
  const givens = [];
  for (let r = 1; r <= 9; r++) {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => v !== r);
    givens.push(new Given(makeCellId(r, r), ...values));
  }
  return givens;
}

return [
  new Shape('9x9'),
  new Given('R8C2', 1),
  new Diagonal(-1),
  ...diagonalNoSelfValue(),
  ...friendlyIndexingPairs(),
];
