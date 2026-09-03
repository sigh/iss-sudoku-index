// Title: (+10)-Yang
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=47tQAsDhC9g
// Source: https://sudokupad.app/3cm1bpm2jv

// Rules encoded below:
//   Normal sudoku - digits 1-9, no repeat in a row, column or box (the ISS
//     baseline). There are no given digits.
//   Yin-Yang - every cell is shaded or unshaded; the shaded cells are
//     orthogonally connected, the unshaded cells are orthogonally connected,
//     and no 2x2 region is entirely one shade.
//   A shaded cell containing digit x has value x+10; an unshaded cell has
//     value equal to its digit.
//   Region sum lines - box borders divide each blue line into segments; all
//     segments of one line have the same sum of values.
//   Black dots - of the two values joined by a dot, one is double the other.
//     "Not all dots are necessarily given", so undotted pairs are unrestricted
//     and no negative dot rule is added.
// The fog is solving UI: it hides clues until digits are placed, and restricts
// no cell of the finished grid, so it is not encoded.

// YinYang shades the grid with the two lowest values on its own YY layer: here
// YY == 1 means shaded and YY == 2 means unshaded. The layer treats its two
// values symmetrically (each connected, neither in a monochrome 2x2), so every
// shading is still reachable under that naming; it fixes which YY assignment
// represents a given shading rather than which shadings are allowed.
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// value(cell) = digit + 10 when shaded (YY 1), digit when unshaded (YY 2)
//             = digit + 10 * (2 - shadeCell)
//             = digit - 10 * shadeCell + 20.
// Both clue rules are linear in the values, so each is one coefficient Sum over
// the digit cells and their YY cells, with the per-cell constant 20 collected
// into the Sum's total. Values reach 19, past the 16-value cap, so they cannot
// be held in a Var layer of their own.
const valueTerms = (cells, sign) => [
  ...cells.map(cell => [cell, sign]),
  ...shade.at(cells).map(cell => [cell, -10 * sign]),
];

// sum(values of a) == sum(values of b), after moving 20 per cell to the total.
const equalValueSum = (a, b) => new Sum(
  20 * (b.length - a.length), ...valueTerms(a, 1), ...valueTerms(b, -1));

// value(a) == 2 * value(b), i.e. digit_a - 10*shade_a - 2*digit_b + 20*shade_b
// == 2*20 - 20 == 20.
const doubleValue = (a, b) => new Sum(
  20, [a, 1], [shade.at(a), -10], [b, -2], [shade.at(b), 20]);

// Blue line paths, in the order each stroke was drawn.
const lines = [
  ['R5C6', 'R5C5', 'R5C4', 'R4C4', 'R3C4', 'R3C5', 'R4C5'],
  ['R7C3', 'R6C3', 'R5C3', 'R4C3'],
  ['R3C3', 'R2C3', 'R1C3', 'R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1'],
  ['R3C7', 'R4C7', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8'],
  ['R1C5', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'],
  ['R8C2', 'R8C3', 'R8C4'],
];

// Black dot edges, as the two cells each mark sits between.
const dots = [
  ['R3C4', 'R3C5'],
  ['R4C4', 'R4C5'],
  ['R4C6', 'R5C6'],
  ['R4C7', 'R5C7'],
  ['R5C3', 'R6C3'],
  ['R5C4', 'R6C4'],
  ['R6C5', 'R6C6'],
  ['R7C5', 'R7C6'],
];

const boxOf = new Map(
  graph.boxes().flatMap((box, i) => box.map(cell => [cell, i])));

// A line's segments are the maximal runs of the drawn walk that stay in one
// box. Splitting by walk order rather than by box means a line that leaves a
// box and comes back gives that box two separate segments (line 1 does).
const segmentsOf = (cells) => cells.reduce((segments, cell, i) => {
  if (i > 0 && boxOf.get(cells[i - 1]) === boxOf.get(cell)) {
    segments[segments.length - 1].push(cell);
  } else {
    segments.push([cell]);
  }
  return segments;
}, []);

const regionSumLines = lines.flatMap(line => {
  const [first, ...rest] = segmentsOf(line);
  return rest.map(segment => equalValueSum(first, segment));
});

// Which of the pair is the doubled value is not drawn, so both orders.
const blackDots = dots.map(
  ([a, b]) => new Or([doubleValue(a, b), doubleValue(b, a)]));

return [
  new Shape('9x9'),
  new YinYang(),
  ...regionSumLines,
  ...blackDots,
];
