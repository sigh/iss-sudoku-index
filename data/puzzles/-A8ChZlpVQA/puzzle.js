// Title: Uncertainty Thermo Sudoku
// Author: JoJoMcFroYo
// Video: https://www.youtube.com/watch?v=-A8ChZlpVQA
// Source: https://cracking-the-cryptic.web.app/sudoku/rnMt4Ltpt7
//
// Normal sudoku (default rows/cols/boxes) plus 7 thermometers (values
// increase from the bulb). The rules also state exactly one of
// non-consecutive / anti-knight / anti-king applies to the whole grid, but
// not which: encoded as Or() over the three, so a completion is accepted
// whenever it satisfies at least one of them. No givens.

const thermoA = new Thermo('R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1');
const thermoB = new Thermo('R1C2', 'R2C2', 'R3C2');
const thermoC = new Thermo('R1C3', 'R1C4');
const thermoD = new Thermo('R8C2', 'R8C3', 'R8C4', 'R8C5');
const thermoE = new Thermo('R9C5', 'R9C4', 'R9C3', 'R9C2');
const thermoF = new Thermo(
  'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8', 'R8C9', 'R7C8');
const thermoG = new Thermo(
  'R3C4', 'R2C5', 'R3C6', 'R2C7', 'R3C8', 'R4C7', 'R5C8', 'R6C9');

// "One restriction from: Non-consecutive; Knight; King" -- the setter chose
// exactly one, unrecoverable from the source, so a completion is accepted
// when it satisfies at least one candidate. The built-in AntiConsecutive /
// AntiKnight / AntiKing classes are layout globals and cannot nest inside an
// Or, so each candidate is rebuilt from Pair edges (one non-equal or
// non-consecutive relation per adjacent cell pair) grouped by translation
// offset with Replicate.
const graph = cellGraph('9x9');
const notConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const notEqualKey = Pair.fnToKey((a, b) => a !== b, 9);

// One Replicate group per translation offset: template Pair anchored at the
// lowest-index cell that has a neighbour at that offset, applied to every
// such cell.
function offsetGroup(dRow, dCol, key, label) {
  const targets = graph.cells().filter(c => graph.step(c, dRow, dCol) !== null);
  const origin = targets[0];
  const template = new Pair(key, label, origin, graph.step(origin, dRow, dCol));
  return new Replicate(
    [template], Replicate.encodeTargetCells(targets, origin, graph), origin);
}

const nonConsecutive = new And([
  offsetGroup(0, 1, notConsecutiveKey, 'non-consecutive'),
  offsetGroup(1, 0, notConsecutiveKey, 'non-consecutive'),
]);
const antiKnight = new And([
  offsetGroup(1, 2, notEqualKey, 'anti-knight'),
  offsetGroup(1, -2, notEqualKey, 'anti-knight'),
  offsetGroup(2, 1, notEqualKey, 'anti-knight'),
  offsetGroup(2, -1, notEqualKey, 'anti-knight'),
]);
const antiKing = new And([
  offsetGroup(0, 1, notEqualKey, 'anti-king'),
  offsetGroup(1, 0, notEqualKey, 'anti-king'),
  offsetGroup(1, 1, notEqualKey, 'anti-king'),
  offsetGroup(1, -1, notEqualKey, 'anti-king'),
]);

const uncertainRestriction = new Or([nonConsecutive, antiKnight, antiKing]);

return [
  new Shape('9x9'),
  thermoA, thermoB, thermoC, thermoD, thermoE, thermoF, thermoG,
  uncertainRestriction,
];
