// Title: Three's a Crowd
// Author: Dani Dracogal
// Video: https://www.youtube.com/watch?v=d8IWVqeIIRc
// Source: https://sudokupad.app/z76xzeafm1

// Normal sudoku rules apply. Digits separated by an X sum to 10; digits
// separated by a V sum to 5. Digits separated by a black dot are in a 1:2
// ratio; digits separated by a white dot are consecutive. Only the drawn
// dots/X/V marks are clued -- an unmarked orthogonal pair carries no
// XV/Kropki relation of its own.
//
// "3 may not orthogonally touch a consecutive digit, nor a digit with which
// it is in a 1:2 ratio" is a blanket rule about the digit 3, not a chaperone
// exception on the drawn dots (contrast puzzles where a dot *permits* an
// otherwise-forbidden pair): for every orthogonally adjacent cell pair in the
// grid, a cell holding 3 forbids its neighbour from holding 2 or 4
// (consecutive) or 6 (3's only in-range 1:2 ratio partner), whether or not
// that edge carries a drawn dot.

const graph = cellGraph('9x9');

// -- Kropki dots, transcribed from raw payload `difference`/`ratio` --------
const whiteDotEdges = [
  ['R2C2', 'R2C3'],
];
const blackDotEdges = [
  ['R8C5', 'R8C6'], ['R7C6', 'R8C6'], ['R9C7', 'R9C8'], ['R7C2', 'R7C3'],
  ['R5C3', 'R6C3'], ['R5C8', 'R6C8'], ['R2C5', 'R3C5'], ['R2C1', 'R3C1'],
  ['R1C2', 'R2C2'],
];

// -- XV marks, transcribed from raw payload `xv` ----------------------------
const xEdges = [
  ['R1C2', 'R1C3'], ['R2C1', 'R2C2'], ['R1C4', 'R1C5'], ['R2C4', 'R2C5'],
  ['R3C5', 'R3C6'], ['R3C5', 'R4C5'], ['R3C7', 'R4C7'], ['R4C6', 'R4C7'],
  ['R7C5', 'R7C6'], ['R8C8', 'R9C8'], ['R8C1', 'R9C1'],
];
const vEdges = [
  ['R9C8', 'R9C9'],
];

// -- Givens, transcribed from raw payload `grid` ----------------------------
const givens = [
  new Given('R1C6', 3),
  new Given('R6C7', 3),
  new Given('R8C4', 3),
];

// -- Magic Number 3: no 3 next to 2, 4, or 6 --------------------------------
// A single translated relation stamped across every orthogonal edge in the
// grid, so it is built once as a Pair template and stamped onto every valid
// origin with Replicate (one Replicate per direction) rather than one Pair
// per edge.
const noThreeNextToTwoFourSix = Pair.fnToKey(
  (a, b) => !((a === 3 && (b === 2 || b === 4 || b === 6)) ||
    (b === 3 && (a === 2 || a === 4 || a === 6))),
  9);
const rightOrigins = graph.cells().filter(cell => graph.step(cell, 0, 1) !== null);
const downOrigins = graph.cells().filter(cell => graph.step(cell, 1, 0) !== null);
const noThreeTouch = [
  graph.makeReplicate(
    new Pair(noThreeNextToTwoFourSix, 'no 3 next to 2/4/6', 'R1C1', 'R1C2'),
    rightOrigins,
  ),
  graph.makeReplicate(
    new Pair(noThreeNextToTwoFourSix, 'no 3 next to 2/4/6', 'R1C1', 'R2C1'),
    downOrigins,
  ),
];

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDotEdges.map(cells => new WhiteDot(...cells)),
  ...blackDotEdges.map(cells => new BlackDot(...cells)),
  ...xEdges.map(cells => new X(...cells)),
  ...vEdges.map(cells => new V(...cells)),
  ...noThreeTouch,
];
