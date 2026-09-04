// Title: Timid Dominoes
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=WoNECwsrGaE
// Source: https://cracking-the-cryptic.web.app/sudoku/QrJQhBfBFD

// Rules (USPC 2017): Place the given dominoes into the grid so that numbers
// outside the grid indicate the sum of the digits in the corresponding
// row/column. Dominoes must be interconnected but can only touch at a corner
// (ie they can never share an edge).
// Board: 11x11 with 39 black cells that hold no domino half. A row or column
// with no printed number is unconstrained. The 19 given dominoes (pip pairs
// 0-6) are the legend printed below the board, listed in DOMINOES; each is
// placed exactly once on two orthogonally adjacent white cells. Nothing is
// omitted.
//
// Encoding: a grid cell holds its pip (0-6), 0 when no domino covers it.
// Overlay L: which neighbour is this cell's domino partner (0 none, 1 right,
// 2 left, 3 down, 4 up). Overlay P: the partner's pip, 7 when the cell has no
// partner. Layer B (21 rows x 11 columns): king-move connectivity bridge for
// the covered cells. All three are functions of the placement.

const NONE = 0, RIGHT = 1, LEFT = 2, DOWN = 3, UP = 4;
const NO_PARTNER = 7;   // P sentinel; pips are 0-6

// Black cells, from the drawn 1x1 black squares; '#' marks black, rows R1..R11.
const BLACK_ROWS = [
  '.##........',
  '.###.#.##..',
  '..#....###.',
  '....#...#..',
  '...###....#',
  '....###....',
  '#....###...',
  '..#...#....',
  '.###....#..',
  '..##.#.###.',
  '........##.',
];

// The 19 given dominoes, from the printed legend below the board (four
// columns of two-cell tiles, read down each column).
const DOMINOES = [
  [0, 0], [0, 1], [0, 2], [0, 3], [1, 1],
  [1, 2], [2, 2], [2, 3], [2, 4], [1, 3],
  [1, 4], [3, 3], [3, 4], [4, 4], [3, 5],
  [4, 5], [5, 5], [5, 6], [6, 6],
];

// Outside numbers: right of rows (R10 has none), below columns (C2, C10 none).
const ROW_CLUES = { 1: 8, 2: 3, 3: 10, 4: 5, 5: 14, 6: 7, 7: 3, 8: 6, 9: 10, 11: 12 };
const COL_CLUES = { 1: 6, 3: 13, 4: 7, 5: 8, 6: 7, 7: 11, 8: 7, 9: 6, 11: 17 };

const shape = new Shape('11x11', '0-7', 'Raw');
const graph = cellGraph('11x11');
const cells = graph.cells();
const L = graph.makeOverlay('VL');
const P = graph.makeOverlay('VP');
const B = new Var('B', 'Bridge', '21x11');

const isBlack = (cell) => {
  const { row, col } = parseCellId(cell);
  return BLACK_ROWS[row - 1][col - 1] === '#';
};
const DIRS = [[RIGHT, 0, 1], [LEFT, 0, -1], [DOWN, 1, 0], [UP, -1, 0]];
const isTile = (g, p) => DOMINOES.some(([a, b]) =>
  (g === a && p === b) || (g === b && p === a));

// Grid cells hold pips only (7 is reserved for P).
const pipDomain = graph.makeReplicate(new Given(cells[0], 0, 1, 2, 3, 4, 5, 6));

// L may only point at a white in-grid neighbour; black cells are never covered.
const linkDomain = cells.map(cell => new Given(L.at(cell), NONE,
  ...(isBlack(cell) ? [] : DIRS
    .filter(([, dR, dC]) => {
      const other = graph.step(cell, dR, dC);
      return other !== null && !isBlack(other);
    })
    .map(([dir]) => dir))));

