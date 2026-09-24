// Title: Casino Royale
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=vU3e-R48JJY
// Source: https://sudokupad.app/w51sf3oxio?setting-nogrid

// Rules:
// - Normal sudoku rules apply to the 9x9 grid (rows 1-9).
// - Index line: nine digits are placed on the line in row 10 (position Y is
//   column Y; position 1 is the far-left diamond). A digit X in position Y
//   requires a digit Y in position X.
// - Skyscraper clues: the line digit in column C equals how many digits in
//   column C (rows 1-9) are larger than all digits lower down in the column,
//   i.e. the skyscraper count seen from below the grid.
// - Even: the grey area sums to an even total.
//
// The line row is not part of any sudoku row, column or box, so the board is a
// Raw 10x9 grid with the 9x9 houses stated explicitly.

const shape = new Shape('10x9', 9, 'Raw');
const graph = cellGraph(shape);

const rows = graph.rows().slice(0, 9);
const columns = graph.columns().map(col => col.slice(0, 9));
const boxes = [];
for (const r of [1, 4, 7]) {
  for (const c of [1, 4, 7]) boxes.push(graph.block(makeCellId(r, c), 3, 3));
}
const houses = [...rows, ...columns, ...boxes].map(cells => new AllDifferent(...cells));

const line = graph.rows()[9];  // R10C1..R10C9, position Y = column Y

// Index line, as one Pair per pair of positions (i, j): line[i] === j holds
// exactly when line[j] === i.
const index = [];
for (let i = 1; i <= 9; i++) {
  for (let j = i + 1; j <= 9; j++) {
    const key = Pair.fnToKey((a, b) => (a === j) === (b === i), 9);
    index.push(new Pair(key, `Index ${i}-${j}`, line[i - 1], line[j - 1]));
  }
}

// Skyscraper NFA per column: the first segment is the line cell (the clue),
// the second is the column read from R9 up to R1. State: clue, tallest digit
// seen so far, and the count of digits that exceeded every digit below them
// (clamped at clue + 1, meaning "too many").
const skyscraperSpec = NFA.encodeSpec({
  startState: { clue: 0, max: 0, count: 0 },
  transition: ({ clue, max, count }, value) => {
    if (value === SEGMENT_BREAK) return { clue, max, count };
    if (clue === 0) return { clue: value, max: 0, count: 0 };
    if (value <= max) return { clue, max, count };
    return { clue, max: value, count: Math.min(count + 1, clue + 1) };
  },
  accept: ({ clue, count }) => clue !== 0 && count === clue,
}, 9, { multiSegment: true });
const skyscrapers = [];
for (let c = 1; c <= 9; c++) {
  const upward = columns[c - 1].slice().reverse();
  skyscrapers.push(new NFA(skyscraperSpec, `Skyscraper C${c}`, [line[c - 1]], upward));
}

// Grey area (the two grey underlay rectangles): R1-R2 C3-C5 and R3-R9 C2-C7.
const grey = [
  ...graph.block(makeCellId(1, 3), 2, 3),
  ...graph.block(makeCellId(3, 2), 7, 6),
];
// State is the parity of the running total.
const evenSpec = NFA.encodeSpec({
  startState: 0,
  transition: (parity, value) => (parity + value) % 2,
  accept: parity => parity === 0,
}, 9);
const even = new NFA(evenSpec, 'Grey area even', grey);

return [shape, ...houses, ...index, ...skyscrapers, even];
