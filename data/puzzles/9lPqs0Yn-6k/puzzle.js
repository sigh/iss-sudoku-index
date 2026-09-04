// Title: Cave / Stations
// Author: KNT
// Video: https://www.youtube.com/watch?v=9lPqs0Yn-6k
// Source: https://sudokupad.app/9yzwo16hpj

// 14x14, no digit-filling rules (Raw grid: no rows/columns/boxes). Two genres
// combined over the same grid:
//
// Stations: draw a closed loop through cell centres that passes through the
// digits 1-9 in that cyclic order (wrapping from 9 back to 1), each exactly
// once; every other printed digit is left unvisited. The loop does not turn
// on a digit cell it visits, and it crosses itself only at the twelve marked
// intersections (all four of their edges used, in the straight-through
// pairing an X-mark draws); nowhere else is a cell's shape a crossing.
//
// Cave: some cells are shaded. Every unshaded cell lies in one
// orthogonally-connected group, and every orthogonally-connected group of
// shaded cells touches the grid's perimeter. A printed digit the loop does
// not visit is unshaded and counts the unshaded cells an orthogonal ray from
// it can see in the four directions (including itself), blocked by shaded
// cells. Every digit the loop visits, and every intersection, is shaded --
// for a digit cell this is a biconditional with the previous sentence
// ("not visited" <-> unshaded), which is how a repeated digit's true station
// is picked out from its decoy copies below.
//
// Omitted: the cyclic order 1->9 in which the loop visits its stations, and
// "never three shaded or three unshaded cells running consecutively along the
// loop" -- both need the loop's own traversal order, which is not modelled.
// Also omitted: the loop may run alongside itself away from a marked
// intersection (two loop cells adjacent without the shared edge being on the
// loop) is not forbidden here, so single-loop topology is only approximated
// by connectivity over cell adjacency, not over the used edges themselves.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7, CROSS = 8;
const usesUp = s => s === VERT || s === UL || s === UR || s === CROSS;
const usesDown = s => s === VERT || s === DL || s === DR || s === CROSS;
const usesLeft = s => s === HORIZ || s === UL || s === DL || s === CROSS;
const usesRight = s => s === HORIZ || s === UR || s === DR || s === CROSS;
// CROSS is deliberately absent: it is given only at the twelve marked cells.
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];

const SHADED = 1, UNSHADED = 2;

const shape = new Shape('14x14', '1-9', 'Raw');
const grid = cellGraph(shape);   // pass the Shape so geometry.numValues is 9, not 14
const geometry = grid.gridGeometry();
const gridCells = grid.cells();
const path = grid.makeOverlay('VP');   // loop shape code per cell

// Padded shading overlay: the 14x14 grid inset in a one-cell frame pinned
// SHADED, so "every shaded group touches the perimeter" becomes "the shaded
// cells plus the frame form one connected region".
const framedGrid = cellGraph('16x16');
const shade = framedGrid.makeOverlay('VS');
const innerShade = shade.at(framedGrid.block('R2C2', 14, 14));
const shadeOf = new Map(gridCells.map((cell, i) => [cell, innerShade[i]]));
const insetCells = new Set(innerShade);
const frameCells = shade.cells().filter(cell => !insetCells.has(cell));

// --- Drawn data -------------------------------------------------------------

// Printed digits, grouped by value, as [row, col] pairs (cell ids are built
// via makeCellId(): rows/cols past 9 are single base-17 letters, e.g. row 11
// is 'b', not a literal "11"). Only one candidate per group is the digit the
// loop actually visits; the rest are Cave sight clues.
const digitGroupCoords = {
  1: [[11, 12]],
  2: [[11, 10], [13, 13]],
  3: [[1, 12], [2, 5], [3, 14], [12, 14], [13, 6], [14, 5], [14, 14]],
  4: [[5, 4], [8, 1], [9, 10], [10, 8], [11, 7]],
  5: [[4, 12], [8, 6]],
  6: [[1, 9], [14, 2]],
  7: [[3, 9], [4, 2]],
  8: [[2, 8], [12, 1]],
  9: [[6, 10], [7, 11], [7, 14]],
};
const digitGroups = Object.fromEntries(Object.entries(digitGroupCoords)
  .map(([value, coords]) => [value, coords.map(([row, col]) => makeCellId(row, col))]));

