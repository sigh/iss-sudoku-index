// Title: The Box
// Author: The Norinori Guy
// Video: https://www.youtube.com/watch?v=5NXrQgkJJ2k
// Source: https://tinyurl.com/ys7pa8ay

// Rules: normal sudoku; anti-knight (identical digits cannot be a knight's
// move apart); killer cage (sum, no repeats); thermometers (strictly
// increasing from the bulb); and one more rule on "the large box" below.
//
// The large box: the drawn grey outline is the border of the central 5x5
// box (rows 3-7, columns 3-7) -- a 16-cell loop, not the 3x3 sudoku boxes.
// The rules call it a "quasi-thermo-palindrome, increasing in both
// directions from an unknown bulb": some cell on the loop is an unmarked
// bulb, and digits increase away from it along the loop in both directions,
// meeting at the cell diametrically opposite (8 steps away either way
// around the 16-cell loop). This is encoded as an Or over all 16 possible
// bulb positions; each disjunct is two 9-cell increasing Thermo arcs
// (sharing the bulb and the opposite peak cell) that together cover the
// whole loop exactly once.

const cage7 = ['R4C5', 'R5C5'];

const thermos = [
  ['R8C9', 'R8C8', 'R9C9', 'R9C8'],
  ['R2C9', 'R1C8', 'R1C9', 'R2C8'],
  ['R1C2', 'R1C1', 'R2C2', 'R2C1'],
  ['R8C2', 'R9C1', 'R9C2', 'R8C1'],
  ['R4C5', 'R5C5'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R6C4', 'R5C4', 'R4C4'],
];

// Perimeter of the central 5x5 box (rows 3-7, cols 3-7), in loop order.
// From the payload's two `line` entries (source-drawn outline), merged at
// their shared endpoints R7C7 and R5C3 into one 16-cell cycle.
const largeBoxLoop = [
  'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3',
  'R6C3', 'R5C3', 'R4C3', 'R3C3',
  'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R4C7', 'R5C7', 'R6C7',
];
const N = largeBoxLoop.length; // 16

// One disjunct per candidate bulb position s: the two 9-cell arcs going
// forward and backward from s both increase, meeting at the opposite cell
// s+8 (mod 16).
const largeBoxDisjuncts = [];
for (let s = 0; s < N; s++) {
  const fwd = [];
  const bwd = [];
  for (let k = 0; k <= N / 2; k++) {
    fwd.push(largeBoxLoop[(s + k) % N]);
    bwd.push(largeBoxLoop[(s - k + N) % N]);
  }
  largeBoxDisjuncts.push(new And([new Thermo(...fwd), new Thermo(...bwd)]));
}

return [
  new Shape('9x9'),
  new Given('R2C4', 1),
  new AntiKnight(),
  new Cage(7, ...cage7),
  ...thermos.map(cells => new Thermo(...cells)),
  new Or(largeBoxDisjuncts),
];
