// Title: Dynamic Dots
// Author: Niverio
// Video: https://www.youtube.com/watch?v=dTIpvZDb0R8
// Source: https://app.crackingthecryptic.com/sudoku/q4LqbrBR4b

// Standard 9x9 sudoku, normal boxes. One given: R9C9=4.
//
// 35 grey dots join orthogonally adjacent cells. Each grey dot represents
// exactly one of: White (consecutive), Black (2:1 ratio), V (sum 5),
// X (sum 10) -- a pair satisfying zero, or two-or-more, of these four
// relations cannot legally sit on a grey dot (rules' worked example: 2-3 is
// simultaneously a valid white dot and a valid V, so that pair is excluded).
//
// Where a cell anchors several grey dots to different neighbours, those
// dots must each realise a DIFFERENT one of the four types.
//
// "Not all possible dots are given" rules out encoding the negative for
// undrawn edges: only the 35 drawn dots are constrained.

// Grey dot edges, transcribed from the puzzle's drawn overlay marks
// (35 edge-sized rounded grey circles).
const dotEdges = [
  ['R1C1', 'R2C1'], ['R2C1', 'R2C2'], ['R1C2', 'R2C2'], ['R1C2', 'R1C3'],
  ['R1C3', 'R1C4'], ['R2C2', 'R2C3'], ['R2C3', 'R3C3'], ['R3C3', 'R3C4'],
  ['R3C3', 'R4C3'], ['R2C2', 'R3C2'], ['R3C1', 'R3C2'], ['R3C1', 'R4C1'],
  ['R4C1', 'R4C2'], ['R4C1', 'R5C1'], ['R6C2', 'R6C3'], ['R5C3', 'R6C3'],
  ['R5C3', 'R5C4'], ['R5C4', 'R6C4'], ['R8C3', 'R8C4'], ['R8C4', 'R9C4'],
  ['R9C6', 'R9C7'], ['R7C6', 'R7C7'], ['R6C6', 'R6C7'], ['R6C6', 'R7C6'],
  ['R6C7', 'R7C7'], ['R4C5', 'R4C6'], ['R4C6', 'R4C7'], ['R3C7', 'R4C7'],
  ['R3C7', 'R3C8'], ['R3C8', 'R3C9'], ['R3C9', 'R4C9'], ['R4C8', 'R5C8'],
  ['R1C6', 'R1C7'], ['R1C6', 'R2C6'], ['R2C4', 'R2C5'],
];

const TYPE_CODE = { white: 1, black: 2, v: 3, x: 4 };

// The grey-dot types (a,b) simultaneously satisfies. A valid grey dot pair
// satisfies exactly one.
function relTypes(a, b) {
  const types = [];
  if (Math.abs(a - b) === 1) types.push('white');
  if (a === 2 * b || b === 2 * a) types.push('black');
  if (a + b === 5) types.push('v');
  if (a + b === 10) types.push('x');
  return types;
}

// 0 means "not a valid grey dot" (zero or 2+ relations hold).
function relType(a, b) {
  const types = relTypes(a, b);
  return types.length === 1 ? TYPE_CODE[types[0]] : 0;
}

const greyDotOk = Pair.fnToKey((a, b) => relTypes(a, b).length === 1, 9);
const dotConstraints = dotEdges.map(
  ([a, b]) => new Pair(greyDotOk, 'grey dot', a, b));

// NFA over [sharedCell, neighbourA, neighbourB]: computes the type of the
// (shared, neighbourA) dot and the (shared, neighbourB) dot and accepts iff
// both are valid grey dots and the two types differ -- "each such grey dot
// must have a different property in terms of which constraint it
// represents".
const distinctTypeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, shared: value };
    if (state.phase === 1) {
      return { phase: 2, shared: state.shared, t1: relType(state.shared, value) };
    }
    const t2 = relType(state.shared, value);
    return { phase: 3, ok: t2 !== 0 && state.t1 !== 0 && t2 !== state.t1 };
  },
  accept: state => state.phase === 3 && state.ok,
}, 9);

// Incident-neighbour lists per cell, derived from dotEdges.
const incident = {};
for (const [a, b] of dotEdges) {
  if (!incident[a]) incident[a] = [];
  if (!incident[b]) incident[b] = [];
  incident[a].push(b);
  incident[b].push(a);
}

const distinctTypeConstraints = [];
for (const cell of Object.keys(incident)) {
  const neighbours = incident[cell];
  for (let i = 0; i < neighbours.length; i++) {
    for (let j = i + 1; j < neighbours.length; j++) {
      distinctTypeConstraints.push(new NFA(
        distinctTypeSpec, 'distinct dot types', cell, neighbours[i], neighbours[j]));
    }
  }
}

return [
  new Shape('9x9'),
  new Given('R9C9', 4),
  ...dotConstraints,
  ...distinctTypeConstraints,
];
