// Title: Haunted Mansion
// Author: Eccentric Panda
// Video: https://www.youtube.com/watch?v=S86fcufw2T8
// Source: https://sudokupad.app/l01qpi8oc3

// Rules
// -----
// Chaos construction: divide the grid into 9 orthogonally connected rooms;
// 1-9 once each in every row, column and room.
//
// A path travels orthogonally through the mansion and does not revisit cells.
// It starts at the entry R8C9 and ends at the ghost in the attic R3C9. It may
// pass through a room wall only where a door (brown line) is drawn, and doors
// are always on walls, never in the middle of a room.
//
// Ghost digits are all different. A ghost digit counts the cells of its own
// room seen horizontally and vertically, including itself; walls block vision.
// The path visits all the ghosts.
//
// Hot and cold path: the digits fall as you step toward the ghost of the room
// you are in and rise as you step away, taken afresh each time you enter a
// room, and a ghost holds the lowest path digit in its room. Rooms with no
// ghost take no readings.
//
// Secret passages: entering one exits from a different passage holding the
// same digit, and each passage shares its digit with exactly one other.
//
// Digits either side of a bat are in a 1:3 ratio.
//
// Not encoded:
//  - The rise/fall half of the hot and cold rule. It compares digits by their
//    order along the path within a room, and neither the path's direction nor
//    the rooms are known to the encoding. Only its room-wide consequence -- the
//    ghost holds the lowest path digit of its room -- is encoded below.
//  - Global path topology: the used edges plus the passage jumps must form one
//    single walk from R8C9 to R3C9. The local degree rules below admit an extra
//    disjoint cycle of path cells alongside that walk. Which two passages a jump
//    joins is likewise not encoded; only the always-true consequence is (a
//    passage is on the path exactly when its same-digit partner is).

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');
// One 0/1 Var per grid edge, split by direction: VR(RrCc) is the edge between
// RrCc and RrC(c+1), VD(RrCc) the edge between RrCc and R(r+1)Cc. USED means
// the path steps across that edge, so the path is carried by its steps rather
// than by cell membership alone -- two path cells may sit side by side without
// the path stepping between them, and the wall rule is about steps.
const right = graph.makeOverlay('VR');
const down = graph.makeOverlay('VD');
// VM marks the cells the path visits.
const member = graph.makeOverlay('VM');
const UNUSED = 1, USED = 2;
const OFFPATH = 1, ONPATH = 2;

// Drawn data, transcribed from the payload's overlays and underlays.
// Ghosts: the 7 ghost-emoji overlays. The entry is the door-emoji overlay
// outside R8C9's right border; the rules name R8C9 and R3C9 directly.
const GHOSTS = ['R1C5', 'R3C9', 'R4C1', 'R4C6', 'R5C9', 'R6C1', 'R9C9'];
const START = 'R8C9';
const END = 'R3C9';
// Secret passages: the 6 hole-emoji underlays.
const PASSAGES = ['R1C8', 'R2C5', 'R5C4', 'R7C5', 'R7C9', 'R9C2'];
// Bats: the 3 bat-emoji overlays, each centred on a cell border.
const BATS = [['R7C7', 'R8C7'], ['R8C4', 'R8C5'], ['R5C5', 'R5C6']];
// Doors: the 9 brown (#954b1a) rectangles, each centred on a cell border.
const DOORS = [
  ['R3C1', 'R3C2'], ['R5C1', 'R5C2'], ['R4C4', 'R4C5'], ['R6C7', 'R6C8'],
  ['R7C4', 'R7C5'], ['R5C1', 'R6C1'], ['R2C4', 'R3C4'], ['R4C6', 'R5C6'],
  ['R8C7', 'R9C7'],
];

const edgeVar = (a, b) => {
  const pa = parseCellId(a), pb = parseCellId(b);
  if (pa.row === pb.row) return right.at(pa.col < pb.col ? a : b);
  return down.at(pa.row < pb.row ? a : b);
};
const incidentEdges = (cell) => graph.neighbours(cell).map(n => edgeVar(cell, n));

