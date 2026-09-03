// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qp37pnVMpNw
// Source: https://cracking-the-cryptic.web.app/sudoku/LjD3JbHLTF

// Rules encoded below:
//
//  - Normal Sudoku rules apply.
//  - Killer cages: the digits in each outlined cage sum to its printed total.
//  - The cages are drawn on a canvas one cell wider than the grid on every
//    side. Besides tiling all 81 grid cells they cover 25 cells of that
//    margin, one beside each of 25 different grid lines and never a corner.
//    A margin cell holds the number of skyscrapers visible along its line,
//    viewed from that cell: reading away from the margin cell, a digit is
//    visible when every digit before it is smaller. Nothing is printed in the
//    margin, so those 25 values are solved for, and each counts towards the
//    total of the cage that contains it.
//
// The margin cells are read as skyscraper clues on the strength of three drawn
// facts: they occupy only outside-clue positions (one per line per side, no
// corner cell, which is where a skyscraper clue can sit and nowhere else); the
// video naming this source calls it "A Killer Skyscraper"; and because the
// cages tile the grid exactly, the printed totals sum to 489 against a grid
// total of 405, forcing the 25 margin cells to total 84 -- a mean of 3.4,
// which is the scale of a visibility count and not of a free digit.
//
// Omitted: whether the killer no-repeat rule reaches the margin cells is not
// recoverable -- the payload carries no rules text, and no drawn feature says
// whether a visibility count may equal a digit of its own cage. Cages that lie
// wholly in the grid are encoded as no-repeat cages; the 13 cages that reach
// into the margin are encoded as sums only. That is the weaker of the two
// readings: it drops no-repeat between a margin cell and the rest of its cage.
// It drops nothing among the grid cells of those 13 cages -- in every one of
// them the in-grid cells already share a row, column or box pairwise, so
// Sudoku alone makes them different.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// The cages, transcribed from the drawn outlines and their printed totals, as
// [total, in-grid cells, margin cells]. A margin cell is named by the line it
// looks along and the direction of view: 'C3,1' is the cell above column 3
// looking down, 'R2,-1' the cell right of row 2 looking left.
const CAGES = [
  [27, ['R1C1', 'R1C2', 'R2C2'], ['C1,1', 'C2,1', 'R1,1']],
  [17, ['R1C3', 'R1C4'], ['C3,1']],
  [16, ['R1C6'], ['C5,1', 'C6,1']],
  [24, ['R1C7', 'R2C7', 'R2C8', 'R2C9'], ['C7,1', 'R2,-1']],
  [18, ['R1C8', 'R1C9'], ['C8,1', 'C9,1']],
  [15, ['R2C1', 'R3C1', 'R3C2'], ['R2,1', 'R3,1']],
  [30, ['R2C3', 'R2C4', 'R3C3', 'R3C4'], []],
  [15, ['R1C5', 'R2C5', 'R2C6', 'R3C5', 'R3C6'], []],
  [31, ['R3C7', 'R3C8', 'R3C9', 'R4C7', 'R4C8', 'R4C9'], []],
  [28, ['R4C6', 'R5C6', 'R5C7', 'R6C7'], []],
  [14, ['R5C8', 'R6C8'], []],
  [15, ['R5C9', 'R6C9', 'R7C9'], ['R6,-1', 'R7,-1']],
  [20, ['R8C9', 'R9C9'], ['R8,-1', 'R9,-1']],
  [13, ['R7C7', 'R7C8', 'R8C7', 'R8C8'], []],
  [13, ['R9C7', 'R9C8'], ['C7,-1']],
  [10, ['R5C1'], ['R4,1', 'R5,1']],
  [15, ['R4C1', 'R4C2'], []],
  [18, ['R4C3', 'R4C4', 'R4C5', 'R5C4', 'R5C5'], []],
  [32, ['R6C5', 'R6C6', 'R7C5', 'R7C6', 'R8C5'], []],
  [21, ['R8C6', 'R9C4', 'R9C5', 'R9C6'], ['C5,-1', 'C6,-1']],
  [21, ['R6C4', 'R7C4', 'R8C3', 'R8C4'], []],
  [22, ['R5C2', 'R5C3', 'R6C2', 'R6C3', 'R7C2', 'R7C3'], []],
  [20, ['R6C1', 'R7C1'], ['R6,1', 'R7,1']],
  [25, ['R8C1', 'R8C2', 'R9C1', 'R9C2'], []],
  [9, ['R9C3'], ['C2,-1', 'C3,-1']],
];

// One extra cell per margin clue, holding its visibility count.
const marginIds = CAGES.flatMap(([, , margin]) => margin);
const margins = new Var('SK', 'skyscraper clues', marginIds.length);
const marginCell = new Map(
  marginIds.map((id, i) => [id, margins.cell(i + 1)]));

// The nine cells a margin clue looks along, ordered away from the clue.
const viewLine = (id) => {
  const [lineId, dir] = id.split(',');
  const line = lineId[0] === 'C'
    ? graph.column(+lineId.slice(1))
    : graph.row(+lineId.slice(1));
  return +dir > 0 ? line : line.slice().reverse();
};

// Visibility count. Segment 1 is the nine line cells read away from the clue;
// segment 2 is the clue cell alone, which must equal the count. `max` is the
// tallest digit read so far and `count` how many digits have beaten every
// earlier one, i.e. how many are visible. `ph` 0 reads the line, 1 reads the
// clue cell, 2 is the sink reached only when the clue matched the count, and
// is the sole accepting phase; a mismatch has no successor state.
const visibleCount = NFA.encodeSpec({
  startState: { max: 0, count: 0, ph: 0 },
  transition: (s, value) => {
    if (value === SEGMENT_BREAK) {
      // Drop `max` at the break: only the count is read from here on.
      return s.ph === 0 ? { max: 0, count: s.count, ph: 1 } : undefined;
    }
    if (s.ph === 0) {
      return value > s.max
        ? { max: value, count: s.count + 1, ph: 0 }
        : { max: s.max, count: s.count, ph: 0 };
    }
    if (s.ph === 1) {
      return value === s.count ? { max: 0, count: 0, ph: 2 } : undefined;
    }
    return undefined;
  },
  accept: (s) => s.ph === 2,
  maxDepth: 11,  // 9 line cells + 1 segment break + 1 clue cell
}, shape, { multiSegment: true });

return [
  shape,
  margins,

  new Given('R3C3', 9),
  new Given('R3C7', 8),
  new Given('R7C3', 1),
  new Given('R7C7', 7),

  ...marginIds.map((id) => new NFA(
    visibleCount, 'skyscraper', viewLine(id), [marginCell.get(id)])),

  ...CAGES.map(([total, cells, margin]) => (
    margin.length === 0
      ? new Cage(total, ...cells)
      : new Sum(total, ...cells, ...margin.map((id) => marginCell.get(id))))),
];
