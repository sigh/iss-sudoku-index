// Title: Between The Skyscrapers
// Author: Klausku
// Video: https://www.youtube.com/watch?v=bi0sC74nPuU
// Source: https://app.crackingthecryptic.com/sudoku/2tfL7TJhPd

// Normal sudoku rules apply.
// Between lines (grey lines with an open circle at each end): interior cells
// must be strictly between the two circled values (`Between`).
// A circled cell's own digit is simultaneously a skyscraper-visibility clue
// for its whole row (from the left) AND its whole column (from the top):
// reading digits as building heights, the count of buildings visible from
// that edge (a taller building obscures every shorter one behind it) equals
// the circled digit itself.
// A "<" mark on the edge between R9C5 and R9C6 is a standard inequality
// (the symbol points at the lower digit): R9C5 < R9C6.

const graph = cellGraph('9x9');

// Between-line paths, first/last cell circled, walked in drawn order.
const betweenLines = [
  ['R3C3', 'R3C4', 'R3C5', 'R4C5'],
  ['R4C5', 'R4C4', 'R5C4', 'R6C4', 'R7C4'],
  ['R2C1', 'R1C1', 'R1C2'],
  ['R9C9', 'R9C8', 'R8C7'],
  ['R8C7', 'R7C6', 'R7C5', 'R7C4'],
  ['R6C8', 'R7C8', 'R8C7'],
];

// The 8 circled cells (each between-line endpoint above, de-duplicated).
// Each sits in its own row and its own column, so each gets exactly one
// row-visibility and one column-visibility check.
const circledCells = [
  'R3C3', 'R4C5', 'R7C4', 'R2C1', 'R1C2', 'R9C9', 'R8C7', 'R6C8',
];

// Skyscraper-visibility state machine for one full row or column. `pos`
// counts cells read so far (bounded 0-9, the row/column length); the
// circled cell's own value is captured when `pos` reaches its known,
// compile-time index (`targetIdx`), so no extra segmenting is needed.
// `tallest`/`visible` track the running scan (tallest building so far,
// count of buildings visible so far); `accept` checks the final visible
// count against the circled cell's own captured value.
function skyscraperSelfCount(name, cells, targetIdx) {
  const spec = NFA.encodeSpec({
    startState: { pos: 0, tallest: 0, visible: 0, target: null },
    transition: ({ pos, tallest, visible, target }, value) => {
      const isTaller = value > tallest;
      return {
        pos: pos + 1,
        tallest: isTaller ? value : tallest,
        visible: visible + (isTaller ? 1 : 0),
        target: pos === targetIdx ? value : target,
      };
    },
    accept: ({ visible, target }) => visible === target,
    maxDepth: 9,
  }, 9);
  return new NFA(spec, name, cells);
}

const skyscraperConstraints = circledCells.flatMap(cell => {
  const rowCells = graph.row(cell);
  const colCells = graph.column(cell);
  return [
    skyscraperSelfCount(`row-${cell}`, rowCells, rowCells.indexOf(cell)),
    skyscraperSelfCount(`col-${cell}`, colCells, colCells.indexOf(cell)),
  ];
});

return [
  new Shape('9x9'),
  new Given('R4C7', 5),
  new Given('R7C6', 5),
  ...betweenLines.map(cells => new Between(...cells)),
  ...skyscraperConstraints,
  new GreaterThan('R9C6', 'R9C5'),
];
