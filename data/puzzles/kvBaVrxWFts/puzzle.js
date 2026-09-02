// Title: Solver, there's a fly on my Sudoku!
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=kvBaVrxWFts
// Source: https://sudokupad.app/1weh2nwtje

// Normal sudoku. Digits either side of a white dot are consecutive; either side
// of a black dot they are in ratio 1:2. There are no given digits, and the dots
// are not exhaustive (no negative constraint is stated).
//
// A fly flies orthogonally across the grid. Arriving at a cell it reads the
// digit: 2 sends it north, 4 east, 6 south, 8 west; an odd digit leaves its
// direction unchanged. It enters heading west at the arrow (into R5C9), exits
// heading east out of R9C9, crosses the border nowhere else, and never flies
// between two cells separated by a dot. It may cross its own path.
//
// The flight is therefore a function of the digits, and it is modelled as four
// boolean overlays: VN/VE/VS/VW at a cell say whether the fly leaves that cell
// heading north/east/south/west. The fly arrives at a cell heading in direction
// d exactly when the neighbour on the far side leaves heading d, so arrivals
// need no cells of their own -- except across the border, where the arrival is a
// constant: true only for the arrow at R5C9.
//
// Each cell's machine makes its four leave-flags an exact function of the four
// arrivals and the digit, so a flag can be set only where the fly is carried to
// it. The one flag pattern that does not lie on the flight is a closed circuit
// crossing no border edge; nothing here forbids one.

const NO = 1, YES = 2;   // overlay values

// Direction order is fixed: index 2 is the reverse of index 0 and index 3 the
// reverse of index 1, which the dot rule below relies on.
const DIRS = [
  { prefix: 'VN', label: 'leaves-north', dRow: -1, dCol: 0 },
  { prefix: 'VE', label: 'leaves-east', dRow: 0, dCol: 1 },
  { prefix: 'VS', label: 'leaves-south', dRow: 1, dCol: 0 },
  { prefix: 'VW', label: 'leaves-west', dRow: 0, dCol: -1 },
];
const [NORTH, EAST, SOUTH, WEST] = DIRS.map((_, d) => d);

// The turning digits. An absent digit (every odd one) means "carry on".
const TURN = new Map([[2, NORTH], [4, EAST], [6, SOUTH], [8, WEST]]);

// Drawn dots, transcribed from the two edge-mark layers of the source art.
const WHITE_DOTS = [
  ['R9C1', 'R9C2'], ['R8C3', 'R8C4'], ['R6C2', 'R7C2'], ['R6C6', 'R7C6'],
  ['R2C5', 'R2C6'], ['R4C6', 'R4C7'], ['R7C1', 'R8C1'], ['R5C2', 'R5C3'],
  ['R5C9', 'R6C9'], ['R6C1', 'R6C2'],
];
const BLACK_DOTS = [
  ['R9C3', 'R9C4'], ['R8C8', 'R9C8'], ['R8C8', 'R8C9'], ['R3C9', 'R4C9'],
  ['R6C9', 'R7C9'], ['R3C1', 'R3C2'], ['R3C3', 'R3C4'],
];

// The arrow outside the right edge of row 5, and the fly drawn on the east edge
// of R9C9 with its head pointing out of the grid.
const ENTRY = { cell: 'R5C9', dir: WEST };
const EXIT = { cell: 'R9C9', dir: EAST };

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const flags = DIRS.map(({ prefix }) => graph.makeOverlay(prefix));

// The cell the fly comes from when it arrives at `cell` heading `d`, and the
// cell it reaches when it leaves heading `d`; either is null across the border.
const arrivesFrom = (cell, d) => graph.step(cell, -DIRS[d].dRow, -DIRS[d].dCol);
const leavesTo = (cell, d) => graph.step(cell, DIRS[d].dRow, DIRS[d].dCol);

// One machine per cell, reading
//   [ leave-flags of the in-grid arrival neighbours, in direction order,
//     the cell's own digit,
//     the cell's own four leave-flags, in direction order ]
// `border` holds, for each direction, whether the fly arrives from outside in
// that direction (a constant), or null when that arrival is read from a
// neighbour instead. Machines are memoised on that pattern, so the interior,
// each edge, each corner and the entry cell compile one machine each.
const machines = new Map();
const flyMachine = (border) => {
  const key = border.map(v => v === null ? 'n' : (v ? 't' : 'f')).join('');
  if (!machines.has(key)) {
    const read = border.flatMap((v, d) => v === null ? [d] : []);
    machines.set(key, NFA.encodeSpec({
      // `arrived[d]` is "the fly arrives here heading d"; the border arrivals
      // are known before the scan starts.
      startState: { k: 0, arrived: border.map(v => v === true) },
      transition: (state, value) => {
        if (state.done) return undefined;   // sink: the scan ends here
        if (state.leaves === undefined) {
          if (state.k < read.length) {
            const arrived = state.arrived.slice();
            arrived[read[state.k]] = (value === YES);
            return { k: state.k + 1, arrived };
          }
          // `value` is the digit: it fixes every leave-flag. A turning digit
          // sends every arrival out of the one direction it names; an odd digit
          // passes each arrival straight through.
          const turn = TURN.get(value);
          const leaves = turn === undefined
            ? state.arrived
            : DIRS.map((_, d) => d === turn && state.arrived.some(Boolean));
          return { leaves, j: 0 };
        }
        if ((value === YES) !== state.leaves[state.j]) return undefined;
        const j = state.j + 1;
        return j === DIRS.length ? { done: true } : { leaves: state.leaves, j };
      },
      accept: (state) => state.done === true,
    }, 9));
  }
  return machines.get(key);
};

const flyRules = gridCells.map(cell => {
  const border = DIRS.map((_, d) => arrivesFrom(cell, d) === null
    ? (cell === ENTRY.cell && d === ENTRY.dir)
    : null);
  const arrivals = DIRS.flatMap((_, d) => {
    const from = arrivesFrom(cell, d);
    return from === null ? [] : [flags[d].at(from)];
  });
  return new NFA(flyMachine(border), 'fly', ...arrivals, cell,
    ...DIRS.map((_, d) => flags[d].at(cell)));
});

// Leaving a cell across a dotted edge, in either direction.
const dotCrossings = new Set([...WHITE_DOTS, ...BLACK_DOTS].flatMap(([a, b]) => {
  const from = parseCellId(a), to = parseCellId(b);
  const d = DIRS.findIndex(({ dRow, dCol }) =>
    from.row + dRow === to.row && from.col + dCol === to.col);
  return [`${a}:${d}`, `${b}:${(d + 2) % DIRS.length}`];
}));

// Every leave-flag is boolean, then narrowed where the fly is forced across the
// border (its exit) or forbidden from crossing an edge (every other border
// edge, and both ways across every dot).
const flagDomains = flags.map(overlay =>
  overlay.makeReplicate(new Given(overlay.at(gridCells[0]), NO, YES)));

const flagPins = gridCells.flatMap(cell => DIRS.flatMap((_, d) => {
  if (cell === EXIT.cell && d === EXIT.dir) return [new Given(flags[d].at(cell), YES)];
  const blocked = leavesTo(cell, d) === null || dotCrossings.has(`${cell}:${d}`);
  return blocked ? [new Given(flags[d].at(cell), NO)] : [];
}));

return [
  new Shape('9x9'),
  ...flags.map((overlay, d) => overlay.toVar(DIRS[d].label)),
  ...WHITE_DOTS.map(pair => new WhiteDot(...pair)),
  ...BLACK_DOTS.map(pair => new BlackDot(...pair)),
  ...flagDomains,
  ...flagPins,
  ...flyRules,
];
