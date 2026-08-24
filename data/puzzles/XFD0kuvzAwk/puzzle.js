// Title: Japanese Sums Sudoku
// Author: Tom Groot Kormelink
// Video: https://www.youtube.com/watch?v=XFD0kuvzAwk
// Source: https://app.crackingthecryptic.com/sudoku/mP3tjTNhmF

// Normal sudoku on the playable 9x9 grid (default rows/cols/3x3 boxes,
// verified against the payload's own regions -- each of the 9 listed
// regions is exactly one standard 3x3 box once translated from canvas
// coordinates R5-13/C5-13 to playable R1-9/C1-9). No givens inside the
// playable grid.
//
// Japanese sums: shade some cells. Outside each row/column, the clues list,
// in order, the digit-sums of that line's maximal runs of contiguous WHITE
// (unshaded) cells; runs need >=1 shaded cell between them (automatic once a
// run is read as maximal). A '?' clue is a real block whose value was not
// printed -- its stated range (1-45) is exactly the range any block already
// satisfies (a block is <=9 distinct digits 1-9), so it adds no numeric
// constraint, only a bijection slot: the clue list length equals the line's
// actual block count. Reading order (farthest-from-grid clue = first block,
// then continuing straight into the grid line) is the standard convention
// for this genre: each stack fills its slot nearest the grid first as
// blocks are added, so a longer stack's extra clues sit farther out, and
// reading outward-in then into the line recovers the actual block order.
//
// Clue tables below are transcribed from the source's outside-clue overlays
// ("?" and multi-digit sums) and margin `value` cells (single-digit sums,
// rendered as plain given-style digits instead of overlay text, one per
// row/column to complete its stack).

const WHITE = 1;   // counted towards a block's sum
const SHADED = 2;  // separator; not counted

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');

const ROW_CLUES = [
  ['?', '?', '?'],       // R1
  [18],                  // R2
  [18, '?'],              // R3
  ['?', '?', '?', '?'],  // R4
  [13, 9],                // R5
  [5, 21],                // R6
  [9, 8, 14, 3],           // R7
  [3, 17],                 // R8
  ['?', '?', '?', '?'],  // R9
];

const COL_CLUES = [
  ['?', '?', '?', '?'],  // C1
  ['?', '?'],              // C2
  ['?', '?', '?'],        // C3
  [9, '?'],                // C4
  [10, 20, 11],            // C5
  [10, 10, 16],            // C6
  [7, 24],                 // C7
  [7, 12, 10],             // C8
  [26, 2],                 // C9
];

// Every listed clue's value either equals the given exact sum, or (for '?')
// matches unconditionally -- any block sum is automatically in 1-45.
const matchesClue = (target, sum) => target === '?' || sum === target;

// Scans one line as alternating [shade, digit] pairs (18 symbols for a
// 9-cell line). State: which clue in the list the currently-open (or next)
// run must satisfy (clueIndex), whether a WHITE run is currently open
// (inRun), and its running digit sum (runSum). A WHITE cell opens/extends a
// run; a SHADED cell closes any open run, checking it against
// clues[clueIndex] and advancing clueIndex. Ending the line still inside an
// open run closes it the same way, in `accept`. The list is a bijection with
// the line's actual runs, so `accept` also requires every clue to have been
// consumed exactly once (clueIndex reaches clues.length).
function japaneseSumMachine(clues) {
  return NFA.encodeSpec({
    startState: { phase: 'shade', clueIndex: 0, inRun: false, runSum: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        return {
          ...state,
          phase: 'shade',
          runSum: state.inRun ? state.runSum + value : state.runSum,
        };
      }
      // phase === 'shade'
      if (value === WHITE) {
        // Opening a new run needs a clue left to satisfy it.
        if (!state.inRun && state.clueIndex >= clues.length) return undefined;
        return { ...state, phase: 'digit', inRun: true };
      }
      // value === SHADED: closes any open run.
      if (state.inRun) {
        if (!matchesClue(clues[state.clueIndex], state.runSum)) return undefined;
        return { phase: 'digit', clueIndex: state.clueIndex + 1, inRun: false, runSum: 0 };
      }
      return { ...state, phase: 'digit' };
    },
    accept: (state) => {
      if (state.phase !== 'shade') return false;
      if (state.inRun) {
        return matchesClue(clues[state.clueIndex], state.runSum) &&
          state.clueIndex + 1 === clues.length;
      }
      return state.clueIndex === clues.length;
    },
    // 9 cells x (shade, digit) = 18 symbols is the whole line.
    maxDepth: 18,
  }, geometry.numValues);
}

const rowConstraints = ROW_CLUES.map((clues, i) => new NFA(
  japaneseSumMachine(clues),
  `japanese-row-R${i + 1}`,
  ...graph.row(i + 1).flatMap(cell => [shade.at(cell), cell]),
));

const columnConstraints = COL_CLUES.map((clues, i) => new NFA(
  japaneseSumMachine(clues),
  `japanese-col-C${i + 1}`,
  ...graph.column(i + 1).flatMap(cell => [shade.at(cell), cell]),
));

return [
  new Shape('9x9'),
  shade.toVar('Japanese Sums shading (1=white/unshaded, 2=shaded)'),
  shade.makeReplicate(new Given(shade.cells()[0], WHITE, SHADED)),
  ...rowConstraints,
  ...columnConstraints,
];
