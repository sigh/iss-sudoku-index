// Title: Lines Lines
// Author: SSG
// Video: https://www.youtube.com/watch?v=cvaZv_2K5ZA
// Source: https://sudokupad.app/qhx16aqc8i

// Rules encoded here:
//  - Normal sudoku.
//  - Two non-branching orthogonal lines through cell centres, one green and one
//    blue, both drawn by the solver. Green is a closed loop; blue is an open
//    line with two ends. Neither line may touch itself, even diagonally. The two
//    lines may share cells but may not run together from one cell into the next
//    (no shared step). Neither end of the blue line may sit on a green cell.
//  - German whispers: green-adjacent digits differ by at least 5.
//  - Modular lines: every run of three cells of the blue line holds three
//    different remainders mod 3.
//  - Projected sums: an outside clue sums the digits its own colour's line
//    covers along the indicated ray; a black clue sums the digits covered by
//    either line, counting a shared cell once.
//  - Clones: the two 3x3 cages hold the same digit at each position and the
//    same drawn line at each position, colour and segment alike. The cages
//    carry no total and the rules allow repeats inside them, so they add no
//    all-different group.
// No rule is omitted.

const OFF = 2;        // line-membership Vars: OFF is the same value on both layers
const GREEN_ON = 1;   // VG: on the green loop
const BLUE_MID = 1;   // VB: on the blue line with two blue neighbours
const BLUE_END = 3;   // VB: an end of the blue line, one blue neighbour

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// One membership Var per grid cell for each line (VG1..VG81, VB1..VB81).
const green = graph.makeOverlay('VG');
const blue = graph.makeOverlay('VB');

const gridCells = graph.cells();
// Every orthogonal edge of the grid exactly once (right and down steps).
const edges = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => [cell, other]));

const domains = [
  green.makeReplicate(new Given(green.cells()[0], GREEN_ON, OFF)),
  blue.makeReplicate(new Given(blue.cells()[0], BLUE_MID, OFF, BLUE_END)),
];

// --- Degrees. Reads a cell's own membership, then each orthogonal neighbour's.
// Green on-cells have two green neighbours, which with ConnectedValues makes the
// green cells one simple cycle. Blue mid-cells have two and blue ends one, which
// with ConnectedValues and exactly two ends makes the blue cells one simple path.
const greenDegree = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, membership) => {
    if (state.phase === 'start') {
      return membership === GREEN_ON ? { phase: 'on', count: 0 } : { phase: 'off' };
    }
    if (state.phase === 'off') return { phase: 'off' };
    const count = state.count + (membership === GREEN_ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', count };
  },
  accept: (state) => state.phase === 'off' || state.count === 2,
}, shape);
const blueDegree = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, membership) => {
    if (state.phase === 'start') {
      if (membership === OFF) return { phase: 'off' };
      // An end has one blue neighbour, any other blue cell has two.
      return { phase: 'on', want: membership === BLUE_END ? 1 : 2, count: 0 };
    }
    if (state.phase === 'off') return { phase: 'off' };
    const count = state.count + (membership === OFF ? 0 : 1);
    return count > state.want ?
      undefined : { phase: 'on', want: state.want, count };
  },
  accept: (state) => state.phase === 'off' || state.count === state.want,
}, shape);
const degrees = gridCells.flatMap(cell => {
  const around = [cell, ...graph.neighbours(cell)];
  return [
    new NFA(greenDegree, 'green-degree', ...green.at(around)),
    new NFA(blueDegree, 'blue-degree', ...blue.at(around)),
  ];
});

// Exactly two blue ends, so the blue line is open and non-empty.
const blueEnds = new ContainExact(`${BLUE_END}_${BLUE_END}`, ...blue.cells());

// --- No diagonal self-touch. Reads a 2x2 block of one layer's membership Vars,
// left-to-right then top-to-bottom, and forbids the block whose only on cells
// are a diagonal pair: those two cells touch without being joined through a
// third. Three on cells in the block is the ordinary right-angle turn.
const noDiagonalTouch = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership !== OFF];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, shape);
// Stamped on each of the 64 cells that start a full 2x2 block.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noTouches = [green, blue].map((layer, i) => layer.makeReplicate(
  new NFA(noDiagonalTouch, i ? 'blue-no-touch' : 'green-no-touch',
    ...layer.at(graph.block(blockOrigins[0], 2, 2))),
  layer.at(blockOrigins)));