// The drawn crosshair marks, each resolved to the single cell it is centred on.
const intersectionCoords = [
  [2, 2], [3, 4], [4, 8], [5, 6], [6, 2], [7, 8],
  [8, 3], [8, 12], [11, 2], [11, 5], [12, 9], [13, 11],
];
const intersections = intersectionCoords.map(([row, col]) => makeCellId(row, col));
const intersectionSet = new Set(intersections);

const allDigitCells = Object.values(digitGroups).flat();
const digitCellSet = new Set(allDigitCells);
const ordinaryCells = gridCells.filter(
  cell => !intersectionSet.has(cell) && !digitCellSet.has(cell));

// Printed digits are decoration on this Raw grid (nothing else reads the main
// grid), but they are still the puzzle's own givens.
const digitGivens = Object.entries(digitGroups)
  .flatMap(([value, cells]) => cells.map(cell => new Given(cell, +value)));

// --- Loop shape domains ------------------------------------------------------
// A cell may use an edge only if the neighbour exists, so border cells can't
// take shapes that point off the grid (wendezaune.js pattern, extended for
// CROSS's four edges).
const boundarySafe = (cell, shapes) => {
  const { row, col } = parseCellId(cell);
  return shapes.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
};

// Stamp the full 7-shape domain over every non-intersection cell (a one-cell
// Replicate template), then narrow the border ordinary cells that cannot use
// every edge. Digit-clue cells need no override: their Or below never proposes
// a boundary-unsafe shape, so the blanket stamp only narrows them further.
const isBorder = (cell) => {
  const { row, col } = parseCellId(cell);
  return row === 1 || row === geometry.numRows || col === 1 || col === geometry.numCols;
};
const nonIntersectionCells = gridCells.filter(cell => !intersectionSet.has(cell));
const borderOrdinaryCells = ordinaryCells.filter(isBorder);

const shapeDomains = [
  path.makeReplicate(
    new Given(path.cells()[0], ...ALL_SHAPES), path.at(nonIntersectionCells)),
  ...borderOrdinaryCells.map(
    cell => new Given(path.at(cell), ...boundarySafe(cell, ALL_SHAPES))),
];

// The loop crosses itself exactly at these twelve cells: forced there (all
// twelve are interior, so every edge is boundary-safe), and impossible
// everywhere else (CROSS is absent from ALL_SHAPES above).
const crossingGivens = intersections.map(cell => new Given(path.at(cell), CROSS));

// --- Edge agreement ----------------------------------------------------------
// Neighbours must agree on their shared edge: one cell uses it towards the
// other iff that other uses it back. A two-cell relation is a Pair, not a
// state machine. This does not forbid two on-loop cells being adjacent
// without that shared edge being used (the loop running alongside itself away
// from a marked intersection) -- see the header omission.
const edgeOk = (toB, toA) => (a, b) => toB(a) === toA(b);
const edgeRightKey = Pair.fnToKey(edgeOk(usesRight, usesLeft), shape);
const edgeDownKey = Pair.fnToKey(edgeOk(usesDown, usesUp), shape);

// Every instance of each direction is the same relation at the same relative
// offset, so one Replicate per direction covers the whole grid.
const rightPairOrigins = gridCells.filter(cell => grid.step(cell, 0, 1));
const downPairOrigins = gridCells.filter(cell => grid.step(cell, 1, 0));

const edgeRules = [
  new Replicate(
    [new Pair(edgeRightKey, 'edge-h',
      path.at(rightPairOrigins[0]), path.at(grid.step(rightPairOrigins[0], 0, 1)))],
    Replicate.encodeTargetCells(path.at(rightPairOrigins), path.at(rightPairOrigins[0]), path),
    path.at(rightPairOrigins[0])),
  new Replicate(
    [new Pair(edgeDownKey, 'edge-v',
      path.at(downPairOrigins[0]), path.at(grid.step(downPairOrigins[0], 1, 0)))],
    Replicate.encodeTargetCells(path.at(downPairOrigins), path.at(downPairOrigins[0]), path),
    path.at(downPairOrigins[0])),
];

