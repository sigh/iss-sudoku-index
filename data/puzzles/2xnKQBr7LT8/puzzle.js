// Title: The Train and the Fly
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=2xnKQBr7LT8
// Source: https://sudokupad.app/wjiiera37d

// Rules
// -----
// Fill each cell with a single digit and draw a "train" that covers every cell
// in the grid. The train consists of 4 carriages of equal length and each
// carriage is formed of an orthogonal path of cells. A carriage doesn't touch
// itself, not even diagonally. Adjacent digits along a carriage are consecutive.
// An X connects the end cells of two carriages, which sum to 10. The black fly
// connects two digits with a 1:2 ratio. Identical digits may not touch each
// other orthogonally. A digit on the train indicates how many times that digit
// appears on the train.
//
// Nothing here makes a row, a column or a box all-different, so the board is a
// Raw grid; "a single digit" is the ordinary 1-9 alphabet.
//
// The train rides on a Var overlay VC, one cell per grid cell, holding the
// carriage that covers that cell numbered by its place in the train: 1 at one
// end, 4 at the other. Which end of the train is called 1 is not a puzzle fact,
// so R1C1 is pinned into the 1-2 half, keeping one of each front/back mirror
// pair.

const shape = new Shape('6x6', '1-9', 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const cells = graph.cells();
const train = graph.makeOverlay('VC');

const NUM_CARRIAGES = 4;
const CARRIAGE_LEN = cells.length / NUM_CARRIAGES;  // 36 cells / 4 = 9
const carriageNums = Array.from({ length: NUM_CARRIAGES }, (_, i) => i + 1);

// --- Drawn clues, transcribed from the grid art. -------------------------
// The three X marks: four short black strokes radiating from the midpoint of a
// cell border, one mark on each of these borders.
const xBorders = [
  ['R2C2', 'R2C3'],
  ['R2C4', 'R2C5'],
  ['R5C6', 'R6C6'],
];
// The black fly -- black body, white wings -- drawn on this cell border.
const flyBorder = ['R2C3', 'R3C3'];

// Each border between two cells, once.
const orthogonalBorders = cells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dr, dc]) => graph.step(cell, dr, dc))
  .filter(Boolean)
  .map(other => [cell, other]));

// --- Every cell belongs to one of the 4 carriages. -----------------------
const overlay = [
  train.toVar('carriage'),
  train.makeReplicate(new Given(train.cells()[0], ...carriageNums)),
  // Front/back mirror pin (see header), not a rule of the puzzle.
  new Given(train.at('R1C1'), ...carriageNums.slice(0, NUM_CARRIAGES / 2)),
];

// --- Each carriage is a 9-cell orthogonal path. --------------------------
// Connected, exactly 9 cells, and no cell with more than two neighbours of its
// own carriage: a connected 9-cell set of maximum degree 2 is a path, because a
// grid graph is bipartite and so has no cycle of odd length. Being a path is
// also the whole of the orthogonal half of "doesn't touch itself": an
// orthogonal pair that is not consecutive along the path would give one of its
// cells a third neighbour, or close the path into a cycle.
const carriageShapes = carriageNums.map(
  c => new ConnectedValues('VC', c, CARRIAGE_LEN));

// Reads a cell's carriage, then each orthogonal neighbour's, counting how many
// of them are in that same carriage.
const degreeMachine = NFA.encodeSpec({
  startState: { carriage: null, sameCarriage: 0 },
  transition: ({ carriage, sameCarriage }, value) => {
    if (carriage === null) return { carriage: value, sameCarriage: 0 };
    const count = sameCarriage + (value === carriage ? 1 : 0);
    return count > 2 ? undefined : { carriage, sameCarriage: count };
  },
  accept: ({ carriage }) => carriage !== null,
}, geometry);
const carriageDegrees = cells.map(cell => new NFA(degreeMachine, 'degree',
  ...train.at([cell, ...graph.neighbours(cell)])));

