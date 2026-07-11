// Title: Clone Count
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=ddbndIaimtc
// Source: https://sudokupad.app/ib9r4zuejw

// The full ruleset AND the symbol givens are encoded, and the encoding accepts
// the known answer -- so this is a complete, correct encoding (bar the single
// occluded given R3C2). It is however too slow to solve:
// ~20k backtracks / ~35 s without even a first solution, and a 500k-backtrack cap
// does not complete in 10 min. The bottleneck is the 81 whole-grid counting NFAs
// combined with the free blob-tiling search. The earlier "unsupported / impossible
// to express" verdict was wrong on every count: the blob tiling, the grid-wide
// clone count, and the symbol givens are all expressible -- the real limit is
// solver performance on this encoding.
//
// RULES:
//  1. Normal sudoku.
//  2. SYMBOLS -- each digit 1-9 is drawn as an alien symbol (hidden bijection).
//     The symbol givens are recovered by clustering the coloured symbol overlays
//     (see the Symbol-givens block below) and encoded via SameValues/AllDifferent.
//  3. TWO-CELL BLOBS -- an unknown set of non-overlapping, horizontally-adjacent
//     dominoes; 11 shown, the rest invisible. Modelled by a VB Var per cell in
//     {NONE, LEFT, RIGHT} with a per-row NFA enforcing LEFT<->next RIGHT.
//  4. CLONES + COUNT -- a blob's LEFT digit equals the number of grid-wide blobs
//     with its exact ordered pair. Equivalent to: for every ordered pair (x,y),
//     the count K(x,y) is 0 or x (any (x,y) blob forces x = K(x,y)). Encoded as
//     one counting NFA per pair, scanning the grid row-major.
//  5. CIRCULAR LABELS -- a label at a blob centre is (a symbol for) the sum of
//     its two cells. Encoded as Arrow(sumVar, a, b): the sum flows into a 1-9 Var,
//     which also forces a+b <= 9. (Its tie to the symbol map needs rule 2.)

const NONE = 1, LEFT = 2, RIGHT = 3;   // blob-state values held in the VB Vars

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const blob = graph.makeOverlay('VB');       // one blob-state Var per grid cell
const bs = cell => blob.at(cell);

const constraints = [new Shape('9x9'), blob.toVar('blob')];
const add = (...cs) => constraints.push(...cs);

// Blob state is one of NONE/LEFT/RIGHT.
const blobOrigin = blob.cells()[0];
add(new Replicate([new Given(blobOrigin, NONE, LEFT, RIGHT)],
  Replicate.encodeTargetCells(blob.cells(), blobOrigin, blob), blobOrigin));

// Shown blobs: fix the left/right cells. [leftCell, rightCell].
const shown = [
  ['R1C8', 'R1C9'], ['R2C5', 'R2C6'], ['R3C1', 'R3C2'], ['R4C5', 'R4C6'],
  ['R5C2', 'R5C3'], ['R6C7', 'R6C8'], ['R7C1', 'R7C2'], ['R7C3', 'R7C4'],
  ['R8C4', 'R8C5'], ['R9C5', 'R9C6'], ['R9C8', 'R9C9'],
];
for (const [l, r] of shown) add(new Given(bs(l), LEFT), new Given(bs(r), RIGHT));

// Circular labels: the sum of the blob's two cells (drawn as a symbol at centre).
const labels = [['R3C1', 'R3C2'], ['R7C1', 'R7C2']];
const sum = graph.makeOverlay('VL', labels.map(([l]) => l));  // a sum Var per label
add(sum.toVar('sum'));
for (const [l, r] of labels) add(new Arrow(sum.at(l), l, r));  // sumVar = l + r (<= 9)

// --- Tiling: within each row, a LEFT is immediately followed by a RIGHT, a
// RIGHT is immediately preceded by a LEFT, and nothing dangles.
const rowMachine = NFA.encodeSpec({
  startState: { expectRight: false },
  transition: ({ expectRight }, s) => {
    if (expectRight) return s === RIGHT ? { expectRight: false } : undefined;
    if (s === RIGHT) return undefined;          // RIGHT with no preceding LEFT
    if (s === LEFT) return { expectRight: true };
    return { expectRight: false };              // NONE
  },
  accept: ({ expectRight }) => !expectRight,    // no LEFT dangling at the row end
}, 9);
for (let r = 1; r <= 9; r++) {
  add(new NFA(rowMachine, 'tiling',
    ...Array.from({ length: 9 }, (_, c) => bs(makeCellId(r, c + 1)))));
}

// --- Clone-count: for each ordered pair (x,y), the number of blobs reading (x,y)
// is 0 or x. Scan every cell row-major as interleaved (state, digit); a LEFT cell
// with digit x arms a check that the next cell -- always its RIGHT partner, since
// a LEFT is never in column 9 -- has digit y, incrementing the count. Count above
// x is dead (it can never return to 0 or x).
const stream = gridCells.flatMap(c => [bs(c), c]);   // [VB1, R1C1, VB2, R1C2, ...]
const pairMachine = (x, y) => NFA.encodeSpec({
  startState: { count: 0, reading: 'state', isLeft: false, armed: false },
  transition: (st, value) => {
    if (st.reading === 'state') return { ...st, reading: 'digit', isLeft: value === LEFT };
    let count = st.count;
    if (st.armed && value === y) count++;                // completes an (x,y) blob
    if (count > x) return undefined;
    return { count, reading: 'state', isLeft: false, armed: st.isLeft && value === x };
  },
  accept: ({ count }) => count === 0 || count === x,
}, 9);
for (let x = 1; x <= 9; x++)
  for (let y = 1; y <= 9; y++)
    add(new NFA(pairMachine(x, y), `k${x}_${y}`, ...stream));

// --- Symbol givens. Recovered by clustering the coloured symbol overlays by
// colour (the green #d5f09c blob-shading is stripped first). Cells sharing a
// symbol colour hold the same digit; the nine symbols are nine distinct digits.
// R3C2's symbol is fully occluded by its circular label, so it is dropped (its
// classification can't be read) -- one given short of the full puzzle.
const symbolClasses = [
  ['R4C2', 'R7C1'],   // symbol a  (#8de8a4)
  ['R7C3', 'R8C9'],   // symbol b  (#fce69f)
  ['R9C5', 'R7C2'],   // symbol c  (#fcae9f)
  ['R1C8'],           // symbol d  (#e7d6c0)
  ['R8C4'],           // symbol e  (#8cf5e4)
  ['R2C7'],           // symbol f  (#acbcc5)
  ['R6C7'],           // symbol g  (#ccb6f3)
  ['R4C5'],           // symbol h  (#fbd0f8)
  ['R9C8'],           // symbol i  (#9fd7fc)
];
for (const cls of symbolClasses)
  if (cls.length > 1) add(new SameValues(cls.length, ...cls));  // same symbol => same digit
add(new AllDifferent(...symbolClasses.map(cls => cls[0])));      // nine distinct symbols

return constraints;
