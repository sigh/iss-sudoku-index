// Title: X-Sandwiches
// Author: Sir Algee
// Video: https://www.youtube.com/watch?v=EhW2Kyn85WI
// Source: https://sudokupad.app/jhwz7m5dbe

// Standard sudoku (9x9, default rows/cols/boxes) plus anti-knight.
// Left-margin numbers are sandwich sums (sum of the digits strictly between
// the 1 and the 9 in that row). Right-margin numbers are X-sums read from
// the right edge inward: N is the row's rightmost digit (C9), and the clue
// is the sum of the first N cells counting from C9 toward C1, C9 included.
// Only 3 of the 9 rows carry a clue on each side; the rest are unconstrained
// by that clue type. Black dots mark every adjacent cell pair in the grid
// with a 1:2 ratio -- since "all possible dots are given", every undotted
// adjacent pair must NOT hold that ratio (a custom Pair supplies that
// negative closure; StrictKropki is not used because it also forbids
// consecutive pairs, which this puzzle's rules never mention -- no white
// dots are drawn anywhere in the payload).

const graph = cellGraph(9);

return [
  new Shape('9x9'),
  new AntiKnight(),

  // Sandwich sums (left margin), by row.
  Sandwich.fromCells(10, graph.row(1), GEOMETRY_9x9),
  Sandwich.fromCells(8, graph.row(5), GEOMETRY_9x9),
  Sandwich.fromCells(10, graph.row(9), GEOMETRY_9x9),

  // X-sums (right margin), by row -- cell order reversed (C9 first) so
  // fromCells resolves to the right-reading (",-1") arrowId.
  XSum.fromCells(10, graph.row(1).slice().reverse(), GEOMETRY_9x9),
  XSum.fromCells(8, graph.row(5).slice().reverse(), GEOMETRY_9x9),
  XSum.fromCells(10, graph.row(9).slice().reverse(), GEOMETRY_9x9),

  // 1:2 Kropki black dots -- from the payload's edge-sized filled-circle
  // overlays (rounded, white-on-black, no text).
  new BlackDot('R2C2', 'R3C2'),
  new BlackDot('R2C6', 'R3C6'),
  new BlackDot('R5C8', 'R6C8'),
  new BlackDot('R6C1', 'R7C1'),
  new BlackDot('R7C1', 'R7C2'),
  new BlackDot('R7C1', 'R8C1'),
  new BlackDot('R7C8', 'R8C8'),

  // "All possible black dots are given" -- every orthogonally adjacent pair
  // not listed above must NOT satisfy the 1:2 ratio. Two shifted templates
  // (rightward pair, downward pair) cover every undotted edge; Replicate
  // tiles each template over its start cells instead of repeating 130 near-
  // identical Pair constraints.
  ...(() => {
    const dotted = new Set([
      'R2C2,R3C2', 'R2C6,R3C6', 'R5C8,R6C8', 'R6C1,R7C1',
      'R7C1,R7C2', 'R7C1,R8C1', 'R7C8,R8C8',
    ]);
    const sortedKey = (a, b) => [a, b].sort().join(',');
    const notDoubleKey = Pair.fnToKey((x, y) => x !== y * 2 && y !== x * 2, 9);

    const rightStarts = [];
    const downStarts = [];
    for (let r = 1; r <= 9; r++) {
      for (let c = 1; c <= 9; c++) {
        const here = makeCellId(r, c);
        if (c < 9 && !dotted.has(sortedKey(here, makeCellId(r, c + 1)))) {
          rightStarts.push(here);
        }
        if (r < 9 && !dotted.has(sortedKey(here, makeCellId(r + 1, c)))) {
          downStarts.push(here);
        }
      }
    }

    return [
      graph.makeReplicate(
        new Pair(notDoubleKey, 'no-1:2-outside-dots', 'R1C1', 'R1C2'),
        rightStarts),
      graph.makeReplicate(
        new Pair(notDoubleKey, 'no-1:2-outside-dots', 'R1C1', 'R2C1'),
        downStarts),
    ];
  })(),
];
