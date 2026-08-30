// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=18FZP31vrbw
// Source: https://cracking-the-cryptic.web.app/sudoku/TGMLrDPMRn

// Japanese Sums on a 10x10 grid using only digits 1-7 (stated by a "1 to 7"
// legend drawn in the payload's top-left corner, next to the grid). Each row
// and each column contains each of 1-7 at most once; the remaining 3+ cells
// in that row/column are blank (no digit). Outside every row/column, a stack
// of numbers gives, in order, the digit-sum of each maximal run of
// consecutive filled cells in that line -- blank cells (and the grid edge)
// bound a run, and the stack's clue count always equals the line's actual
// run count.
//
// Reading order: a lane's outside clues and its grid cells read as one
// continuous strip in a single direction (top-to-bottom for a column,
// left-to-right for a row) -- the clue printed first (farthest from the
// grid) is the first run met continuing that same direction into the grid,
// and so on inward. This is the standard convention for this genre. The
// alternative (nearest-clue-first) was checked directly on this puzzle's
// full clue set and is unsatisfiable: solving the complete 20-lane system
// (all 10 rows + 10 columns, run-sums and per-line distinctness, no other
// rules) finds no solution under the nearest-first reading and exactly one
// under the farthest-first reading, so farthest-first is not merely assumed
// but refuted-against here.
//
// No box/region constraint: the payload's single `regions` entry covers all
// 100 playable cells, which cannot be a real all-different house (only 7
// values exist for a 10-cell line) -- it is boundary/rendering metadata, not
// a rule, so only rows and columns are constrained.
//
// The playable grid is the payload's canvas R5-R14/C5-C14 (its top-left 4
// rows/columns are the outside-clue margin plus the "1 to 7" legend), mapped
// here to ISS R1-R10/C1-C10 with no other geometry change.

const shape = new Shape('10x10', '0-9', 'Raw');
const graph = cellGraph(shape);

// Outside-clue stacks, farthest-from-grid first (see Reading order above).
// Transcribed from the drawn text marks in the margin above/left of the play
// grid (rows/cols outside R5-R14/C5-C14); a lane's stack is exactly the
// marks present in its 4-cell margin strip, nearest-to-grid slot last.
const ROW_CLUES = {
  1: [14, 14],
  2: [6, 12, 4],
  3: [7, 7, 7, 7],
  4: [11, 3, 3, 11],
  5: [8, 8],
  6: [7, 1, 20],
  7: [9, 10, 9],
  8: [9, 10, 9],
  9: [11, 10],
  10: [14, 6, 6],
};
const COL_CLUES = {
  1: [10, 18],
  2: [21, 7],
  3: [8, 8, 10],
  4: [9, 9],
  5: [7, 7, 7, 7],
  6: [14, 14],
  7: [7, 7, 7, 7],
  8: [5, 6, 9],
  9: [7, 21],
  10: [11, 6, 4],
};

// Every playable cell holds 0 (blank) or a digit 1-7; values 8-9 exist only
// because a 10-wide Raw grid needs >=10 values (CellGeometry's floor), so
// they are excluded from every cell rather than left reachable. One
// Replicate stamps the same domain over the whole grid (Group Domains
// pattern) instead of 100 identical Given constraints.
const gridCells = graph.cells();
const domainGiven = new Replicate(
  [new Given(gridCells[0], 0, 1, 2, 3, 4, 5, 6, 7)],
  Replicate.encodeTargetCells(gridCells, gridCells[0], graph),
  gridCells[0],
);

// Per-line "AllDifferent ignoring blanks": a small NFA carrying a 7-bit seen
// mask (128 states) is used instead of native AllDifferent because
// AllDifferent would also forbid a line's blanks (all value 0) from
// repeating, which is required here (a line has 3+ of them).
function distinctNonzero(name, cells) {
  const spec = NFA.encodeSpec({
    startState: { mask: 0 },
    transition: (state, value) => {
      if (value === 0) return state;
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined; // repeat of a nonzero digit
      return { mask: state.mask | bit };
    },
    accept: () => true,
    maxDepth: 10,
  }, shape);
  return new NFA(spec, name, ...cells);
}

// One run-sum machine per line: scans a run of nonzero cells, closes it on a
// 0 (or line end) and checks the closed run's sum against clues[clueIndex],
// then advances. Rejects an extra run beyond the clue list; accept requires
// every clue to have been consumed exactly once (the list is a bijection
// with the line's actual runs, matching "every possible clue is given").
function japaneseSumMachine(clues) {
  return NFA.encodeSpec({
    startState: { clueIndex: 0, inRun: false, runSum: 0 },
    transition: (state, value) => {
      if (value === 0) {
        if (state.inRun) {
          const expected = clues[state.clueIndex];
          if (expected === undefined || expected !== state.runSum) return undefined;
          return { clueIndex: state.clueIndex + 1, inRun: false, runSum: 0 };
        }
        return state;
      }
      if (!state.inRun && state.clueIndex >= clues.length) return undefined;
      return { clueIndex: state.clueIndex, inRun: true, runSum: state.runSum + value };
    },
    accept: (state) => {
      if (state.inRun) {
        return clues[state.clueIndex] === state.runSum &&
          state.clueIndex + 1 === clues.length;
      }
      return state.clueIndex === clues.length;
    },
    maxDepth: 10,
  }, shape);
}

const rowConstraints = Object.entries(ROW_CLUES).flatMap(([r, clues]) => {
  const cells = graph.row(Number(r));
  return [
    distinctNonzero(`RowDistinct${r}`, cells),
    new NFA(japaneseSumMachine(clues), `RowSum${r}`, ...cells),
  ];
});

const colConstraints = Object.entries(COL_CLUES).flatMap(([c, clues]) => {
  const cells = graph.column(Number(c));
  return [
    distinctNonzero(`ColDistinct${c}`, cells),
    new NFA(japaneseSumMachine(clues), `ColSum${c}`, ...cells),
  ];
});

return [shape, domainGiven, ...rowConstraints, ...colConstraints];
