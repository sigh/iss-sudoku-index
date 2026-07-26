// Title: Help! My flatmate is a Camel!
// Author: Lorena
// Video: https://www.youtube.com/watch?v=gkBlSmIBSW4
// Source: https://sudokupad.app/hj7tmm15ln

// Normal sudoku rules apply (default row/column/box groups).
//
// Every 5 must have a 1 directly above it or a 9 directly below it (either
// or both). Modeled per cell as an Or of the option(s) that exist; the top
// row keeps only "9 below" and the bottom row only "1 above".
//
// A camel's move is a (1,3)/(3,1) leaper jump. Any cell a camel's move away
// from a camel cell must hold a digit that is consecutive with, or in a 2:1
// ratio to, the camel cell's digit.
//
// There are exactly seven camel cells: two are shown (drawn camel markers
// at R2C1 and R7C1), five are hidden. Every hidden camel lives in an
// odd-numbered box (reading-order numbering, per the rules) and holds that
// box's number as its digit. That is the rules' stated necessary property
// of a hidden camel, not a full characterisation -- it does not say every
// qualifying cell *is* a camel -- so which five qualifying cells are the
// actual hidden camels is left to the solver via flag Vars, not resolved
// by hand.

const graph = cellGraph('9x9');

const CAMEL_STEPS = [
  [1, 3], [1, -3], [-1, 3], [-1, -3],
  [3, 1], [3, -1], [-3, 1], [-3, -1],
];
function camelTargets(cell) {
  return CAMEL_STEPS
    .map(([dr, dc]) => graph.step(cell, dr, dc))
    .filter(Boolean);
}

function boxNumber(cell) {
  const { row, col } = parseCellId(cell);
  return 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;
}

// Consecutive or 2:1 ratio -- shared by every camel-move pair below.
const camelKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) === 1 || a === 2 * b || b === 2 * a, 9);

// The two shown camels (drawn camel emoji markers in the payload).
const shownCamels = ['R2C1', 'R7C1'];
const shownCamelMoves = shownCamels.flatMap(
  cell => camelTargets(cell).map(
    target => new Pair(camelKey, 'camel move', cell, target)));

// Hidden camels can only be cells in odd boxes, excluding the two shown
// camel cells (those are already accounted for and are not "the others").
const oddBoxes = [1, 3, 5, 7, 9];
const hiddenCandidates = oddBoxes
  .flatMap(n => graph.box(n))
  .filter(cell => !shownCamels.includes(cell));

// One flag Var per candidate: 1 = not a camel, 2 = hidden camel. The
// solver chooses which five candidates are actually camels.
const flags = graph.makeOverlay('VK', hiddenCandidates);
const flagCells = flags.at(hiddenCandidates);
const flagDomain = flagCells.map(fc => new Given(fc, 1, 2));

// Exactly five hidden camels among the candidates.
const hiddenCount = new ContainExact('2_2_2_2_2', ...flagCells);

// A flagged hidden camel's digit equals its box number; an unflagged
// candidate is unconstrained by this rule.
const hiddenDigits = hiddenCandidates.map(cell => new Pair(
  Pair.fnToKey((flag, digit) => flag !== 2 || digit === boxNumber(cell), 9),
  'hidden camel digit', flags.at(cell), cell));

// Each candidate's camel-move effect applies only when it is flagged a
// camel: either the flag says "not a camel" (no constraint on the target),
// or it says "camel" and the move-target must satisfy the digit relation.
const hiddenCamelMoves = hiddenCandidates.flatMap(cell => camelTargets(cell).map(
  target => new Or([
    new Given(flags.at(cell), 1),
    new And([
      new Given(flags.at(cell), 2),
      new Pair(camelKey, 'camel move', cell, target),
    ]),
  ])));

// Every 5 needs a 1 directly above it or a 9 directly below it.
const fiveAboveKey = Pair.fnToKey((self, above) => self !== 5 || above === 1, 9);
const fiveBelowKey = Pair.fnToKey((self, below) => self !== 5 || below === 9, 9);
const fiveRule = graph.cells().map(cell => {
  const above = graph.step(cell, -1, 0);
  const below = graph.step(cell, 1, 0);
  const aboveOpt = above && new Pair(fiveAboveKey, '5 above 1', cell, above);
  const belowOpt = below && new Pair(fiveBelowKey, '5 below 9', cell, below);
  return (aboveOpt && belowOpt) ? new Or([aboveOpt, belowOpt]) : (aboveOpt || belowOpt);
});

return [
  new Shape('9x9'),
  flags.toVar('hidden camel flags'),
  ...fiveRule,
  ...shownCamelMoves,
  ...flagDomain,
  hiddenCount,
  ...hiddenDigits,
  ...hiddenCamelMoves,
];
