// Title: The Greatest Line
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=0Z8XXgfiVB4
// Source: https://sudokupad.app/8ui7lv2d7j

// Normal sudoku rules apply.
//
// On each line, there is exactly one cell whose value is greater than the
// sum of any other two cells on that line.
//
// Reduction used for the encoding: let m1 >= m2 >= m3 be the three largest
// values among a line's cells (with repeats). A cell v satisfies "greater
// than the sum of any other two cells" exactly when v > m2' + m3', where
// m2'/m3' are the two largest values excluding v -- i.e. v is the unique
// maximum (m1) and m1 > m2 + m3. (If two cells tied for the max, the
// larger-of-the-other-two test fails for both, since each would need to
// exceed the other's own value plus a positive third value.) So "exactly
// one" collapses to "m1 > m2 + m3": that alone forces m1 to be the strict,
// unique maximum, because m3 >= 1 makes m1 > m2 automatic once m1 > m2 + m3
// holds, and two cells can never simultaneously satisfy the property (each
// would have to exceed the other, which is a contradiction).
//
// Encoded as an NFA per line: scan the line, keep the running top three
// values (a bounded, saturating reduction -- state stays a sorted triple,
// never grows), and accept when the largest exceeds the sum of the other
// two.

function insertTop3({ m1, m2, m3 }, v) {
  const sorted = [m1, m2, m3, v].sort((a, b) => b - a);
  return { m1: sorted[0], m2: sorted[1], m3: sorted[2] };
}

const greatestLineSpec = NFA.encodeSpec({
  startState: { m1: 0, m2: 0, m3: 0 },
  transition: (state, value) => insertTop3(state, value),
  accept: ({ m1, m2, m3 }) => m1 > m2 + m3,
}, 9);

function greatestLine(...cells) {
  return new NFA(greatestLineSpec, 'greatest line', ...cells);
}

// Drawn lines (row-major cell paths), converted from the puzzle's waypoints.
const lines = [
  ['R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C5', 'R3C5'],
  ['R2C2', 'R3C2', 'R4C2', 'R5C2'],
  ['R3C4', 'R4C4', 'R4C5', 'R4C6'],
  ['R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R6C6', 'R7C6', 'R7C5'],
  ['R6C4', 'R6C3', 'R7C3', 'R8C3', 'R8C2'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R8C7', 'R9C7', 'R9C8'],
  ['R7C9', 'R6C9', 'R5C9', 'R4C9'],
  ['R2C9', 'R2C8', 'R1C8'],
];

return [
  new Shape('9x9'),
  ...lines.map(cells => greatestLine(...cells)),
];
