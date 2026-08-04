// Title: Rising Streak
// Author: 3Good5You
// Video: https://www.youtube.com/watch?v=240rmFpSFWk
// Source: https://app.crackingthecryptic.com/sudoku/mrPNd4M4bq

// Normal sudoku rules (rows/columns/3x3 boxes) apply. Each outside-clue
// number is a MINIMUM streak length for its row/column, read in the
// direction implied by which side it sits on: a clue above/left of the grid
// requires the run increasing away from that edge (downward/rightward); a
// clue below/right requires it increasing towards that edge
// (upward/leftward) -- per the rules text's own example ("a number above
// the grid indicates a downward streak").
// That example also fixes what "streak" means: in '214678935' the run
// 4,6,7,8,9 is likewise increasing and consecutively placed, but the rules
// call the maximal rightward streak '6789' (length 4), not '46789' (length
// 5). So a streak is a run of consecutive cells holding consecutive
// integers in increasing order (e.g. 6,7,8,9), not merely increasing
// values. "AT LEAST N" is equivalent to "some window of exactly N
// consecutive cells forms such a run", since any longer run contains one.
// The clue set is explicitly non-exhaustive ("Not all rows and columns with
// streaks are indicated"), so only the drawn clues are encoded; no lane
// without a clue is constrained.

// One NFA per outside clue: scans the lane's 9 cells in the clue's
// direction and, once it has seen n cells in a row each exactly 1 more than
// the last, moves to an absorbing "found" state that accepts regardless of
// what follows -- which is what makes it an "at least n" test rather than
// "exactly n".
const streakSpecCache = {};
const streakNFA = (n) => {
  if (!streakSpecCache[n]) {
    const spec = {
      startState: { prev: null, run: 0, found: false },
      transition: ({ prev, run, found }, value) => {
        if (found) return { prev: null, run: 0, found: true };
        const newRun = (prev !== null && value === prev + 1) ? run + 1 : 1;
        if (newRun >= n) return { prev: null, run: 0, found: true };
        return { prev: value, run: newRun, found: false };
      },
      accept: ({ found }) => found,
    };
    streakSpecCache[n] = NFA.encodeSpec(spec, 9);
  }
  return streakSpecCache[n];
};

const col = (c) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, c));
const row = (r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c));

// [side, lane index, minimum streak length n], one per drawn outside-clue
// circle (14 total): top/bottom carry a column index, left/right a row
// index.
const outsideClues = [
  ['top', 4, 2], ['top', 9, 3],
  ['bottom', 5, 6], ['bottom', 7, 4], ['bottom', 9, 2],
  ['left', 1, 2], ['left', 3, 7], ['left', 5, 2], ['left', 6, 2], ['left', 7, 4], ['left', 9, 5],
  ['right', 3, 2], ['right', 5, 3], ['right', 9, 3],
];

const streaks = outsideClues.map(([side, lane, n]) => {
  let cells;
  if (side === 'top') cells = col(lane);                            // downward: R1..R9
  else if (side === 'bottom') cells = col(lane).slice().reverse();   // upward: R9..R1
  else if (side === 'left') cells = row(lane);                       // rightward: C1..C9
  else cells = row(lane).slice().reverse();                          // leftward: C9..C1
  return new NFA(streakNFA(n), `streak-${side}-${lane}`, ...cells);
});

return [
  new Shape('9x9'),
  ...streaks,
];
