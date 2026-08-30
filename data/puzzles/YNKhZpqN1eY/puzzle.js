// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YNKhZpqN1eY
// Source: https://cracking-the-cryptic.web.app/sudoku/hP28dT8Q9r

// Japanese Sums and Products on the 8x8 board, digits 1-8. The source carries
// no rules text at all, so the reading below is the genre convention pinned by
// the drawing:
//
// - Some board cells hold a digit and the rest are blank. Each row and each
//   column holds each of the digits 1-8 at most once. There is no box rule:
//   the payload draws no region geometry.
// - A maximal run of consecutive filled cells in a line is described by one
//   outside clue. The clue is either the digit sum or the digit product of its
//   run; nothing drawn says which, so both are allowed for every clue.
// - A line's clue stack is a bijection with that line's runs, in order: no
//   clue without a run and no run without a clue.
// - Reading order: a lane's clue stack and its cells read as one strip in a
//   single direction (left-to-right for a row, top-to-bottom for a column), so
//   the clue printed farthest from the board is the first run met on
//   continuing inward. The drawing shows this: every short stack is pushed up
//   against the board (a 1-clue stack sits in the slot adjacent to the board,
//   a 2-clue stack in the two adjacent slots), which only orders the clues if
//   the far slot is the outermost run.
// - Board row 7 and board columns 2 and 7 carry no clue stack at all. They are
//   left with no run rule, only the digit-distinctness rule. The alternative
//   reading -- an empty stack meaning "this line is entirely blank" -- is
//   refuted by the printed clues alone: it would blank board columns 2 and 7
//   in every row, and board row 6's three-clue stack then has no legal shape.
//   With those two columns blank the row's filled cells lie in the segments
//   [c1], [c3..c6] and [c8], and the only way to read exactly three runs out
//   of them puts a run on the single cell c1 or c8, which would have to hold
//   12 on its own.
//
// Nothing in the source states the digit alphabet. 1-8 is the board's own
// width, which is the genre default, and it is consistent with every printed
// clue.

const shape = new Shape('8x8', '0-8', 'Raw');
const graph = cellGraph(shape);
const LINES = [1, 2, 3, 4, 5, 6, 7, 8];

// Outside-clue stacks, farthest-from-board first, in board coordinates
// (board R1C1 is canvas R4C4). Every clue is a text overlay in the 3-deep grey
// margin band; a short stack is drawn in the slots nearest the board.
const ROW_CLUES = {
  1: [15, 15],     // canvas R4C2, R4C3
  2: [16, 12],     // canvas R5C2, R5C3
  3: [18, 18],     // canvas R6C2, R6C3
  4: [12],         // canvas R7C3
  5: [14, 14],     // canvas R8C2, R8C3
  6: [12, 12, 12], // canvas R9C1, R9C2, R9C3
  8: [5, 5, 5],    // canvas R11C1, R11C2, R11C3
  // Board row 7 (canvas R10) carries no clue overlay at all.
};
const COL_CLUES = {
  1: [14, 14],     // canvas R2C4, R3C4
  3: [7, 7, 7],    // canvas R1C6, R2C6, R3C6
  4: [12, 12],     // canvas R2C7, R3C7
  5: [14],         // canvas R3C8
  6: [10, 10, 10], // canvas R1C9, R2C9, R3C9
  8: [6, 6, 6],    // canvas R1C11, R2C11, R3C11
  // Board columns 2 and 7 (canvas C5, C10) carry no clue overlay at all.
};

// Per-line "all-different ignoring blanks". A native AllDifferent would also
// forbid the line's several blanks (all value 0) from repeating, so the rule is
// carried by an 8-bit mask of the nonzero digits already seen.
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
    maxDepth: 8,
  }, shape);
  return new NFA(spec, name, ...cells);
}

// Run machine for one clue stack. `i` is the run the scan is currently inside
// (or the next run to open); `mode` is null outside a run, and inside one says
// whether this run is being read as a sum ('s') or as a product ('p'); `acc` is
// the running total or product. Opening a run branches into both modes, which
// is the "sum or product, unmarked" rule. A blank closes an open run, which
// must then equal its clue exactly; opening a run once every clue is consumed
// is refused, and acceptance requires every clue to have been matched --
// together that is the clue-to-run bijection. Both accumulators are
// non-decreasing over digits 1-8, so passing the clue value is a dead branch.
function runMachine(clues) {
  return NFA.encodeSpec({
    startState: { i: 0, mode: null, acc: 0 },
    transition: (state, value) => {
      if (value === 0) {
        if (state.mode === null) return state;
        if (state.acc !== clues[state.i]) return undefined;
        return { i: state.i + 1, mode: null, acc: 0 };
      }
      if (state.mode === null) {
        if (state.i >= clues.length) return undefined;
        if (value > clues[state.i]) return undefined;
        return [
          { i: state.i, mode: 's', acc: value },
          { i: state.i, mode: 'p', acc: value },
        ];
      }
      const acc = state.mode === 's' ? state.acc + value : state.acc * value;
      if (acc > clues[state.i]) return undefined;
      return { i: state.i, mode: state.mode, acc };
    },
    accept: (state) => {
      if (state.mode !== null) {
        return state.i + 1 === clues.length && state.acc === clues[state.i];
      }
      return state.i === clues.length;
    },
    maxDepth: 8,
  }, shape);
}

function lineConstraints(clueMap, cellsFn, label) {
  return LINES.flatMap(n => {
    const cells = cellsFn(n);
    const clues = clueMap[n];
    return [
      distinctNonzero(`${label}Distinct${n}`, cells),
      // An unclued line gets the distinctness rule and no run rule.
      ...(clues ? [new NFA(runMachine(clues), `${label}Runs${n}`, ...cells)] : []),
    ];
  });
}

return [
  shape,
  ...lineConstraints(ROW_CLUES, r => graph.row(r), 'row'),
  ...lineConstraints(COL_CLUES, c => graph.column(c), 'col'),
];
