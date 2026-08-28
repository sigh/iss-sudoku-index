// Title: Pathway Sudoku
// Author: Tom Groot Kormelink
// Video: https://www.youtube.com/watch?v=hqBN2RniiZ4
// Source: https://cracking-the-cryptic.web.app/sudoku/FJrgnTML78

// Rules encoded below:
//   Normal sudoku rules apply (rows, columns, nine 3x3 boxes).
//   A closed loop joins the centres of some subset of cells by orthogonal
//   unit steps and does not cross itself (so each cell it visits belongs to
//   at most two loop edges). At every cell where the loop turns, the digit
//   in that cell gives the length -- in cells, counting from the cell just
//   past the turn through and including the following turn -- of the next
//   straight run ("line") of the path. Cells the loop does not turn at
//   (straight-through loop cells, and cells off the loop) are unconstrained
//   by this rule. R8C9 (digit 5) is drawn with a green highlight, which the
//   rules single out as confirmed to be one of the turning cells.
// Not encoded: none. The loop has no fixed start or traversal direction, so
//   "the next line" (walking one way around the loop vs. the other) is
//   ambiguous by the rules text alone; see the VP/VS overlay note below for
//   how both readings are represented rather than one being chosen.
// The far endpoint of "the length of the next line" is read as included in
//   the count (the turn cell itself, whose digit is the clue, is not) --
//   the reading a sibling "length of the rest of the line including ... the
//   other endpoint" clue in this pipeline uses for the same kind of phrase.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// Direction codes shared by the VP (predecessor) and VS (successor) overlays.
// A cell off the loop is OFF in both; an on-loop cell names, in each, the
// compass direction of the loop edge it uses to reach its predecessor /
// successor. No cell can have the same value in both (that would reuse one
// edge as both neighbours), which is asserted below.
const OFF = 1, N = 2, E = 3, S = 4, W = 5;
const DIRS = ['N', 'E', 'S', 'W'];
const CODE = { N, E, S, W };
const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };
const OPP_CODE = { [N]: S, [S]: N, [E]: W, [W]: E };
const DELTA = { N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] };
const ALL_DIR_CODES = [N, E, S, W];

const step = (cell, d) => graph.step(cell, ...DELTA[d]);

const vp = graph.makeOverlay('VP'); // predecessor direction, or OFF
const vs = graph.makeOverlay('VS'); // successor direction, or OFF

// --- Per-cell domains: only directions with a real neighbour are allowed. ---
const domains = gridCells.flatMap(cell => {
  const codes = [OFF, ...DIRS.filter(d => step(cell, d)).map(d => CODE[d])];
  return [new Given(vp.at(cell), ...codes), new Given(vs.at(cell), ...codes)];
});

// --- VP/VS agree on membership (on together, off together) and never name
// the same direction twice (a cell's predecessor and successor edges must be
// two different neighbours). ---
const linkKey = Pair.fnToKey((p, s) =>
  (p === OFF && s === OFF) || (p !== OFF && s !== OFF && p !== s), shape);
const links = gridCells.map(cell => new Pair(linkKey, 'vp-vs link', vp.at(cell), vs.at(cell)));

// --- Edge agreement: a cell's successor-in-direction-d claim is only valid
// when the neighbour in direction d agrees it is that neighbour's
// predecessor-from-the-opposite-direction. Generated once per (cell,
// direction) with a real neighbour; running it from every cell in every
// direction covers both ends of every used edge without double-asserting
// either end's own claim. ---
const edgeKeys = Object.fromEntries(DIRS.map(d => {
  const dCode = CODE[d], oppCode = CODE[OPP[d]];
  return [d, Pair.fnToKey((vsVal, vpVal) => (vsVal === dCode) === (vpVal === oppCode), shape)];
}));
const edgeAgreement = gridCells.flatMap(cell => DIRS.flatMap(d => {
  const nb = step(cell, d);
  if (!nb) return [];
  return [new Pair(edgeKeys[d], `edge agree ${d}`, vs.at(cell), vp.at(nb))];
}));

