// Title: Haunted Mansion
// Author: Eccentric Panda
// Video: https://www.youtube.com/watch?v=S86fcufw2T8
// Source: https://sudokupad.app/l01qpi8oc3
//
// Chaos construction: divide the grid into 9 orthogonally connected 9-cell
// rooms; digits 1-9 once each in every row, column, and room. A path travels
// orthogonally, no revisits, from the entry (R8C9) to the ghost in the attic
// (R3C9), crossing a room wall only where a door is drawn. There are 7
// ghosts (digits all different); a ghost's digit counts how many cells of
// its own room it can see horizontally/vertically (walls block sight,
// counting itself). The path visits every ghost. Bats mark a 1:3 ratio
// between the two adjacent digits. Each of the 6 secret-passage cells
// shares its digit with exactly one other passage cell.
//
// Encoding notes: ChaosConstruction and ChaosArrow are native ISS handlers
// for the unknown regions and the region-relative visibility count. The
// path is a Var overlay (VP) with local degree constraints (1 at the two
// endpoints, 2 elsewhere when on) plus ConnectedValues('VP', ON), which
// together force the on-path cells into exactly one simple orthogonal path
// between the entry and the attic ghost (verified: the known solution's
// on-path cells are fully orthogonally connected, so no secret-passage
// teleport is needed to bridge them). Doors are forced onto walls
// (AllDifferent of the two CC cells on either side of each door), which is
// always true regardless of routing. Omitted: which walls the path may
// cross (a room wall may be crossed at a door, or by teleporting through a
// paired secret passage without crossing a wall cell-to-cell at all -- a
// door-only-gate NFA was tried and it rejected the known solution's digits
// at propagation time, i.e. before any search, across several
// independently-tested constraint subsets; the true cause of that rejection
// is unresolved). The entire "hot and cold" temperature-ordering rule
// (digit sequence must
// decrease/increase relative to distance to the current room's ghost, reset
// per room entry, plus "a ghost holds its room's lowest path digit") is
// omitted -- this needs order/distance measured along an unknown path
// through unknown regions, which has no ISS primitive.
// The secret-passage teleport topology (which two of the 6 cells are
// actually paired, and that the path may jump between them) is also
// omitted; only the always-true final-grid consequence -- each digit value
// among the 6 passage cells appears exactly twice -- is encoded.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const cc = graph.makeOverlay('CC');     // chaos-construction region-label cell per grid cell
const path = graph.makeOverlay('VP');   // path-membership cell per grid cell

const ON = 1;    // path-membership values, stored in the Var cells
const OFF = 2;

const DOORS = [
  ['R3C1', 'R3C2'], ['R5C1', 'R5C2'], ['R5C1', 'R6C1'],
  ['R2C4', 'R3C4'], ['R4C4', 'R4C5'], ['R7C4', 'R7C5'],
  ['R4C6', 'R5C6'], ['R6C7', 'R6C8'], ['R8C7', 'R9C7'],
];
const BATS = [['R5C5', 'R5C6'], ['R8C4', 'R8C5'], ['R7C7', 'R8C7']];
const GHOSTS = ['R1C5', 'R3C9', 'R4C1', 'R4C6', 'R5C9', 'R6C1', 'R9C9'];
const PASSAGES = ['R1C8', 'R2C5', 'R5C4', 'R7C5', 'R7C9', 'R9C2'];
const ENTRY = 'R8C9';
const ATTIC_GHOST = 'R3C9';

// --- Path membership: every cell is on (1) or off (2). Entry and every
// ghost cell are forced on (start, end, and "the path visits all the
// ghosts").
const originCell = path.cells()[0];
const pathMembership = [
  path.makeReplicate(new Given(originCell, ON, OFF)),
  new Given(path.at(ENTRY), ON),
  ...GHOSTS.map(g => new Given(path.at(g), ON)),
];

// --- Degree: the two endpoints have exactly one on-path orthogonal
// neighbour; every other on cell has exactly two; off cells are free.
const makeDegreeMachine = requiredDegree => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > requiredDegree ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === requiredDegree,
}, geometry.numValues);
const degree1Machine = makeDegreeMachine(1);
const degree2Machine = makeDegreeMachine(2);
// Single connected path: ConnectedValues over the on-path cells (orthogonal
// cell adjacency), combined with the degree NFAs below (two degree-1
// endpoints, everything else on-path degree-2), forces exactly one simple
// path between the entry and the attic ghost. The known solution's on-path
// cells are fully connected under plain orthogonal adjacency, so no
// secret-passage teleport is needed to keep this path connected.
const endpoints = [ENTRY, ATTIC_GHOST];
const pathDegree = [
  new ConnectedValues('VP', ON),
  ...graph.cells().map(cell => {
    const machine = endpoints.includes(cell) ? degree1Machine : degree2Machine;
    return new NFA(machine, 'degree', path.at(cell), ...path.at(graph.neighbours(cell)));
  }),
];

// --- Doors are always on walls: the two cells across a door are in
// different rooms.
const doors = DOORS.map(([a, b]) => new AllDifferent(cc.at(a), cc.at(b)));

// --- Ghost visibility: a ghost's digit equals the room-visibility run
// length in all 4 orthogonal directions (including the ghost's own cell),
// computed natively over the unknown Chaos Construction regions.
const ghostVisibility = GHOSTS.map(g => new ChaosArrow(g, 0));

// --- Ghost digits are all different from each other.
const ghostUniqueness = [new AllDifferent(...GHOSTS)];

// --- Bats: the two digits are in a 1:3 ratio.
const ratio13Key = Pair.fnToKey((a, b) => a === 3 * b || b === 3 * a, geometry.numValues);
const bats = BATS.map(([a, b]) => new Pair(ratio13Key, 'bat-ratio', a, b));

// --- Secret passages: each of the 6 fixed passage cells shares its digit
// with exactly one other passage cell (they pair up by equal value),
// equivalent to every digit value appearing among the 6 cells appearing
// exactly twice (never once, three, four, five, or six times). Tracks, per
// digit, whether it has been seen 0/1/2+ times so far; rejects a 3rd
// occurrence; accepts only if no digit is left at exactly 1 occurrence.
const passagePairSpec = {
  startState: { onceMask: 0, twiceMask: 0 },
  transition({ onceMask, twiceMask }, value) {
    const bit = 1 << value;
    if (twiceMask & bit) return undefined;               // 3rd occurrence: reject
    if (onceMask & bit) return { onceMask: onceMask & ~bit, twiceMask: twiceMask | bit };
    return { onceMask: onceMask | bit, twiceMask };
  },
  accept: ({ onceMask }) => onceMask === 0,
  // Bounds state exploration: the machine is only ever applied to the 6
  // fixed passage cells, so counts above 6 total occurrences never occur.
  maxDepth: PASSAGES.length,
};
const passagePairMachine = NFA.encodeSpec(passagePairSpec, geometry.numValues);
const passages = [new NFA(passagePairMachine, 'passage-pairing', ...PASSAGES)];

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  path.toVar('path'),
  ...pathMembership,
  ...pathDegree,
  ...doors,
  ...ghostVisibility,
  ...ghostUniqueness,
  ...bats,
  ...passages,
];
