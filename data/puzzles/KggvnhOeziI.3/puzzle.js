// Title: Differences Count - part 1
// Author: Sujoyku and Marty Sears
// Video: https://www.youtube.com/watch?v=KggvnhOeziI
// Source: https://sudokupad.app/6bxd0ipaky
//
// Rules encoded:
// - Normal 4x4 sudoku (default Shape gives the 2x2 boxes).
// - Black dot (R4C1/R4C2): 1:2 ratio -> BlackDot.
// - Two coloured lines. Each is a self-referential "differences count" group,
//   scoped to that line only ("along that line" in the rules text): the
//   difference of every adjacent pair on the line must equal the number of
//   adjacent pairs *on that same line* whose difference has that exact value.
//
// The self-referential rule is reduced below to the finite set of difference
// sequences that satisfy it -- this is arithmetic forced by the rule itself
// (how many ways can a multiset of counts describe its own frequencies),
// not a fit to the stored solution:
//
//   n=2 adjacent pairs (palegreen, R3C1-R3C2-R4C3): call the two differences
//   d1, d2. If d1 == d2 == v, the count of pairs with difference v is 2, so
//   v must be 2. If d1 != d2, each is the lone pair with its own difference,
//   so each would have to equal 1 -- but then d1 == d2 == 1, contradicting
//   d1 != d2. So the only solution is d1 == d2 == 2.
//
//   n=3 adjacent pairs (plum, R2C2-R2C3-R3C4-R4C4): grouping the three
//   differences by equal value only has three possible shapes:
//     - all three equal (count 3) -> the shared value must be 3.
//     - two equal + one different (counts 2 and 1) -> the pair's value must
//       be 2 and the singleton's value must be 1.
//     - all three different (counts 1,1,1) -> each would have to equal 1,
//       contradicting "all different". Impossible.
//   So exactly 4 difference sequences (e1,e2,e3) satisfy the rule:
//   (3,3,3), (1,2,2), (2,1,2), (2,2,1).

const geometry = cellGeometry('4x4');
const diffKey = k => Pair.fnToKey((a, b) => Math.abs(a - b) === k, geometry);
const diffPair = (k, label, a, b) => new Pair(diffKey(k), label, a, b);

// palegreen line R3C1-R3C2-R4C3: both adjacent pairs are forced to
// difference 2 (see derivation above), so a single Pair over the whole
// chain enforces both edges at once.
const palegreenLine = new Pair(
  diffKey(2), 'palegreen self-count', 'R3C1', 'R3C2', 'R4C3');

// plum line R2C2-R2C3-R3C4-R4C4: its 3 adjacent pairs, in order.
const plumEdges = [['R2C2', 'R2C3'], ['R2C3', 'R3C4'], ['R3C4', 'R4C4']];
// Each of the 4 valid difference sequences derived above, as a conjunction
// of per-edge exact-difference Pairs; exactly one sequence must hold.
const plumSequences = [
  [3, 3, 3],
  [1, 2, 2],
  [2, 1, 2],
  [2, 2, 1],
];
const plumLine = new Or(plumSequences.map((seq, i) => new And(
  seq.map((k, j) => diffPair(k, `plum e${j} seq${i}`, ...plumEdges[j])))));

return [
  new Shape('4x4'),

  // Black dot overlay, edge R4C1/R4C2.
  new BlackDot('R4C1', 'R4C2'),

  palegreenLine,
  plumLine,
];
