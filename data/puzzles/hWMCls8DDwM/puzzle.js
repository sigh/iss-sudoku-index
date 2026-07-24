// Title: Grid Racer
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=hWMCls8DDwM
// Source: https://sudokupad.app/lhid2td2zu

// Standard 9x9 sudoku. Draw a single closed loop through cell centres: a
// car's path, driving clockwise, strictly orthogonally. The loop may touch
// itself orthogonally but never crosses or branches. Cages are obstacles the
// loop can never enter. The digit in each on-loop cell drives the car: odd
// digits go straight (continue the current heading); even digits turn onto
// an absolute heading (2 = Up/North, 4 = Left/West, 6 = Right/East,
// 8 = Down/South). Box Balance: in each box, the sum of odd digits on the
// loop equals the sum of the digits in that box's cage cell(s) (0 when a box
// has no cage). The loop visits every box at least once.
//
// Encoding: a directed "next" overlay Var per cell (VN) holds the compass
// heading the car exits toward (N/E/S/W) or OFF. Off-grid headings are
// excluded per cell via a domain Given, and cage cells are pinned OFF
// (obstacle). One NFA per cell reads its own (next, digit) then every
// neighbour's next value; the neighbour whose next points back at this cell
// (its next equals the opposite heading) is the unique predecessor, so its
// next value doubles as this cell's entry heading. The same NFA enforces
// in-degree (0 when off, exactly 1 when on) and the driving rule (straight:
// next == entry heading; turn: next == the digit's fixed heading). Out-degree
// is automatic: `next` is a single value. Crossing is excluded because a
// loop cell can have at most one in- and one out-edge (never four); the
// self-touch allowance falls out because two on-loop cells may be orthogonal
// neighbours without either pointing at the other.
//
// This models the loop as a directed successor function, so in/out degree
// 1 assembles it into a disjoint union of directed cycles; a single-loop
// (rather than several disjoint or touching-but-separate cycles) is not
// proven -- see the ConnectedValues comment below for the residual gap,
// documented the same way as $ISS_REPO/data/scripts/wendezaune.js.
//
// The "turn" rule is encoded as "next == the digit's fixed heading" without
// also requiring that heading to differ from the entry heading. A real
// U-turn (next == opposite(entry)) cannot occur in a directed simple cycle,
// but "turn to the same heading you already had" (a straight cell mislabelled
// even) is not explicitly forbidden by the rules text, so it is left
// permitted rather than added as an extra (tightening) requirement.

const N = 1, E = 2, S = 3, W = 4, OFF = 5;
const OPPOSITE = { [N]: S, [E]: W, [S]: N, [W]: E };
// Fixed absolute heading for each even (turning) digit.
const FIXED_HEADING = { 2: N, 4: W, 6: E, 8: S };
const DIRS = [
  { dR: -1, dC: 0, code: N },
  { dR: 0, dC: 1, code: E },
  { dR: 1, dC: 0, code: S },
  { dR: 0, dC: -1, code: W },
];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const next = graph.makeOverlay('VN');
const nextCell = cell => next.at(cell);
const gridCells = graph.cells();

const cages = [
  ['R7C2', 'R7C3', 'R8C3'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R1C2'],
  ['R2C6', 'R3C4', 'R3C5', 'R3C6'],
  ['R4C5', 'R5C5'],
  ['R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R5C7'],
  ['R6C9'],
  ['R8C6', 'R9C6'],
  ['R7C4'],
];
const cageCells = new Set(cages.flat());

// --- Domain: every cell may point OFF, or toward any in-grid neighbour;
// cage cells are pinned OFF (obstacles the loop never enters).
const domains = gridCells.map(cell => {
  if (cageCells.has(cell)) return new Given(nextCell(cell), OFF);
  const { row, col } = parseCellId(cell);
  const allowed = DIRS
    .filter(({ dR, dC }) => graph.step(cell, dR, dC))
    .map(({ code }) => code);
  return new Given(nextCell(cell), OFF, ...allowed);
});

// --- Per-cell driving + degree NFA. Reads this cell's own `next`, then each
// existing neighbour's next value in N,E,S,W order, then this cell's digit
// last. `matchCodes[i]` is the value that neighbour i must carry to be
// "pointing at" this cell (its own next equals the heading from itself into
// this cell, i.e. the opposite of the direction from this cell to that
// neighbour). Digit is read last, and matchCount saturates at 2, purely to
// keep the reachable state count under the NFA compiler's 4096 cap -- an
// earlier version that carried `digit` through the whole neighbour scan
// compiled ~4500 states for a 4-neighbour interior cell.
const cellMachine = (matchCodes) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    if (state.phase === 'start') return { phase: 'nbr', next: value, i: 0, matchCount: 0, entryHeading: null };
    if (state.phase === 'nbr') {
      const isMatch = value === matchCodes[state.i];
      const matchCount = Math.min(state.matchCount + (isMatch ? 1 : 0), 2);
      const entryHeading = isMatch && state.matchCount === 0 ? value : state.entryHeading;
      const i = state.i + 1;
      return i === matchCodes.length
        ? { phase: 'digit', next: state.next, matchCount, entryHeading }
        : { phase: 'nbr', next: state.next, i, matchCount, entryHeading };
    }
    if (state.phase === 'digit') {
      // The final read is this cell's own grid digit.
      return { phase: 'done', next: state.next, matchCount: state.matchCount, entryHeading: state.entryHeading, digit: value };
    }
    return undefined;   // phase 'done': no further reads are ever supplied
  },
  accept: ({ phase, next: n, digit, matchCount, entryHeading }) => {
    if (phase !== 'done') return false;
    if (n === OFF) return matchCount === 0;
    if (matchCount !== 1) return false;
    if (digit % 2 === 1) return n === entryHeading;           // straight
    return n === FIXED_HEADING[digit];                        // turn
  },
}, geometry.numValues);
const cellMachineCache = new Map();
const cachedCellMachine = (matchCodes) => {
  const key = matchCodes.join(',');
  if (!cellMachineCache.has(key)) cellMachineCache.set(key, cellMachine(matchCodes));
  return cellMachineCache.get(key);
};