// Edge and membership Vars are 2-valued; the last column has no right-edge and
// the last row no down-edge, so those slots are pinned UNUSED.
const domainReplicate = (overlay, low, high) => {
  const origin = overlay.at('R1C1');
  return new Replicate(
    [new Given(origin, low, high)],
    Replicate.encodeTargetCells(
      graph.cells().map(c => overlay.at(c)), origin, overlay),
    origin);
};
const varDomains = [
  domainReplicate(right, UNUSED, USED),
  domainReplicate(down, UNUSED, USED),
  domainReplicate(member, OFFPATH, ONPATH),
  ...graph.column(9).map(c => new Given(right.at(c), UNUSED)),
  ...graph.row(9).map(c => new Given(down.at(c), UNUSED)),
];

// Degree rule. Each cell reads its own VM flag and then its incident edge Vars:
// a cell off the path uses none of them, a cell the path passes through uses
// exactly two, and the two path ends use exactly one. A passage cell is the
// other one-edge case: stepping onto it teleports you away, so on the grid the
// path arrives at it or leaves from it but never both.
const degreeSpec = (wantOnPath) => NFA.encodeSpec({
  startState: 'flag',
  transition: (state, value) => {
    if (state === 'flag') {
      if (value === OFFPATH) return { want: 0, count: 0 };
      if (value === ONPATH) return { want: wantOnPath, count: 0 };
      return undefined;
    }
    if (value !== UNUSED && value !== USED) return undefined;
    const count = state.count + (value === USED ? 1 : 0);
    return count > state.want ? undefined : { want: state.want, count };
  },
  accept: (state) => state !== 'flag' && state.count === state.want,
}, 9);
const degreeSpecs = { through: degreeSpec(2), oneEdge: degreeSpec(1) };
const degrees = graph.cells().map(cell => {
  const spec = (cell === START || cell === END || PASSAGES.includes(cell))
    ? degreeSpecs.oneEdge : degreeSpecs.through;
  return new NFA(spec, 'degree', member.at(cell), ...incidentEdges(cell));
});
// The path starts at the entry, ends at the attic ghost, and visits every ghost.
const onPath = [START, ...GHOSTS].map(c => new Given(member.at(c), ONPATH));

// Wall rule: a step may cross a room wall only at a door, so any USED edge that
// is not one of the 9 drawn doors joins two cells of the same room.
const wallSpec = NFA.encodeSpec({
  startState: 'edge',
  transition: (state, value) => {
    if (state === 'edge') {
      if (value === UNUSED) return 'skip1';
      if (value === USED) return 'first';
      return undefined;
    }
    if (state === 'skip1') return 'skip2';
    if (state === 'skip2') return 'unused';
    if (state === 'first') return 'saw' + value;
    if (state.startsWith('saw')) return value === +state.slice(3) ? 'match' : undefined;
    return undefined;
  },
  accept: (state) => state === 'unused' || state === 'match',
}, 9);
const doorEdges = new Set(DOORS.map(([a, b]) => edgeVar(a, b)));
const wallGate = [
  ...graph.cells().filter(c => parseCellId(c).col < 9).map(
    c => [right.at(c), c, graph.step(c, 0, 1)]),
  ...graph.cells().filter(c => parseCellId(c).row < 9).map(
    c => [down.at(c), c, graph.step(c, 1, 0)]),
].filter(([edge]) => !doorEdges.has(edge)).map(
  ([edge, a, b]) => new NFA(wallSpec, 'wall', edge, cc.at(a), cc.at(b)));

// Doors are always on walls: the two cells across a door are in different rooms.
const doorsOnWalls = DOORS.map(
  ([a, b]) => new AllDifferent(cc.at(a), cc.at(b)));

// Ghost digit = cells of its own room visible along the four orthogonal rays,
// itself included. A bare ChaosArrow control cell generates all four arms to the
// grid edge and counts the shared start once; offset 0 counts the ghost's cell.
const ghostCounts = GHOSTS.map(g => new ChaosArrow(g, 0));