// --- The lines may meet only at points, never sharing a step from one cell into
// the next. Neither line touches itself, so two adjacent cells of one colour are
// always consecutive on that line; a step is shared exactly when both cells carry
// both colours. Reads (green a, green b, blue a, blue b) for an adjacent pair.
const noSharedStep = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, membership) => {
    const next = count + (membership !== OFF ? 1 : 0);
    return next === 4 ? undefined : { count: next };
  },
  accept: () => true,
}, shape);
const sharedSteps = edges.map(([a, b]) => new NFA(noSharedStep, 'no-shared-step',
  green.at(a), green.at(b), blue.at(a), blue.at(b)));

// --- No end of the blue line lies on a cell the green loop also uses.
const endOffGreen = Pair.fnToKey(
  (greenMembership, blueMembership) =>
    !(greenMembership === GREEN_ON && blueMembership === BLUE_END),
  shape);
const blueEndsOffGreen = gridCells.map(cell => new Pair(
  endOffGreen, 'blue-end-off-green', green.at(cell), blue.at(cell)));

// --- German whispers along the green loop. Reads (green a, digit a, green b,
// digit b) for an adjacent pair; the pair is on the loop only when both cells
// are, and off-loop cells skip past the digits that follow them.
const greenWhisper = NFA.encodeSpec({
  startState: { phase: 'aOn' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aOn':
        return value === GREEN_ON ? { phase: 'aDigit' } : { phase: 'skip', left: 3 };
      case 'aDigit':
        return { phase: 'bOn', aDigit: value };
      case 'bOn':
        return value === GREEN_ON ?
          { phase: 'bDigit', aDigit: state.aDigit } : { phase: 'skip', left: 1 };
      case 'bDigit':
        return Math.abs(state.aDigit - value) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ?
          { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
const whispers = edges.map(([a, b]) => new NFA(greenWhisper, 'green-whisper',
  green.at(a), a, green.at(b), b));

// --- Modular blue line. A run of three cells is a blue cell together with two
// of its blue neighbours, so one machine per cell covers every run: read the
// cell's own (membership, digit) then each neighbour's, and require the cell's
// remainder and its blue neighbours' remainders to be three different values.
// A cell with fewer than two blue neighbours starts no run of three.
const blueModular = NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'self':
        return value === OFF ? { phase: 'absorb' } : { phase: 'selfDigit' };
      case 'absorb':
        return { phase: 'absorb' };
      case 'selfDigit':
        return { phase: 'nbr', mod: value % 3, seen: [] };
      case 'nbr':
        return value === OFF ?
          { phase: 'nbrSkip', mod: state.mod, seen: state.seen } :
          { phase: 'nbrDigit', mod: state.mod, seen: state.seen };
      case 'nbrSkip':
        return { phase: 'nbr', mod: state.mod, seen: state.seen };
      case 'nbrDigit': {
        const seen = [...state.seen, value % 3].sort();
        // Three or more blue neighbours is already excluded by the degree rule.
        return seen.length > 2 ?
          { phase: 'absorb' } : { phase: 'nbr', mod: state.mod, seen };
      }
    }
  },
  accept: (state) => {
    if (state.phase === 'absorb') return true;
    if (state.phase !== 'nbr') return false;
    if (state.seen.length < 2) return true;
    return new Set([state.mod, ...state.seen]).size === 3;
  },
}, shape);
const modulars = gridCells.map(cell => {
  const around = [cell, ...graph.neighbours(cell)];
  return new NFA(blueModular, 'blue-modular',
    ...around.flatMap(c => [blue.at(c), c]));
});

