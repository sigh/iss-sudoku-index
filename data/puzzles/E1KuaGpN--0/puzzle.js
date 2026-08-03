// Title: DIY Arrows
// Author: sophmayrob
// Video: https://www.youtube.com/watch?v=E1KuaGpN--0
// Source: https://app.crackingthecryptic.com/sudoku/tpjLQ6BhQ7

// Rules encoded here:
//  - Normal sudoku.
//  - Anti-knight: cells a knight's move apart cannot repeat.
//  - Grey dot: the two cells either side are consecutive OR in a 2:1 ratio
//    (WhiteDot's relation or BlackDot's relation, not necessarily both true).
//  - DIY arrows: 8 circles are drawn (never a digit), but their arrows are
//    not drawn. Each circle's arrow is exactly 3 cells long, orthogonally
//    connected and self-avoiding, must stay entirely within columns
//    1,2,3,7,8,9 (whichever of the two column-bands is on the circle's own
//    side, since the bands are separated by the forbidden columns and a
//    connected path cannot cross them), and the arm digits must sum to the
//    digit placed in the circle cell. Arrows may cross on the page but may
//    not occupy the same cell.
// OMITTED: that the arm additionally touches the circle's own cell. That
// requirement is not in the rules text -- it is the standard arrow-sudoku
// convention -- and combined with anti-knight and R5C5's given it makes the
// puzzle unsatisfiable (checked exhaustively), so it is left out and every
// 3-cell connected shape within the circle's own band is a candidate
// regardless of whether it reaches the circle.
// The 27-cell no-total region drawn over columns 4-6 exactly matches the
// columns the rules forbid arrows from entering; the rules never mention a
// cage there and 27 cells cannot be a real all-different cage (only 9
// digits exist), so it is a background highlight, not a constraint -- and
// is deliberately left unencoded.

const graph = cellGraph('9x9');

// The 8 drawn circles: white, grey-bordered, no digit shown.
const circles = [
  'R3C4', 'R6C4', 'R4C4', 'R8C4',
  'R4C6', 'R7C6', 'R6C6', 'R2C6',
];

// The 4 drawn grey dots, each on the edge between the two listed cells.
const greyDotEdges = [
  ['R1C1', 'R2C1'],
  ['R1C8', 'R2C8'],
  ['R9C1', 'R9C2'],
  ['R9C8', 'R9C9'],
];

// Rule: "Arrows can only extend into columns 123789 of the sudoku."
const ARROW_COLS = new Set([1, 2, 3, 7, 8, 9]);
const inArrowCols = (cell) => ARROW_COLS.has(parseCellId(cell).col);
// The two halves of ARROW_COLS: a connected path can never cross the
// forbidden columns 4-6 to get from one half to the other, so every arm
// stays entirely on the same side as its circle.
const bandOf = (cell) => (parseCellId(cell).col <= 3 ? 'L' : 'R');

// Every 3-cell orthogonally-connected, self-avoiding shape that fits inside
// one column-band (cols 1-3, or cols 7-9), deduplicated by cell set. Built
// once per band and shared by every circle on that side (see the OMITTED
// note above for why this does not also require touching the circle).
const armsByBand = { L: [], R: [] };
{
  const seen = { L: new Set(), R: new Set() };
  for (const start of graph.cells().filter(inArrowCols)) {
    const band = bandOf(start);
    for (const second of graph.neighbours(start)) {
      if (!inArrowCols(second) || bandOf(second) !== band) continue;
      for (const third of graph.neighbours(second)) {
        if (third === start) continue;
        if (!inArrowCols(third) || bandOf(third) !== band) continue;
        const key = [start, second, third].sort().join(',');
        if (seen[band].has(key)) continue;
        seen[band].add(key);
        armsByBand[band].push([start, second, third]);
      }
    }
  }
}
const candidateArms = (circle) =>
  armsByBand[bandOf(graph.neighbours(circle).filter(inArrowCols)[0])];

const arms = circles.map(candidateArms);

// Label overlay: every cell carries the label of the arm covering it, so two
// arms can never claim the same cell ("may not share cells") -- a cell in
// both would need two labels at once. Circles whose candidate arms can never
// meet (the left-band and right-band circles are always disjoint from each
// other) may safely reuse a label; colour the conflict graph greedily to
// find how few labels are actually needed.
const armSets = arms.map(list => list.map(cells => new Set(cells)));
const canMeet = (i, j) => armSets[i].some(
  a => armSets[j].some(b => [...b].some(cell => a.has(cell))));
const conflicts = circles.map((_, i) => circles.map((_, j) => i !== j && canMeet(i, j)));
const degrees = conflicts.map(row => row.filter(Boolean).length);
const labels = new Array(circles.length);
for (const i of circles.map((_, i) => i).sort((a, b) => degrees[b] - degrees[a])) {
  const used = new Set(conflicts[i].map((meets, j) => meets ? labels[j] : null));
  let label = 1;
  while (used.has(label)) label++;
  labels[i] = label;
}
const numLabels = Math.max(...labels);
if (numLabels > 9) throw new Error(`need ${numLabels} arm labels, only 9 fit`);

const armOwner = graph.makeOverlay('VA');

return [
  new Shape('9x9'),
  armOwner.toVar('ArmOwner'),

  new Given('R5C5', 5),

  new AntiKnight(),

  ...greyDotEdges.map(([a, b]) => new Or([new WhiteDot(a, b), new BlackDot(a, b)])),

  // Pick one arm per circle: it ties the arm's sum to the circled digit and
  // stamps its label on the 3 arm cells, so a conflicting choice on another
  // circle's arm is rejected by the label overlay above.
  ...circles.map((circle, i) => new Or(
    arms[i].map(cells => new And([
      new Arrow(circle, ...cells),
      ...cells.map(cell => new Given(armOwner.at(cell), labels[i])),
    ]))
  )),
];
