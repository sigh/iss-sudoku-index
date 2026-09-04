// Title: Japanese Sums and Products
// Author: Gabi Penn-Karras
// Video: https://www.youtube.com/watch?v=YNKhZpqN1eY
// Source: https://cracking-the-cryptic.web.app/sudoku/hP28dT8Q9r

// Playable board: the 8x8 unshaded block inside the drawn 11x11 canvas
// (canvas rows 4-11, columns 4-11); all coordinates below are the playable
// board's own (board R1C1 = canvas R4C4). The margin (canvas rows/columns
// 1-3) carries only the outside-clue text; no cell inside the playable board
// carries a given.
//
// Rules encoded here (from the video's on-screen rules panel -- the source
// payload itself carries no rules text):
//  - Enter 1-7 into the grid, at most once per row/column; blacken every
//    other cell.
//  - Each maximal run of filled cells in a row or column ("a contiguous
//    group") is either the sum or the product (or both) of its digits,
//    matched in order against that line's outside clues.
//  - The stated correspondence only runs clue-to-run ("each clue...
//    corresponds to a... group"), not the reverse, so a line with no
//    outside clue is not thereby claimed to hold no run: it is simply not
//    constrained by any sum/product rule of its own, leaving its cells to
//    the base row/column rule and to the clues of the lines crossing it.
//    (The alternative reading -- no clue means no run, so the line is
//    entirely blackened -- was tried first and is unsatisfiable: e.g. board
//    row 1's two 15 clues would then only have the 4 cells of columns 3-6 to
//    place two runs in, since columns 2 and 7 carry no clue and would be
//    forced entirely black, and two runs each needing >= 2 cells to reach 15
//    -- no single digit 1-7 does -- cannot fit in 4 cells with a separator.)
//
// BLACK stands for a blackened board cell. A "Raw" grid is used because a
// blackened cell may repeat within a line and 1-7 does not fill all 8 cells
// of one, so no implicit latin rule applies to rows or columns.
const BLACK = 8;
const shape = new Shape('8x8', '1-8', 'Raw');
const graph = cellGraph(shape);

// Outside-clue tables, transcribed from the overlay text at canvas rows/cols
// 1-3. Every stacked clue group packs against the grid with no gap, so the
// slot count equals the run count; listed here nearest-to-grid first, with
// the unused far slots trimmed. An empty list means the line carries no
// clue.
const ROW_CLUES = [
  [15, 15],      // board row 1 = canvas R4: C3=15, C2=15
  [12, 16],      // board row 2 = canvas R5: C3=12, C2=16
  [18, 18],      // board row 3 = canvas R6: C3=18, C2=18
  [12],          // board row 4 = canvas R7: C3=12
  [14, 14],      // board row 5 = canvas R8: C3=14, C2=14
  [12, 12, 12],  // board row 6 = canvas R9: C3=12, C2=12, C1=12
  [],            // board row 7 = canvas R10: no clue
  [5, 5, 5],     // board row 8 = canvas R11: C3=5, C2=5, C1=5
];
const COL_CLUES = [
  [14, 14],      // board col 1 = canvas C4: R3=14, R2=14
  [],            // board col 2 = canvas C5: no clue
  [7, 7, 7],     // board col 3 = canvas C6: R3=7, R2=7, R1=7
  [12, 12],      // board col 4 = canvas C7: R3=12, R2=12
  [14],          // board col 5 = canvas C8: R3=14
  [10, 10, 10],  // board col 6 = canvas C9: R3=10, R2=10, R1=10
  [],            // board col 7 = canvas C10: no clue
  [6, 6, 6],     // board col 8 = canvas C11: R3=6, R2=6, R1=6
];

// Scans one line's cells and matches its runs of filled cells against the
// line's ordered clue list. State: `done` runs already closed and accepted,
// `sum`/`prod` the running total/product of the run in progress (0/1 between
// runs -- sum 0 doubles as "no run open" since every digit is >= 1). A run
// closes on the next blackened cell, or at the line's end via accept(), and
// must equal its clue by sum or by product ("either...or...or possibly
// both"). Both sum and product only grow as a run extends (every digit is
// >= 1), so once a track passes the clue it can never come back to match --
// `clamp` pins such a dead track to one sentinel value (the clue plus one)
// instead of its exact overshoot, which is what keeps the state count finite
// (a row/column is only 8 cells, but the compile-time search does not know
// digits in one run cannot repeat, so an unclamped run of 1s can otherwise
// inflate the sum indefinitely while the product stays put).
const clamp = (value, cap) => value > cap ? cap + 1 : value;
const lineSpec = (clues) => NFA.encodeSpec({
  startState: { done: 0, sum: 0, prod: 1 },
  transition: ({ done, sum, prod }, value) => {
    if (value === BLACK) {
      if (sum === 0) return { done, sum: 0, prod: 1 };
      const v = clues[done];
      return (sum === v || prod === v) ? { done: done + 1, sum: 0, prod: 1 } : undefined;
    }
    if (done >= clues.length) return undefined;
    const v = clues[done];
    const nextSum = sum + value;
    const nextProd = prod * value;
    if (nextSum > v && nextProd > v) return undefined;   // both tracks dead
    return { done, sum: clamp(nextSum, v), prod: clamp(nextProd, v) };
  },
  accept: ({ done, sum, prod }) => {
    if (sum === 0) return done === clues.length;
    const v = clues[done];
    return done === clues.length - 1 && (sum === v || prod === v);
  },
}, shape);

// The rules give a line's clues "in the correct order" but nothing drawn
// says which end of a clue stack packed against the grid is the first run --
// read outward from the grid, or read into it. Both directions are kept as
// a disjunction (reversing the cell order rather than the clue list; a
// palindromic clue list needs only one branch, per the same reasoning used
// for the encoded sibling row oeYbtN8wGDQ). Every clue list here but row 2's
// is a palindrome (repeats one value, or is empty/single), so the two
// directions differ only for row 2 (12,16 vs 16,12); every other line
// accepts either direction identically, so choosing the direction per line
// rather than once for the whole grid changes nothing in this puzzle.
// A line with no clue gets no constraint at all here (see the rules note
// above): it is left to the row/column distinctness rule and to whichever
// crossing lines do carry a clue.
const lineConstraint = (clues, cells, name) => {
  if (clues.length === 0) return null;
  const spec = lineSpec(clues);
  const forward = new NFA(spec, name, ...cells);
  const isPalindrome = clues.join() === [...clues].reverse().join();
  if (isPalindrome) return forward;
  return new Or([forward, new NFA(spec, name, ...[...cells].reverse())]);
};

// Two cells in the same row or column may share a value only when both are
// blackened.
const distinctKey = Pair.fnToKey((a, b) => a !== b || a === BLACK, shape);

return [
  shape,

  ...graph.rows().map(
    (cells, i) => new PairX(distinctKey, `row${i + 1}`, ...cells)),
  ...graph.columns().map(
    (cells, i) => new PairX(distinctKey, `col${i + 1}`, ...cells)),

  ...ROW_CLUES.map(
    (clues, i) => lineConstraint(clues, graph.row(i + 1), `rowclue${i + 1}`))
    .filter(c => c !== null),
  ...COL_CLUES.map(
    (clues, i) => lineConstraint(clues, graph.column(i + 1), `colclue${i + 1}`))
    .filter(c => c !== null),
];