// --- Projected sums. Clue values, colours and rays transcribed from the five
// outside badges and their arrows: green 16 and black 37 both read the diagonal
// R1C2-R8C9, green 22 and blue 27 both read row 5, and black 2 reads column 1.
const colouredSum = (target) => NFA.encodeSpec({
  startState: { phase: 'flag', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'flag') {
      return value === OFF ?
        { phase: 'skip', sum: state.sum } : { phase: 'digit', sum: state.sum };
    }
    if (state.phase === 'skip') return { phase: 'flag', sum: state.sum };
    const sum = state.sum + value;
    return sum > target ? undefined : { phase: 'flag', sum };
  },
  accept: (state) => state.phase === 'flag' && state.sum === target,
}, shape);
// A cell on both lines contributes its digit once.
const blackSum = (target) => NFA.encodeSpec({
  startState: { phase: 'green', sum: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 'green':
        return { phase: 'blue', on: value !== OFF, sum: state.sum };
      case 'blue':
        return { phase: 'digit', on: state.on || value !== OFF, sum: state.sum };
      case 'digit': {
        const sum = state.sum + (state.on ? value : 0);
        return sum > target ? undefined : { phase: 'green', sum };
      }
    }
  },
  accept: (state) => state.phase === 'green' && state.sum === target,
}, shape);

const diagonal = graph.ray('R1C2', 1, 1);
const row5 = graph.row(5);
const column1 = graph.column(1);
const projectedSums = [
  new NFA(colouredSum(16), 'green-16',
    ...diagonal.flatMap(cell => [green.at(cell), cell])),
  new NFA(colouredSum(22), 'green-22',
    ...row5.flatMap(cell => [green.at(cell), cell])),
  new NFA(colouredSum(27), 'blue-27',
    ...row5.flatMap(cell => [blue.at(cell), cell])),
  new NFA(blackSum(2), 'black-2',
    ...column1.flatMap(cell => [green.at(cell), blue.at(cell), cell])),
  new NFA(blackSum(37), 'black-37',
    ...diagonal.flatMap(cell => [green.at(cell), blue.at(cell), cell])),
];

// --- Clone cages, transcribed from the payload's two cage cell lists: the 3x3
// blocks at R2C2 and R5C6. Each position holds the same digit in both and is
// covered by the same lines in both. What is drawn at a position is not only
// which line covers it but the segment through it, so a position's four
// possible line steps must match too: "the same lines ... in the same
// positions" makes a through-segment and a line end different drawings. Every
// neighbour of both cages is inside the grid, so no position loses a step to
// the border.
const sameOccupancy = Pair.fnToKey((a, b) => (a === OFF) === (b === OFF), shape);
// Reads (cage A cell, its neighbour, cage B cell, its neighbour) on one layer:
// the step out of the cell is used exactly when both its cells are on the line,
// and both cages must agree on it.
const cloneStep = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen }, membership) => {
    if (seen === null) return { seen: null };
    const next = [...seen, membership !== OFF];
    if (next.length < 4) return { seen: next };
    const [aCell, aNext, bCell, bNext] = next;
    return (aCell && aNext) === (bCell && bNext) ? { seen: null } : undefined;
  },
  accept: ({ seen }) => seen === null,
}, shape);
const cageA = graph.block('R2C2', 3, 3);
const cageB = graph.block('R5C6', 3, 3);
const steps = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const clones = cageA.flatMap((a, i) => {
  const b = cageB[i];
  return [
    new SameValues(2, a, b),
    new Pair(sameOccupancy, 'clone-green', green.at(a), green.at(b)),
    new Pair(sameOccupancy, 'clone-blue', blue.at(a), blue.at(b)),
    ...steps.flatMap(([dR, dC]) => {
      const quad = [a, graph.step(a, dR, dC), b, graph.step(b, dR, dC)];
      return [
        new NFA(cloneStep, 'clone-green-step', ...green.at(quad)),
        new NFA(cloneStep, 'clone-blue-step', ...blue.at(quad)),
      ];
    }),
  ];
});

return [
  shape,
  green.toVar('green line'),
  blue.toVar('blue line'),
  ...domains,
  // One green region plus degree 2 everywhere on it is a single closed loop.
  new ConnectedValues('VG', GREEN_ON),
  // One blue region with two ends and degree 2 elsewhere is a single open line.
  new ConnectedValues('VB', [BLUE_MID, BLUE_END]),
  blueEnds,
  ...degrees,
  ...noTouches,
  ...sharedSteps,
  ...blueEndsOffGreen,
  ...whispers,
  ...modulars,
  ...projectedSums,
  ...clones,
];
