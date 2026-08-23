// Title: Shady Equation
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=ql2VGullPRA
// Source: https://sudokupad.app/eep49o4qx6

// Rules encoded here, in full:
//   - Normal 6x6 sudoku (the engine's default rows, columns and 2x3 boxes).
//   - Yin Yang: the shaded cells form one orthogonally connected area, the
//     unshaded cells form one orthogonally connected area, and no 2x2 area of
//     the grid is entirely shaded or entirely unshaded.
//   - Counting Yin Yang: a digit in a shaded cell shows how many times that
//     digit appears in shaded cells.
//   - Quadruples: a digit in a circle appears in the surrounding 2x2 square,
//     twice over if the circle prints it twice.
// Nothing is omitted. There are no given digits.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('6x6');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// The shading is solver state: one Var per grid cell, holding SHADED/UNSHADED.
const shade = graph.makeOverlay('YY');

// Counting Yin Yang, one machine per digit. The rule only speaks about digits
// that occupy a shaded cell, so the shaded count of `digit` is either `digit`
// (some shaded cell holds it) or zero (none does).
// The scan reads the whole grid as [grid cell, its shade] pairs:
//   phase 0 - the next symbol is a grid digit;
//   phase 1 - the next symbol is the shade of a cell not holding `digit`;
//   phase 2 - the next symbol is the shade of a cell holding `digit`.
// `count` is the shaded occurrences so far; exceeding `digit` can no longer
// reach an accepting count, so that branch is dropped rather than counted on.
function shadedCountRule(digit) {
  const machine = NFA.encodeSpec({
    startState: { phase: 0, count: 0 },
    transition: ({ phase, count }, value) => {
      if (phase === 0) return { phase: value === digit ? 2 : 1, count };
      const next = count + (phase === 2 && value === SHADED ? 1 : 0);
      return next > digit ? undefined : { phase: 0, count: next };
    },
    accept: ({ phase, count }) => phase === 0 && (count === 0 || count === digit),
  }, geometry.numValues);
  return new NFA(machine, `shaded-${digit}s`,
    ...gridCells.flatMap(cell => [cell, shade.at(cell)]));
}
const countingYinYang = Array.from(
  { length: geometry.numValues }, (_, i) => shadedCountRule(i + 1));

// The five drawn circles, each keyed by the top-left cell of the 2x2 square it
// sits on, with the digits printed inside it.
const quadruples = [
  new Quad('R2C2', 1, 1, 6, 6),
  new Quad('R2C4', 2, 3, 4),
  new Quad('R3C3', 2, 3),
  new Quad('R4C2', 2, 3, 4),
  new Quad('R4C4', 1, 3, 4),
];

return [
  new Shape('6x6'),
  new YinYang(),
  ...countingYinYang,
  ...quadruples,
];