const drivingAndDegree = gridCells.map(cell => {
  // Each neighbour's *compass identity* (not just its cell id) is required
  // here, so this walks DIRS via step() rather than graph.neighbours(cell).
  const directionalInputs = DIRS
    .map(({ dR, dC, code }) => ({ cell: graph.step(cell, dR, dC), matchCode: OPPOSITE[code] }))
    .filter(info => info.cell);
  const machine = cachedCellMachine(directionalInputs.map(info => info.matchCode));
  return new NFA(machine, 'drive', nextCell(cell), ...directionalInputs.map(info => nextCell(info.cell)), cell);
});

// --- Region (box) helpers.
const boxes = graph.boxes();
const cagesByBox = boxes.map(() => []);
for (const cage of cages) {
  cagesByBox[boxes.findIndex(box => box.includes(cage[0]))].push(...cage);
}

// --- Each box is visited at least once: not every cell in the box is OFF.
const visitMachine = NFA.encodeSpec({
  startState: { anyOn: false },
  transition: ({ anyOn }, value) => ({ anyOn: anyOn || value !== OFF }),
  accept: ({ anyOn }) => anyOn,
}, geometry.numValues);
const visits = boxes.map(cells => new NFA(visitMachine, 'visit', ...next.at(cells)));

// --- Box Balance: sum of odd digits on the loop within the box equals the
// sum of the box's cage digits. Reads (next, digit) for each of the box's 9
// cells, then the digit of each of the box's cage cells (0-4 of them).
// `onLoop` collapses the raw next-value (up to 9 raw alphabet symbols) to a
// boolean before it is carried into the next state -- carrying the raw value
// instead multiplies every downstream state by 9 and blew the compiler's
// 4096-state cap.
const boxBalanceMachine = (cageCount) => NFA.encodeSpec({
  startState: { phase: 'cellNext', i: 0, sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'cellNext') {
      return { phase: 'cellDigit', i: state.i, sum: state.sum, onLoop: value !== OFF };
    }
    if (state.phase === 'cellDigit') {
      const contributes = state.onLoop && value % 2 === 1;
      const sum = state.sum + (contributes ? value : 0);
      const i = state.i + 1;
      if (i === 9) return cageCount === 0 ? { phase: 'done', sum } : { phase: 'cage', i: 0, sum };
      return { phase: 'cellNext', i, sum };
    }
    if (state.phase === 'cage') {
      const sum = state.sum - value;
      const i = state.i + 1;
      return i === cageCount ? { phase: 'done', sum } : { phase: 'cage', i, sum };
    }
    return undefined;   // phase 'done': no further reads are ever supplied
  },
  accept: ({ phase, sum }) => phase === 'done' && sum === 0,
}, geometry.numValues);
const boxBalanceMachineCache = new Map();
const cachedBoxBalanceMachine = (cageCount) => {
  if (!boxBalanceMachineCache.has(cageCount)) boxBalanceMachineCache.set(cageCount, boxBalanceMachine(cageCount));
  return boxBalanceMachineCache.get(cageCount);
};
const boxBalances = boxes.map((cells, i) => {
  const cage = cagesByBox[i];
  const machine = cachedBoxBalanceMachine(cage.length);
  const args = cells.flatMap(cell => [nextCell(cell), cell]);
  return new NFA(machine, 'box-balance', ...args, ...cage);
});

return [
  new Shape('9x9'),
  next.toVar('next'),
  ...domains,
  ...drivingAndDegree,
  ...visits,
  ...boxBalances,
  // Single connected blob of on-loop cells. Sound (a genuine loop is one
  // orthogonally-connected region) but does not by itself prove the on-loop
  // cells form one directed cycle rather than several touching-but-separate
  // ones, since this tests cell adjacency, not used-edge adjacency -- same
  // residual gap as wendezaune.js.
  new ConnectedValues('VN', [N, E, S, W]),
];
