// Title: LCM Fan
// Author: Chameleon
// Video: https://www.youtube.com/watch?v=v_JyKBFCTWA
// Source: https://app.crackingthecryptic.com/sudoku/Ngn4D93Jjp

// Normal sudoku rules -- Shape('9x9') supplies rows, columns and the 3x3
// boxes, which match the puzzle's regions exactly.
//
// White dots join grid-adjacent cells with consecutive digits; not every
// dot is drawn, so a missing dot means nothing (WhiteDot per drawn pair
// only, no negative claim about undrawn edges).
//
// "The lowest common multiple of all digits on a connected grey line is
// lower than 10 (could be a different number for different lines)": four
// grey lines are drawn, but two of them -- the two diagonal strokes -- meet
// at the shared cell R5C5, so per the rule's own "connected" wording they
// count as one line for this clue. The other two short diagonals and the
// 32-cell closed fan path each stand alone: nothing drawn or stated merges
// or splits them further (each is its own unbroken stroke, touching none of
// the others), so the default one-clue-per-drawn-line reading is kept.

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

// State = running LCM of the digits read so far on the line (a value in
// 1..9, since every accepted state is already < 10). A transition is
// rejected (returns undefined) the moment folding in the next digit would
// push the LCM to 10 or above; any state that survives to the end already
// satisfies the rule, so accept is unconditional.
const lcmBelow10 = NFA.encodeSpec({
  startState: 1,
  transition: (state, value) => {
    const next = lcm(state, value);
    return next < 10 ? next : undefined;
  },
  accept: () => true,
}, 9);

const lcmLine = (name, cells) => new NFA(lcmBelow10, name, ...cells);

// Grey-line groups, transcribed from the four drawn grey strokes.
const greyGroups = {
  // Two diagonal strokes, sharing cell R5C5.
  X: ['R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R4C6', 'R3C7', 'R2C8'],
  // Short diagonal stroke.
  Y: ['R6C5', 'R5C6'],
  // Short straight stroke.
  Z: ['R9C5', 'R9C6'],
  // One closed 32-cell stroke spanning 8 of the 9 boxes.
  F: [
    'R1C2', 'R1C3', 'R2C4', 'R3C5', 'R3C6', 'R2C6', 'R1C7', 'R1C8', 'R2C9', 'R3C9',
    'R4C8', 'R5C7', 'R6C7', 'R6C8', 'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R8C6', 'R7C5',
    'R7C4', 'R8C4', 'R9C3', 'R9C2', 'R8C1', 'R7C1', 'R6C2', 'R5C3', 'R4C3', 'R4C2',
    'R3C1', 'R2C1',
  ],
};

// White dots (7 overlays), each a plain edge-adjacent consecutive pair.
const whiteDots = [
  ['R3C1', 'R3C2'],
  ['R4C3', 'R4C4'],
  ['R5C1', 'R6C1'],
  ['R8C7', 'R8C8'],
  ['R6C8', 'R7C8'],
  ['R8C6', 'R9C6'],
  ['R2C9', 'R3C9'],
];

return [
  new Shape('9x9'),
  ...Object.entries(greyGroups).map(([name, cells]) => lcmLine(`lcm-${name}`, cells)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
