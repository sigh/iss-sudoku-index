// Title: spaghetti & meatballs
// Author: MOORESUDOKU90
// Video: https://www.youtube.com/watch?v=VSxRlTqUUaM
// Source: https://sudokupad.app/00r3q84657
//
// Normal sudoku. Ten orange lines (Whisper(2) + AllDifferent per line, since
// digits differ by >= 2 between neighbours but need not be consecutive).
// Twenty-seven circled cells: CountingCircles encodes "a digit N in a circle
// appears N times across all circles" directly (that is its documented
// semantics). A knight's-move Pair forbids equal digits between any two
// circled cells a knight's move apart. The rule ties the circle-cell sum to
// the line-cell sum; the two cell sets are disjoint (checked against the
// drawn geometry), so a coefficient Sum states that equality without double
// counting any cell.

const lines = [
  ['R1C3', 'R1C4', 'R1C5', 'R2C5', 'R2C4', 'R3C5', 'R4C5'],
  ['R2C2', 'R2C1', 'R3C2', 'R3C1', 'R4C1', 'R4C2'],
  ['R5C1', 'R6C1', 'R7C2', 'R7C1'],
  ['R8C2', 'R8C3', 'R7C3'],
  ['R5C4', 'R4C4', 'R4C3', 'R5C3', 'R6C4', 'R6C5'],
  ['R7C6', 'R7C5', 'R8C6', 'R9C6', 'R9C5', 'R9C4'],
  ['R8C7', 'R8C8', 'R9C8'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R5C8', 'R4C9'],
  ['R6C7', 'R5C7', 'R4C6', 'R4C7', 'R3C7', 'R3C6'],
  ['R3C8', 'R2C9', 'R2C8', 'R1C7', 'R1C8'],
];

const circles = [
  'R1C1', 'R1C2', 'R1C6', 'R1C9', 'R2C3', 'R2C6', 'R2C7', 'R3C3', 'R3C4',
  'R3C9', 'R4C8', 'R5C2', 'R5C5', 'R6C2', 'R6C3', 'R6C6', 'R6C8', 'R7C4',
  'R7C7', 'R7C8', 'R8C1', 'R8C4', 'R8C5', 'R9C1', 'R9C2', 'R9C3', 'R9C7',
];

// Knight's-move pairs among the circled cells only, derived from the circle
// coordinate list above (not hand-enumerated from the grid).
const knightPairs = [];
for (let i = 0; i < circles.length; i++) {
  const [ra, ca] = [+circles[i][1], +circles[i][3]];
  for (let j = i + 1; j < circles.length; j++) {
    const [rb, cb] = [+circles[j][1], +circles[j][3]];
    const dr = Math.abs(ra - rb);
    const dc = Math.abs(ca - cb);
    if ((dr === 1 && dc === 2) || (dr === 2 && dc === 1)) {
      knightPairs.push([circles[i], circles[j]]);
    }
  }
}

return [
  new Shape('9x9'),

  // Lines: adjacent cells differ by >= 2, and no digit repeats anywhere on
  // the line (not only among neighbours).
  ...lines.flatMap((cells, i) => [
    new Whisper(2, ...cells),
    new AllDifferent(...cells),
  ]),

  // Circles: CountingCircles' documented semantics is exactly "the value in
  // a circle counts the number of circles with the same value" -- the rule
  // as stated.
  new CountingCircles(...circles),

  // No two circled cells a knight's move apart may hold the same digit
  // (a two-cell AllDifferent per knight-adjacent pair).
  ...knightPairs.map(([a, b]) => new AllDifferent(a, b)),

  // Sum of all circled digits equals sum of all digits on lines. The two
  // cell sets are disjoint (checked against the drawn geometry), so this is
  // an equal-sum relation over the two segments.
  new EqualSum(circles, lines.flatMap(cells => cells)),
];
