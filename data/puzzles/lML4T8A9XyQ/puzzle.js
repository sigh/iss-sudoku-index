// Title: Shikaku Killer
// Author: Ennead
// Video: https://www.youtube.com/watch?v=lML4T8A9XyQ
// Source: https://sudokupad.app/vhpyfwlo56

// Rules encoded here, in full:
//  - Normal sudoku.
//  - The whole grid is divided into axis-aligned rectangles; each rectangle
//    contains exactly one circle and exactly one cell marked '?'.
//  - The digit in a circle is the number of cells in its rectangle.
//  - Digits do not repeat within a rectangle.
//  - Every rectangle's digits sum to 10, 20, 30, or X, where the single value
//    X is chosen by the solver and shared by every rectangle that is not
//    10, 20 or 30.
// Nothing is omitted.

const SIZE = 9;

// Drawn clues: the cells carrying a white circle, and the cells printed '?'.
const circleCells = [
  'R1C1', 'R2C3', 'R3C1', 'R4C2', 'R4C9', 'R5C5', 'R8C5', 'R9C1', 'R7C4',
  'R6C3', 'R5C8', 'R6C2', 'R3C5', 'R1C8', 'R7C8', 'R9C7', 'R5C6',
];
const questionCells = [
  'R9C6', 'R9C9', 'R5C4', 'R1C5', 'R4C7', 'R8C8', 'R6C1', 'R1C4', 'R4C1',
  'R4C3', 'R6C4', 'R8C9', 'R1C6', 'R3C9', 'R7C6', 'R8C2', 'R2C2',
];
const circles = new Set(circleCells);
const questions = new Set(questionCells);

// The division is modelled as an exact cover by candidate rectangles: every
// axis-aligned rectangle a division rectangle could possibly be. Two rules cut
// the 2025 rectangles of a 9x9 grid down to a few hundred:
//  - area <= SIZE, because digits do not repeat inside a rectangle;
//  - exactly one circle and exactly one '?' inside it.
const candidates = [];
for (let h = 1; h <= SIZE; h++) {
  for (let w = 1; h * w <= SIZE; w++) {
    for (let r = 1; r + h - 1 <= SIZE; r++) {
      for (let c = 1; c + w - 1 <= SIZE; c++) {
        const cells = [];
        for (let i = 0; i < h; i++) {
          for (let j = 0; j < w; j++) cells.push(makeCellId(r + i, c + j));
        }
        const inCircles = cells.filter((id) => circles.has(id));
        const inQuestions = cells.filter((id) => questions.has(id));
        if (inCircles.length === 1 && inQuestions.length === 1) {
          candidates.push({ cells, circle: inCircles[0], area: h * w });
        }
      }
    }
  }
}

// One flag cell per candidate rectangle: 2 = this rectangle is used in the
// division, 1 = it is not. The per-rectangle Or below is what confines each
// flag to those two values.
const USED = 2;
const UNUSED = 1;
const rectVar = new Var('S', 'rectangle used', candidates.length);
const rectFlag = (i) => rectVar.cell(i + 1);

// "Divide the entire grid": every cell is in exactly one used rectangle.
// With flags valued 1/2, the flags covering a cell sum to (count + 1) exactly
// when one of them is 2.
const coverage = new Map();
for (let i = 0; i < candidates.length; i++) {
  for (const id of candidates[i].cells) {
    if (!coverage.has(id)) coverage.set(id, []);
    coverage.get(id).push(rectFlag(i));
  }
}
const exactCover = [...coverage.values()].map(
  (flags) => new Sum(flags.length + 1, ...flags));

// X is written in base 9 over two var cells: X = 9*(VX1-1) + (VX2-1). Each
// digit is in 0..8, so every X in 0..80 has exactly one representation and the
// pair carries no spare freedom. A rectangle summing to X therefore satisfies
// sum - 9*VX1 - VX2 = -10.
const xVar = new Var('X', 'fourth rectangle total, base 9', 2);
const xSumOffset = -10;
const xSumTerms = [[xVar.cell(1), -9], [xVar.cell(2), -1]];

// Per candidate rectangle: either it is unused, or it satisfies every rule a
// division rectangle must satisfy. Cage supplies both "digits do not repeat"
// and the total; the fourth branch is the same set with the solver-chosen X.
const rectRules = candidates.map((cand, i) => new Or([
  new Given(rectFlag(i), UNUSED),
  new And([
    new Given(rectFlag(i), USED),
    new Given(cand.circle, cand.area),
    new Or([
      new Cage(10, ...cand.cells),
      new Cage(20, ...cand.cells),
      new Cage(30, ...cand.cells),
      new And([
        new AllDifferent(...cand.cells),
        new Sum(xSumOffset, ...cand.cells, ...xSumTerms),
      ]),
    ]),
  ]),
]));

return [
  new Shape('9x9'),
  rectVar,
  xVar,
  ...exactCover,
  ...rectRules,
];
