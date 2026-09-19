// Title: Flax
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=fYCf_M0qgrI
// Source: https://sudokupad.app/o9w2xjxagb
//
// Normal sudoku rules apply. Each row/column/box contains one "doubler" cell,
// whose value is double its digit; each digit appears in exactly one doubler.
// The 3x3 box borders split each blue line into segments, and the cells of
// each segment of a line sum to the same total (checked per line, not across
// lines -- the rules state one shared total per line, drawn separately five
// times).
//
// No cell is marked as a doubler in the source: which cell in each house is
// the doubler is solver-deduced structure, so it is modelled with an overlay
// rather than a Given.

// Shape is widened to 0-9 so the doubler overlay can hold 0 (not a doubler)
// alongside a copy of the cell's own digit (a doubler). Grid cells are then
// restricted back to the real 1-9 digits below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const cells = graph.cells();

const digitGivens = graph.makeReplicate(new Given(cells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// `extra` holds, per cell, the doubler's contribution to that cell's value:
// 0 for an ordinary cell, or a second copy of the digit for a doubler cell.
// A cell's effective value (used only by the line-sum rule below) is then
// digit + extra: digit, or double the digit when it is the doubler.
const extra = graph.makeOverlay('VE');
const extraVar = extra.toVar('doubler extra value');

// Per cell: extra is 0, or equals the cell's own digit.
const extraMatchesDigit = Pair.fnToKey(
  (digit, ex) => ex === 0 || ex === digit, shape);
const doublerLinks = cells.map(
  cell => new Pair(extraMatchesDigit, 'doubler value', cell, extra.at(cell)));

// Exactly one doubler (non-zero extra) per row, column and box: 8 of the 9
// cells' extra values are 0, so the 9th is forced non-zero.
const houses = graph.rowsColumnsBoxes();
const oneDoublerPerHouse = houses.map(
  house => new ContainExact('0_0_0_0_0_0_0_0', ...extra.at(house)));

// Each digit 1-9 appears as a doubler's extra value exactly once across the
// whole grid, i.e. each digit is doubled in exactly one cell.
const eachDigitDoubledOnce =
  new ContainExact('1_2_3_4_5_6_7_8_9', ...extra.cells());

// Blue lines, drawn order. Each line's cell path is split into segments
// wherever it crosses a 3x3 box border; a box the line re-enters contributes
// a further, separate segment for that visit.
const lines = [
  ['R1C3', 'R2C4', 'R3C4', 'R4C3', 'R4C2', 'R3C1'],
  ['R7C1', 'R6C2', 'R6C3', 'R7C4', 'R8C4', 'R8C3'],
  ['R6C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C9', 'R7C8', 'R8C8', 'R8C7'],
  ['R3C8', 'R4C8', 'R4C7', 'R3C6', 'R2C6', 'R1C7'],
  ['R9C8', 'R9C7', 'R9C6', 'R8C5', 'R7C6', 'R7C7'],
];

const boxOf = new Map();
graph.boxes().forEach((box, i) => box.forEach(cell => boxOf.set(cell, i)));

// Split a line's cell path into per-box-visit segments, walking in the
// drawn order (a re-entered box starts a new segment rather than merging
// with its earlier visit).
function segmentsOf(lineCells) {
  const segments = [];
  let current = [];
  let lastBox = null;
  for (const cell of lineCells) {
    const box = boxOf.get(cell);
    if (current.length && box !== lastBox) {
      segments.push(current);
      current = [];
    }
    current.push(cell);
    lastBox = box;
  }
  segments.push(current);
  return segments;
}

// Each segment's effective total is the sum of its cells' digits plus their
// doubler extras (0 or a repeated digit), i.e. the sum of effective values.
const lineEqualSums = lines.map(lineCells => new EqualSum(
  ...segmentsOf(lineCells).map(segment => [...segment, ...extra.at(segment)])));

return [
  shape,
  digitGivens,
  extraVar,
  ...doublerLinks,
  ...oneDoublerPerHouse,
  eachDigitDoubledOnce,
  ...lineEqualSums,
];