// Per cell, reading [L, pip, P, B-coverage]: an uncovered cell holds pip 0,
// has no partner and coverage 0; a covered cell has a partner, coverage 1,
// and its (pip, partner pip) is one of the given tiles. The state carries
// whether the cell is covered and, until P is read, its pip.
const cellMachine = NFA.encodeSpec({
  startState: { phase: 'link' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'link':
        return { phase: 'pip', covered: value !== NONE };
      case 'pip':
        if (!state.covered && value !== 0) return undefined;
        return { phase: 'partner', covered: state.covered, pip: value };
      case 'partner':
        if (state.covered ? (value === NO_PARTNER || !isTile(state.pip, value))
          : value !== NO_PARTNER) return undefined;
        return { phase: 'bridge', covered: state.covered };
      case 'bridge':
        return value === (state.covered ? 1 : 0) ? { phase: 'done' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
const cellRules = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(cellMachine, 'cell',
    L.at(cell), cell, P.at(cell), B.cell(2 * row - 1, col));
});

// Per edge: the two link codes agree on whether this edge joins a domino, and
// two covered cells may share an edge only as the two halves of one domino.
const edgeKey = (toward, back) => Pair.fnToKey((a, b) =>
  (a === toward && b === back) ||
  (a !== toward && b !== back && (a === NONE || b === NONE)), shape);
const rightOrigins = cells.filter(cell => graph.step(cell, 0, 1) !== null);
const downOrigins = cells.filter(cell => graph.step(cell, 1, 0) !== null);
const edgeAgreement = [
  new Replicate(
    [new Pair(edgeKey(RIGHT, LEFT), '', L.at('R1C1'), L.at('R1C2'))],
    Replicate.encodeTargetCells(L.at(rightOrigins), L.at('R1C1'), L), L.at('R1C1')),
  new Replicate(
    [new Pair(edgeKey(DOWN, UP), '', L.at('R1C1'), L.at('R2C1'))],
    Replicate.encodeTargetCells(L.at(downOrigins), L.at('R1C1'), L), L.at('R1C1')),
];

// Per edge, reading [L1, P1, pip2, L2, P2, pip1]: whichever end's L points
// across this edge has the other end's pip as its P. The state carries the
// P just read until the pip it must match arrives.
const partnerMachine = (toward, back) => NFA.encodeSpec({
  startState: { phase: 'l1' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'l1': return { phase: 'p1', linked: value === toward };
      case 'p1': return { phase: 'g2', want: state.linked ? value : null };
      case 'g2':
        return state.want === null || state.want === value ? { phase: 'l2' } : undefined;
      case 'l2': return { phase: 'p2', linked: value === back };
      case 'p2': return { phase: 'g1', want: state.linked ? value : null };
      case 'g1':
        return state.want === null || state.want === value ? { phase: 'done' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
const partnerPips = [
  ...rightOrigins.map(cell => [cell, graph.step(cell, 0, 1), partnerMachine(RIGHT, LEFT)]),
  ...downOrigins.map(cell => [cell, graph.step(cell, 1, 0), partnerMachine(DOWN, UP)]),
].map(([a, b, machine]) => new NFA(machine, 'partner',
  L.at(a), P.at(a), b, L.at(b), P.at(b), a));

// Each given tile is placed exactly once: exactly two cells belong to a domino
// with that pip pair. Reads [pip, partner pip] for every cell in turn; the
// state carries the cell's pip between the two reads and the count so far.
const gridWithPartners = cells.flatMap(cell => [cell, P.at(cell)]);
const tileCounts = DOMINOES.map(([a, b]) => {
  const spec = NFA.encodeSpec({
    startState: { pip: null, count: 0 },
    transition: ({ pip, count }, value) => {
      if (pip === null) return { pip: value, count };
      const hit = (pip === a && value === b) || (pip === b && value === a);
      const next = count + (hit ? 1 : 0);
      return next > 2 ? undefined : { pip: null, count: next };
    },
    accept: ({ pip, count }) => pip === null && count === 2,
  }, shape);
  return new NFA(spec, `tile${a}${b}`, ...gridWithPartners);
});

const rowSums = Object.entries(ROW_CLUES).map(([r, total]) =>
  new Sum(total, ...graph.row(Number(r))));
const colSums = Object.entries(COL_CLUES).map(([c, total]) =>
  new Sum(total, ...graph.column(Number(c))));

// Interconnected dominoes: with no shared edges, dominoes meet only at
// corners, so the covered cells must form one king-move connected group.
// Layer B: row 2i-1 is board row i's coverage (0/1, tied above); row 2i is a
// bridge row, 1 exactly where board row i or i+1 is covered beneath it. Two
// diagonal neighbours then meet through two adjacent bridge cells, and a
// bridge cell joins nothing else, so orthogonal connectivity of the 1s in B
// is king-move connectivity of the covered cells.
// Down each B column, reading board, bridge, board, ...: every value is 0/1;
// a bridge under a covered board cell is 1; a bridge under an uncovered board
// cell equals the next board cell. The state holds the last board value and
// the last bridge value.
const bridgeMachine = NFA.encodeSpec({
  startState: { phase: 'board', board: null, bridge: null },
  transition: ({ phase, board, bridge }, value) => {
    if (value !== 0 && value !== 1) return undefined;
    if (phase === 'board') {
      if (board === 0 && value !== bridge) return undefined;
      return { phase: 'bridge', board: value, bridge: null };
    }
    if (board === 1 && value !== 1) return undefined;
    return { phase: 'board', board, bridge: value };
  },
  accept: ({ phase }) => phase === 'bridge',
}, shape);
const bridgeColumns = Array.from({ length: 11 }, (_, c) => new NFA(bridgeMachine, 'bridge',
  ...Array.from({ length: 21 }, (_, r) => B.cell(r + 1, c + 1))));

return [
  shape,
  L.toVar('Link'),
  P.toVar('Partner'),
  B,
  pipDomain,
  ...linkDomain,
  ...cellRules,
  ...edgeAgreement,
  ...partnerPips,
  ...tileCounts,
  ...rowSums,
  ...colSums,
  ...bridgeColumns,
  new ConnectedValues('VB', 1),
];
