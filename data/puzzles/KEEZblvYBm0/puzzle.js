// Title: World Cup 2026: Kick Off!
// Author: Sudoku Joker
// Video: https://www.youtube.com/watch?v=KEEZblvYBm0
// Source: https://sudokupad.app/8iktohgrmy

// Normal sudoku. Given digits are coded as letters; the cipher (letter ->
// alphabet position) is fixed by the clue "world cup" = 23,15,18,12,4,3,21,16.
// The grid's letters all have positions 1-9: F=6, I=9, A=1, E=5.
//   Givens: R6C1=F=6, R7C2=I=9, R8C3=F=6, R9C4=A=1, R1C9=E=5.
// - 26: no 2x2 square in the grid may sum to 26.
// - Offside: within each 3x3 box, 9 is never on a lower row than 1 or 2
//   (it must be above or on the same row as both).
// - Goal line (row 8): horizontally adjacent digits are not consecutive.
// - Ball control: on the brown football, each digit has the opposite parity to
//   its orthogonal football neighbours (checkerboard parity on the ball).
//
// The "Substitute"/fog rule (R1C9 hidden until triggered) is cosmetic and carries
// no logical constraint, so it is not encoded.

const cid = makeCellId;

// --- Givens (decoded letters) ---
const givens = [
  new Given(cid(6, 1), 6), // F
  new Given(cid(7, 2), 9), // I
  new Given(cid(8, 3), 6), // F
  new Given(cid(9, 4), 1), // A
  new Given(cid(1, 9), 5), // E
];

// --- 26: no 2x2 square sums to 26 ---
// One multiSegment NFA; each segment is a 2x2 block's four cells. The machine
// tallies the block sum and rejects a completed block totalling 26.
const blocks = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    blocks.push([cid(r, c), cid(r, c + 1), cid(r + 1, c), cid(r + 1, c + 1)]);
  }
}
const noSum26 = NFA.encodeSpec({
  startState: { count: 0, sum: 0 },
  transition: (s, value) => {
    if (value === SEGMENT_BREAK) return { count: 0, sum: 0 };
    const count = s.count + 1;
    const sum = s.sum + value;
    if (count === 4) {
      if (sum === 26) return undefined;
      return { count: 0, sum: 0 };
    }
    return { count, sum };
  },
  accept: () => true,
}, 9, { multiSegment: true });

// --- Offside: in each box, row(9) <= row(1) and row(9) <= row(2) ---
// One multiSegment NFA; each segment is a box read in row-major order, so the
// band index (0/1/2) advances every three cells.
const boxes = [];
for (let br = 0; br < 9; br += 3) {
  for (let bc = 0; bc < 9; bc += 3) {
    const box = [];
    for (let dr = 1; dr <= 3; dr++) {
      for (let dc = 1; dc <= 3; dc++) box.push(cid(br + dr, bc + dc));
    }
    boxes.push(box);
  }
}
const resetOffside = { idx: 0, band9: -1, band1: -1, band2: -1 };
const offside = NFA.encodeSpec({
  startState: { ...resetOffside },
  transition: (s, value) => {
    if (value === SEGMENT_BREAK) return { ...resetOffside };
    const band = Math.floor(s.idx / 3);
    let { band9, band1, band2 } = s;
    if (value === 9) band9 = band;
    if (value === 1) band1 = band;
    if (value === 2) band2 = band;
    const idx = s.idx + 1;
    if (idx === 9) {
      if (band9 > band1 || band9 > band2) return undefined;
      return { ...resetOffside };
    }
    return { idx, band9, band1, band2 };
  },
  accept: () => true,
}, 9, { multiSegment: true });

// --- Goal line (row 8): adjacent digits not consecutive ---
const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const goalLine = [];
for (let c = 1; c <= 8; c++) {
  goalLine.push(new Pair(notConsecutive, '', cid(8, c), cid(8, c + 1)));
}

// --- Ball control: checkerboard parity on the brown football ---
// The ball is the brown circle centred on R5C5 with radius ~2.96 cells. Cells
// whose centre lies inside it are exactly the 5x5 core R3C3..R7C7; the circle's
// edge also reaches the four cardinal cells R2C5, R8C5, R5C2, R5C8 ("digits
// around the edge of the ball"). Each football cell must differ in parity from
// its orthogonal football neighbours.
const footballSet = new Set();
for (let r = 3; r <= 7; r++) {
  for (let c = 3; c <= 7; c++) footballSet.add(`${r},${c}`);
}
for (const [r, c] of [[2, 5], [8, 5], [5, 2], [5, 8]]) footballSet.add(`${r},${c}`);

const oppositeParity = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const ballControl = [];
for (const key of footballSet) {
  const [r, c] = key.split(',').map(Number);
  for (const [nr, nc] of [[r, c + 1], [r + 1, c]]) {
    if (footballSet.has(`${nr},${nc}`)) {
      ballControl.push(new Pair(oppositeParity, '', cid(r, c), cid(nr, nc)));
    }
  }
}

return [
  new Shape('9x9'),
  ...givens,
  new NFA(noSum26, 'no-2x2-sum-26', ...blocks),
  new NFA(offside, 'offside', ...boxes),
  ...goalLine,
  ...ballControl,
];
