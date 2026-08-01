// Title: SET PIECE
// Author: Wisteria Fall
// Video: https://www.youtube.com/watch?v=Wq-K_ckoVYs
// Source: https://sudokupad.app/w1n9shvh3t

// The 72 unshaded cells are represented as one Var group because the source
// has non-rectangular rows and permits repeated digits. Each source row,
// column, and bold 9-cell region is padded to nine cells, then SameValues
// makes all of them the same multiset (including repeated digits).
const shape = new Shape('1x1', 9);
const digits = new Var('G', 'unshaded cells', '9x8');
const padding = new Var('P', 'multiset padding', 36);
const activeRows = [
  '0111111110', '1100010011', '1001111001', '1011111101', '1111111101',
  '1011111111', '1011111101', '1001111001', '1100100011', '0111111110',
];
let nextDigit = 1;
const cellIds = new Map();
for (let r = 0; r < activeRows.length; r++) {
  for (let c = 0; c < activeRows[r].length; c++) {
    if (activeRows[r][c] === '1') cellIds.set(`${r + 1},${c + 1}`, digits.cell(nextDigit++));
  }
}
const cell = (r, c) => cellIds.get(`${r},${c}`);
let nextPadding = 1;
const pad = (cells) => cells.concat(Array.from(
  {length: 9 - cells.length}, () => padding.cell(nextPadding++)));
const rows = activeRows.map((row, r) => pad([...row].flatMap(
  (active, c) => active === '1' ? [cell(r + 1, c + 1)] : [])));
const columns = Array.from({length: 10}, (_, c) => pad(activeRows.flatMap(
  (row, r) => row[c] === '1' ? [cell(r + 1, c + 1)] : [])));

// The thick outlines in the source draw these eight 9-cell regions.
const regions = [
  [[1,2],[1,3],[1,4],[1,5],[2,2],[2,1],[3,1],[4,1],[5,1]],
  [[1,6],[1,7],[1,8],[1,9],[2,9],[2,10],[3,10],[4,10],[5,10]],
  [[2,6],[3,6],[3,7],[4,7],[4,8],[5,8],[5,7],[5,6],[4,6]],
  [[3,4],[4,4],[4,3],[5,3],[5,2],[6,3],[6,4],[7,3],[5,4]],
  [[3,5],[4,5],[5,5],[6,5],[7,5],[7,4],[8,4],[8,5],[9,5]],
  [[6,1],[7,1],[8,1],[9,1],[9,2],[10,2],[10,3],[10,4],[10,5]],
  [[6,6],[6,7],[6,8],[6,9],[7,8],[7,7],[8,7],[8,6],[7,6]],
  [[6,10],[7,10],[8,10],[9,10],[9,9],[10,9],[10,8],[10,7],[10,6]],
].map(region => region.map(([r, c]) => cell(r, c)));

// Arrows: circle first; the remaining listed cells form its arm.
const arrows = [
  [[6,5],[7,4],[7,3]], [[5,5],[4,4],[3,4]], [[5,6],[4,7],[4,8]],
  [[6,6],[7,7],[8,7]], [[5,10],[6,9],[7,8]], [[6,1],[5,2],[4,3]],
  [[2,6],[1,4],[1,3]], [[3,1],[2,1],[2,2]],
  [[9,5],[10,4],[10,3],[9,2]], [[2,6],[1,9]],
  [[9,9],[9,10]],
].map(arrow => arrow.map(([r, c]) => cell(r, c)));

// White dots require their two endpoint digits to be consecutive.
const consecutive = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const dots = [
  [[1,3],[1,4]], [[2,9],[2,10]], [[4,7],[4,8]], [[6,3],[6,4]],
  [[6,9],[6,10]], [[10,7],[10,8]], [[4,8],[5,8]], [[7,7],[8,7]],
].map(dot => dot.map(([r, c]) => cell(r, c)));

return [
  shape,
  new Given('R1C1', 1), // Fixed dummy cell: the actual answer is in VG.
  digits,
  padding,
  new SameValues(28, ...rows.flat(), ...columns.flat(), ...regions.flat()),
  ...arrows.map(arrow => new Arrow(...arrow)),
  ...dots.map(dot => new Pair(consecutive, 'white dot', ...dot)),
];
