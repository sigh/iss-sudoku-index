// Title: Feb. 8, 2023: Either/Or Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=lL6tZXFIJxY
// Source: https://tinyurl.com/ym6ntucw

// Normal sudoku rules apply. 32 white circles, each on the edge between two
// orthogonally adjacent cells and printed with a digit. The rules state that
// digit "must appear in one of the two adjacent cells" -- an either/or
// membership test, not a sum/ratio/consecutive relation -- so each circle is
// a Pair over its two cells with a value-specific predicate. Circle cell
// pairs and values transcribed from the drawn circle geometry.
const circles = [
  ['R1C1', 'R1C2', 1], ['R1C2', 'R2C2', 2], ['R1C1', 'R2C1', 5], ['R2C1', 'R2C2', 3],
  ['R1C8', 'R1C9', 2], ['R1C9', 'R2C9', 3], ['R1C8', 'R2C8', 6], ['R2C8', 'R2C9', 4],
  ['R8C8', 'R8C9', 1], ['R8C9', 'R9C9', 7], ['R8C8', 'R9C8', 4], ['R9C8', 'R9C9', 3],
  ['R8C1', 'R8C2', 8], ['R8C2', 'R9C2', 4], ['R8C1', 'R9C1', 2], ['R9C1', 'R9C2', 1],
  ['R4C3', 'R5C3', 5], ['R6C3', 'R5C3', 2], ['R5C4', 'R5C3', 3], ['R5C2', 'R5C3', 7],
  ['R7C4', 'R7C5', 7], ['R7C5', 'R7C6', 1], ['R7C5', 'R6C5', 6], ['R7C5', 'R8C5', 9],
  ['R5C7', 'R6C7', 6], ['R4C7', 'R5C7', 4], ['R5C7', 'R5C6', 1], ['R5C7', 'R5C8', 9],
  ['R3C6', 'R3C5', 8], ['R3C4', 'R3C5', 3], ['R4C5', 'R3C5', 5], ['R3C5', 'R2C5', 7],
];

// One shared Pair key per circle digit (1-9): a pair of cells satisfies the
// key iff at least one of them holds that digit.
const keyForValue = {};
for (let v = 1; v <= 9; v++) {
  keyForValue[v] = Pair.fnToKey((a, b) => a === v || b === v, 9);
}

return [
  new Shape('9x9'),
  ...circles.map(([a, b, v]) =>
    new Pair(keyForValue[v], `Circle ${v}`, a, b)),
];