// A single loop: on-loop cells form one orthogonally-connected region. This
// is necessary but not sufficient for one true loop (see the header
// omission) -- two edge-disjoint loop fragments that happen to run
// cell-adjacent without sharing a used edge would still pass.
const singleLoop = new ConnectedValues(
  'VP', [HORIZ, VERT, UL, UR, DL, DR, CROSS]);

// --- Shading domains and connectivity ----------------------------------------
const shadeDomains = [
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED)),
  shade.makeReplicate(new Given(shade.cells()[0], SHADED), frameCells),
];

const intersectionShaded = intersections.map(
  cell => new Given(shadeOf.get(cell), SHADED));

const caveConnectivity = [
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
];

// --- Cave sight counts (unvisited digit cells only) --------------------------
// One machine per target count, over the four rays away from the clue (the
// clue's own cell is not read: its branch below already pins it UNSHADED, and
// it counts itself for free by needing only target-1 more). Blocked by the
// first SHADED cell in a ray; a SEGMENT_BREAK resets sight for the next ray.
const sightMachines = new Map();
const sightMachineFor = (target) => {
  if (!sightMachines.has(target)) {
    sightMachines.set(target, NFA.encodeSpec({
      startState: { count: 0, blocked: false },
      transition: ({ count, blocked }, value) => {
        if (value === SEGMENT_BREAK) return { count, blocked: false };
        if (blocked || value !== UNSHADED) return { count, blocked: true };
        const next = count + 1;
        return next > target ? [] : { count: next, blocked: false };
      },
      accept: ({ count }) => count === target,
    }, geometry.numValues, { multiSegment: true }));
  }
  return sightMachines.get(target);
};

const RAY_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const sightConstraint = (cell, digit) => new NFA(
  sightMachineFor(digit - 1), 'sight',
  ...RAY_DIRS
    .map(([dRow, dCol]) => grid.ray(cell, dRow, dCol).slice(1)
      .map(rayCell => shadeOf.get(rayCell)))
    .filter(ray => ray.length));

// --- Which copy of each repeated digit is the true station ------------------
// Exactly one candidate per digit is the visited/shaded station (straight,
// never a turn); every other candidate is the unvisited/unshaded Cave clue.
// A candidate whose grid position cannot host a straight loop segment at all
// (a grid corner blocks both HORIZ and VERT) can only ever be the Cave-clue
// role, so its Or collapses to that one branch.
const digitClueConstraints = Object.entries(digitGroups).flatMap(([value, cells]) => {
  const digit = +value;
  const perCell = cells.map(cell => {
    const straightShapes = boundarySafe(cell, [HORIZ, VERT]);
    const unshadedBranch = new And([
      new Given(shadeOf.get(cell), UNSHADED),
      new Given(path.at(cell), OFF),
      sightConstraint(cell, digit),
    ]);
    if (straightShapes.length === 0) return unshadedBranch;
    const shadedBranch = new And([
      new Given(shadeOf.get(cell), SHADED),
      new Given(path.at(cell), ...straightShapes),
    ]);
    return new Or([shadedBranch, unshadedBranch]);
  });
  const exactlyOneShaded = new ContainExact(
    [SHADED, ...cells.slice(1).map(() => UNSHADED)].join('_'),
    ...cells.map(cell => shadeOf.get(cell)));
  return [...perCell, exactlyOneShaded];
});

return [
  shape,

  ...digitGivens,

  path.toVar('loop shape'),
  ...shapeDomains,
  ...crossingGivens,
  ...edgeRules,
  singleLoop,

  shade.toVar('shading'),
  ...shadeDomains,
  ...intersectionShaded,
  ...caveConnectivity,

  ...digitClueConstraints,
];
