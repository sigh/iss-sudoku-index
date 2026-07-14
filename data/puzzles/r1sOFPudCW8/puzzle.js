// Title: All Arrows Are Given
// Author: Kainapple
// Video: https://www.youtube.com/watch?v=r1sOFPudCW8
// Source: https://sudokupad.app/5y1anz3kmc

// Normal 6x6 sudoku, plus three drawn arrows (values along the arrow sum to
// the circled cell). The twist clause: these are the only straight,
// never-bending up/down/left/right arrows that could validly be drawn
// anywhere on the finished grid -- even overlapping the drawn arrows or
// their circles -- so every other candidate cell/direction/run must NOT sum
// to that cell's own value.

const graph = cellGraph('6x6');

// The three arrows actually drawn: circle cell first, then the arm cells
// that sum to it.
const arrows = [
  ['R2C2', 'R2C3', 'R2C4', 'R2C5'],
  ['R1C4', 'R2C4', 'R3C4'],
  ['R6C2', 'R6C3', 'R6C4'],
];
const arrowKeys = new Set(arrows.map(cells => cells.join(',')));

// Every candidate straight run of a circle cell plus >=2 arm cells, in one
// row or column, in either direction along it. A 1-cell arm is skipped: its
// "sum" is just that single cell's value, which can never equal the circle
// cell's value anyway since the two cells always share a row or column
// (ordinary Sudoku all-different) -- so a length-1 run could never be a real
// arrow, and asserting inequality for it would be redundant, not a rule.
function candidateRuns(line) {
  const n = line.length;
  const runs = [];
  for (let i = 0; i < n; i++) {
    for (const dir of [1, -1]) {
      const maxLen = dir === 1 ? n - 1 - i : i;
      for (let len = 2; len <= maxLen; len++) {
        const arm = [];
        for (let k = 1; k <= len; k++) arm.push(line[i + dir * k]);
        runs.push([line[i], ...arm]);
      }
    }
  }
  return runs;
}

const allCandidates = [...graph.rows(), ...graph.columns()].flatMap(candidateRuns);

// Reads (circle, arm1, arm2, ...): remembers the circle's value as `target`,
// accumulates the arm sum, and accepts only when that sum does NOT equal the
// target -- i.e. this candidate run is not a valid arrow. The running sum is
// clamped at target+1 (a "already overshot" sink) once it exceeds the
// target, since arm digits are positive and it can then never come back down
// to equal it -- this bounds the compiled state count.
const notArrowMachine = NFA.encodeSpec({
  startState: { target: null, sum: 0 },
  transition: ({ target, sum }, value) => {
    if (target === null) return { target: value, sum: 0 };
    return { target, sum: Math.min(sum + value, target + 1) };
  },
  accept: ({ target, sum }) => sum !== target,
}, 6);

const notArrows = allCandidates
  .filter(cells => !arrowKeys.has(cells.join(',')))
  .map(cells => new NFA(notArrowMachine, 'not-arrow', ...cells));

return [
  new Shape('6x6'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...notArrows,
];
