// Title: Pentomino Sight Lines
// Author: Blobz
// Video: https://www.youtube.com/watch?v=TUMP5GFD5D4
// Source: https://app.crackingthecryptic.com/sudoku/gJBh3q6mmr

// Rules encoded here:
//  1. Normal sudoku rules apply.
//  2. Digits separated by a white dot are consecutive; not all such dots are
//     shown, so there is no negative constraint on undotted pairs.
//  3. The indicated 60-cell white region contains one each of the twelve
//     standard pentominoes. The region is exactly 60 cells and the twelve
//     pentominoes cover 12 x 5 = 60, so they tile it: every white cell lies in
//     exactly one pentomino.
//  4. Each pentomino contains exactly one given digit, and that digit is the
//     number of cells of the pentomino 'seen' orthogonally from that cell,
//     itself included.
//  5. Each pentomino behaves like a 5-cell killer cage: its digits do not
//     repeat and sum to F=30, I=26, L=24, N=17, P=33, T=17, U=15, V=25, W=26,
//     X=25, Y=23, Z=31.
// Nothing is omitted.
//
// Rule 4's 'seen' is read as a sight line cast along the pentomino's own body:
// from the given cell, each of the four orthogonal rays advances while the next
// cell is part of the same pentomino and stops at the first cell that is not.
// The puzzle's title ("Pentomino Sight Lines") and the ray language of "seen
// orthogonally from that position" are what fix this over the weaker reading
// that counts every pentomino cell sharing the given's row or column whether or
// not the pentomino connects it to the given.
//
// Rules 3 and 4 are pure geometry -- the region, the pentomino shapes, the
// given cells and the given digits are all fixed before any digit is placed --
// so the legal placements are a finite list this script builds rather than
// state the solver must discover. Every orientation of every pentomino that
// fits inside the white region, holds exactly one given, and whose sight count
// from that given equals the given's digit is one candidate placement; there
// are 230. A boolean flag per placement (1 = unused, 2 = used) lets the solver
// choose the tiling: one Sum per white cell forces exactly one covering
// placement to be used, one Sum per letter forces that letter to be used once,
// and rule 5's Cage is attached to each placement through an Or that is
// satisfied for free while the placement's flag is unused.

const NUM_VALUES = 9;
const GRID = 9;

// The 21 grey cells drawn as 1x1 background squares; the white region of rule 3
// is the rest of the grid.
const GREY = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C8', 'R1C9',
  'R2C1', 'R2C9', 'R3C9', 'R4C9',
  'R5C5',
  'R6C1', 'R7C1', 'R8C1', 'R8C9',
  'R9C1', 'R9C2', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
];

// The 12 given digits, one per pentomino by rule 4.
const GIVENS = [
  ['R2C5', 5], ['R2C7', 3], ['R3C7', 4],
  ['R4C2', 3], ['R4C3', 4], ['R4C4', 5],
  ['R5C9', 4], ['R6C2', 5], ['R6C6', 4],
  ['R7C5', 3], ['R8C6', 5], ['R9C3', 5],
];

// The twelve standard (Golomb) pentominoes named in rule 3, drawn as ascii, and
// the killer totals rule 5 lists against each name.
const PENTOMINOES = {
  F: { sum: 30, art: ['.XX', 'XX.', '.X.'] },
  I: { sum: 26, art: ['XXXXX'] },
  L: { sum: 24, art: ['X.', 'X.', 'X.', 'XX'] },
  N: { sum: 17, art: ['.X', '.X', 'XX', 'X.'] },
  P: { sum: 33, art: ['XX', 'XX', 'X.'] },
  T: { sum: 17, art: ['XXX', '.X.', '.X.'] },
  U: { sum: 15, art: ['X.X', 'XXX'] },
  V: { sum: 25, art: ['X..', 'X..', 'XXX'] },
  W: { sum: 26, art: ['X..', 'XX.', '.XX'] },
  X: { sum: 25, art: ['.X.', 'XXX', '.X.'] },
  Y: { sum: 23, art: ['.X', 'XX', '.X', '.X'] },
  Z: { sum: 31, art: ['XX.', '.X.', '.XX'] },
};

const whiteCells = new Set();
for (let row = 1; row <= GRID; row++) {
  for (let col = 1; col <= GRID; col++) {
    const id = makeCellId(row, col);
    if (!GREY.includes(id)) whiteCells.add(id);
  }
}

