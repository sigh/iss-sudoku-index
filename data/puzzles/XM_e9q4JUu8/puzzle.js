// Title: Sunday Surprise
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=XM_e9q4JUu8
// Source: https://app.crackingthecryptic.com/sudoku/jNh79RDfH9

// Rules:
//   Normal sudoku rules apply within the 9x9 grid.
//   Digits along a thermometer must increase from the bulb end.
//   Each digit in the 9x9 grid represents a skyscraper with a height
//   corresponding to its value. Clues outside the 9x9 grid indicate how many
//   skyscrapers can be seen, in total, when looking along that row or column
//   from that direction. Taller skyscrapers block smaller skyscrapers
//   from view.
// The grid is printed with no given digits and no printed outside numbers: the
// thermometer strokes leave the 9x9 grid and run through the surrounding ring
// of cells, so each ring cell a stroke passes through is an outside clue whose
// value is solved for rather than printed. Every sentence above is encoded;
// nothing is omitted.

// The drawn canvas is 11x11. The playable 9x9 occupies canvas rows and columns
// 1-9 (0-based); canvas row 0, row 10, column 0 and column 10 form the ring of
// outside-clue cells, which take no part in sudoku rows, columns or boxes.
const inGrid = ([r, c]) => r >= 1 && r <= 9 && c >= 1 && c <= 9;
const key = ([r, c]) => `${r},${c}`;

// Thermometer strokes as [canvasRow, canvasCol], bulb first: transcribed from
// the grey bulb-and-stroke figures, one entry per stroke leaving a bulb. Each
// filled circle is a bulb, so a figure with two strokes at its circle (the
// R4C3, R5C5, R8C1 and R3C9 circles) contributes two thermometers, and the
// top-right figure -- drawn as a single polyline with its circle at the fourth
// waypoint rather than at either end -- is split there into its two strokes.
const thermoPaths = [
  [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
  [[4, 3], [4, 2]],
  [[4, 3], [3, 3], [2, 3], [1, 3], [0, 3]],
  [[5, 5], [4, 4], [3, 4], [3, 5], [3, 6]],
  [[5, 5], [6, 6], [7, 6], [7, 5], [7, 4]],
  [[10, 7], [9, 7], [8, 7], [7, 7], [6, 8], [7, 9]],
  [[8, 8], [8, 9]],
  [[10, 9], [9, 9]],
  [[8, 1], [8, 0], [9, 0], [9, 1]],
  [[8, 1], [7, 1], [7, 0]],
  [[3, 9], [2, 9], [2, 10], [1, 10], [1, 9]],
  [[3, 9], [3, 10]],
];

// The ring cells the strokes reach, in canvas reading order, are exactly the
// puzzle's outside clues. They become the Var cells VS1..VSn in that order.
const clueCanvasCells = [...new Map(
  thermoPaths.flat().filter(p => !inGrid(p)).map(p => [key(p), p])).values()]
  .sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));

const clueVar = new Var('S', 'outside skyscraper clues', clueCanvasCells.length);
const clueIds = new Map(
  clueCanvasCells.map((p, i) => [key(p), clueVar.cells()[i]]));
const cellFor = p => inGrid(p) ? makeCellId(p[0], p[1]) : clueIds.get(key(p));

// A ring cell's line of sight, ordered from nearest to furthest: down its
// column from canvas row 0, up its column from canvas row 10, rightwards along
// its row from canvas column 0, leftwards along its row from canvas column 10.
const graph = cellGraph('9x9');
const sightLine = ([r, c]) => {
  if (r === 0) return graph.column(c);
  if (r === 10) return graph.column(c).slice().reverse();
  if (c === 0) return graph.row(r);
  return graph.row(r).slice().reverse();
};

// Skyscraper visibility, one machine per outside clue. Segment 1 is the clue
// cell, segment 2 its line of sight. `rem` counts the visible skyscrapers the
// clue still demands and starts at the clue's own value; `max` is the tallest
// seen so far along the line, so a cell is visible exactly when it exceeds
// `max`. Reaching the end of the line with `rem` at 0 means the number seen
// equalled the clue; running out of `rem` early rejects.
const skyscraperSpec = NFA.encodeSpec({
  startState: { rem: null, max: 0 },
  transition: ({ rem, max }, value) => {
    if (value === SEGMENT_BREAK) return { rem, max };
    if (rem === null) return { rem: value, max: 0 };
    if (value <= max) return { rem, max };
    if (rem === 0) return undefined;
    return { rem: rem - 1, max: value };
  },
  accept: ({ rem }) => rem === 0,
  maxDepth: 11,  // 1 clue cell + 1 segment break + 9 line cells
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),
  clueVar,
  ...thermoPaths.map(path => new Thermo(...path.map(cellFor))),
  ...clueCanvasCells.map(p => new NFA(
    skyscraperSpec, 'skyscraper', [cellFor(p)], sightLine(p))),
];
