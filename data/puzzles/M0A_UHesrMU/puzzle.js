// Title: Strange Dream
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=M0A_UHesrMU
// Source: https://sudokupad.app/xmr3yscqzn?setting-digitoutlines=0

// Rules encoded here, in full:
//   Place a digit from 1-9 in each cell so that every digit appears once in
//   every row, column and box. (There are 6 rows, 6 columns and 54 cells: one
//   cell in each row -- also one in each column and one in each box -- is
//   divided by drawn lines into four quarter-cells, so every row, column and
//   box holds nine cells.)
//   THERMO - digits increase along thermometer lines, starting from the bulb.
//   KILLER - digits may not repeat in the cage.
//   SILENT LITTLE KILLER - each cell with an arrow contains the sum of the
//   digits on the diagonal pointed to by the arrow.
// Nothing is omitted.
//
// Board layout: a 6x9 Raw grid. Board row r holds puzzle row r's nine cells in
// drawing order, left to right, the divided cell contributing its four quarters
// in reading order (top-left, top-right, bottom-left, bottom-right). Raw carries
// no implicit rules, so the row, column and box rules are stated explicitly
// below; board columns are not puzzle columns and carry no rule of their own.

const shape = new Shape('6x9', '', 'Raw');

// Drawn data: the cell-splitting lines divide exactly one cell per row into four
// quarters. SPLIT_COL[r] is the column of the divided cell in puzzle row r.
const SPLIT_COL = { 1: 1, 2: 4, 3: 2, 4: 5, 5: 3, 6: 6 };
const QUADS = ['TL', 'TR', 'BL', 'BR'];

// A puzzle cell is (row, col) when undivided, and (row, col, quadrant) when it
// is one quarter of a divided cell. Board column: walk the puzzle row from the
// left, a divided cell taking four board columns instead of one.
const cell = (r, c, q) => {
  let col = 1;
  for (let cc = 1; cc < c; cc++) col += cc === SPLIT_COL[r] ? 4 : 1;
  if (c === SPLIT_COL[r]) col += QUADS.indexOf(q);
  return makeCellId(r, col);
};

// The cells of a rectangular block of puzzle cells, quarters expanded.
const block = (rows, cols) => rows.flatMap(
  r => cols.flatMap(
    c => c === SPLIT_COL[r] ? QUADS.map(q => cell(r, c, q)) : [cell(r, c)]));

const ALL = [1, 2, 3, 4, 5, 6];
const rows = ALL.map(r => block([r], ALL));
const columns = ALL.map(c => block(ALL, [c]));
// Boxes are the drawn 2-row by 3-column boxes; each holds one divided cell.
const boxes = [[1, 2], [3, 4], [5, 6]].flatMap(
  rs => [[1, 2, 3], [4, 5, 6]].map(cs => block(rs, cs)));

const units = [...rows, ...columns, ...boxes].map(g => new AllDifferent(...g));

// Each divided cell carries one thermometer running through its four quarters:
// bulb in the top-left quarter, then top-right, bottom-left, bottom-right.
const thermos = ALL.map(
  r => new Thermo(...QUADS.map(q => cell(r, SPLIT_COL[r], q))));

// The one dashed cage, transcribed from the drawn dashed border. Sum 0 means the
// cage has no total, so only the no-repeat rule applies.
const cage = new Cage(
  0, cell(2, 3), cell(2, 4, 'TL'), cell(2, 4, 'TR'), cell(3, 2, 'TR'),
  cell(3, 3));

// Silent little killers, as drawn: the cell the arrow sits in, and the arrow's
// direction in the picture as [rows, columns] (up is negative).
const ARROWS = [
  [[2, 2], [-1, -1]],
  [[3, 1], [-1, 1]],
  [[3, 4], [-1, 1]],
  [[6, 4], [-1, 1]],
  [[2, 4, 'BR'], [-1, -1]],
  [[3, 2, 'BR'], [-1, -1]],
  [[4, 5, 'BL'], [-1, 1]],
];

// The diagonals are read off the drawing on a 12x12 lattice of half-cells: an
// undivided cell spans a 2x2 block of them, a quarter-cell is exactly one, so a
// 45-degree ray steps one half-cell at a time. Half-cell (i, j) belongs to
// puzzle cell (ceil(i/2), ceil(j/2)), and its parities name the quarter.
const halfCell = (i, j) => {
  const r = Math.ceil(i / 2);
  const c = Math.ceil(j / 2);
  if (c !== SPLIT_COL[r]) return cell(r, c);
  return cell(r, c, (i % 2 ? 'T' : 'B') + (j % 2 ? 'L' : 'R'));
};

// The ray leaves the centre of the arrow's cell, so it starts in the half-cell
// on the side the arrow points at, then runs to the edge of the drawing. Repeats
// (a cell entered through two consecutive half-cells) and the arrow's own cell
// are dropped: the arrow holds the total, it is not part of the diagonal.
const diagonal = ([r, c, q], [dr, dc]) => {
  let i = 2 * r - (q ? (q[0] === 'T' ? 1 : 0) : (dr < 0 ? 1 : 0));
  let j = 2 * c - (q ? (q[1] === 'L' ? 1 : 0) : (dc < 0 ? 1 : 0));
  const path = [cell(r, c, q)];
  for (i += dr, j += dc; i >= 1 && i <= 12 && j >= 1 && j <= 12; i += dr, j += dc) {
    const id = halfCell(i, j);
    if (id !== path[path.length - 1]) path.push(id);
  }
  return path.slice(1);
};

const littleKillers = ARROWS.map(
  ([a, d]) => new Arrow(cell(...a), ...diagonal(a, d)));

return [shape, ...units, ...thermos, cage, ...littleKillers];
