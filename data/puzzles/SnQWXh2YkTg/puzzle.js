// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=SnQWXh2YkTg
// Source: https://cracking-the-cryptic.web.app/sudoku/8pHpMqfRJL

// Japanese Sums on the walled 7x7 board, digits 1-7. The source carries no
// rules text at all, so the reading below is the genre convention pinned by
// the drawing and by arithmetic on the printed clues:
//
// - Each row and each column of the board holds each of the digits 1-7 at
//   most once; every other cell in that line is blank (no digit). There is
//   no box rule -- the payload draws no region geometry, and 7 has no square
//   factorisation.
// - A line's outside clue stack gives, in order, the digit-sum of each
//   maximal run of consecutive filled cells in that line. Blank cells and
//   the board edge bound a run, and the stack is a bijection with the line's
//   runs: no clue without a run, no run without a clue.
// - Reading order: a lane's clue stack and its cells read as one strip in a
//   single direction (top-to-bottom for a column, left-to-right for a row),
//   so the clue printed farthest from the board is the first run met on
//   continuing inward. The drawing itself shows this: every short stack is
//   pushed up against the board (a 1-clue stack sits in the slot adjacent to
//   the board, a 2-clue stack in the two adjacent slots), which only orders
//   the clues if the far slot is the outermost run.
// - Three rows carry no clue stack at all (board rows 2, 3 and 5). They are
//   left with no run rule, only the digit-distinctness rule. The alternative
//   reading -- an empty stack meaning "this line is entirely blank" -- is
//   refuted by arithmetic on the printed clues alone: the seven column
//   stacks total 118 while the four printed row stacks total 81, and the
//   grid total is the same sum read either way, so the unclued rows must
//   hold digits summing to 37.
//
// Nothing in the source states the digit alphabet. 1-7 is the board's own
// size and is consistent with every printed clue: the largest single run,
// 22, needs 1+2+...+7 = 28 minus a real subset (6), and column 1's stack
// 8/1/8 needs exactly 1 + {2,6} + {3,5} = five filled cells in seven, which
// is only reachable with digits capped at 7.

const shape = new Shape('7x7', '0-7', 'Raw');
const graph = cellGraph(shape);

// Outside-clue stacks, farthest-from-board first, in board coordinates
// (board R1C1 is canvas R4C4). Single-digit clues are drawn as payload cell
// values in the 3-wide margin, two-digit clues as white overlay text; a
// short stack is drawn in the slots nearest the board.
const ROW_CLUES = {
  1: [7, 19],   // canvas R4C2=7, R4C3 overlay "19"
  4: [1, 17],   // canvas R7C2=1, R7C3 overlay "17"
  6: [22],      // canvas R9C3 overlay "22"
  7: [3, 7, 5], // canvas R10C1=3, R10C2=7, R10C3=5
  // board rows 2, 3 and 5 (canvas R5, R6, R8) carry no clue cell at all.
};
const COL_CLUES = {
  1: [8, 1, 8],  // canvas R1C4=8, R2C4=1, R3C4=8
  2: [4, 2],     // canvas R2C5=4, R3C5=2
  3: [9, 6],     // canvas R2C6=9, R3C6=6
  4: [3, 2, 8],  // canvas R1C7=3, R2C7=2, R3C7=8
  5: [7, 9, 5],  // canvas R1C8=7, R2C8=9, R3C8=5
  6: [22],       // canvas R3C9 overlay "22"
  7: [12, 7, 5], // canvas R1C10 overlay "12", R2C10=7, R3C10=5
};

// Per-line "all-different ignoring blanks". A native AllDifferent would also
// forbid the line's several blanks (all value 0) from repeating, so the rule
// is carried by a 7-bit mask of the nonzero digits already seen.
function distinctNonzero(name, cells) {
  const spec = NFA.encodeSpec({
    startState: { mask: 0 },
    transition: (state, value) => {
      if (value === 0) return state; // blank: unrestricted, may repeat
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined; // digit already used in the line
      return { mask: state.mask | bit };
    },
    accept: () => true,
    maxDepth: 7,
  }, shape);
  return new NFA(spec, name, ...cells);
}

// Run-sum machine for one clue stack. `clueIndex` is the run the scan is
// currently inside (or the next run to open), `inRun`/`runSum` the open run.
// A blank closes an open run, which must equal clues[clueIndex] exactly;
// opening a run once every clue is consumed is refused, and acceptance
// requires every clue to have been matched -- together that is the
// clue-to-run bijection.
function runSumMachine(clues) {
  return NFA.encodeSpec({
    startState: { clueIndex: 0, inRun: false, runSum: 0 },
    transition: (state, value) => {
      if (value === 0) {
        if (!state.inRun) return state;
        if (state.runSum !== clues[state.clueIndex]) return undefined;
        return { clueIndex: state.clueIndex + 1, inRun: false, runSum: 0 };
      }
      if (!state.inRun && state.clueIndex >= clues.length) return undefined;
      const nextSum = state.runSum + value;
      if (nextSum > clues[state.clueIndex]) return undefined;
      return { clueIndex: state.clueIndex, inRun: true, runSum: nextSum };
    },
    accept: (state) => {
      if (state.inRun) {
        return state.clueIndex + 1 === clues.length &&
          state.runSum === clues[state.clueIndex];
      }
      return state.clueIndex === clues.length;
    },
    maxDepth: 7,
  }, shape);
}

function lineConstraints(clueMap, cellsFn, label) {
  return [1, 2, 3, 4, 5, 6, 7].flatMap(n => {
    const cells = cellsFn(n);
    const clues = clueMap[n];
    return [
      distinctNonzero(`${label}Distinct${n}`, cells),
      // An unclued line gets the distinctness rule and no run rule.
      ...(clues ? [new NFA(runSumMachine(clues), `${label}Sum${n}`, ...cells)] : []),
    ];
  });
}

return [
  shape,
  ...lineConstraints(ROW_CLUES, r => graph.row(r), 'row'),
  ...lineConstraints(COL_CLUES, c => graph.column(c), 'col'),
];