const givenDigit = new Map(GIVENS);

// Pentominoes are free pieces: rotations and reflections of the ascii art are
// the same named piece, so each art is expanded to its distinct orientations.
const orientations = (art) => {
  const key = (offsets) => offsets.map(([r, c]) => `${r},${c}`).sort().join(' ');
  const normalize = (offsets) => {
    const minRow = Math.min(...offsets.map(([r]) => r));
    const minCol = Math.min(...offsets.map(([, c]) => c));
    return offsets.map(([r, c]) => [r - minRow, c - minCol]);
  };
  let current = [];
  art.forEach((line, r) => {
    [...line].forEach((ch, c) => { if (ch === 'X') current.push([r, c]); });
  });
  const seen = new Map();
  for (let i = 0; i < 4; i++) {
    current = normalize(current.map(([r, c]) => [c, -r]));  // rotate 90 degrees
    const mirror = normalize(current.map(([r, c]) => [r, -c]));
    for (const shape of [current, mirror]) seen.set(key(shape), shape);
  }
  return [...seen.values()];
};

// Rule 4's sight count for a candidate placement: 1 for the given cell itself
// plus, along each orthogonal ray, the run of consecutive cells that are also
// in the placement.
const sightCount = (placement, givenId) => {
  const { row, col } = parseCellId(givenId);
  let count = 1;
  for (const [dRow, dCol] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    for (let r = row + dRow, c = col + dCol; ; r += dRow, c += dCol) {
      if (r < 1 || r > GRID || c < 1 || c > GRID) break;
      if (!placement.has(makeCellId(r, c))) break;
      count++;
    }
  }
  return count;
};

// One entry per legal placement: which letter it is and which cells it covers.
const placements = [];
for (const [letter, { art }] of Object.entries(PENTOMINOES)) {
  for (const offsets of orientations(art)) {
    const height = Math.max(...offsets.map(([r]) => r)) + 1;
    const width = Math.max(...offsets.map(([, c]) => c)) + 1;
    for (let row = 1; row + height - 1 <= GRID; row++) {
      for (let col = 1; col + width - 1 <= GRID; col++) {
        const cells = offsets.map(([r, c]) => makeCellId(row + r, col + c));
        if (!cells.every(id => whiteCells.has(id))) continue;
        const givensInside = cells.filter(id => givenDigit.has(id));
        if (givensInside.length !== 1) continue;
        const givenId = givensInside[0];
        if (sightCount(new Set(cells), givenId) !== givenDigit.get(givenId)) continue;
        placements.push({ letter, cells });
      }
    }
  }
}

const flags = new Var('P', 'pentomino placement used', placements.length);
const flagCell = (index) => flags.cell(index + 1);

// A flag reads 1 when its placement is unused and 2 when it is used. Var cells
// take any value in 1..9, and no separate domain constraint is needed: a Sum of
// n + 1 over n cells that are each at least 1 leaves exactly one unit of slack,
// so it forces one of them to 2 and the rest to 1. Every flag sits in the
// per-letter group below, so every flag is pinned to 1 or 2 by that Sum.
const exactlyOne = (cells) => new Sum(cells.length + 1, ...cells);

// Rule 3: every white cell is covered by exactly one used placement, and every
// letter is used exactly once.
const coverage = [...whiteCells].map(id => exactlyOne(
  placements.flatMap((p, i) => (p.cells.includes(id) ? [flagCell(i)] : []))));
const eachLetterOnce = Object.keys(PENTOMINOES).map(letter => exactlyOne(
  placements.flatMap((p, i) => (p.letter === letter ? [flagCell(i)] : []))));

// Rule 5, applied to a placement only while its flag says the placement is used:
// the Or is already satisfied by the flag being 1 in that case.
const cages = placements.map((p, i) => new Or([
  new Given(flagCell(i), 1),
  new Cage(PENTOMINOES[p.letter].sum, ...p.cells),
]));

return [
  new Shape('9x9'),
  ...GIVENS.map(([id, digit]) => new Given(id, digit)),
  // White dot: the small white circle drawn on the R5C1/R6C1 edge.
  new WhiteDot('R5C1', 'R6C1'),
  flags,
  ...coverage,
  ...eachLetterOnce,
  ...cages,
];