// "A carriage doesn't touch itself, not even diagonally." Every 90-degree turn
// leaves the cells before and after it diagonally adjacent, so a diagonally
// adjacent pair of one carriage is a turn -- not a touch -- exactly when the
// carriage also holds one of the two cells that share their corner. Where it
// holds neither, the two cells are three or more steps apart along the path and
// the carriage does touch itself. Read over each 2x2 block, once per diagonal.
const noSelfTouch = cells
  .map(cell => graph.block(cell, 2, 2))
  .filter(Boolean)
  .flatMap(block => {
    const [topLeft, topRight, bottomLeft, bottomRight] = train.at(block);
    return [
      [topLeft, bottomRight, topRight, bottomLeft],
      [topRight, bottomLeft, topLeft, bottomRight],
    ].map(([cell, opposite, corner, otherCorner]) => new Or([
      new AllDifferent(cell, opposite),
      new SameValues(2, cell, corner),
      new SameValues(2, cell, otherCorner),
    ]));
  });

// --- Digit rules across a cell border. -----------------------------------
// "Identical digits may not touch each other orthogonally."
const noTouchingRepeats = orthogonalBorders.map(
  ([a, b]) => new AllDifferent(a, b));

// "Adjacent digits along a carriage are consecutive." A carriage does not touch
// itself, so two orthogonally adjacent cells of one carriage are consecutive
// along its path; either the cells sit in different carriages, or their digits
// differ by one.
const consecutiveAlongCarriage = orthogonalBorders.map(([a, b]) => new Or([
  new AllDifferent(...train.at([a, b])),
  new WhiteDot(a, b),
]));

// --- "A digit ... indicates how many times that digit appears." ----------
// The train covers every cell, so a digit that appears at all appears exactly
// its own value of times, and the digits in use must add to the 36 cells. Each
// such digit set fixes the grid's whole multiset, so the rule is the choice
// between them.
const total = cells.length;
const allDigits = geometry.allValues();
const digitMultisets = [];
for (let mask = 1; mask < (1 << allDigits.length); mask++) {
  const used = allDigits.filter((_, i) => mask & (1 << i));
  if (used.reduce((a, b) => a + b, 0) !== total) continue;
  digitMultisets.push(used.flatMap(d => Array(d).fill(d)).join('_'));
}
const digitCounts = new Or(
  digitMultisets.map(values => new ContainExact(values, ...cells)));

// --- The X marks. --------------------------------------------------------
// "... which sum to 10."
const xSums = xBorders.map(border => new X(...border));

// "... connects the end cells of two carriages." A carriage is a path, so its
// end cells are the two cells with exactly one orthogonal neighbour in the same
// carriage: one branch per neighbour that may be that one.
const carriageEnd = (cell) => {
  const neighbours = graph.neighbours(cell);
  return new Or(neighbours.map(next => new And([
    new SameValues(2, ...train.at([cell, next])),
    ...neighbours.filter(other => other !== next).map(
      other => new AllDifferent(...train.at([cell, other]))),
  ])));
};
const xEnds = xBorders.flat().map(carriageEnd);

// A 4-carriage train has exactly 3 couplings -- carriages 1-2, 2-3 and 3-4 --
// and exactly 3 X marks are drawn, so the X marks are those couplings, one
// each. One branch per way of dealing the three couplings out to the three X
// marks; within a branch the coupling's two carriage numbers go to the X's two
// cells in either order.
const permutations = (values) => values.length <= 1 ? [values] :
  values.flatMap((v, i) => permutations(
    [...values.slice(0, i), ...values.slice(i + 1)]).map(rest => [v, ...rest]));
const couplings = new Or(permutations([1, 2, 3]).map(order => new And(
  order.flatMap((lower, i) => {
    const carriagesAtX = train.at(xBorders[i]);
    return [
      ...carriagesAtX.map(cell => new Given(cell, lower, lower + 1)),
      new AllDifferent(...carriagesAtX),
    ];
  }))));

// --- The black fly. ------------------------------------------------------
const fly = new BlackDot(...flyBorder);

return [
  shape,
  ...overlay,
  ...carriageShapes,
  ...carriageDegrees,
  ...noSelfTouch,
  ...noTouchingRepeats,
  ...consecutiveAlongCarriage,
  digitCounts,
  ...xSums,
  ...xEnds,
  couplings,
  fly,
];
