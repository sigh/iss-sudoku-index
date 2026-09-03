// Title: Stay in Your Box
// Author: Marty Sears and Justin Vitanza
// Video: https://www.youtube.com/watch?v=uconYa_ca7w
// Source: https://sudokupad.app/j0e1hqfsp4

// Normal 9x9 sudoku, no given digits, plus:
//   - every box holds an invisible 'index line', 9 cells long, moving only
//     orthogonally, never leaving its own box, never crossing itself, and never
//     stepping across a border that carries a black or a green spot;
//   - each row, each column and each box holds exactly one diamond; a box's
//     diamond lies at one end of that box's index line and holds the box's own
//     number, boxes being numbered 1-9 in reading order;
//   - counting positions from the diamond end, the digit at position N gives the
//     position at which digit N sits (1st digit 3 => 3rd digit 1);
//   - two digits either side of a black spot are in a 1:2 ratio;
//   - two digits either side of a green spot differ by at least 5.
// Every clause is encoded; nothing is omitted. The spot lists are not
// exhaustive rules: the rules text never says every such pair is marked, so
// unmarked neighbours carry no constraint.
//
// A 3x3 box holds exactly 9 cells, so a 9-cell route inside one that never
// revisits a cell passes through every cell of the box exactly once. The line is
// therefore modelled by its visit order rather than by its edges: the Var
// overlay VP gives each grid cell its position 1..9 along its own box's line,
// with position 1 at the diamond end.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// The nine drawn spots, each an edge-centred circle on the border between two
// cells of one box. Black = filled #000000, green = filled #00ef0e.
const BLACK_SPOTS = [
  ['R4C2', 'R5C2'], ['R4C4', 'R5C4'], ['R5C9', 'R6C9'],
];
const GREEN_SPOTS = [
  ['R1C1', 'R1C2'], ['R1C5', 'R1C6'], ['R5C2', 'R5C3'],
  ['R4C7', 'R5C7'], ['R7C5', 'R7C6'], ['R7C8', 'R8C8'],
];

// A spot blocks its own border to the index line, whatever its colour.
const spotted = new Set([...BLACK_SPOTS, ...GREEN_SPOTS].flatMap(
  ([a, b]) => [a + '/' + b, b + '/' + a]));
const isStep = (a, b) =>
  graph.neighbours(a).includes(b) && !spotted.has(a + '/' + b);

const position = graph.makeOverlay('VP');
const boxes = graph.boxes();
// Unordered cell pairs within one box.
const boxPairs = cells => cells.flatMap(
  (a, i) => cells.slice(i + 1).map(b => [a, b]));

// --- The line visits every cell of its box exactly once. ---
// 9 positions over the box's 9 cells, all different, so the positions are a
// bijection onto 1..9 and the route needs no separate "visits each cell once"
// clause.
const distinctPositions = boxes.map(
  cells => new AllDifferent(...position.at(cells)));

// --- Consecutive positions are a single legal step. ---
// With the positions a bijection, exactly one pair of the box's cells holds
// positions i and i+1 for each i, so requiring every pair that is NOT a legal
// step to avoid consecutive positions is the whole route rule: orthogonal
// moves, confined to the box, and never across a spotted border.
const notConsecutiveKey = Pair.fnToKey((p, q) => Math.abs(p - q) !== 1, geometry);
const route = boxes.flatMap(cells => boxPairs(cells)
  .filter(([a, b]) => !isStep(a, b))
  .map(([a, b]) => new Pair(
    notConsecutiveKey, 'route', position.at(a), position.at(b))));

// --- The diamond: position 1 of box k holds digit k. ---
// The diamond lies at one end of the line and the positions are counted from
// that end, so the diamond is the cell at position 1. Reads (position, digit)
// of one cell: a cell at position 1 must hold the box number, and any other
// position leaves the digit free.
const diamondKeys = boxes.map(
  (cells, i) => Pair.fnToKey((p, d) => p !== 1 || d === i + 1, geometry));
const diamondDigits = boxes.flatMap((cells, i) => cells.map(
  cell => new Pair(diamondKeys[i], 'diamond', position.at(cell), cell)));

// --- Exactly one diamond in each row and each column. ---
// One per box is already forced: each box has exactly one cell at position 1.
const diamondLines = [...Array(geometry.numValues).keys()].flatMap(i => [
  new ContainExact('1', ...position.row(i + 1)),
  new ContainExact('1', ...position.column(i + 1)),
]);

// --- Indexing along the line. ---
// "The digit at position N sits at position D, where D is the digit at position
// N" makes the digit sequence along the line self-inverse: for two cells a and b
// of one box, position(a) equals digit(b) exactly when digit(a) equals
// position(b). Checking that for every pair of the box's cells is the whole
// rule, because the cell at position digit(a) is then forced to hold
// position(a).
// The machine reads position(a), digit(a), position(b), digit(b): it remembers
// position(a) and digit(a), notes at position(b) whether digit(a) was matched,
// and requires digit(b) to match position(a) exactly when it was.
const indexMachine = NFA.encodeSpec({
  startState: { phase: 'positionA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'positionA':
        return { phase: 'digitA', positionA: value };
      case 'digitA':
        return { phase: 'positionB', positionA: state.positionA, digitA: value };
      case 'positionB':
        return {
          phase: 'digitB',
          positionA: state.positionA,
          hit: value === state.digitA,
        };
      case 'digitB':
        return (value === state.positionA) === state.hit
          ? { phase: 'done' }
          : undefined;
    }
  },
  accept: state => state.phase === 'done',
}, geometry);
const indexing = boxes.flatMap(cells => boxPairs(cells).map(([a, b]) =>
  new NFA(indexMachine, 'index', position.at(a), a, position.at(b), b)));

return [
  new Shape('9x9'),
  position.toVar('line position'),
  ...distinctPositions,
  ...route,
  ...diamondDigits,
  ...diamondLines,
  ...indexing,
  ...BLACK_SPOTS.map(([a, b]) => new BlackDot(a, b)),
  // A green spot is a two-cell whisper: the pair differs by at least 5.
  ...GREEN_SPOTS.map(([a, b]) => new Whisper(5, a, b)),
];
