// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=JWgsqLKptho
// Source: https://cracking-the-cryptic.web.app/sudoku/drm8J7hr62

// The source carries no rules text at all -- no title, no author, no rules, no
// givens. Everything encoded below is read off the drawn board.
//
// Rules encoded here:
//   * The board is a 9x9 crossword grid. 22 squares are painted black and hold
//     no digit; each of the other 59 squares holds a digit 1-9.
//   * The black squares cut every row into "across" entries and every column
//     into "down" entries. An entry is a maximal run of white squares, read
//     left-to-right along a row and top-to-bottom down a column, and is one
//     multi-digit number; a run one square long is a one-digit entry.
//   * The number printed to the left of a row is the total of that row's
//     across entries. The number printed above a column is the total of that
//     column's down entries.
//
// Omitted: any digit-uniqueness ("sudoku") layer -- no digit repeats in a row,
// a column or a 3x3 box. The board is drawn on a 9x9 sudoku app and the video
// calls the puzzle a maths/sudoku/crossword hybrid, but the source states no
// rule, and the drawn art distinguishes none of "no uniqueness at all",
// "rows and columns only", and "rows, columns and boxes". Adding one would
// tighten the encoding past anything the source says, so all three are left
// out and the grid is built on the `Raw` grid type, which has no implicit
// row/column/box rules of its own.

// Black squares, transcribed from the 22 black 1x1 shapes drawn on the board.
const BLACK = [
  'R1C3', 'R1C5', 'R1C7',
  'R2C2', 'R2C9',
  'R3C4', 'R3C6', 'R3C8',
  'R4C1', 'R4C5',
  'R5C3', 'R5C7',
  'R6C5', 'R6C9',
  'R7C2', 'R7C4', 'R7C6',
  'R8C1', 'R8C8',
  'R9C3', 'R9C5', 'R9C7',
];

// The 18 numbers printed outside the board: nine to the left of rows R1..R9,
// nine above columns C1..C9, in board order. Two of the row numbers are
// printed with a leading '#' ("#325856" beside R2, "#978128" beside R8); they
// are read as the decimal numbers 325856 and 978128, the same as the other
// sixteen.
const ACROSS_TOTALS = [111, 325856, 146, 10168, 707, 6992, 277, 978128, 174];
const DOWN_TOTALS = [844, 2467, 561, 857, 144, 1033, 1221, 2891, 1376];

// A `Raw` 9x9 with values 0-9: 0 is the "no digit" value the black squares
// take, 1-9 the digits a white square may hold.
const shape = new Shape('9x9', '0-9', 'Raw');
const graph = cellGraph(shape);
const black = new Set(BLACK);

const cells = graph.cells();
const squares = [
  graph.makeReplicate(
    new Given(cells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9),
    cells.filter(cell => !black.has(cell))),
  graph.makeReplicate(new Given(cells[0], 0), BLACK),
];

// The maximal runs of white squares along one row or column, in reading order.
const entriesOf = (line) => {
  const runs = [];
  let run = [];
  for (const cell of line) {
    if (black.has(cell)) {
      if (run.length) runs.push(run);
      run = [];
    } else {
      run.push(cell);
    }
  }
  if (run.length) runs.push(run);
  return runs;
};

// The lanes carrying a printed total: the nine rows then the nine columns.
const lanes = [
  ...graph.rows().map((line, i) => ({ line, total: ACROSS_TOTALS[i] })),
  ...graph.columns().map((line, i) => ({ line, total: DOWN_TOTALS[i] })),
];

// A lane whose longest entry is over three squares is written as long addition
// (see below), which needs one carry digit between each pair of adjacent
// decimal columns. Each carry is forced by the equations it appears in, so none
// is left free.
const carryCount = (lane) =>
  Math.max(...entriesOf(lane.line).map(entry => entry.length)) <= 3
    ? 0 : String(lane.total).length - 1;
const carryVar = new Var(
  'K', 'carry', lanes.reduce((n, lane) => n + carryCount(lane), 0));
let carriesUsed = 0;
const nextCarry = () => carryVar.cell(++carriesUsed);

// One lane's clue: the lane's entries, as numbers, total `clueTotal`.
//
// Where every entry is at most three squares long the equation is one `Sum`
// with the place-value coefficients (100, 10, 1) written out directly. ISS
// caps `Sum` coefficients at 100, so a four- or six-square entry cannot be
// weighted that way; those lanes get the identical equation written as school
// long addition instead -- one `Sum` per decimal column p, reading
//
//   (digits in column p) + carry in = (digit p of the total) + 10 * carry out
//
// with no carry into the units column and none out of the top column, which is
// what makes the columns telescope back to the plain total.
const laneConstraints = (line, clueTotal) => {
  const entries = entriesOf(line);
  const longest = Math.max(...entries.map(entry => entry.length));
  if (longest <= 3) {
    return [new Sum(clueTotal, ...entries.flatMap(
      entry => entry.map((cell, i) => [cell, 10 ** (entry.length - 1 - i)])))];
  }
  const columns = String(clueTotal).length;
  let carryIn = null;
  return Array.from({ length: columns }, (_, p) => {
    const digits = entries
      .filter(entry => entry.length > p)
      .map(entry => [entry[entry.length - 1 - p], 1]);
    const carryOut = p === columns - 1 ? null : nextCarry();
    const terms = [...digits];
    if (carryIn) terms.push([carryIn, 1]);
    if (carryOut) terms.push([carryOut, -10]);
    carryIn = carryOut;
    const digitOfTotal = Math.floor(clueTotal / 10 ** p) % 10;
    // The top column has no carry out, so its terms are a plain sum.
    return terms.every(([, coeff]) => coeff === 1)
      ? new Sum(digitOfTotal, ...terms.map(([cell]) => cell))
      : new Sum(digitOfTotal, ...terms);
  });
};

const totals = lanes.flatMap(lane => laneConstraints(lane.line, lane.total));

return [
  shape,
  carryVar,
  ...squares,
  ...totals,
];
