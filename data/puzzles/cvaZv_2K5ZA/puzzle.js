// Title: Lines Lines
// Author: SSG
// Video: https://www.youtube.com/watch?v=cvaZv_2K5ZA
// Source: https://sudokupad.app/qhx16aqc8i

// Green and blue line membership use independent binary overlays. Local degree,
// diagonal no-touch, and ConnectedValues constraints make the green cells one
// simple loop and the blue cells one simple path. A third overlay records the
// two blue endpoints as a derived property of blue membership.

const ON = 1;
const OFF = 2;
const END = 1;
const NOT_END = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const cells = graph.cells();
const green = graph.makeOverlay('VG');
const blue = graph.makeOverlay('VB');
const blueEnd = graph.makeOverlay('VE');

const binaryDomain = overlay => overlay.makeReplicate(
  new Given(overlay.cells()[0], 1, 2));

function makeDegreeMachine(requiredDegree) {
  return NFA.encodeSpec({
    startState: { phase: 'center' },
    transition: (state, value) => {
      if (state.phase === 'center') {
        return value === ON
          ? { phase: 'neighbours', count: 0 }
          : { phase: 'off' };
      }
      if (state.phase === 'off') return state;
      const count = state.count + (value === ON ? 1 : 0);
      return count > requiredDegree ? undefined : { phase: 'neighbours', count };
    },
    accept: state => state.phase === 'off' || state.count === requiredDegree,
  }, geometry.numValues);
}

const greenDegreeMachine = makeDegreeMachine(2);
const greenDegrees = cells.map(cell => new NFA(
  greenDegreeMachine, 'green degree',
  ...green.at([cell, ...graph.neighbours(cell)])));

// Derive the endpoint flag and require every blue on-cell to have degree 1 or 2.
const blueDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'blue' },
  transition: (state, value) => {
    if (state.phase === 'blue') {
      return { phase: 'endpoint', blueOn: value === ON };
    }
    if (state.phase === 'endpoint') {
      if (!state.blueOn && value !== NOT_END) return undefined;
      return { phase: 'neighbours', blueOn: state.blueOn,
        endpoint: value === END, count: 0 };
    }
    const count = state.count + (value === ON ? 1 : 0);
    return count > 2 ? undefined : { ...state, count };
  },
  accept: state => state.phase === 'neighbours' && (
    !state.blueOn || (state.endpoint ? state.count === 1 : state.count === 2)),
}, geometry.numValues);
const blueDegrees = cells.map(cell => new NFA(
  blueDegreeMachine, 'blue degree',
  blue.at(cell), blueEnd.at(cell), ...blue.at(graph.neighbours(cell))));

const exactlyTwoEndsMachine = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (value === END ? 1 : 0);
    return next > 2 ? undefined : { count: next };
  },
  accept: ({ count }) => count === 2,
}, geometry.numValues);

