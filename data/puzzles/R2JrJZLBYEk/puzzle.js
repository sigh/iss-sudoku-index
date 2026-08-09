// Title: Sum Line Sudoku #1
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=R2JrJZLBYEk
// Source: https://app.crackingthecryptic.com/sudoku/GJ9PTHm8N7

// Normal sudoku rules, plus a sum-line rule: for every triple of adjacent
// digits on a line, one of the three digits is the sum of the other two.
// Digits may repeat on a line. "cell X equals the sum of the other two" is
// the same as "the 1-cell segment {X} sums to the same total as the 2-cell
// segment of the other two", so each triple is a disjunction of three
// EqualSum readings, one per choice of which cell holds the sum.
const sumTriple = (a, b, c) => new Or([
  new EqualSum([a], [b, c]),
  new EqualSum([b], [a, c]),
  new EqualSum([c], [a, b]),
]);

// A line drawn in the shape of a Y is three 3-cell lines that share their
// centre cell: each pair of arms together with the centre forms one triple
// (rules text example: R2C2-R3C2-R4C1, R2C2-R3C2-R4C3, R4C1-R3C2-R4C3).
// Transcribed from the four branching stroke pairs in the source geometry.
const yTriples = (center, arms) => [
  sumTriple(arms[0], center, arms[1]),
  sumTriple(arms[0], center, arms[2]),
  sumTriple(arms[1], center, arms[2]),
];

const branches = [
  ['R3C2', ['R2C2', 'R4C1', 'R4C3']],
  ['R3C8', ['R2C8', 'R4C7', 'R4C9']],
  ['R6C2', ['R5C2', 'R7C1', 'R7C3']],
  ['R7C8', ['R6C7', 'R8C8', 'R6C9']],
];

// Plain (non-branching) sum lines, transcribed from the remaining strokes.
// Each is expanded into one triple per sliding window of 3 consecutive cells.
const plainLines = [
  ['R4C4', 'R4C5', 'R3C5'],
  ['R7C7', 'R8C6', 'R9C6'],
  ['R8C4', 'R9C4', 'R9C5'],
  ['R7C6', 'R7C5', 'R6C6', 'R5C7'],
  ['R6C4', 'R5C4', 'R5C5', 'R6C5'],
  ['R1C6', 'R1C7', 'R2C7'],
  ['R8C1', 'R8C2', 'R9C2'],
];

const plainTriples = plainLines.flatMap(
  cells => cells.slice(0, -2).map(
    (_, i) => sumTriple(cells[i], cells[i + 1], cells[i + 2])));

return [
  new Shape('9x9'),
  ...branches.flatMap(([center, arms]) => yTriples(center, arms)),
  ...plainTriples,
];
