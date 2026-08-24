// Title: Propellers
// Author: fritzdis
// Video: https://www.youtube.com/watch?v=v3ADmHmEyGU
// Source: https://app.crackingthecryptic.com/sudoku/3n247BmLHF

// Normal sudoku rules apply (default row/col/box all-different from Shape).
// One given: R5C3=6.
//
// Arrows: digits along each arrow sum to the digit in its connected circle
// (bulb cell listed first). Digits may repeat along an arrow -- the default
// Arrow class adds no distinctness, matching the rules text exactly.
//
// The four 5-cell cages (a centre cell plus its four orthogonal neighbours)
// are cages with no printed total, so each is AllDifferent over its 5 cells.
// They are also clones of each other, with rotation allowed but not
// required:
//   - the same digit sits in the centre of every clone (SameValues over the
//     4 centres);
//   - the 4 outer digits, read clockwise from any starting digit, form the
//     same cyclic sequence in every clone. "Clockwise from any particular
//     digit" is a rotation-only reading (no reflection), so each clone's own
//     [N, E, S, W] tuple must equal some cyclic rotation of a shared
//     reference tuple. Encoded below as an explicit Or over the 4 possible
//     rotation offsets (k=0 covers "rotation not required" / identical
//     orientation), tested pairwise against cage 0 as the reference; the
//     rotation relation is transitive, so pairwise-vs-reference implies all
//     six pairs share one common cyclic sequence.

const eqKey = Pair.fnToKey((a, b) => a === b, 9);

// Outer ring cells for each clone, listed clockwise from North: [N, E, S, W].
// Coordinates come from the drawn cages (5-cell plus shapes; centre is the
// cell orthogonally adjacent to all 4 others).
const cage0Center = 'R3C3';
const cage0Outer = ['R2C3', 'R3C4', 'R4C3', 'R3C2'];
const cage1Center = 'R2C8';
const cage1Outer = ['R1C8', 'R2C9', 'R3C8', 'R2C7'];
const cage2Center = 'R6C6';
const cage2Outer = ['R5C6', 'R6C7', 'R7C6', 'R6C5'];
const cage3Center = 'R8C2';
const cage3Outer = ['R7C2', 'R8C3', 'R9C2', 'R8C1'];

// True iff `other`'s [N,E,S,W] tuple equals `ref`'s tuple rotated by some
// shift k in 0..3 (k=0 is the identity/no-rotation case).
function isRotationOf(ref, other, label) {
  const rotations = [];
  for (let k = 0; k < 4; k++) {
    const eqs = [];
    for (let j = 0; j < 4; j++) {
      eqs.push(new Pair(eqKey, `${label}_k${k}_${j}`, other[j], ref[(j + k) % 4]));
    }
    rotations.push(new And(eqs));
  }
  return new Or(rotations);
}

return [
  new Shape('9x9'),

  new Given('R5C3', 6),

  // Arrows: bulb cell first, then arm cells (arm cells may repeat digits).
  new Arrow('R1C2', 'R1C1', 'R2C1'),
  new Arrow('R2C2', 'R2C3', 'R3C3', 'R3C2'),
  new Arrow('R5C5', 'R4C5', 'R4C6', 'R3C7'),
  new Arrow('R5C5', 'R5C4', 'R6C4', 'R7C3'),
  new Arrow('R5C5', 'R6C6', 'R7C7', 'R8C8'),
  new Arrow('R5C8', 'R6C9', 'R7C9', 'R7C8'),
  new Arrow('R8C5', 'R9C6', 'R9C7', 'R8C7'),

  // Clone cages: no printed total, so each is a plain distinctness cage.
  new AllDifferent(cage0Center, ...cage0Outer),
  new AllDifferent(cage1Center, ...cage1Outer),
  new AllDifferent(cage2Center, ...cage2Outer),
  new AllDifferent(cage3Center, ...cage3Outer),

  // Same digit in every clone's centre.
  new SameValues(4, cage0Center, cage1Center, cage2Center, cage3Center),

  // Same cyclic outer sequence in every clone (rotation allowed, not required).
  isRotationOf(cage0Outer, cage1Outer, 'CloneRot1'),
  isRotationOf(cage0Outer, cage2Outer, 'CloneRot2'),
  isRotationOf(cage0Outer, cage3Outer, 'CloneRot3'),
];
