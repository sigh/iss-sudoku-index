// Title: Sudokoban
// Author: DiMono
// Video: https://www.youtube.com/watch?v=KE9UUDKWEaM
// Source: https://tinyurl.com/ctcsudokuban
//
// The 11x11 canvas holds nine ordinary 3x3 boxes, each printed at one of the
// standard nine box locations, separated by one-cell gap rows/columns (rows
// and columns 4 and 8) that carry no digits. The boxes' *printed* positions
// are not their sudoku positions: each box is assigned an unknown target box
// number 1-9 (a permutation, `slot`), and only once boxes are grouped by
// target box number do the resulting rows/columns/boxes hold each digit
// once. A box's own 9 printed cells always hold 1-9 once each (that's true
// regardless of the target permutation), so "resulting row/column" reduces
// to: whichever three boxes share a target row-band (ceil(slot/3)) must be
// pairwise digit-disjoint at each of their local rows, and whichever three
// share a target column-stack ((slot-1)%3) must be pairwise digit-disjoint
// at each of their local columns. Encoded as: for every pair of boxes and
// every local row/column, either their `slot`s differ in that grouping or
// the 3+3 cells are AllDifferent.
//
// Self-numbering: each box's own local cell-numbering (1-9, left-right
// top-bottom, the standard convention restated in the rules) must hold its
// target box number at the position matching that number, and no cell may
// hold its own local position number unless that position is the box's
// target number. Encoded as one lookup Pair per local position p, tying
// `slot` to that position's cell: cell == p iff slot == p.
//
// Cages sum with distinct digits (rules: "Digits in a cage must sum to the
// indicated number"), each drawn within a single box: R10C6+R11C6=8,
// R5C5+R5C6+R6C6+R7C6=12, R3C6+R3C7=15, R1C10+R1C11=14. One further cage
// (R1C1, R11C11) is drawn with zero opacity and carries no printed total --
// encoded as a real, sum-less (distinct-only) cage per the usual rule that
// hidden/no-total cages are still real; no rules sentence names it, so only
// distinctness is asserted.
//
// Outside clues (rules: "no arrow" = X-Sum, first X cells where X is the
// first-seen digit sum to the clue; "with an arrow" = Little Killer, plain
// diagonal sum; both "do not cross box gaps", so every ray is capped at the
// 3 cells of the one box it enters), resolved against the drawn arrow glyphs'
// axis/tip and the outside-margin clue positions.
//   X-Sum: top C6 -> R1C6,R2C6,R3C6 = 10; left R2 -> R2C1,R2C2,R2C3 = 9;
//   right R5 -> R5C11,R5C10,R5C9 = 8.
//   Two more X-Sum clues (bottom C1 -> R11C1,R10C1,R9C1; right R3 ->
//   R3C11,R3C10,R3C9) print "?": the total itself is not recoverable (it is
//   not read back out anywhere else), but "sums do not cross box gaps"
//   still bounds X, the first cell's own value, to the box's 3 cells --
//   encoded as the first cell of each ray having a value in 1-3, the one
//   part of an unknown-total X-Sum clue that is not vacuous.
//   Little Killer (arrow glyphs at gap cells). Each glyph is drawn as one
//   small corner-hook per diagonal it clues, all sharing the one printed
//   total: the 4-way corners R4C4 and R4C8 carry 3 and 2 drawn hooks
//   respectively, the corners R8C3/R8C5/R8C8 carry exactly 1 -- confirmed by
//   each hook's offset from its cell's centre, which names the quadrant
//   (hence the diagonal direction) it points toward.
//     R4C4 (hooks NW, NE, SW; SE undrawn): R3C3,R2C2,R1C1 = 10 (box A);
//       R3C5,R2C6,R1C7 = 10 (box B); R5C3,R6C2,R7C1 = 10 (box D).
//     R4C8 (hooks SW, SE; NW, NE undrawn): R5C7,R6C6,R7C5 = 10 (box E);
//       R5C9,R6C10,R7C11 = 10 (box F).
//     R8C3 (hook NW only): R7C2,R6C1 = 14 (box D).
//     R8C5 (hook NE only): R7C6,R6C7 = 12 (box E).
//     R8C8 (hook NE only): R7C9,R6C10,R5C11 = 15 (box F).

const BLOCKS = [
  { R0: 1, C0: 1 }, { R0: 1, C0: 5 }, { R0: 1, C0: 9 },
  { R0: 5, C0: 1 }, { R0: 5, C0: 5 }, { R0: 5, C0: 9 },
  { R0: 9, C0: 1 }, { R0: 9, C0: 5 }, { R0: 9, C0: 9 },
];

// p is the box's local position number, 1-9, left-right then top-bottom.
const blockCell = (b, p) => {
  const rOff = Math.floor((p - 1) / 3);
  const cOff = (p - 1) % 3;
  return makeCellId(BLOCKS[b].R0 + rOff, BLOCKS[b].C0 + cOff);
};
const blockCells = b => Array.from({ length: 9 }, (_, i) => blockCell(b, i + 1));
// The 3 cells of the box's local row r (0-2).
const blockRow = (b, r) => [1, 2, 3].map(k => blockCell(b, r * 3 + k));
// The 3 cells of the box's local column c (0-2).
const blockCol = (b, c) => [0, 1, 2].map(k => blockCell(b, k * 3 + c + 1));

