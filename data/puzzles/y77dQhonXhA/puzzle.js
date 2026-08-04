// Title: Inclusion
// Author: apetersen
// Video: https://www.youtube.com/watch?v=y77dQhonXhA
// Source: https://app.crackingthecryptic.com/sudoku/hMtN6tTmT6

// Normal sudoku rules apply (rows, columns, boxes -- the default Shape
// groups). White dots join consecutive digits; black dots join digits with a
// 1:2 ratio (WhiteDot/BlackDot below bind by grid adjacency). "Digits cannot
// repeat in each letter shape": the payload's regions are exactly the 9
// standard boxes, so this is the default box grouping under a themed name --
// no separate constraint is added for it. Purple lines hold a consecutive
// set of digits, in any order (Renban). The orange line's digits alternately
// increase or decrease, reading the stroke edges in drawn order; the rules
// do not say which direction the first edge takes, so both starting
// parities are encoded as an Or.

const whiteDotPairs = [
  ['R1C4', 'R1C5'], ['R1C5', 'R1C6'], ['R2C5', 'R2C6'], ['R3C4', 'R3C5'],
  ['R4C8', 'R4C9'], ['R5C7', 'R5C8'], ['R6C7', 'R6C8'], ['R7C7', 'R7C8'],
  ['R7C8', 'R7C9'], ['R8C8', 'R8C9'], ['R9C7', 'R9C8'], ['R9C4', 'R9C5'],
  ['R8C5', 'R8C6'], ['R7C4', 'R7C5'], ['R6C1', 'R6C2'], ['R5C1', 'R5C2'],
  ['R4C1', 'R4C2'],
];

const blackDotPairs = [
  ['R2C1', 'R2C2'], ['R1C2', 'R1C3'], ['R4C4', 'R4C5'], ['R6C4', 'R6C5'],
  ['R6C5', 'R6C6'], ['R1C7', 'R1C8'], ['R1C8', 'R1C9'], ['R7C2', 'R7C3'],
  ['R8C1', 'R8C2'],
];

// Purple "consecutive set" lines. Each is drawn as a stem plus a small
// closed loop (one cell visited twice by the stroke); since the rule is
// order-independent only the distinct cell set is given here.
const purpleLines = [
  ['R3C4', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R5C5'],
  ['R7C9', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R5C7', 'R6C7'],
];

// Orange "alternately increase or decrease" line. Drawn as a stem plus a
// small closed loop like the purple lines, so R6C3 is visited twice and has
// three incident edges. Listed here as the 7 stroke edges in drawn order.
const orangeEdges = [
  ['R8C2', 'R8C3'], ['R8C3', 'R7C3'], ['R7C3', 'R6C3'], ['R6C3', 'R5C3'],
  ['R5C3', 'R5C2'], ['R5C2', 'R6C2'], ['R6C2', 'R6C3'],
];

// GreaterThan(x, y) requires x > y on grid-adjacent cells; every orange-line
// edge is grid-adjacent, so an "increase" edge (later > earlier) is
// GreaterThan(later, earlier), and a "decrease" edge is GreaterThan(earlier,
// later). Two candidate readings for which edge starts the alternation.
const alternatingStartsIncreasing = orangeEdges.map(([a, b], i) => (
  i % 2 === 0 ? new GreaterThan(b, a) : new GreaterThan(a, b)));
const alternatingStartsDecreasing = orangeEdges.map(([a, b], i) => (
  i % 2 === 0 ? new GreaterThan(a, b) : new GreaterThan(b, a)));

return [
  new Shape('9x9'),

  ...whiteDotPairs.map(cells => new WhiteDot(...cells)),
  ...blackDotPairs.map(cells => new BlackDot(...cells)),

  ...purpleLines.map(cells => new Renban(...cells)),

  new Or([
    new And(alternatingStartsIncreasing),
    new And(alternatingStartsDecreasing),
  ]),
];
