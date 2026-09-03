// Title: Assembly Required
// Author: Staxis
// Video: https://www.youtube.com/watch?v=PZkQtQow_MY
// Source: https://sudokupad.app/vanmy8509l

// Normal sudoku, on an empty grid. Nothing is drawn except 20 coloured
// circles: the arrows, region sum lines, Renbans, Dutch whispers and parity
// lines are not given and must be placed by the solver.
//
// Encoded:
//  - A role code per cell (the VR overlay) naming the clue type that covers it,
//    or NONE. One code per cell is "no cells are a member of more than one of
//    these extra regions".
//  - Each drawn circle fixes its cell's role from its fill colour: white on an
//    arrow, blue on a region sum line, pink on a Renban, orange on a Dutch
//    whisper, red on a parity line. The circle may sit anywhere on the clue,
//    so it fixes membership only.
//  - "There are exactly 9 cells on arrows (circles and lines combined) and they
//    contain all numbers 1-9. The same is true for region sums, Renbans, Dutch
//    whispers, and parity lines": for every digit, each of the five roles
//    covers that digit exactly once. Nine digits at one cell each is also the
//    "exactly 9 cells" half of the sentence.
//  - A relaxation of the length rules -- "all arrows must have one or more
//    attached lines", "all region sum lines must visit multiple regions", "all
//    Renbans lines, Dutch whisper lines, and parity lines must be at least 2
//    cells long". Every clue therefore covers at least two cells, so each
//    clued cell has a neighbour on its own clue; for a Dutch whisper or parity
//    cell that neighbour also satisfies the type's adjacency rule. Consecutive
//    cells of a clue are king-move adjacent: the rules let two clues "cross
//    diagonally", which only a diagonal step can do.
//
// Omitted. The clue shapes are the puzzle's answer, and an unknown partition of
// a cell set into an unknown number of independently shaped lines is not
// expressible here, so none of the following is stated:
//  - which cells form each individual arrow or line, or which cell is a bulb;
//  - "Digits on each line sum to the digit in the circled cell";
//  - "Region borders divide region sum lines into regions with equal sum", and
//    "all region sum lines must visit multiple regions";
//  - "Renban lines contain a set of consecutive digits in any order";
//  - the Dutch whisper and parity rules along a whole line, beyond the
//    single-neighbour relaxation above.

const ARROW = 1, REGION_SUM = 2, RENBAN = 3, WHISPER = 4, PARITY = 5, NONE = 6;
const ROLES = [ARROW, REGION_SUM, RENBAN, WHISPER, PARITY];

const graph = cellGraph('9x9');
const roles = graph.makeOverlay('VR');

// The 20 drawn circles, transcribed by fill colour; nothing else is drawn.
const circles = [
  [ARROW, ['R2C5', 'R6C4', 'R6C6']],                          // white (unfilled)
  [REGION_SUM, ['R4C4', 'R5C7', 'R9C2']],                     // blue
  [RENBAN, ['R1C4', 'R2C8', 'R8C5', 'R9C1']],                 // pink
  [WHISPER, ['R4C3', 'R5C1', 'R5C5', 'R8C1', 'R9C4']],        // orange
  [PARITY, ['R2C2', 'R3C9', 'R6C9', 'R8C3', 'R8C9']],         // red
];

// digit, role, digit, role, ... over the whole grid in reading order.
const digitsAndRoles = cells => cells.flatMap(cell => [cell, roles.at(cell)]);

// One machine per digit, scanning every cell's digit next to its role: each of
// the five roles must take this digit exactly once. `pending` carries whether
// the digit just read was this machine's digit, so the role that follows can be
// counted; a role seen twice for the same digit is rejected on the spot, and
// `accept` demands all five bits.
const ALL_ROLES_SEEN = (1 << ROLES.length) - 1;
const digitCoverSpec = digit => NFA.encodeSpec({
  startState: { seen: 0, pending: null },
  transition: ({ seen, pending }, value) => {
    if (pending === null) return { seen, pending: value === digit };
    if (!pending || value === NONE) return { seen, pending: null };
    if (value > NONE) return undefined;             // not a role code
    const bit = 1 << (value - 1);
    if (seen & bit) return undefined;               // this role already has it
    return { seen: seen | bit, pending: null };
  },
  accept: ({ seen, pending }) => pending === null && seen === ALL_ROLES_SEEN,
}, 9);

// One machine per cell, scanning the cell's own digit and role and then each
// king-move neighbour's digit and role. It looks for one neighbour sharing the
// cell's role; for a Dutch whisper cell that neighbour's digit must also differ
// by at least 4, and for a parity cell it must be of the other parity. States:
// `p` is the scan phase (0 own digit, 1 own role, 2 neighbour digit, 3
// neighbour role, 9 found), `g` the cell's own digit, `r` its role, and `ok`
// whether the neighbour digit just read would satisfy the role's rule.
const partnerFound = 9;
const partnerSpec = NFA.encodeSpec({
  startState: { p: 0 },
  transition: ({ p, g, r, ok }, value) => {
    switch (p) {
      case 0: return { p: 1, g: value };
      case 1: return value === NONE ? { p: partnerFound }
        : value > NONE ? undefined : { p: 2, g, r: value };
      case 2: return {
        p: 3, g, r,
        ok: r === WHISPER ? Math.abs(g - value) >= 4
          : r === PARITY ? (g + value) % 2 === 1
            : true,
      };
      case 3: return ok && value === r ? { p: partnerFound } : { p: 2, g, r };
      default: return { p: partnerFound };
    }
  },
  accept: ({ p }) => p === partnerFound,
}, 9);

return [
  new Shape('9x9'),
  roles.toVar('clue role'),
  roles.makeReplicate(new Given(roles.at('R1C1'), ...ROLES, NONE)),
  ...circles.flatMap(([role, cells]) =>
    cells.map(cell => new Given(roles.at(cell), role))),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => new NFA(
    digitCoverSpec(digit), `digit ${digit} once per role`,
    ...digitsAndRoles(graph.cells()))),
  ...graph.cells().map(cell => new NFA(
    partnerSpec, `${cell} clue partner`,
    ...digitsAndRoles([cell, ...graph.kingNeighbours(cell)]))),
];