// --- Single loop: on-loop cells (VP != OFF) form one connected region; with
// each on-loop cell already forced to exactly one predecessor edge (its own
// VP value) and exactly one successor edge (its own VS value), connected +
// 1-in/1-out makes that region a single simple cycle. ---
const connectivity = new ConnectedValues('VP', ALL_DIR_CODES);

// --- The green-highlighted cell (R8C9) is confirmed by the rules to be a
// turning cell: on the loop, and not straight-through. ---
const GREEN = 'R8C9';
const notStraightKey = Pair.fnToKey((p, s) => p !== OFF && s !== OPP_CODE[p], shape);
const greenIsTurn = [
  new Given(vp.at(GREEN), N, E, S, W),
  new Pair(notStraightKey, 'green cell turns', vp.at(GREEN), vs.at(GREEN)),
];

// --- Turn-length rule. For each cell and each direction e it could exit
// through: if the cell is not actually exiting that way (VS != e), or it is
// exiting that way but straight through (VP == opposite(e), so this is not a
// turn), the rule is vacuous. Otherwise (VS == e and VP != opposite(e), a
// genuine turn using e as its outgoing edge) the cell's digit must equal the
// number of cells from here, walking in direction e, through and including
// the next turn: the run's cells all name the axis of e as their own
// predecessor/successor pair, except the last, which must not continue
// straight through e (so the run cannot silently overshoot the counted
// length). Length is bounded by the distance to the grid edge in direction e.
const lengthRules = gridCells.flatMap(cell => DIRS.flatMap(d => {
  const eCode = CODE[d];
  if (!step(cell, d)) return [];
  const oppCode = CODE[OPP[d]];

  const chain = [];
  for (let cur = step(cell, d); cur; cur = step(cur, d)) chain.push(cur);

  const branches = chain.map((turnCell, idx) => {
    const len = idx + 1;
    const straightCells = chain.slice(0, idx); // P1..P(len-1)
    return new And([
      ...straightCells.flatMap(pc => [new Given(vp.at(pc), oppCode), new Given(vs.at(pc), eCode)]),
      new Given(vp.at(turnCell), oppCode),
      new Given(vs.at(turnCell), ...ALL_DIR_CODES.filter(c => c !== eCode)),
      new Given(cell, len),
    ]);
  });

  const notExitingHere = new Given(vs.at(cell), OFF, ...ALL_DIR_CODES.filter(c => c !== eCode));
  const straightThroughHere = new Given(vp.at(cell), oppCode);
  return [new Or([notExitingHere, straightThroughHere, ...branches])];
}));

// --- Standard sudoku givens (the puzzle's printed digits). ---
const givens = [
  ['R1C5', 1], ['R1C6', 7],
  ['R2C1', 3], ['R2C5', 6], ['R2C6', 9],
  ['R3C3', 9], ['R3C4', 5], ['R3C7', 1], ['R3C9', 6],
  ['R4C1', 4], ['R4C2', 7], ['R4C7', 2],
  ['R5C1', 2], ['R5C2', 9], ['R5C8', 5], ['R5C9', 4],
  ['R6C3', 8], ['R6C8', 9], ['R6C9', 3],
  ['R7C1', 8], ['R7C3', 5], ['R7C6', 2], ['R7C7', 9],
  ['R8C4', 3], ['R8C5', 9], ['R8C9', 5],
  ['R9C4', 7], ['R9C5', 5],
].map(([cell, v]) => new Given(cell, v));

return [
  shape,
  vp.toVar('loop predecessor'),
  vs.toVar('loop successor'),
  ...domains,
  ...links,
  ...edgeAgreement,
  connectivity,
  ...greenIsTurn,
  ...lengthRules,
  ...givens,
];
