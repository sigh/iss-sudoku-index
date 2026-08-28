// Title: A Sudoku That Defies The Laws Of Nature?
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=pPtBsUTYUJk
// Source: https://cracking-the-cryptic.web.app/sudoku/PtjrqnTpPB

// Normal sudoku on the interior 9x9 grid (rows/cols 1-9); the payload's own
// regions are exactly the default 3x3 boxes, so no extra Region constraint is
// needed.
//
// Every board cell -- interior and perimeter (row 0, row 10, col 0, col 10 of
// the drawn 11x11) -- holds a skyscraper height. Taller hides shorter, and
// (stated explicitly, since the perimeter allows repeats) equal height also
// hides. The perimeter is not part of the sudoku and may repeat, so it is
// modelled with extra Var cells outside the 9x9 grid, connected to the grid
// cells explicitly (NFA/Sum).
//
// The 36 non-corner perimeter cells double as ordinary exterior skyscraper
// clues for their adjacent interior row/column: the cell's own digit is the
// count of buildings visible looking into the grid from that side.
//
// The 4 corner cells are not exterior clues for any interior row/column. With
// the 36 edge cells they instead form 4 length-11 perimeter "frame" lines
// (row 0, row 10, col 0, col 10, corner to corner), each itself a skyscraper
// line. The diagonal drawn across each corner cell carries two numbers -- the
// frame's seen-count from that corner, once for the row and once for the
// column. Which number is which is fixed by the diagonal's geometry: it
// splits the corner cell into two triangles, and the triangle sharing an edge
// with a line's next cell carries that line's count. The 8 resulting counts:
const FRAME = {
  rowTopLR: 7, rowTopRL: 2,   // row 0, left->right / right->left
  rowBotLR: 4, rowBotRL: 1,   // row 10
  colLeftTB: 4, colLeftBT: 3, // column 0, top->bottom / bottom->top
  colRightTB: 1, colRightBT: 2, // column 10
};

const graph = cellGraph('9x9');

// Perimeter Var cells: index n <-> interior row/col n. Corners are separate
// single cells (they border no interior row/column).
const top = new Var('TP', 'top edge (row 0) skyscraper clues', 9);       // VTP{c}: row0,col c
const bot = new Var('BT', 'bottom edge (row 10) skyscraper clues', 9);   // VBT{c}: row10,col c
const lft = new Var('LF', 'left edge (column 0) skyscraper clues', 9);   // VLF{r}: row r,col0
const rgt = new Var('RT', 'right edge (column 10) skyscraper clues', 9); // VRT{r}: row r,col10
const tl = new Var('TL', 'top-left corner', 1);
const tr = new Var('TR', 'top-right corner', 1);
const bl = new Var('BL', 'bottom-left corner', 1);
const br = new Var('BR', 'bottom-right corner', 1);

// Exterior skyscraper clue: the outside Var equals the count of visible
// buildings along a row/column, viewed from that Var's side (`cells` is
// ordered nearest-first). Read the clue cell as its own segment, then the 9
// row/column cells as a second segment, breaking the target out of the count
// (same construction as data/scripts/between_the_skyscrapers.js).
const clueSpec = NFA.encodeSpec({
  startState: { phase: 0, tallest: 0, visible: 0, target: null },
  transition: ({ phase, tallest, visible, target }, value) => {
    if (value === SEGMENT_BREAK) {
      return phase === 1 ? [] : { phase: phase + 1, tallest, visible, target };
    }
    if (phase === 0) return { phase, tallest, visible, target: value };
    return {
      phase,
      tallest: Math.max(tallest, value),
      visible: visible + (value > tallest ? 1 : 0),
      target,
    };
  },
  accept: ({ phase, visible, target }) => phase === 1 && visible === target,
  maxDepth: 11, // 1 clue cell + 1 break + 9 row/column cells
}, 9, { multiSegment: true });

const exteriorClues = [];
for (let i = 1; i <= 9; i++) {
  const row = graph.row(i);
  const col = graph.column(i);
  exteriorClues.push(new NFA(clueSpec, 'sky-left', [lft.cell(i)], row));
  exteriorClues.push(new NFA(clueSpec, 'sky-right', [rgt.cell(i)], [...row].reverse()));
  exteriorClues.push(new NFA(clueSpec, 'sky-top', [top.cell(i)], col));
  exteriorClues.push(new NFA(clueSpec, 'sky-bottom', [bot.cell(i)], [...col].reverse()));
}

// Frame visibility: one length-11 perimeter run (corner, 9 edge cells,
// corner), fixed seen-count target baked into the spec (no clue cell to read,
// so a single segment).
const frameSpec = target => NFA.encodeSpec({
  startState: { tallest: 0, visible: 0 },
  transition: ({ tallest, visible }, value) => ({
    tallest: Math.max(tallest, value),
    visible: visible + (value > tallest ? 1 : 0),
  }),
  accept: ({ visible }) => visible === target,
  maxDepth: 11,
}, 9);
const frameLine = (target, cells) => new NFA(frameSpec(target), 'frame', ...cells);

const topCells = top.cells();
const botCells = bot.cells();
const lftCells = lft.cells();
const rgtCells = rgt.cells();

const frameClues = [
  frameLine(FRAME.rowTopLR, [tl.cell(1), ...topCells, tr.cell(1)]),
  frameLine(FRAME.rowTopRL, [tr.cell(1), ...[...topCells].reverse(), tl.cell(1)]),
  frameLine(FRAME.rowBotLR, [bl.cell(1), ...botCells, br.cell(1)]),
  frameLine(FRAME.rowBotRL, [br.cell(1), ...[...botCells].reverse(), bl.cell(1)]),
  frameLine(FRAME.colLeftTB, [tl.cell(1), ...lftCells, bl.cell(1)]),
  frameLine(FRAME.colLeftBT, [bl.cell(1), ...[...lftCells].reverse(), tl.cell(1)]),
  frameLine(FRAME.colRightTB, [tr.cell(1), ...rgtCells, br.cell(1)]),
  frameLine(FRAME.colRightBT, [br.cell(1), ...[...rgtCells].reverse(), tr.cell(1)]),
];

// Circled clues: sum of the two adjacent column-0 exterior-clue cells.
// (drawn edges, 1-indexed board coords R3C1/R4C1, R4C1/R5C1, R7C1/R8C1,
// R8C1/R9C1 -- interior rows 2/3, 3/4, 6/7, 7/8.)
const circleSums = [
  new Sum(9, lft.cell(2), lft.cell(3)),
  new Sum(8, lft.cell(3), lft.cell(4)),
  new Sum(12, lft.cell(6), lft.cell(7)),
  new Sum(7, lft.cell(7), lft.cell(8)),
];

return [
  new Shape('9x9'),
  top, bot, lft, rgt, tl, tr, bl, br,
  ...exteriorClues,
  ...frameClues,
  ...circleSums,
];
