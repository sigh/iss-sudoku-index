// Title: Two-two Train
// Author: Goargula
// Video: https://www.youtube.com/watch?v=dbXeHMzXs64
// Source: https://app.crackingthecryptic.com/sudoku/RGhRqJJQ3G

// Rules encoded (standard 9x9 sudoku plus):
// - A closed loop visits some cells (the "train"). It never enters box 5.
// - Exactly four digit VALUES are consistent for the whole grid ("stations,
//   meadows, forests, tunnels"); the loop passes through a cell iff that
//   cell's digit is one of those four. Every box except box 5 already holds
//   all nine digits once each (box all-different), so "the loop passes
//   through all four digits exactly once in every box but box 5" reduces to:
//   a non-box-5 cell is on the loop iff its digit is one of the four, and no
//   box-5 cell is ever on the loop.
// - The loop does not touch itself (ordinary "closed loop path" reading,
//   as in nordschleife.js / loop_entropic.js): on-loop cells are exactly
//   2-regular under orthogonal adjacency and form one connected region, which
//   forces a single simple cycle.
// - The red cell (R8C7) is a station, i.e. on the loop.
// - Outside clues: "the sum up to (and including) the station from that
//   direction" is read as a standard outside-sum reading-order clue: sum the
//   row from that border inward, stopping at (and including) that row's own
//   occurrence of the station digit. Every row holds the station digit
//   exactly once (row all-different), so this is well-defined regardless of
//   the loop. (The row 8 clue, 32, independently checks out against the
//   drawn station position R8C7: 22+32 both sit far below a straight full
//   sum, consistent with stopping partway across the row.)
// - Cages: no repeated digits; sums given only where drawn.
// - Black dots: 1:2 ratio (BlackDot). Not all dots are given, so no negative
//   constraint elsewhere (silence, not a universal "all dots shown").

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;

const ON = 1;   // on-loop / terrain-digit flag value
const OFF = 2;  // off-loop / non-terrain-digit flag value

// --- Loop membership overlay: one Var per grid cell, ON/OFF. ---
const onloop = graph.makeOverlay('VO');
const membershipDomain = onloop.makeReplicate(new Given(onloop.cells()[0], ON, OFF));

// --- Terrain-digit flags: one Var per digit 1-9, ON if that digit is one of
// the four consistent "station/meadow/forest/tunnel" digits. ---
const terrain = new Var('VT', 'terrain digit flags', 9);
const terrainDomain = terrain.cells().map(cell => new Given(cell, ON, OFF));
// Exactly four of the nine digits are terrain digits (ON contributes 1,
// OFF contributes 2 to the raw cell value; 4*1 + 5*2 = 14).
const terrainCount = new Sum(14, ...terrain.cells());

const box5 = new Set(graph.box(5));
const nonBox5Cells = graph.cells().filter(cell => !box5.has(cell));

// Box 5: the train never enters it, regardless of digit.
const box5Off = graph.box(5).map(cell => new Given(onloop.at(cell), OFF));

// The red cell is a station: it is on the loop.
const stationOn = new Given(onloop.at('R8C7'), ON);

// --- Digit <-> loop-membership link. ---
// For each digit d, one NFA scans [terrain[d], digit1, onloop1, digit2,
// onloop2, ...] over every non-box-5 cell (in a fixed order) and checks:
// whenever a cell's digit equals d, that cell's onloop flag equals
// terrain[d]; cells with a different digit are unconstrained. State is
// {phase, target, pendingDigit} where target is terrain[d]'s value and
// pendingDigit holds a cell's digit while its onloop flag is being read.
function terrainLinkMachine(d) {
  return NFA.encodeSpec({
    startState: { phase: 'target' },
    transition: (state, value) => {
      if (state.phase === 'target') {
        return { phase: 'digit', target: value };
      }
      if (state.phase === 'digit') {
        return { phase: 'onloop', target: state.target, pendingDigit: value };
      }
      // state.phase === 'onloop'
      const { target, pendingDigit } = state;
      if (pendingDigit === d && value !== target) return undefined;
      return { phase: 'digit', target };
    },
    accept: (state) => state.phase === 'digit',
  }, numValues);
}
const terrainLinks = Array.from({ length: 9 }, (_, i) => i + 1).map(d => new NFA(
  terrainLinkMachine(d), 'terrain-link',
  terrain.cell(d),
  ...nonBox5Cells.flatMap(cell => [cell, onloop.at(cell)]),
));

// --- Single loop: on-loop cells form one connected region of exactly
// 4 cells * 8 non-box-5 boxes = 32 cells (a direct consequence of the box
// argument above, not an extra rule). ---
const loopConnected = new ConnectedValues('VO', ON, 32);

// --- Degree 2: each on-loop cell has exactly two on-loop orthogonal
// neighbours (off-loop cells are unconstrained). Same construction as
// nordschleife.js / loop_entropic.js; sound because the loop does not touch
// itself. ---
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, numValues);
const degrees = graph.cells().map(cell => new NFA(degreeMachine, 'degree',
  onloop.at(cell), ...onloop.at(graph.neighbours(cell))));

// --- Outside clues: sum from the border up to and including that row's
// occurrence of the station digit (whichever column that turns out to be).
// One Or branch per candidate stopping column k, each pairing the row prefix
// sum with "this row's column k holds the same digit as the drawn station
// cell R8C7" (row all-different means at most one k can match). ---
function outsideStationSum(row, total) {
  const branches = [];
  for (let k = 1; k <= 9; k++) {
    const prefixCells = Array.from({ length: k }, (_, i) => makeCellId(row, i + 1));
    branches.push(new And([
      new Sum(total, ...prefixCells),
      new SameValues(2, makeCellId(row, k), 'R8C7'),
    ]));
  }
  return new Or(branches);
}
// The two drawn outside-clue circles: left of R1 ("22") and left of R8 ("32").
const outsideClues = [
  outsideStationSum(1, 22),
  outsideStationSum(8, 32),
];

// --- Cages (drawn cages; no-repeat always, sum only where drawn). ---
const cages = [
  new Cage(22, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(22, 'R4C7', 'R5C7', 'R5C8'),
  new Cage(22, 'R7C9', 'R8C9', 'R9C9'),
  new Cage(22, 'R7C4', 'R7C5', 'R7C6'),
  // Two more cages are drawn with no printed total: all-different only.
  new AllDifferent('R7C3', 'R6C3', 'R5C3', 'R5C2', 'R5C1'),
  new AllDifferent('R2C1', 'R2C2', 'R2C4', 'R2C5', 'R3C3', 'R3C4', 'R3C2'),
];

// --- Black dots, 1:2 ratio (six drawn edge marks). "Not all dots are
// given" means undrawn adjacent pairs are left unconstrained. ---
const dots = [
  new BlackDot('R1C5', 'R1C6'),
  new BlackDot('R2C3', 'R3C3'),
  new BlackDot('R5C1', 'R5C2'),
  new BlackDot('R8C7', 'R8C8'),
  new BlackDot('R7C7', 'R8C7'),
  new BlackDot('R7C8', 'R7C9'),
];

return [
  new Shape('9x9'),
  new Given('R1C6', 2),
  new Given('R6C9', 2),
  new Given('R9C5', 6),

  onloop.toVar('loop membership'),
  membershipDomain,
  terrain,
  ...terrainDomain,
  terrainCount,
  ...box5Off,
  stationOn,
  ...terrainLinks,
  loopConnected,
  ...degrees,

  ...outsideClues,
  ...cages,
  ...dots,
];
