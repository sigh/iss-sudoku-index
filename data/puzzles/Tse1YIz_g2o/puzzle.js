// Title: What's Literally Eating Gilbert Grape?
// Author: Oyvind Thorsby
// Video: https://www.youtube.com/watch?v=Tse1YIz_g2o
// Source: https://app.crackingthecryptic.com/sudoku/qnjrtqbr7j

// Normal sudoku rules apply. Every cell also carries a zombie/human state
// (the VZ overlay below). No 2x2 block of cells is all-zombie or all-human.
// R3C5 (circled in the source) is a zombie -- "patient zero". For every
// orthogonally adjacent pair of cells x, y: if x is a zombie and its digit
// "infects" y -- digit(x) > digit(y), or the exception digit(x) = 1 and
// digit(y) = 9 -- then y must also be a zombie. Both directions of every
// edge are checked, since the trigger condition is directional.
//
// Omission: "every other zombie's infection traces back to patient zero"
// additionally requires the zombie set to be exactly the cells *reachable*
// from patient zero along the infection relation above, not merely a set
// that is closed under it (a second, unreachable zombie pocket that is
// locally self-consistent would also satisfy the rule below). ISS has no
// reachability-from-a-source primitive, so only the closure half is
// encoded here.

const HUMAN = 1;
const ZOMBIE = 2;
const PATIENT_ZERO = 'R3C5'; // the drawn circle marks this cell
const shape = new Shape('9x9');
const infectionShape = new Shape('1x1', 2);

// Givens, transcribed from the drawn grid (rows 5-7 only).
const givens = [
  ['R5C3', 6], ['R5C6', 3], ['R5C8', 2],
  ['R6C1', 9], ['R6C2', 5], ['R6C3', 8], ['R6C4', 7], ['R6C5', 2],
  ['R6C6', 6], ['R6C7', 3], ['R6C8', 4], ['R6C9', 1],
  ['R7C1', 7], ['R7C2', 8], ['R7C3', 5], ['R7C4', 9], ['R7C5', 4],
  ['R7C6', 2], ['R7C7', 6], ['R7C8', 1], ['R7C9', 3],
];

const graph = cellGraph(shape);
const gridCells = graph.cells();
const zLayer = graph.makeOverlay('VZ');
const z = cell => zLayer.at(cell);

// Every zombie/human cell is one of the two states.
const zDomain = zLayer.makeReplicate(
  new Given(zLayer.cells()[0], HUMAN, ZOMBIE));

// No 2x2 block is all-zombie or all-human: scan each block's 4 cells and
// reject once all four seen values match.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, infectionShape);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = zLayer.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...zLayer.at(graph.block(gridCells[0], 2, 2))),
  zLayer.at(blockOrigins));

// Patient zero is a zombie.
const patientZero = new Given(z(PATIENT_ZERO), ZOMBIE);

// Infection trigger does NOT hold from x to y: digit(x) <= digit(y), and not
// the digit(x)=1, digit(y)=9 exception.
const noTrigger = Pair.fnToKey(
  (dx, dy) => dx <= dy && !(dx === 1 && dy === 9), 9);

// For every ordered adjacent pair (x, y): either x is human, or x's digit
// does not infect y's digit, or y is a zombie too.
function forcing(x, y) {
  return new Or([
    new Given(z(x), HUMAN),
    new Pair(noTrigger, 'no infection trigger', x, y),
    new Given(z(y), ZOMBIE),
  ]);
}
const forcingRules = gridCells.flatMap(
  x => graph.neighbours(x).map(y => forcing(x, y)));

return [
  shape,
  ...givens.map(([cell, value]) => new Given(cell, value)),
  zLayer.toVar('zombie/human'),
  zDomain,
  noMono2x2,
  patientZero,
  ...forcingRules,
];
