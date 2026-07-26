// Title: Parity Fish
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=JdHSSNKuIzU
// Source: https://sudokupad.app/o0n73yxg22

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, default).
// Two cells adjacent along a red line must contain one even digit and one
// odd digit: no native class exists for this relation, so it is a custom
// Pair over each drawn stroke.
// White dots (WhiteDot) are consecutive-digit pairs; black dots (BlackDot)
// are 2:1-ratio pairs. Both are read from the overlays' backgroundColor /
// borderColor (white fill/black border vs. black fill/white border), not
// from the mark's own `color` field.

// The red line is drawn as three strokes forming a fish outline plus two
// crossing fins; each stroke is one continuous cell sequence (the outline
// takes two diagonal steps at the fish's tail point). The parity relation
// applies between every pair of cells consecutive along a stroke.
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);

const fishOutline = [
  'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6',
  'R4C7', 'R5C8', 'R6C7',
  'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2',
];
const fin1 = ['R3C4', 'R4C4', 'R5C3', 'R6C2', 'R6C1'];
const fin2 = ['R7C4', 'R6C4', 'R5C3', 'R4C2', 'R4C1'];

const parityLines = [fishOutline, fin1, fin2].map(
  cells => new Pair(parityKey, 'Parity line', ...cells));

// White dots: consecutive digits. One entry per drawn dot (overlays with
// white backgroundColor / black borderColor).
const whiteDotEdges = [
  ['R4C8', 'R4C9'], ['R5C8', 'R5C9'], ['R6C8', 'R6C9'], ['R5C1', 'R5C2'],
  ['R8C3', 'R9C3'], ['R7C1', 'R8C1'], ['R1C1', 'R2C1'], ['R7C7', 'R7C8'],
  ['R7C1', 'R7C2'], ['R9C8', 'R9C9'], ['R8C5', 'R8C6'], ['R1C4', 'R2C4'],
  ['R7C6', 'R8C6'], ['R2C7', 'R3C7'], ['R1C2', 'R1C3'], ['R1C5', 'R2C5'],
];
const whiteDots = whiteDotEdges.map(([a, b]) => new WhiteDot(a, b));

// Black dots: one digit is double the other. One entry per drawn dot
// (overlays with black backgroundColor / white borderColor).
const blackDotEdges = [
  ['R3C2', 'R4C2'], ['R4C7', 'R4C8'], ['R2C3', 'R3C3'],
  ['R9C2', 'R9C3'], ['R8C8', 'R9C8'],
];
const blackDots = blackDotEdges.map(([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),
  ...parityLines,
  ...whiteDots,
  ...blackDots,
];
