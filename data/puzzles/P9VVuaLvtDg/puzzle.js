// Title: 45
// Author: Teal
// Video: https://www.youtube.com/watch?v=P9VVuaLvtDg
// Source: https://sudokupad.app/14arl2fm9c

// Each 6-cell row, column, and 2x3 box uses the same unknown subset of 1-9.
// The shaded notes cells show that subset in increasing order. Each gray Ten
// line is partitioned into consecutive groups whose digits sum to 10.
const shape = new Shape('6x6', 9);
const notes = new Var('N', 'shaded notes', '1x6');
const tenLine = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => {
    // A segment break ends one independently partitioned gray line.
    if (value === SEGMENT_BREAK) return sum === 0 ? 0 : undefined;
    const next = sum + value;
    if (next > 10) return undefined;
    return next === 10 ? 0 : next;
  },
  accept: sum => sum === 0,
}, shape, { multiSegment: true });
const increasing = Pair.fnToKey((a, b) => a < b, shape);

return [
  shape,
  new RegionSameValues(),
  notes,
  // The shaded cells are the same six values as a Sudoku row, in drawn order.
  new SameValues(2, 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', ...notes.cells()),
  new Pair(increasing, 'increasing notes', ...notes.cells()),
  // Gray Ten lines, transcribed from the drawn paths.
  new NFA(tenLine, 'Ten lines',
    ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'],
    ['R5C1', 'R6C1', 'R6C2'],
    ['R3C2', 'R3C3', 'R4C4', 'R4C5', 'R4C6'],
    ['R3C1', 'R4C1'],
    ['R3C4', 'R2C4', 'R2C3', 'R2C2'],
    ['R5C4', 'R6C4'],
    ['R2C6', 'R3C5']),
];