// A diagonal pair of on-cells in a 2x2 may not occur, even when one or both
// orthogonal corner cells are also on: any such diagonal contact is forbidden.
const noDiagonalMachine = NFA.encodeSpec({
  startState: { phase: 'read', seen: [] },
  transition: ({ phase, seen }, value) => {
    if (phase === 'done') return { phase: 'done' };
    const next = [...seen, value === ON];
    if (next.length < 4) return { phase: 'read', seen: next };
    const diagonalOnly =
      (next[0] && next[3] && !next[1] && !next[2]) ||
      (next[1] && next[2] && !next[0] && !next[3]);
    return diagonalOnly ? undefined : { phase: 'done' };
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const blockOrigins = cells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = overlay => overlay.makeReplicate(new NFA(
  noDiagonalMachine, 'no diagonal touch',
  ...overlay.at(graph.block('R1C1', 2, 2))), overlay.at(blockOrigins));

// Intersections are allowed, but a grid edge cannot belong to both lines.
const noSharedEdgeMachine = NFA.encodeSpec({
  startState: { phase: 'read', values: [] },
  transition: ({ phase, values }, value) => {
    if (phase === 'done') return { phase: 'done' };
    const next = [...values, value];
    if (next.length < 4) return { phase: 'read', values: next };
    const [g1, b1, g2, b2] = next;
    return g1 === ON && b1 === ON && g2 === ON && b2 === ON
      ? undefined : { phase: 'done' };
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const cellOrder = new Map(cells.map((cell, i) => [cell, i]));
const orthogonalEdges = cells.flatMap(cell => graph.neighbours(cell)
  .filter(other => cellOrder.get(cell) < cellOrder.get(other))
  .map(other => [cell, other]));
const noSharedEdges = orthogonalEdges.map(([a, b]) => new NFA(
  noSharedEdgeMachine, 'discrete crossing',
  green.at(a), blue.at(a), green.at(b), blue.at(b)));

// A blue endpoint cannot also lie on the green loop.
const endpointCrossingKey = Pair.fnToKey(
  (isEnd, greenOn) => isEnd !== END || greenOn !== ON,
  geometry.numValues);
const endpointCrossings = cells.map(cell => new Pair(
  endpointCrossingKey, 'endpoint crossing', blueEnd.at(cell), green.at(cell)));

// German whispers applies to each used green edge.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'aMembership' },
  transition: (state, value) => {
    if (state.phase === 'aMembership') {
      return { phase: 'aDigit', aOn: value === ON };
    }
    if (state.phase === 'aDigit') {
      return { phase: 'bMembership', aOn: state.aOn, aDigit: value };
    }
    if (state.phase === 'bMembership') {
      return { ...state, phase: 'bDigit', bOn: value === ON };
    }
    return !state.aOn || !state.bOn || Math.abs(state.aDigit - value) >= 5
      ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const whispers = orthogonalEdges.map(([a, b]) => new NFA(
  whisperMachine, 'green whisper', green.at(a), a, green.at(b), b));

// At every blue internal cell, its digit and the digits of its two blue
// neighbours must occupy all three residue classes modulo 3.
const modularMachine = NFA.encodeSpec({
  startState: { phase: 'centerMembership' },
  transition: (state, value) => {
    if (state.phase === 'centerMembership') {
      return value === ON ? { phase: 'centerDigit' } : { phase: 'off' };
    }
    if (state.phase === 'off') return state;
    if (state.phase === 'centerDigit') {
      return { phase: 'neighbourMembership', count: 0,
        residues: 1 << (value % 3) };
    }
    if (state.phase === 'neighbourMembership') {
      return { ...state, phase: 'neighbourDigit', neighbourOn: value === ON };
    }
    const count = state.count + (state.neighbourOn ? 1 : 0);
    if (count > 2) return undefined;
    return {
      phase: 'neighbourMembership',
      count,
      residues: state.neighbourOn
        ? state.residues | (1 << (value % 3)) : state.residues,
    };
  },
  accept: state => state.phase === 'off' || (
    state.phase === 'neighbourMembership' &&
    (state.count === 1 || (state.count === 2 && state.residues === 0b111))),
}, geometry.numValues);
const modulars = cells.map(cell => new NFA(
  modularMachine, 'blue modular', blue.at(cell), cell,
  ...graph.neighbours(cell).flatMap(n => [blue.at(n), n])));

function projectedSumMachine(total, mode) {
  return NFA.encodeSpec({
    startState: { phase: mode === 'both' ? 'green' : 'membership', sum: 0 },
    transition: (state, value) => {
      if (mode === 'both') {
        if (state.phase === 'green') {
          return { phase: 'blue', sum: state.sum, greenOn: value === ON };
        }
        if (state.phase === 'blue') {
          return { phase: 'digit', sum: state.sum,
            selected: state.greenOn || value === ON };
        }
      } else if (state.phase === 'membership') {
        return { phase: 'digit', sum: state.sum, selected: value === ON };
      }
      const sum = state.sum + (state.selected ? value : 0);
      if (sum > total) return undefined;
      return { phase: mode === 'both' ? 'green' : 'membership', sum };
    },
    accept: state => state.sum === total && (
      state.phase === (mode === 'both' ? 'green' : 'membership')),
  }, geometry.numValues);
}

function projected(total, ray, mode) {
  const machine = projectedSumMachine(total, mode);
  const sequence = mode === 'both'
    ? ray.flatMap(cell => [green.at(cell), blue.at(cell), cell])
    : ray.flatMap(cell => [(mode === 'green' ? green : blue).at(cell), cell]);
  return new NFA(machine, `${mode} projected ${total}`, ...sequence);
}

const projectedSums = [
  projected(16, ['R1C2','R2C3','R3C4','R4C5','R5C6','R6C7','R7C8','R8C9'], 'green'),
  projected(22, ['R5C1','R5C2','R5C3','R5C4','R5C5','R5C6','R5C7','R5C8','R5C9'], 'green'),
  projected(2, ['R9C1','R8C1','R7C1','R6C1','R5C1','R4C1','R3C1','R2C1','R1C1'], 'both'),
  projected(37, ['R8C9','R7C8','R6C7','R5C6','R4C5','R3C4','R2C3','R1C2'], 'both'),
  projected(27, ['R5C9','R5C8','R5C7','R5C6','R5C5','R5C4','R5C3','R5C2','R5C1'], 'blue'),
];

const cloneA = graph.block('R2C2', 3, 3);
const cloneB = graph.block('R5C6', 3, 3);
const cloneDigits = cloneA.map((cell, i) => new SameValues(2, cell, cloneB[i]));
const cloneLines = cloneA.flatMap((cell, i) => [
  new SameValues(2, green.at(cell), green.at(cloneB[i])),
  new SameValues(2, blue.at(cell), blue.at(cloneB[i])),
]);

return [
  new Shape('9x9'),
  green.toVar('green line'),
  blue.toVar('blue line'),
  blueEnd.toVar('blue endpoints'),
  binaryDomain(green),
  binaryDomain(blue),
  binaryDomain(blueEnd),
  new ConnectedValues('VG', ON),
  new ConnectedValues('VB', ON),
  ...greenDegrees,
  ...blueDegrees,
  new NFA(exactlyTwoEndsMachine, 'two blue endpoints', ...blueEnd.cells()),
  noDiagonalTouches(green),
  noDiagonalTouches(blue),
  // Partial encoding: shared-edge exclusion is omitted.
  ...endpointCrossings,
  ...whispers,
  // Partial encoding: blue modular triples are omitted.
  projectedSums[0],
  projectedSums[1],
  projectedSums[2],
  projectedSums[3],
  ...cloneDigits,
  // Partial encoding: clone line occupancy and the blue 27 are omitted.
];
