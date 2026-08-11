// Title: Red & Blue
// Author: Ben Needham
// Video: https://www.youtube.com/watch?v=Vrn141DNof8
// Source: https://app.crackingthecryptic.com/sudoku/2gLqgm64fP

// Normal sudoku rules (rows, columns, boxes all-different) come from the
// default 9x9 Shape.
//
// "Colour every x'th cell in each row red, where x is the digit in column 1
// of that row" and the symmetric column/blue rule are encoded with an
// auxiliary VC overlay (1 = neither, 2 = red, 3 = blue) plus one placement
// NFA per row/column. Each row's own NFA reads its own column-1 digit as the
// target column and requires VC=red there and VC!=red everywhere else in
// that row; each column's own NFA does the same for VC=blue against its own
// row-1 digit.
//
// "A red cell and a blue cell may never be the same cell" needs no separate
// constraint: a cell where its row's NFA places red and its column's NFA
// independently places blue is a direct contradiction (one VC cell cannot
// hold both 2 and 3 at once), so overlap is already excluded by construction.
// "Exactly one red and one blue in every row/column" also needs no separate
// constraint: each row's NFA already forces exactly one red position in that
// row and forbids red elsewhere in it, and each column's NFA does the same
// for blue in its column; the *other* count (one red per column, one blue
// per row) then follows from column 1 / row 1 being a permutation (ordinary
// sudoku all-different on column 1 and row 1). Only the box count is not
// implied by any of that, so it is stated explicitly with one
// ContainExact (seven neither + one red + one blue) per box.
//
// The outside clues give "the sum of digits sandwiched between the red and
// blue cell" in that row/column -- a second family of NFAs over the same
// interleaved (digit, VC) stream: accumulate digits seen strictly after the
// first marker (VC=red or VC=blue) and before the second, clamped so the
// running total never needs to exceed target+1, and compare to the clue --
// exactly for a plain number, as a lower bound for a ">N" clue.

const NEUTRAL = 1, RED = 2, BLUE = 3;

const graph = cellGraph('9x9');
const vc = graph.makeOverlay('VC');

const rows = graph.rows();
const cols = graph.columns();
const vcRows = vc.rows();
const vcCols = vc.columns();

const interleave = (digitCells, flagCells) =>
  digitCells.flatMap((cell, i) => [cell, flagCells[i]]);

// State: which half of the (digit, flag) pair is being read, how many cells
// consumed so far (`pos`, doubling as the current column/row index), and the
// target index learned from the very first digit read (the row's own
// column-1 digit, or the column's own row-1 digit).
function placementSpec(markValue) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', pos: 0, target: null },
    transition: ({ phase, pos, target }, value) => {
      if (phase === 'digit') {
        // Clamp at 10 (one past the last real column/row) so the compiler's
        // generic reachability search doesn't climb forever; the real scan
        // is always exactly 9 cells, so this never fires there.
        const nextPos = Math.min(pos + 1, 10);
        return {
          phase: 'flag', pos: nextPos,
          target: nextPos === 1 ? value : target,
        };
      }
      const shouldMark = pos === target;
      if (shouldMark !== (value === markValue)) return undefined;
      return { phase: 'digit', pos, target };
    },
    accept: ({ phase, pos }) => phase === 'digit' && pos === 9,
  }, 9);
}

const redPlacement = placementSpec(RED);
const bluePlacement = placementSpec(BLUE);

const rowPlacements = rows.map((cells, i) =>
  new NFA(redPlacement, 'red position', ...interleave(cells, vcRows[i])));
const colPlacements = cols.map((cells, i) =>
  new NFA(bluePlacement, 'blue position', ...interleave(cells, vcCols[i])));

// Exactly one red and one blue (and seven neither) VC value per box -- the
// one placement fact not already implied by the row/column NFAs above.
const boxContainExacts = graph.boxes().map(box =>
  new ContainExact('1_1_1_1_1_1_1_2_3', ...vc.at(box)));

// Sum of digits strictly between the two markers, regardless of which comes
// first. `cap` bounds the running sum: once it can only mean "already over
// target", further growth is not tracked, which keeps the compiled state
// count small.
function sandwichSpec(mode, target) {
  const cap = target + 1;
  return NFA.encodeSpec({
    startState: { stage: 'before', sum: 0, pendingDigit: null },
    transition: ({ stage, sum, pendingDigit }, value) => {
      if (pendingDigit === null) return { stage, sum, pendingDigit: value };
      const digit = pendingDigit;
      const isMarker = value !== NEUTRAL;
      if (stage === 'before') {
        return { stage: isMarker ? 'between' : 'before', sum, pendingDigit: null };
      }
      if (stage === 'between') {
        if (isMarker) return { stage: 'after', sum, pendingDigit: null };
        return { stage: 'between', sum: Math.min(sum + digit, cap), pendingDigit: null };
      }
      return { stage: 'after', sum, pendingDigit: null };
    },
    accept: ({ stage, sum }) =>
      stage === 'after' && (mode === 'eq' ? sum === target : sum === cap),
  }, 9);
}

// Row/column outside clues: [1-based row/col index, mode, target]. Rows 2, 8
// and columns 1, 7 carry no printed clue and get no sandwich NFA.
const rowClues = [
  [1, 'eq', 2], [3, 'eq', 20], [4, 'eq', 16], [5, 'eq', 13],
  [6, 'gt', 30], [7, 'eq', 20], [9, 'eq', 35],
];
const colClues = [
  [2, 'eq', 10], [3, 'eq', 42], [4, 'eq', 28], [5, 'eq', 4],
  [6, 'gt', 0], [8, 'eq', 8], [9, 'eq', 31],
];

const rowSums = rowClues.map(([i, mode, target]) =>
  new NFA(sandwichSpec(mode, target), 'row sandwich',
    ...interleave(rows[i - 1], vcRows[i - 1])));
const colSums = colClues.map(([i, mode, target]) =>
  new NFA(sandwichSpec(mode, target), 'col sandwich',
    ...interleave(cols[i - 1], vcCols[i - 1])));

const vcOrigin = vc.cells()[0];
const vcDomain = vc.makeReplicate(new Given(vcOrigin, NEUTRAL, RED, BLUE));

return [
  new Shape('9x9'),
  vc.toVar('red/blue marker'),
  vcDomain,
  ...rowPlacements,
  ...colPlacements,
  ...boxContainExacts,
  ...rowSums,
  ...colSums,
];
