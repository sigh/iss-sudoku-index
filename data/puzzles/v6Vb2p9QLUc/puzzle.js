// Title: The Inauguration Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=v6Vb2p9QLUc
// Source: https://cracking-the-cryptic.web.app/sudoku/jjj2LdLLt8

// Standard sudoku. Digits increase along each thermometer from the bulb to
// the end. Clues outside the grid give the sum of the indicated diagonal
// (values may repeat along it). Every 4 must be orthogonally adjacent to at
// least one 6; a 4 may never be the immediate predecessor of a 6 along a
// thermometer, even though such a pair would otherwise satisfy the
// increasing rule. The drawn flag colouring (red/blue cell backgrounds) and
// the video description's note that the thermos trace the flag's stripes and
// stars are decorative framing -- the rules text gives no rule keyed to
// colour or to the flag motif, so they are not encoded.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Givens, transcribed from the drawn grid.
const givens = [
  new Given('R1C3', 9),
  new Given('R3C5', 4),
  new Given('R3C8', 2),
  new Given('R3C9', 1),
  new Given('R4C3', 7),
  new Given('R6C1', 5),
  new Given('R6C7', 6),
  new Given('R8C9', 8),
  new Given('R9C1', 3),
  new Given('R9C3', 1),
];

// Thermometers, transcribed bulb-first from the drawn lines. Four of them
// (marked below) are drawn tip-first with the bulb mark at the far end of
// the stroke; those are listed here already reversed to bulb-first order.
const thermoCells = [
  ['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4'],
  ['R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1'],
  ['R7C5', 'R7C4'],
  ['R6C2', 'R6C3', 'R6C4', 'R6C5'],
  ['R5C9', 'R5C8'],
  ['R4C1', 'R3C1', 'R4C2'],
  ['R2C1', 'R3C2', 'R4C3'],   // drawn tip-first, reversed here
  ['R1C1', 'R2C2', 'R3C3'],   // drawn tip-first, reversed here
  ['R1C2', 'R2C3', 'R1C3'],   // drawn tip-first, reversed here
  ['R2C4', 'R1C5', 'R2C5', 'R1C4'],   // drawn tip-first, reversed here
  ['R4C4', 'R3C5', 'R3C4', 'R4C5'],
];
const thermos = thermoCells.map(cells => new Thermo(...cells));

// Outside diagonal-sum clues ("little killers"): each drawn arrow gives a
// start cell and direction, paired with the nearest clue-text badge. Each
// diagonal is computed to the grid edge from its drawn start cell/direction,
// rather than hand-listing every cell. Video description flavour text (1/20/21
// American-format inauguration date; 46 = Biden's presidency number; 30 = his
// age entering the Senate) corroborates the read but is not the ground for
// it -- the arrow geometry is.
// The "1" corner diagonal is a single cell, which LittleKiller.fromCells
// rejects (its cellMap skips diagonals of length <= 1); use Sum there.
const littleKillers = [
  LittleKiller.fromCells(20, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R4C1', -1, 1), geometry),
  LittleKiller.fromCells(46, graph.ray('R8C1', -1, 1), geometry),
  LittleKiller.fromCells(30, graph.ray('R9C6', -1, -1), geometry),
];
const cornerSum = new Sum(1, 'R1C1');

// "Every 4 must be orthogonally connected to a 6": for every grid cell, if
// its value is 4 then at least one of its (up to 4) orthogonal neighbours is
// 6. One NFA per cell reads [cell, ...orthogonal neighbours]: a first value
// of 4 moves to a 'need6' state, which only a later neighbour reading 6
// clears to 'found'; both 'free' (first value != 4) and 'found' accept, only
// 'need6' rejects.
const need6Machine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase }, value) => {
    if (phase === 'start') {
      return value === 4 ? { phase: 'need6' } : { phase: 'free' };
    }
    if (phase === 'need6') {
      return value === 6 ? { phase: 'found' } : { phase: 'need6' };
    }
    return { phase };  // 'free' and 'found' are already satisfied.
  },
  accept: ({ phase }) => phase !== 'need6',
}, geometry.numValues);
const fourNeedsSix = graph.cells().map(
  cell => new NFA(
    need6Machine, 'four-needs-six', ...[cell, ...graph.neighbours(cell)]));

// "A 4 can never be next to a 6 in a thermo": forbid a thermo-consecutive
// (4, 6) pair. Thermo values strictly increase bulb-to-tip, so 6 can only
// ever follow 4 (never precede it) on consecutive thermo cells; applying an
// ordered-pair relation to each thermometer's own bulb-first cell list (via
// Pair, which binds consecutive list entries) covers exactly its
// thermo-consecutive edges and nothing else.
const noFourSixKey = Pair.fnToKey((a, b) => !(a === 4 && b === 6), 9);
const noFourSixOnThermo = thermoCells.map(
  (cells, i) => new Pair(noFourSixKey, `no-4-6-thermo-${i}`, ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
  ...littleKillers,
  cornerSum,
  ...fourNeedsSix,
  ...noFourSixOnThermo,
];
