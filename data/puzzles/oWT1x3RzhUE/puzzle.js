// Title: Thermo Ninesweeper
// Author: Albin Bernhardsson
// Video: https://www.youtube.com/watch?v=oWT1x3RzhUE
// Source: https://app.crackingthecryptic.com/sudoku/QJ9LLGfqDN

// Normal sudoku, standard 3x3 boxes, no givens. Five thermometers: digits
// strictly increase from the bulb (drawn circle) to the tip. One cell is
// marked green (the single yellow-green underlay, R4C4): its digit must
// equal the count of 9s among its up-to-eight king-move neighbours. Every
// other cell's digit must NOT equal that same count for its own
// neighbourhood ("no other cell can have this relationship").
//
// Encoding: a per-cell "is this digit a 9" flag Var (values 1/2 for
// false/true, pinned by an Or of Given pairs -- no alphabet widening needed
// since the flag never has to hold a literal 0). For every grid cell, a
// two-segment NFA reads [own digit, neighbour flags...] and tracks (target
// = own digit, count = neighbours flagged 9 so far); one shared spec accepts
// count === target (used only for the green cell), the other accepts
// count !== target (used for all 80 remaining cells).

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const allCells = graph.cells();
const greenCell = 'R4C4';

// Thermometers, bulb first. Transcribed from `lines`, bulb identified by the
// drawn circle overlay on top of it; thermo 1 is drawn tip-first in the
// payload so its cell order is reversed here to read bulb-to-tip.
const thermos = [
  ['R3C2', 'R2C3', 'R1C3'],
  ['R6C3', 'R5C3', 'R4C4', 'R4C5', 'R4C6', 'R5C7', 'R5C8', 'R4C9'],
  ['R8C5', 'R7C5', 'R8C6', 'R9C7', 'R9C8'],
  ['R8C2', 'R7C1', 'R6C1', 'R5C1'],
  ['R2C8', 'R1C7'],
];

const flags = graph.makeOverlay('VN');

// Reads [own digit, neighbour flags...] as two segments (SEGMENT_BREAK
// between them). `target` is set from the first segment (the own digit);
// `count` then accumulates flag=2 ("is a 9") hits over the second segment,
// clamped so it never needs to exceed target+1. wantEqual selects which of
// the two relationships (count === target / count !== target) the machine
// accepts.
const nineCountSpec = (wantEqual) => NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (value === SEGMENT_BREAK) return { target, count: 0 };
    if (target === null) return { target: value, count: 0 };
    const hit = value === 2 ? 1 : 0;
    return { target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) =>
    target !== null && (wantEqual ? count === target : count !== target),
  maxDepth: 12,
}, 9, { multiSegment: true });
const equalSpec = nineCountSpec(true);
const notEqualSpec = nineCountSpec(false);

return [
  shape,

  flags.toVar('NineFlag'),
  ...allCells.map(cell => new Or([
    new And([new Given(cell, 9), new Given(flags.at(cell), 2)]),
    new And([new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8), new Given(flags.at(cell), 1)]),
  ])),

  ...thermos.map(cells => new Thermo(...cells)),

  ...allCells.map(cell => new NFA(
    cell === greenCell ? equalSpec : notEqualSpec,
    'NS',
    [cell],
    flags.at(graph.kingNeighbours(cell)),
  )),
];