const slots = new Var('SL', 'box target numbers', 9);
const slotCell = b => slots.cell(b + 1);

// Self-numbering lookup: cell holds p iff this box's target number is p.
const selfNumberKeys = Array.from({ length: 9 }, (_, i) => {
  const p = i + 1;
  return Pair.fnToKey((s, v) => (v === p) === (s === p), 9);
});

// Row-band / column-stack membership, derived from `slot` directly:
// ceil(slot/3) is the target row-band, (slot-1)%3 is the target column-stack.
const notSameBandKey = Pair.fnToKey(
  (a, b) => Math.ceil(a / 3) !== Math.ceil(b / 3), 9);
const notSameStackKey = Pair.fnToKey(
  (a, b) => ((a - 1) % 3) !== ((b - 1) % 3), 9);

const blockPairGroupingConstraints = [];
for (let i = 0; i < 9; i++) {
  for (let j = i + 1; j < 9; j++) {
    for (let r = 0; r < 3; r++) {
      blockPairGroupingConstraints.push(new Or([
        new Pair(notSameBandKey, 'different row-band', slotCell(i), slotCell(j)),
        new AllDifferent(...blockRow(i, r), ...blockRow(j, r)),
      ]));
    }
    for (let c = 0; c < 3; c++) {
      blockPairGroupingConstraints.push(new Or([
        new Pair(notSameStackKey, 'different column-stack', slotCell(i), slotCell(j)),
        new AllDifferent(...blockCol(i, c), ...blockCol(j, c)),
      ]));
    }
  }
}

const selfNumberConstraints = [];
for (let b = 0; b < 9; b++) {
  for (let p = 1; p <= 9; p++) {
    selfNumberConstraints.push(
      new Pair(selfNumberKeys[p - 1], 'self-number lookup', slotCell(b), blockCell(b, p)));
  }
}

// Gap rows/columns (4 and 8) carry no digits at all; pin them so they don't
// each multiply the solution count by a free 1-9 choice.
const gapGivens = [];
for (let r = 1; r <= 11; r++) {
  for (let c = 1; c <= 11; c++) {
    if (r === 4 || r === 8 || c === 4 || c === 8) {
      gapGivens.push(new Given(makeCellId(r, c), 1));
    }
  }
}

// X-Sum over a 3-cell in-box ray: the first cell's value X selects how many
// of the (at most 3) cells sum to the clue.
const xSum = (cells, total) => new Or([
  new And([new Given(cells[0], 1), new Sum(total, cells[0])]),
  new And([new Given(cells[0], 2), new Sum(total, cells[0], cells[1])]),
  new And([new Given(cells[0], 3), new Sum(total, cells[0], cells[1], cells[2])]),
]);

const cell = (r, c) => makeCellId(r, c);
const cells = pairs => pairs.map(([r, c]) => cell(r, c));

return [
  new Shape('11x11', 9, 'Raw'),

  slots,
  new AllDifferent(...slots.cells()),

  // Each printed box holds 1-9 once (true for any box regardless of its
  // eventual target number).
  ...BLOCKS.map((_, b) => new AllDifferent(...blockCells(b))),

  ...selfNumberConstraints,
  ...blockPairGroupingConstraints,

  ...gapGivens,

  // Cages.
  new Cage(8, ...cells([[10, 6], [11, 6]])),
  new Cage(12, ...cells([[5, 5], [5, 6], [6, 6], [7, 6]])),
  new Cage(15, ...cells([[3, 6], [3, 7]])),
  new Cage(14, ...cells([[1, 10], [1, 11]])),
  new AllDifferent(...cells([[1, 1], [11, 11]])),

  // Little Killer diagonals (plain sums; do not cross box gaps). R4C4 and
  // R4C8 each carry more than one drawn diagonal sharing their one printed
  // total -- see header comment.
  new Sum(10, ...cells([[3, 3], [2, 2], [1, 1]])),
  new Sum(10, ...cells([[3, 5], [2, 6], [1, 7]])),
  new Sum(10, ...cells([[5, 3], [6, 2], [7, 1]])),
  new Sum(10, ...cells([[5, 7], [6, 6], [7, 5]])),
  new Sum(10, ...cells([[5, 9], [6, 10], [7, 11]])),
  new Sum(14, ...cells([[7, 2], [6, 1]])),
  new Sum(12, ...cells([[7, 6], [6, 7]])),
  new Sum(15, ...cells([[7, 9], [6, 10], [5, 11]])),

  // X-Sum outside clues (do not cross box gaps).
  xSum(cells([[1, 6], [2, 6], [3, 6]]), 10),
  xSum(cells([[2, 1], [2, 2], [2, 3]]), 9),
  xSum(cells([[5, 11], [5, 10], [5, 9]]), 8),

  // The two "?" X-Sum clues: only the box-gap bound on the first cell is
  // recoverable (see header comment).
  new Given(...cells([[11, 1]]), 1, 2, 3),
  new Given(...cells([[3, 11]]), 1, 2, 3),
];
