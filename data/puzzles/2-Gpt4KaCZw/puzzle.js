// Title: Region Sum Cages
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=2-Gpt4KaCZw
// Source: https://app.crackingthecryptic.com/sudoku/FB378fm267

// Normal Sudoku rules apply, with no given digits.
//
// Every cell is either grey (a wall) or green (the cave).
//   - Every orthogonally connected group of grey cells reaches the edge of the
//     grid.
//   - The green cells form a single orthogonally connected area.
//   - No 2x2 block of the grid is entirely grey.
//   - A number printed in a cell's top-left corner is the sum of the digits
//     seen from that cell looking north, south, east and west. Sight passes
//     over green cells and stops at the first grey cell or at the grid edge;
//     the clued cell counts its own digit once. A clued cell is green. Digits
//     may not repeat within one clue's field of vision.
//
// Omitted: "grey walls act as Region Sum lines: each wall (ie group of
// connected grey squares) must visit at least two boxes and the sum of the
// digits in each box must be equal." Neither half of that sentence is encoded.

const GREY = 1;    // wall
const GREEN = 2;   // cave

const grid = cellGraph('9x9');

// The shading lives on an 11x11 overlay: the 9x9 grid inset in a one-cell
// frame whose cells are pinned to GREY. "Every grey group is orthogonally
// connected to the edge" is then exactly "the grey cells plus the frame form a
// single orthogonally connected region", which ConnectedValues states directly;
// over the bare 9x9 it would instead force a single grey group.
const framedGrid = cellGraph('11x11');
const shade = framedGrid.makeOverlay('VS');
const innerShade = shade.at(framedGrid.block('R2C2', 9, 9));
const shadeOf = new Map(grid.cells().map((cell, i) => [cell, innerShade[i]]));
const insetCells = new Set(innerShade);
const frameCells = shade.cells().filter(cell => !insetCells.has(cell));

// Drawn data: the fourteen corner numbers, as [cell, clue text]. Three are
// drawn as inequalities rather than as an exact total, and are read at face
// value: the field-of-vision sum is strictly below / above the number.
const CLUES = [
  ['R2C3', '26'],
  ['R3C1', '<15'],
  ['R3C8', '32'],
  ['R4C3', '9'],
  ['R4C7', '27'],
  ['R5C2', '33'],
  ['R5C4', '34'],
  ['R5C6', '36'],
  ['R6C3', '10'],
  ['R7C1', '>30'],
  ['R7C7', '26'],
  ['R7C9', '11'],
  ['R9C1', '>35'],
  ['R9C9', '20'],
];

const RAY_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// Nine distinct digits is the most a field of vision can hold, so 45 is the
// largest total any clue can reach.
const MAX_TOTAL = 45;

// A clue text becomes a test on the total plus the largest total still worth
// tracking; sight only ever adds digits, so a partial sum already past the
// ceiling is a dead branch.
const readClue = (text) => {
  if (text.startsWith('<')) {
    const limit = Number(text.slice(1));
    return { test: (total) => total < limit, ceiling: limit - 1 };
  }
  if (text.startsWith('>')) {
    const limit = Number(text.slice(1));
    return { test: (total) => total > limit, ceiling: MAX_TOTAL };
  }
  const target = Number(text);
  return { test: (total) => total === target, ceiling: target };
};

const maskTotal = (mask) => {
  let total = 0;
  for (let digit = 1; digit <= 9; digit++) {
    if (mask & (1 << (digit - 1))) total += digit;
  }
  return total;
};

// One machine per clue. Segment 1 is the clued cell's own digit; each later
// segment is one ray, read as its cells' shade and digit alternately, nearest
// cell first. `mask` is the set of digits already in the field of vision,
// `blocked` records that the current ray has run into a wall so nothing
// further along it is seen, and `expect` says whether the next value is a
// shade or a digit. Repeating a digit is rejected as it happens ("within the
// field of vision of a clue, digits may not repeat"), which makes `mask` a
// faithful record of the seen digits and its digit total the clue's sum.
const makeSightSpec = (clue, maxDepth) => NFA.encodeSpec({
  startState: { mask: 0, blocked: false, expect: 'clue' },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { mask: state.mask, blocked: false, expect: 'shade' };
    }
    if (state.expect === 'clue') {
      return { mask: 1 << (value - 1), blocked: false, expect: 'shade' };
    }
    if (state.expect === 'shade') {
      if (value !== GREY && value !== GREEN) return undefined;
      return {
        mask: state.mask,
        blocked: state.blocked || value === GREY,
        expect: 'digit',
      };
    }
    if (state.blocked) {
      return { mask: state.mask, blocked: true, expect: 'shade' };
    }
    const bit = 1 << (value - 1);
    if (state.mask & bit) return undefined;
    const mask = state.mask | bit;
    if (maskTotal(mask) > clue.ceiling) return undefined;
    return { mask: mask, blocked: false, expect: 'shade' };
  },
  accept: (state) => state.expect !== 'clue' && clue.test(maskTotal(state.mask)),
  maxDepth: maxDepth,
}, 9, { multiSegment: true });

const sightCounts = CLUES.map(([cell, text]) => {
  const rays = RAY_DIRECTIONS
    .map(([dRow, dCol]) => grid.ray(cell, dRow, dCol).slice(1))
    .filter(ray => ray.length)
    .map(ray => ray.flatMap(rayCell => [shadeOf.get(rayCell), rayCell]));
  // Consumed symbols: the clued digit, one break before each ray, and two
  // values (shade then digit) per ray cell.
  const maxDepth = 1 + rays.length + rays.reduce((n, ray) => n + ray.length, 0);
  return new NFA(makeSightSpec(readClue(text), maxDepth), 'sight', [cell], ...rays);
});

// One machine per 2x2 block of the grid, over its four shade cells in reading
// order, rejecting an all-grey block. It is stamped by Replicate from the
// block at the overlay's first cell. The frame's own 2x2 blocks are
// deliberately not targets: the frame is all grey, so stamping the rule there
// would reject every shading.
const noGreySquareSpec = NFA.encodeSpec({
  startState: { greyCount: 0, seen: 0 },
  transition: (state, value) => {
    if (value !== GREY && value !== GREEN) return undefined;
    const greyCount = state.greyCount + (value === GREY ? 1 : 0);
    if (greyCount === 4) return undefined;
    return { greyCount: greyCount, seen: state.seen + 1 };
  },
  accept: (state) => state.seen === 4,
  maxDepth: 4,
}, 9);

const noGreySquares = shade.makeReplicate(
  new NFA(noGreySquareSpec, 'no-grey-2x2', ...shade.block(shade.cells()[0], 2, 2)),
  grid.cells()
    .filter(cell => grid.block(cell, 2, 2))
    .map(cell => shadeOf.get(cell)));

return [
  new Shape('9x9'),

  shade.toVar('shade'),
  // The grey/green domain is stamped over the whole layer, frame included, so
  // the frame pins and the clue pins narrow it rather than replace it.
  shade.makeReplicate(new Given(shade.cells()[0], GREY, GREEN)),
  shade.makeReplicate(new Given(shade.cells()[0], GREY), frameCells),

  new ConnectedValues('VS', GREY),
  new ConnectedValues('VS', GREEN),

  noGreySquares,

  // "A cell with a clue must be part of the cave."
  ...CLUES.map(([cell]) => new Given(shadeOf.get(cell), GREEN)),

  ...sightCounts,
];
