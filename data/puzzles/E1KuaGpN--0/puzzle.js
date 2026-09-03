// Title: DIY Arrows
// Author: sophmayrob
// Video: https://www.youtube.com/watch?v=E1KuaGpN--0
// Source: https://app.crackingthecryptic.com/sudoku/tpjLQ6BhQ7

// Rules encoded here:
//   Normal sudoku rules apply.
//   Cells separated by a knight's move (in chess) cannot contain the same digit.
//   Cells separated by a grey dot contain digits that are either consecutive or
//   in a 2:1 ratio.
//   Standard arrow sudoku rules apply: digits along an arrow sum to the digit in
//   that arrow's circle. The eight circles are drawn but the arrows are not: the
//   solver draws them. Each arrow is exactly 3 cells long (4 including the
//   circle), arrows may only extend into columns 1, 2, 3, 7, 8, 9, and arrows
//   may cross each other but may not share cells.
// Nothing is omitted. The drawn no-total cage around all 27 cells of columns
// 4-6 is an annotation of the band arrows may not enter -- 27 cells cannot be
// mutually distinct on a 9x9 grid -- and the rules give it no clue of its own.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// The eight drawn circles (arrow bulbs), all in columns 4 and 6.
const circles = [
  'R3C4', 'R4C4', 'R6C4', 'R8C4',
  'R2C6', 'R4C6', 'R6C6', 'R7C6',
];

// The four grey dots, as the cell pairs they are drawn between.
const greyDots = [
  ['R1C1', 'R2C1'],
  ['R1C8', 'R2C8'],
  ['R9C1', 'R9C2'],
  ['R9C8', 'R9C9'],
];

// Grey dot: consecutive, or one digit twice the other.
const greyDotKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) === 1 || a === 2 * b || b === 2 * a, shape);

const ARM_LENGTH = 3;                                 // "exactly 3 cells long"
const ARM_COLUMNS = new Set([1, 2, 3, 7, 8, 9]);      // "columns 123789"

// An arm steps from cell to cell in any of the eight king directions. The rules
// let two arrows cross without sharing a cell, and chains of orthogonal steps
// through cell centres cannot cross without meeting in a cell, so the steps are
// diagonal as well as orthogonal.
const armNeighbours = (cell) => graph.kingNeighbours(cell).filter(
  next => ARM_COLUMNS.has(parseCellId(next).col));

// Every self-avoiding three-cell arm that could leave a circle: the first cell
// adjacent to the circle, each later cell adjacent to the one before it. A
// column-4 circle has no permitted neighbour outside column 3 and a column-6
// circle none outside column 7, so each arm stays within its own outer band.
function candidateArms(circle) {
  const arms = [];
  const extend = (arm, last) => {
    if (arm.length === ARM_LENGTH) {
      arms.push(arm);
      return;
    }
    for (const next of armNeighbours(last)) {
      if (arm.includes(next)) continue;
      extend([...arm, next], next);
    }
  };
  extend([], circle);
  return arms;
}

const armsByCircle = circles.map(candidateArms);   // 68-87 arms per circle

// Which arrow a cell belongs to: NO_ARROW, or NO_ARROW + 1 + the arrow's index.
// One value per cell, so a cell can lie on at most one arm, which is the
// "may not share cells" half of the crossing rule.
const NO_ARROW = 1;
const arrows = graph.makeOverlay('VA');

// A cell may only be labelled with an arrow that has some arm through it.
const labelDomains = graph.cells().map(cell => new Given(
  arrows.at(cell),
  NO_ARROW,
  ...armsByCircle.flatMap(
    (arms, i) => arms.some(arm => arm.includes(cell))
      ? [NO_ARROW + 1 + i] : [])));

// One disjunction per circle, over that circle's candidate arms. A branch
// labels its own arm's cells and, via ContainExact, caps the label's total
// count at three, so no cell off the chosen arm carries the label; the label
// domains above then leave every remaining cell at NO_ARROW.
const arrowChoices = armsByCircle.map((arms, i) => {
  const value = NO_ARROW + 1 + i;
  const reachable = arrows.at(graph.cells().filter(
    cell => arms.some(arm => arm.includes(cell))));
  return new Or(arms.map(arm => new And([
    ...arrows.at(arm).map(cell => new Given(cell, value)),
    new ContainExact(Array(ARM_LENGTH).fill(value).join('_'), ...reachable),
    new Arrow(circles[i], ...arm),
  ])));
});

return [
  shape,
  arrows.toVar('arrow'),
  new Given('R5C5', 5),
  new AntiKnight(),
  ...greyDots.map(([a, b]) => new Pair(greyDotKey, 'grey', a, b)),
  ...labelDomains,
  ...arrowChoices,
];
