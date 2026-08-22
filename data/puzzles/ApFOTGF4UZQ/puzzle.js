// Title: Wall Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=ApFOTGF4UZQ
// Source: https://app.crackingthecryptic.com/sudoku/j87R9nmNNP

// Standard row/column/box Sudoku. Four boxes are shaded grey purely for visual
// contrast; all nine boxes are ordinary Sudoku boxes, so no region constraint
// beyond the default is needed.
//
// "Place a wall between all orthogonally adjacent cells that contain
// consecutive digits" names what a wall means (it marks a consecutive
// adjacent pair): every consecutive pair has one, drawn or not. Only "some
// walls are already given" -- unlike the circled digits, the rules never say
// all such walls are shown, so an undrawn edge is not asserted non-consecutive.
// Each drawn wall below is simply a positive given: those cells are
// consecutive, i.e. `WhiteDot`. The rest of the grid's wall positions are
// exactly its consecutive pairs, which the sight-count rule below reads
// directly off the digits.
//
// "A circled digit indicates how many cells it can see..." -- the source's
// circles carry no printed number anywhere, so the circled digit is read as
// the cell's own solution digit; the circle only flags that this cell's digit
// must equal its own sight count.

const graph = cellGraph('9x9');

// Drawn walls (wall-chain geometry). Each already asserts its member cells
// hold consecutive digits.
const givenWalls = [
  ['R1C1', 'R1C2', 'R2C2'], // one bent wall stroke: R1C1|R1C2 and R1C2|R2C2
  ['R2C3', 'R2C4'],
  ['R3C8', 'R4C8'],
  ['R1C9', 'R2C9'],
];
const givenWallConstraints = givenWalls.map(cells => new WhiteDot(...cells));

// Circled cells (plain circle outline, no printed digit). Not necessarily all
// sight-count circles are given.
const circledCells = [
  'R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C2', 'R4C4', 'R6C1', 'R9C1', 'R9C3',
  'R8C6', 'R1C5', 'R4C7', 'R2C8', 'R1C8', 'R1C9',
];

// One NFA per circled cell: the origin cell, then one segment per compass
// direction that has at least one cell (omitted at a grid edge), walking
// outward. `broken` tracks whether the view has already been blocked in the
// current ray; it resets at each SEGMENT_BREAK because every ray restarts
// from the circled cell. Digits are consumed via `prev`/`value`: a
// consecutive jump between successively-visible cells is the wall which
// blocks everything past it in that ray (same relation as the wall rule
// above, so the two rules agree by construction -- no wall Var is needed).
// `sum` accumulates seen ray cells (excluding the origin), clamped at 9 since
// the origin digit -- the target -- can never exceed 9.
const sightSpec = NFA.encodeSpec({
  startState: { origin: null, sum: 0, broken: false, prev: null },
  transition: (state, value) => {
    const { origin, sum, broken, prev } = state;
    if (value === SEGMENT_BREAK) {
      return { origin, sum, broken: false, prev: origin };
    }
    if (origin === null) {
      // First symbol consumed is the circled cell itself.
      return { origin: value, sum: 0, broken: false, prev: value };
    }
    if (broken) return state;
    if (Math.abs(value - prev) === 1) {
      // Wall right here: this cell, and the rest of the ray, are not seen.
      return { origin, sum, broken: true, prev };
    }
    return { origin, sum: Math.min(sum + 1, 9), broken: false, prev: value };
  },
  accept: (state) => state.origin !== null && state.sum + 1 === state.origin,
}, 9, { multiSegment: true });

const sightConstraints = circledCells.map(cell => {
  const rays = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    .map(([dr, dc]) => graph.ray(cell, dr, dc).slice(1))
    .filter(ray => ray.length > 0);
  return new NFA(sightSpec, `sight ${cell}`, [cell], ...rays);
});

return [
  new Shape('9x9'),
  ...givenWallConstraints,
  ...sightConstraints,
];