// A ghost holds the lowest path digit of its room: reading a cell's room label,
// the ghost's room label, the cell's path flag and then the two digits, a cell
// sharing the ghost's room and lying on the path must hold the larger digit.
const ghostLowestSpec = NFA.encodeSpec({
  startState: 'cellRoom',
  transition: (state, value) => {
    if (state === 'cellRoom') return 'room' + value;
    if (state.startsWith('room')) {
      return value === +state.slice(4) ? 'sameRoom' : 'elsewhere';
    }
    if (state === 'elsewhere') return 'skipA';
    if (state === 'skipA') return 'skipB';
    if (state === 'skipB') return 'free';
    if (state === 'sameRoom') {
      if (value === OFFPATH) return 'skipA';
      if (value === ONPATH) return 'onPath';
      return undefined;
    }
    if (state === 'onPath') return 'cellDigit' + value;
    if (state.startsWith('cellDigit')) {
      return value < +state.slice(9) ? 'ghostLower' : undefined;
    }
    return undefined;
  },
  accept: (state) => state === 'free' || state === 'ghostLower',
}, 9);
const ghostLowest = GHOSTS.flatMap(g => graph.cells().filter(c => c !== g).map(
  c => new NFA(ghostLowestSpec, 'ghost lowest',
    cc.at(c), cc.at(g), member.at(c), c, g)));

// Secret passage digits: among the 6 passage cells every digit appears exactly
// twice or not at all, which is "each passage shares its digit with exactly one
// other". The state carries the digits seen once and the digits already paired;
// a third occurrence is rejected, and an unpaired digit is pruned once too few
// cells remain to pair it.
const passagePairSpec = NFA.encodeSpec({
  startState: { once: [], done: [], read: 0 },
  transition: ({ once, done, read }, value) => {
    if (done.includes(value)) return undefined;
    const paired = once.includes(value);
    const nextOnce = paired ? once.filter(v => v !== value) : [...once, value].sort();
    const nextDone = paired ? [...done, value].sort() : done;
    const remaining = PASSAGES.length - read - 1;
    if (nextOnce.length > remaining) return undefined;
    return { once: nextOnce, done: nextDone, read: read + 1 };
  },
  accept: ({ once, read }) => read === PASSAGES.length && once.length === 0,
}, 9);
const passageDigits = new NFA(passagePairSpec, 'passage pairs', ...PASSAGES);

// A passage is on the path exactly when the passage it shares its digit with is:
// you leave the one you entered by that partner, and cannot re-enter either.
const passagePartnerSpec = NFA.encodeSpec({
  startState: 'digitA',
  transition: (state, value) => {
    if (state === 'digitA') return 'digit' + value;
    if (state.startsWith('digit')) {
      return value === +state.slice(5) ? 'partners' : 'unrelated';
    }
    if (state === 'unrelated') return 'skip';
    if (state === 'skip') return 'free';
    if (state === 'partners') return 'flag' + value;
    if (state.startsWith('flag')) return value === +state.slice(4) ? 'agree' : undefined;
    return undefined;
  },
  accept: (state) => state === 'free' || state === 'agree',
}, 9);
const passagePartners = PASSAGES.flatMap((a, i) => PASSAGES.slice(i + 1).map(
  b => new NFA(passagePartnerSpec, 'passage partner',
    a, b, member.at(a), member.at(b))));

const ratio1to3 = Pair.fnToKey((a, b) => a === 3 * b || b === 3 * a, 9);
const bats = BATS.map(([a, b]) => new Pair(ratio1to3, 'bat', a, b));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  right.toVar('path right edges'),
  down.toVar('path down edges'),
  member.toVar('path cells'),
  ...varDomains,
  ...degrees,
  ...onPath,
  ...wallGate,
  ...doorsOnWalls,
  ...ghostCounts,
  ...ghostLowest,
  new AllDifferent(...GHOSTS),
  passageDigits,
  ...passagePartners,
  ...bats,
];
