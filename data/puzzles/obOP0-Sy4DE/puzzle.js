// Title: Alternating Stripes Sudoku
// Author: Sudoku Grand Prix: Croatia
// Video: https://www.youtube.com/watch?v=obOP0-Sy4DE
// Source: https://sudokupad.app/y51haclcjs

// Normal sudoku rules apply. Along each orange or grey stripe, digits must
// alternate larger/smaller than their immediate neighbours (each interior
// cell is a strict local peak or valley) and may not repeat anywhere on the
// stripe. Both colours share this one rule -- the rules text draws no
// distinction between them.

const givens = [
  ['R1C2', 6], ['R1C3', 3], ['R1C7', 1], ['R1C8', 8],
  ['R3C1', 5], ['R3C9', 9],
  ['R4C5', 1],
  ['R5C1', 7], ['R5C4', 5], ['R5C6', 8], ['R5C9', 3],
  ['R6C2', 4], ['R6C5', 9], ['R6C8', 5],
  ['R7C1', 2], ['R7C5', 4], ['R7C9', 5],
  ['R8C1', 9], ['R8C9', 2],
  ['R9C2', 5], ['R9C3', 7], ['R9C7', 8], ['R9C8', 3],
];

// Stripe cell lists, transcribed from the drawn diagonal lines.
const orangeStripes = [
  ['R1C1', 'R2C2', 'R3C3', 'R4C4'],
  ['R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R4C9', 'R3C8', 'R2C7', 'R1C6'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
];
const greyStripes = [
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R4C3', 'R3C4', 'R2C5'],
  ['R6C7', 'R7C6', 'R8C5'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ['R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
];

// A stripe forbids repeats and requires each consecutive pair to alternate
// which one is larger. Which of the two cells starts out larger is not
// fixed by the rule, so the whole stripe follows one of exactly two global
// zigzag patterns (starting "up" or starting "down"); encode that choice as
// an Or of the two fully-determined patterns.
//
// The stripes run diagonally, so the built-in adjacent-pair line classes
// (GreaterThan, Thermo, ...) do not apply: they bind pairs found by grid
// (orthogonal) adjacency, which is empty for a diagonal stripe and silently
// enforces nothing. Pair instead binds each call's two cells directly by
// argument position, regardless of grid adjacency, so one Pair per edge with
// a ">" relation correctly expresses the diagonal comparison.
const GREATER = Pair.fnToKey((a, b) => a > b, 9);
function alternatingStripe(...cells) {
  const edges = [];
  for (let i = 0; i + 1 < cells.length; i++) edges.push([cells[i], cells[i + 1]]);

  const patternUp = edges.map(([a, b], i) =>
    i % 2 === 0
      ? new Pair(GREATER, 'alt', b, a)
      : new Pair(GREATER, 'alt', a, b));
  const patternDown = edges.map(([a, b], i) =>
    i % 2 === 0
      ? new Pair(GREATER, 'alt', a, b)
      : new Pair(GREATER, 'alt', b, a));

  return [
    new AllDifferent(...cells),
    new Or([new And(patternUp), new And(patternDown)]),
  ];
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...orangeStripes.flatMap(cells => alternatingStripe(...cells)),
  ...greyStripes.flatMap(cells => alternatingStripe(...cells)),
];
