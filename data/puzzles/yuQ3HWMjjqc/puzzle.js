// Title: Below Lines
// Author: jubale
// Video: https://www.youtube.com/watch?v=yuQ3HWMjjqc
// Source: https://app.crackingthecryptic.com/sudoku/NBghbpFnrM

// Normal Sudoku rules apply. Opposite circled ends on every purple line match;
// the nine line digits differ; each non-circled line cell is no greater than its
// line's circled digit. The coordinate lists transcribe the drawn purple paths.
const lines = [
  ['R3C3', 'R2C4', 'R1C5', 'R2C6', 'R2C7', 'R2C8', 'R1C7'],
  ['R3C7', 'R4C8', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C8', 'R8C8', 'R9C7', 'R8C7', 'R9C6'],
  ['R5C8', 'R6C8', 'R7C8', 'R7C7'],
  ['R6C1', 'R7C1', 'R8C2', 'R9C2', 'R9C3', 'R9C4', 'R8C4', 'R7C5'],
  ['R5C7', 'R6C6', 'R7C6', 'R8C5'],
  ['R5C5', 'R6C5', 'R6C4', 'R7C4', 'R8C3', 'R7C2', 'R6C2', 'R5C1', 'R4C2'],
  ['R5C3', 'R4C4', 'R3C5'],
  ['R2C5', 'R3C6', 'R4C5', 'R4C6', 'R4C7'],
  ['R2C1', 'R3C2', 'R4C3', 'R5C2', 'R6C3', 'R7C3'],
];
const atMostEnd = Pair.fnToKey((end, cell) => cell <= end, 9);

return [
  new Shape('9x9'),
  ...lines.map(line => new SameValues(2, line[0], line.at(-1))),
  new AllDifferent(...lines.map(line => line[0])),
  // Pairing each internal line cell with its end digit expresses the inclusive bound.
  ...lines.flatMap(line => line.slice(1, -1).map(cell => new Pair(
    atMostEnd, 'line cell <= circled end', line[0], cell,
  ))),
];
