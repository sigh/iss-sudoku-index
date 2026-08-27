// Title: Accumulator
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=mLipKMzcRYY
// Source: https://sudokupad.app/bjvft4ipmz

// Normal 6x6 sudoku, plus an undrawn path that steps between orthogonally
// adjacent cells, visits every cell exactly once, and may start and end
// anywhere. A cell's VALUE is its own digit plus the sum of every digit
// visited earlier on the path (so the path's first cell has value = its own
// digit). A pink clue gives a cell's value. A black dot between two cells
// means one's value is double the other's (direction not stated, so either
// way is allowed); a white dot means the two values are consecutive.
//
// The path is carried as a visit-order position 1..36 per cell (two Var
// overlays VPH/VPL, position = 6*(VPH-1)+VPL) and each cell's VALUE (two Var
// overlays VVH/VVL, value = 16*(VVH-1)+VVL, since a value can reach the
// grid's full digit sum of 126). Both quantities are linear in their two
// Vars, so every rule below is a plain equation (`Sum`) or a small `Or` over
// a cell's (at most four) neighbours -- no state machine is needed.

const shape = new Shape('6x6', 16);
const graph = cellGraph(shape);
const cells = graph.cells();
const N = 6; // the grid's own digit count, independent of the widened alphabet

const posHigh = graph.makeOverlay('VPH');
const posLow = graph.makeOverlay('VPL');
const valHigh = graph.makeOverlay('VVH');
const valLow = graph.makeOverlay('VVL');

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// position(c) = N*(VPH(c)-1) + VPL(c); position(c) is exactly 1 iff both
// layers are 1.
const positionIsOne = cell => new And([
  new Given(posHigh.at(cell), 1), new Given(posLow.at(cell), 1),
]);
// position(a) - position(b) = 1, i.e. b is a's predecessor on the path.
const isPredecessor = (a, b) => new Sum(1,
  [posHigh.at(a), N], [posLow.at(a), 1], [posHigh.at(b), -N], [posLow.at(b), -1]);

// --- The path's visit order: every cell but the first has an orthogonal
// neighbour one position earlier. Nothing pins which cell is first or last --
// the rules leave both undetermined -- so this alone would allow several
// disjoint sub-paths/cycles sharing the position range between them.
// `mustReachTop` closes that gap by asserting only that *some* cell reaches
// position 36: chasing this rule backward from that cell strings together 36
// pairwise-distinct cells (each link's position is exactly one less than the
// last, so no cell can recur), which is the whole grid -- so every position
// 1..36 is used exactly once and the result is a genuine, freely-ended
// Hamiltonian path. (cZjpWVk2dhU.3 gets the same bijection from one direction
// of this rule plus two *fixed* endpoints; here neither endpoint is fixed, so
// the rule instead needs one endpoint's position pinned to the top of the
// range, at a cell of the solver's own choosing.)
const path = cells.map(cell => new Or([
  positionIsOne(cell),
  ...graph.neighbours(cell).map(n => isPredecessor(cell, n)),
]));

const mustReachTop = new Or(cells.map(cell => new And([
  new Given(posHigh.at(cell), N), new Given(posLow.at(cell), N),
])));

// --- Each cell's VALUE: its own digit when it is the path's first cell
// (position 1), else the predecessor's value plus its own digit. `path` plus
// `mustReachTop` already force the position numbering into a bijection, so
// every cell above position 1 has exactly one neighbour holding position - 1;
// pairing that same predecessor test with the value equation below picks it
// out again without needing to have identified it elsewhere.
const valueIsOwnDigit = cell => new Sum(16,
  [valHigh.at(cell), 16], [valLow.at(cell), 1], [cell, -1]);
const valueIsAccumulated = (cell, predecessor) => new Sum(0,
  [valHigh.at(cell), 16], [valLow.at(cell), 1],
  [valHigh.at(predecessor), -16], [valLow.at(predecessor), -1], [cell, -1]);
const accumulate = cells.map(cell => new Or([
  new And([positionIsOne(cell), valueIsOwnDigit(cell)]),
  ...graph.neighbours(cell).map(n => new And([
    isPredecessor(cell, n), valueIsAccumulated(cell, n),
  ])),
]));

// --- Pink value clues. Cells and values from the drawn pink pill markers.
const decompose = v => ({ h: Math.floor((v - 1) / 16) + 1, l: ((v - 1) % 16) + 1 });
const VALUE_CLUES = { R1C2: 90, R4C3: 23, R5C2: 125, R6C2: 3 };
const valueClues = Object.entries(VALUE_CLUES).flatMap(([cell, v]) => {
  const { h, l } = decompose(v);
  return [new Given(valHigh.at(cell), h), new Given(valLow.at(cell), l)];
});

// --- Black dot: the two cells' VALUES have one double the other (either way,
// since the rule does not say which). value = 16*(VVH-1)+VVL, so
// value(a) = 2*value(b) expands to 16*VVHa + VVLa - 32*VVHb - 2*VVLb = -16.
const doubling = (a, b) => new Or([
  new Sum(-16, [valHigh.at(a), 16], [valLow.at(a), 1],
    [valHigh.at(b), -32], [valLow.at(b), -2]),
  new Sum(-16, [valHigh.at(b), 16], [valLow.at(b), 1],
    [valHigh.at(a), -32], [valLow.at(a), -2]),
]);
// --- White dot: the two cells' VALUES are consecutive, either order.
const consecutive = (a, b) => new Or([
  new Sum(1, [valHigh.at(a), 16], [valLow.at(a), 1],
    [valHigh.at(b), -16], [valLow.at(b), -1]),
  new Sum(-1, [valHigh.at(a), 16], [valLow.at(a), 1],
    [valHigh.at(b), -16], [valLow.at(b), -1]),
]);

// Edge dots, from the drawn circles sitting on the cell borders.
const BLACK_DOTS = [['R5C3', 'R6C3'], ['R4C4', 'R5C4']];
const WHITE_DOTS = [['R5C4', 'R6C4'], ['R2C5', 'R2C6']];

return [
  shape,
  posHigh.toVar('position high'), posLow.toVar('position low'),
  valHigh.toVar('value high'), valLow.toVar('value low'),

  // Domains: grid digits back to 1-6; positions 1-6 per layer (base 6, exact);
  // value layers 1-8 / 1-16 (base 16, headroom to 128 against a true max of
  // 126 -- the fixed digit sum of a 6x6 grid using digits 1-6).
  graph.makeReplicate(new Given(cells[0], ...range(1, N))),
  posHigh.makeReplicate(new Given(posHigh.at(cells[0]), ...range(1, N))),
  posLow.makeReplicate(new Given(posLow.at(cells[0]), ...range(1, N))),
  valHigh.makeReplicate(new Given(valHigh.at(cells[0]), ...range(1, 8))),
  valLow.makeReplicate(new Given(valLow.at(cells[0]), ...range(1, 16))),

  ...path,
  mustReachTop,
  ...accumulate,
  ...valueClues,
  ...BLACK_DOTS.map(([a, b]) => doubling(a, b)),
  ...WHITE_DOTS.map(([a, b]) => consecutive(a, b)),
];
