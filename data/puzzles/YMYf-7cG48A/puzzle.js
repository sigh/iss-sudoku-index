// Title: YYSL Knights
// Author: Blobz
// Video: https://www.youtube.com/watch?v=YMYf-7cG48A
// Source: https://app.crackingthecryptic.com/sudoku/2QrQPp6qPp

// Normal sudoku (standard boxes, no givens). Shade some cells: shaded cells
// form one orthogonally-connected region, unshaded cells form another, and no
// 2x2 area is monochrome. White dots mark a shade border between their two
// cells and (independently) that the two digits are consecutive; undrawn
// borders/non-consecutive pairs carry no information ("not all possible dots
// are shown"). Cells a knight's move apart differ. Cells drawn with a plain
// (no-total) single-cell cage carry a digit equal to the count of
// orthogonally-visible cells sharing that cell's own colour, including
// itself, where the opposite colour blocks vision along a direction.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// Every rule below treats "shaded" and "unshaded" symmetrically (connectivity
// of both, a border/count that reads only "own colour" vs "the other
// colour"), so swapping the two labels everywhere yields the same physical
// partition under a different name -- a labelling symmetry, not a second
// answer. Canonicalize it, the same way an unknown-region label overlay is
// canonicalized, by fixing what "shaded" means: the partition containing
// R1C1.
const shadeCanonical = new Given(shade.cells()[0], SHADED);

// White dots, by drawn edge.
const dots = [
  ['R3C8', 'R3C9'],
  ['R3C8', 'R4C8'],
  ['R3C7', 'R3C8'],
  ['R3C6', 'R3C7'],
  ['R4C6', 'R4C7'],
  ['R4C8', 'R5C8'],
  ['R8C5', 'R8C6'],
  ['R9C4', 'R9C5'],
  ['R8C1', 'R8C2'],
];

// Each dot is consecutive digits, and its two cells take opposite shades
// (with two shades, "opposite" is just all-different).
const dotRules = dots.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new AllDifferent(...shade.at([a, b])),
]);

// Sight-count cells: single-cell, no-total cages.
const sightCells = [
  'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R7C4',
  'R2C1', 'R1C6', 'R1C2', 'R4C6', 'R3C8', 'R2C8', 'R2C7', 'R3C7',
  'R4C8', 'R2C4', 'R5C8', 'R9C8', 'R2C3', 'R4C3', 'R4C2',
];

// One Var per (sight cell, direction) holding that arm's run length + 1 (the
// +1 keeps the value inside the default 1-9 Var domain, since a 0-length arm
// is legal). DIRS lists [dRow, dCol, VarGroup].
const N = sightCells.length;
const armUp = new Var('AU', 'up-arm+1', N);
const armDown = new Var('AD', 'down-arm+1', N);
const armLeft = new Var('AL', 'left-arm+1', N);
const armRight = new Var('AR', 'right-arm+1', N);
const DIRS = [
  [-1, 0, armUp],
  [1, 0, armDown],
  [0, -1, armLeft],
  [0, 1, armRight],
];

// An arm's run length is measured relative to the clue's own (unknown)
// shade, not a fixed shade, so equality/inequality between the clue cell and
// each ray cell is expressed with SameValues/AllDifferent over their shade
// Vars rather than Given -- unlike a pill arrow whose two ends are each
// pinned to a known, fixed shade.
function armConstraint(cell, dRow, dCol, armVar) {
  // graph.ray(...) is inclusive of `cell`; drop it to get the outward ray.
  const ray = graph.ray(cell, dRow, dCol).slice(1);
  const maxLen = ray.length;
  const shadeCell = shade.at(cell);

  const branches = [];
  for (let k = 0; k <= maxLen; k++) {
    const clauses = [new Given(armVar, k + 1)];
    if (k > 0) {
      clauses.push(new SameValues(
        k + 1, shadeCell, ...shade.at(ray.slice(0, k))));
    }
    if (k < maxLen) {
      clauses.push(new AllDifferent(shadeCell, shade.at(ray[k])));
    }
    branches.push(new And(clauses));
  }
  return new Or(branches);
}

const sightRules = sightCells.flatMap((cell, i) => [
  ...DIRS.map(([dRow, dCol, armVarGroup]) =>
    armConstraint(cell, dRow, dCol, armVarGroup.cell(i + 1))),
  // digit = 1 (self) + sum of the four actual (unshifted) arm lengths, i.e.
  // digit - (armUp-1) - (armDown-1) - (armLeft-1) - (armRight-1) = 1.
  new Sum(-3, cell,
    [armUp.cell(i + 1), -1], [armDown.cell(i + 1), -1],
    [armLeft.cell(i + 1), -1], [armRight.cell(i + 1), -1]),
]);

return [
  new Shape('9x9'),
  new YinYang(),
  shadeCanonical,
  ...dotRules,
  new AntiKnight(),
  armUp, armDown, armLeft, armRight,
  ...sightRules,
];
