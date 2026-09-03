// Title: Killer Caves
// Author: Stephen Mason
// Video: https://www.youtube.com/watch?v=-h37tMyYDwI
// Source: https://sudokupad.app/eaox36rsvw

// Normal Sudoku rules apply, with one given digit.
//
// Killer cages: digits in a cage sum to the total printed in its top-left cell
// where one is printed, and digits do not repeat within a cage. Two cages carry
// no printed total; both are single cells, so neither the sum nor the
// no-repeat clause says anything about them.
//
// Cave: every cell is either shaded or unshaded, and the unshaded cells are the
// cave.
//   - The cave is a single orthogonally connected group.
//   - No shaded cell is enclosed: every orthogonally connected group of shaded
//     cells reaches an edge of the grid. Any number of such groups is allowed.
//   - Every digit placed in a cage is a "cave clue": its cell is part of the
//     cave, and its digit counts the cells seen from that cell along its row and
//     its column, itself included, with shaded cells and the grid edge blocking
//     the view.
//   - Exactly one digit does not appear anywhere in the cave.
//
// Nothing is omitted.

const SHADED = 1;
const CAVE = 2;

const ABSENT = 1;
const PRESENT = 2;

const grid = cellGraph('9x9');

// The shading lives on an 11x11 overlay: the 9x9 grid inset in a one-cell frame
// whose cells are pinned to SHADED. "Every shaded group reaches an edge of the
// grid" is then exactly "the shaded cells plus the frame form a single
// orthogonally connected region", which ConnectedValues states directly. Over
// the bare 9x9 the same constraint would instead force one shaded group, which
// the rule does not ask for.
const framedGrid = cellGraph('11x11');
const shade = framedGrid.makeOverlay('VS');
const innerShade = shade.at(framedGrid.block('R2C2', 9, 9));
const shadeOf = new Map(grid.cells().map((cell, i) => [cell, innerShade[i]]));
const insetCells = new Set(innerShade);
const frameCells = shade.cells().filter(cell => !insetCells.has(cell));

// Drawn data: the nine killer cages, each as its printed total (null where the
// cage prints none) and its cells.
const cages = [
  [null, ['R1C1']],
  [21, ['R1C4', 'R2C4', 'R2C5', 'R3C5', 'R3C6']],
  [14, ['R1C8', 'R1C9']],
  [13, ['R4C1', 'R4C2']],
  [14, ['R5C7', 'R6C6', 'R6C7', 'R7C7']],
  [9, ['R8C2', 'R8C3']],
  [null, ['R9C1']],
  [8, ['R9C4', 'R9C5']],
  [6, ['R9C7', 'R9C8']],
];

const cageConstraints = cages.flatMap(([total, cells]) => {
  if (total !== null) return [new Cage(total, ...cells)];
  // No printed total, so only the no-repeat clause is left, and it is empty on
  // a one-cell cage.
  return cells.length > 1 ? [new AllDifferent(...cells)] : [];
});

// The cave clues are the cells the cages cover.
const clueCells = cages.flatMap(([, cells]) => cells);

// One machine per cave clue. The first segment is the clue's own digit, then
// each of the four rays leading away from it, read over the shade overlay.
// `target` is the clue digit, `count` the ray cells seen so far, and `blocked`
// records that this ray has already reached a shaded cell, so nothing beyond it
// is visible; the break between segments starts the next ray with sight
// restored. The clue counts itself, so the rays must supply exactly
// `target - 1` cells; passing that is a dead branch, which also bounds `count`.
// The clue cell's own shade is not read here -- it is pinned to CAVE below.
//
// The rules sentence "the total count of cells connected vertically and
// horizontally to the numbered cell including the cell itself" is read as this
// sightline count rather than as the size of the cave region holding the clue,
// or as the clue's orthogonal neighbours plus itself. Both of those are
// arithmetically impossible against the printed cages: under the region-size
// reading every clue carries the cave's size, so the two clues of the 6-cage
// R9C7+R9C8 would be equal and the cage's no-repeat clause fails; under the
// neighbours reading no clue exceeds 5, and R1C8+R1C9 = 14 cannot be reached by
// two distinct digits of at most 5.
const sightSpec = NFA.encodeSpec({
  startState: { target: 0, count: 0, blocked: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { target: state.target, count: state.count, blocked: false };
    }
    if (state.target === 0) return { target: value, count: 0, blocked: false };
    if (state.blocked || value !== CAVE) {
      return { target: state.target, count: state.count, blocked: true };
    }
    const count = state.count + 1;
    if (count >= state.target) return undefined;
    return { target: state.target, count: count, blocked: false };
  },
  accept: (state) => state.target !== 0 && state.count === state.target - 1,
  maxDepth: 21,   // 17 cells (the clue and its two full lines) plus 4 breaks
}, 9, { multiSegment: true });

const RAY_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const sightCounts = clueCells.map(cell => new NFA(
  sightSpec, 'sight', [cell],
  ...RAY_DIRECTIONS
    .map(([dRow, dCol]) => grid.ray(cell, dRow, dCol).slice(1)
      .map(rayCell => shadeOf.get(rayCell)))
    .filter(ray => ray.length)));

// One flag cell per digit, ABSENT or PRESENT, recording whether that digit
// appears anywhere in the cave.
const digitFlags = new Var('D', 'digit-in-cave', 9);

// One machine per digit, reading that digit's flag and then every grid cell
// paired with its own shade cell. `pend` remembers that the digit just read was
// this machine's digit, so the shade cell that follows decides whether that
// occurrence lies in the cave, and `found` records that some occurrence did.
// Accepting only when `found` agrees with the flag forces the flag both ways.
const presenceSpec = (digit) => NFA.encodeSpec({
  startState: { phase: 'flag', flag: 0, pend: false, found: false },
  transition: (state, value) => {
    switch (state.phase) {
      case 'flag':
        if (value !== ABSENT && value !== PRESENT) return undefined;
        return { phase: 'digit', flag: value, pend: false, found: false };
      case 'digit':
        return {
          phase: 'shade', flag: state.flag,
          pend: value === digit, found: state.found,
        };
      case 'shade':
        if (value !== SHADED && value !== CAVE) return undefined;
        return {
          phase: 'digit', flag: state.flag, pend: false,
          found: state.found || (state.pend && value === CAVE),
        };
      default:
        return undefined;
    }
  },
  accept: (state) =>
    state.phase === 'digit' && state.found === (state.flag === PRESENT),
  maxDepth: 163,   // the flag, then each of the 81 cells with its shade cell
}, 9);

const gridAndShade = grid.cells().flatMap(cell => [cell, shadeOf.get(cell)]);

const digitPresence = digitFlags.cells().map((flag, i) => new NFA(
  presenceSpec(i + 1), `digit${i + 1}-in-cave`, flag, ...gridAndShade));

return [
  new Shape('9x9'),
  new Given('R7C4', 8),

  shade.toVar('shade'),
  // The shaded/cave domain is stamped over the whole layer, frame included, so
  // the frame pins and the clue pins narrow it rather than replace it.
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, CAVE)),
  shade.makeReplicate(new Given(shade.cells()[0], SHADED), frameCells),

  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', CAVE),

  ...cageConstraints,
  ...clueCells.map(cell => new Given(shadeOf.get(cell), CAVE)),
  ...sightCounts,

  digitFlags,
  ...digitFlags.cells().map(flag => new Given(flag, ABSENT, PRESENT)),
  ...digitPresence,
  // Nine flags, each 1 or 2, summing to 17: eight are PRESENT, so exactly one
  // digit is absent from the cave.
  new Sum(17, ...digitFlags.cells()),
];
