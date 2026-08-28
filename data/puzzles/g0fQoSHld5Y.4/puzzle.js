// Title: Jan 21, 2021: Bust Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=g0fQoSHld5Y
// Source: https://tinyurl.com/2s3sxcbh

// Normal sudoku rules apply.
//
// A "bust" clue outside a row or column gives the position N where the
// running sum of that row/column, read from the near edge (left for a row,
// top for a column), first exceeds 21: sum of the first N-1 cells <= 21 and
// sum of the first N cells > 21. Only rows/columns carrying a printed clue
// are constrained; the four even rows and four even columns have no clue and
// so no rule. Each clued line is one NFA: state tracks the running sum
// (bounded 0-21) until the step that busts it, after which a sink state
// absorbs the remaining cells -- later digits are unconstrained by this
// rule. Rows/columns are permutations of 1-9 under ordinary Sudoku, so no
// extra value range is needed.

const graph = cellGraph('9x9');
const rows = graph.rows(); // rows[i] = row i+1, left to right
const columns = graph.columns(); // columns[i] = column i+1, top to bottom

// Row/column bust clues, transcribed from the drawn outside-clue digits
// (one lane left of its row, one lane above its column).
const rowClues = { 1: 7, 3: 3, 5: 4, 7: 6, 9: 4 };
const colClues = { 1: 7, 3: 3, 5: 4, 7: 6, 9: 4 };

const BUST_TARGET = 21;
const specCache = new Map();

// "sum of the first N-1 values <= 21, sum of the first N values > 21".
// pos/sum track progress before busting; once busted the sum is dropped
// (clamped to 0) since later cells carry no further state for this rule.
function bustSpec(n) {
  if (specCache.has(n)) return specCache.get(n);
  const spec = NFA.encodeSpec({
    startState: { pos: 0, sum: 0, busted: false },
    transition: ({ pos, sum, busted }, value) => {
      if (busted) return { pos: pos + 1, sum: 0, busted: true };
      const nextPos = pos + 1;
      const nextSum = sum + value;
      if (nextPos < n) {
        if (nextSum > BUST_TARGET) return undefined; // busted too early
        return { pos: nextPos, sum: nextSum, busted: false };
      }
      // nextPos === n: must bust exactly here.
      if (nextSum <= BUST_TARGET) return undefined; // didn't bust on time
      return { pos: nextPos, sum: 0, busted: true };
    },
    accept: ({ busted }) => busted,
    maxDepth: 9,
  }, 9);
  specCache.set(n, spec);
  return spec;
}

const rowBusts = Object.entries(rowClues).map(
  ([r, n]) => new NFA(bustSpec(n), `row-bust-${r}`, ...rows[r - 1]));
const colBusts = Object.entries(colClues).map(
  ([c, n]) => new NFA(bustSpec(n), `col-bust-${c}`, ...columns[c - 1]));

return [
  new Shape('9x9'),

  // Givens, from the puzzle's drawn grid.
  new Given('R1C3', 5), new Given('R1C5', 2), new Given('R1C7', 8), new Given('R1C9', 7),
  new Given('R2C2', 1),
  new Given('R3C1', 6), new Given('R3C5', 3), new Given('R3C9', 1),
  new Given('R5C1', 3), new Given('R5C3', 2), new Given('R5C7', 7), new Given('R5C9', 4),
  new Given('R7C1', 9), new Given('R7C5', 6), new Given('R7C7', 5), new Given('R7C8', 7),
  new Given('R8C7', 9),
  new Given('R9C1', 7), new Given('R9C3', 1), new Given('R9C5', 5), new Given('R9C9', 2),

  ...rowBusts,
  ...colBusts,
];
