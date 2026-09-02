// Title: Eclipsed Whispers
// Author: Space_man
// Video: https://www.youtube.com/watch?v=gvpahosHGvI
// Source: https://app.crackingthecryptic.com/2lfn0sf0o6

// Normal sudoku. Draw a loop of orthogonally connected cells (the sun loop) and
// a loop of diagonally connected cells (the moon loop). Each loop is one cell
// wide and may not intersect itself or touch itself orthogonally, but may touch
// itself diagonally. Both loops are German Whispers lines: digits adjacent along
// a loop differ by at least 5. Every location where the two loops intersect is
// marked with a sun or a moon, and those eight marked cells are therefore exactly
// the cells lying on both loops. A sun means the moon loop's digit there is
// eclipsed by the sun loop's digit; a moon means the sun loop's digit is eclipsed
// by the moon loop's. An eclipsed digit is from 1-9 and strictly lower than the
// visible digit. Digits separated by the white dot are consecutive.
//
// Nothing is omitted. The eclipsed digit is modelled as a value that exists only
// on its loop and not in the grid: the rules give it its own range ("must be from
// 1-9") and call it hidden, and a cell cannot hold two digits for Sudoku.
//
// "Orthogonally" and "diagonally" are read as grid directions throughout, since
// the same sentence uses them to define the two loops' own step directions. Two
// clauses then hold by geometry rather than by a constraint of their own, because
// a diagonal step never changes the parity of row+column: the whole moon loop lies
// in one parity class, so no two of its cells are orthogonally adjacent and no two
// of its segments cross. That leaves "one-cell-wide and may not touch itself
// orthogonally" biting on the sun loop, where it is the degree rule below.

// --- Values stored in the overlay cells ----------------------------------
const ON = 1, OFF = 2;                // sun-loop membership
const UNUSED = 1, FWD = 2, BWD = 3;   // moon-loop step: unused, a->b, b->a
const POS_OFF = 1, POS_START = 2;     // moon-loop position counters

// A diagonal step preserves the parity of row+column, so every cycle of diagonal
// steps stays inside one parity class; the larger class of a 9x9 holds 41 cells,
// which bounds any such cycle. Two coprime moduli whose lcm (42) exceeds that
// bound are what forbid a second moon cycle beside the real one: away from the
// seam cell every step advances both counters, so a cycle avoiding the seam would
// have to have a length divisible by 42.
const MOD_A = 6, MOD_B = 7;

// --- The drawn board ------------------------------------------------------
// The eight glyphs printed in cell centres and the one white Kropki dot.
const SUN_MARKS = ['R2C3', 'R3C4', 'R3C6', 'R5C2', 'R7C2'];
const MOON_MARKS = ['R2C1', 'R4C7', 'R6C7'];
const WHITE_DOT = ['R7C6', 'R7C7'];

const MARKS = [...SUN_MARKS, ...MOON_MARKS];

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const NV = geometry.numValues;
const gridCells = graph.cells();

const sun = graph.makeOverlay('VL');   // sun-loop membership
const posA = graph.makeOverlay('VA');  // moon-loop position, mod MOD_A
const posB = graph.makeOverlay('VB');  // moon-loop position, mod MOD_B

// --- Which cell holds each loop's digit -----------------------------------
// Away from the marked cells both loops read the grid digit. At a marked cell the
// eclipsed loop reads its own hidden Var instead: at a sun the moon loop is
// eclipsed, at a moon the sun loop is.
const hiddenAt = new Map(MARKS.map((cell, n) => [cell, 'VH' + (n + 1)]));
const sunDigit = cell =>
  MOON_MARKS.includes(cell) ? hiddenAt.get(cell) : cell;
const moonDigit = cell =>
  SUN_MARKS.includes(cell) ? hiddenAt.get(cell) : cell;

// --- Moon-loop step variables ---------------------------------------------
// One Var per diagonal adjacency, recording whether the loop uses it and in which
// direction; the direction is what the position counters read.
const DIAGONALS = [[1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dR, dC] of DIAGONALS) {
    const other = graph.step(cell, dR, dC);
    if (!other) continue;
    const id = 'VM' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD, other });
    stepsAt.get(other).push({ id, out: BWD, in: FWD, other: cell });
  }
}

// The counters need one cell where the numbering wraps. Every marked cell is on
// both loops, so any of them is a legal seam; take the first in reading order.
const SEAM = 'R2C1';

// --- Custom keys and machines ---------------------------------------------
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// A cell not marked with a glyph cannot be on both loops.
const notBothKey = Pair.fnToKey((s, p) => !(s === ON && p !== POS_OFF), NV);
// An eclipsed digit is strictly lower than the visible digit of its cell.
const lowerKey = Pair.fnToKey((h, g) => h < g, NV);

// Sun-loop degree: an on-loop cell has exactly two on-loop orthogonal
// neighbours. Reads the cell's membership, then each neighbour's. Sound because
// the sun loop may not touch itself orthogonally, so an orthogonal neighbour that
// is on the loop is always the previous or next cell along it.
const sunDegreeSpec = NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (s, v) => {
    switch (s.phase) {
      case 'self': return v === ON ? { phase: 'on', count: 0 } : { phase: 'off' };
      case 'off': return { phase: 'off' };
      case 'on': {
        const count = s.count + (v === ON ? 1 : 0);
        return count > 2 ? undefined : { phase: 'on', count };
      }
      default: return undefined;
    }
  },
  accept: s => s.phase === 'off' || s.count === 2,
}, NV);

// Sun whisper: two orthogonally adjacent cells that are both on the sun loop are
// consecutive along it. Reads (membership, sun digit) for each cell; if either is
// off the loop the pair is free, and `skip` absorbs the values still to be read.
const sunWhisperSpec = NFA.encodeSpec({
  startState: { phase: 'onA' },
  transition: (s, v) => {
    switch (s.phase) {
      case 'onA': return v === ON
        ? { phase: 'digitA' } : { phase: 'skip', left: 3 };
      case 'digitA': return { phase: 'onB', a: v };
      case 'onB': return v === ON
        ? { phase: 'digitB', a: s.a } : { phase: 'skip', left: 1 };
      case 'digitB': return Math.abs(s.a - v) >= 5
        ? { phase: 'done' } : undefined;
      case 'skip': return s.left > 1
        ? { phase: 'skip', left: s.left - 1 } : { phase: 'done' };
      default: return undefined;
    }
  },
  accept: s => s.phase === 'done',
}, NV);

// Moon whisper: reads (step, moon digit of a, moon digit of b). Cells joined by a
// used step are consecutive along the moon loop.
const moonWhisperSpec = NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (s, v) => {
    switch (s.phase) {
      case 'step': return { phase: 'digitA', used: v !== UNUSED };
      case 'digitA': return { phase: 'digitB', used: s.used, a: v };
      case 'digitB': return !s.used || Math.abs(s.a - v) >= 5
        ? { phase: 'done' } : undefined;
      default: return undefined;
    }
  },
  accept: s => s.phase === 'done',
}, NV);

// Moon-loop cell shape: reads the cell's two counters, then every step it is an
// endpoint of. A cell off the loop (POS_OFF in both layers) uses no step; a cell
// on the loop is entered by exactly one step and left by exactly one.
const nextPos = (v, mod) => POS_START + ((v - POS_START + 1) % mod);
const moonCellSpec = incident => cached(
  'cell|' + incident.map(s => s.in + '/' + s.out).join(','),
  () => NFA.encodeSpec({
    startState: { phase: 'posA' },
    transition: (s, v) => {
      switch (s.phase) {
        case 'posA':
          return { phase: 'posB', on: v !== POS_OFF };
        case 'posB':
          return (v !== POS_OFF) === s.on
            ? { phase: 'steps', on: s.on, k: 0, in: 0, out: 0 } : undefined;
        case 'steps': {
          if (s.k >= incident.length) return undefined;
          const step = incident[s.k];
          let { in: nIn, out: nOut } = s;
          if (v === step.in) nIn++;
          else if (v === step.out) nOut++;
          else if (v !== UNUSED) return undefined;
          if (nIn > 1 || nOut > 1) return undefined;
          return { phase: 'steps', on: s.on, k: s.k + 1, in: nIn, out: nOut };
        }
        default: return undefined;
      }
    },
    accept: s => s.phase === 'steps' && s.k === incident.length &&
      (s.on ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0)),
  }, NV));

// Moon position counter: a used step advances the counter by one in the direction
// of travel. The step arriving at the seam is exempt -- that is where the loop's
// numbering wraps -- so `checkFwd` / `checkBwd` drop the check for whichever
// direction of this step enters the seam.
const counterSpec = (mod, checkFwd, checkBwd) => cached(
  'cnt|' + mod + '|' + checkFwd + '|' + checkBwd,
  () => NFA.encodeSpec({
    startState: { phase: 'step' },
    transition: (s, v) => {
      switch (s.phase) {
        case 'step': return { phase: 'posA', dir: v };
        case 'posA': return { phase: 'posB', dir: s.dir, a: v };
        case 'posB': {
          if (s.dir === UNUSED) return { phase: 'done' };
          if (s.a === POS_OFF || v === POS_OFF) return undefined;
          if (s.dir === FWD) {
            return !checkFwd || v === nextPos(s.a, mod)
              ? { phase: 'done' } : undefined;
          }
          return !checkBwd || s.a === nextPos(v, mod)
            ? { phase: 'done' } : undefined;
        }
        default: return undefined;
      }
    },
    accept: s => s.phase === 'done',
  }, NV));

// An eclipsed digit is an existential witness, not part of the answer: the rules
// bound it (below the visible digit, and five clear of each of its neighbours on
// the loop it belongs to) but never fix it, so several values can satisfy them.
// ISS has to hold it in a cell, so pin the canonical representative -- the
// smallest admissible one. Each loop neighbour d bounds it on one side only,
// since h >= d + 5 is the only option when d <= 4 and h <= d - 5 the only one when
// d >= 6, so the admissible values form an interval whose lower end is 1 or d + 5
// for the largest neighbour d that bounds it from below. The machine reads the
// hidden digit, then each candidate neighbour as (on-loop flag, that loop's digit
// there), and accepts when the hidden digit is 1 or is one neighbour's lower
// bound; that it clears every neighbour by 5 is the whisper constraint's job.
const canonicalSpec = (count, tag, isUsed) => cached(
  'canon|' + count + '|' + tag,
  () => NFA.encodeSpec({
    startState: { phase: 'hidden' },
    transition: (s, v) => {
      switch (s.phase) {
        case 'hidden':
          return { phase: 'flag', hidden: v, low: false, k: 0 };
        case 'flag':
          return s.k < count
            ? { phase: 'digit', hidden: s.hidden, low: s.low, k: s.k, used: isUsed(v) }
            : undefined;
        case 'digit':
          return {
            phase: 'flag', hidden: s.hidden, k: s.k + 1,
            low: s.low || (s.used && v + 5 === s.hidden),
          };
        default: return undefined;
      }
    },
    accept: s => s.phase === 'flag' && s.k === count &&
      (s.hidden === 1 || s.low),
  }, NV));

// Direction of travel around the moon loop is an artifact of this encoding, not
// something the puzzle names, so pin one representative: of the seam's incident
// steps, read in a fixed order, the first one the loop uses must be the step it
// leaves by. The seam sits in column 1, so it has exactly the two diagonal
// neighbours R1C2 and R3C2 and the rule is a relation on those two step Vars.
const seamSteps = stepsAt.get(SEAM);
const seamOrientKey = Pair.fnToKey((v1, v2) => v1 !== UNUSED
  ? v1 === seamSteps[0].out : v2 === seamSteps[1].out, NV);

// --- Layers and domains ---------------------------------------------------
const positions = mod => Array.from({ length: mod }, (_, n) => POS_START + n);

const layers = [
  sun.toVar('sun loop membership'),
  posA.toVar('moon loop position mod ' + MOD_A),
  posB.toVar('moon loop position mod ' + MOD_B),
  new Var('M', 'moon loop steps', steps.length),
  new Var('H', 'eclipsed digits', MARKS.length),
];
// The step Vars need no domain constraint of their own: the moon cell machine
// accepts no value on them but unused / in / out.
const domains = [
  sun.makeReplicate(new Given(sun.at(gridCells[0]), ON, OFF)),
  posA.makeReplicate(
    new Given(posA.at(gridCells[0]), POS_OFF, ...positions(MOD_A))),
  posB.makeReplicate(
    new Given(posB.at(gridCells[0]), POS_OFF, ...positions(MOD_B))),
];

// --- The marked cells -----------------------------------------------------
// Each is on both loops, and no other cell is on both.
const intersections = [
  ...MARKS.map(cell => new Given(sun.at(cell), ON)),
  ...MARKS.filter(cell => cell !== SEAM).flatMap(cell => [
    new Given(posA.at(cell), ...positions(MOD_A)),
    new Given(posB.at(cell), ...positions(MOD_B)),
  ]),
  ...gridCells.filter(cell => !MARKS.includes(cell)).map(cell =>
    new Pair(notBothKey, 'unmarked', sun.at(cell), posA.at(cell))),
];

// The eclipsed digit of each marked cell is lower than the cell's visible digit,
// and is the canonical witness among the values the rules leave open to it. At a
// sun the eclipsed digit is the moon loop's, so its neighbours are the cells its
// diagonal steps reach; at a moon it is the sun loop's, over the orthogonal
// neighbours.
const eclipses = [
  ...MARKS.map(cell => new Pair(lowerKey, 'eclipsed', hiddenAt.get(cell), cell)),
  ...SUN_MARKS.map(cell => {
    const incident = stepsAt.get(cell);
    return new NFA(canonicalSpec(incident.length, 'step', v => v !== UNUSED),
      'eclipsed-witness', hiddenAt.get(cell),
      ...incident.flatMap(s => [s.id, moonDigit(s.other)]));
  }),
  ...MOON_MARKS.map(cell => {
    const around = graph.neighbours(cell);
    return new NFA(canonicalSpec(around.length, 'sun', v => v === ON),
      'eclipsed-witness', hiddenAt.get(cell),
      ...around.flatMap(nb => [sun.at(nb), sunDigit(nb)]));
  }),
];

// --- Sun loop -------------------------------------------------------------
const sunRules = [
  // Degree 2 plus one connected region of on-loop cells is exactly one cycle.
  new ConnectedValues('VL', ON),
  ...gridCells.map(cell => new NFA(sunDegreeSpec, 'sun-degree',
    ...sun.at([cell, ...graph.neighbours(cell)]))),
  // Right and down steps only, so each orthogonal pair is covered once.
  ...gridCells.flatMap(cell => [[0, 1], [1, 0]]
    .map(([dR, dC]) => graph.step(cell, dR, dC))
    .filter(Boolean)
    .map(other => new NFA(sunWhisperSpec, 'sun-whisper',
      sun.at(cell), sunDigit(cell), sun.at(other), sunDigit(other)))),
];

// --- Moon loop ------------------------------------------------------------
const moonRules = [
  ...gridCells.map(cell => new NFA(moonCellSpec(stepsAt.get(cell)), 'moon-cell',
    posA.at(cell), posB.at(cell), ...stepsAt.get(cell).map(s => s.id))),
  ...steps.flatMap(s => [MOD_A, MOD_B].map(mod => new NFA(
    counterSpec(mod, s.b !== SEAM, s.a !== SEAM), 'moon-order',
    s.id, (mod === MOD_A ? posA : posB).at(s.a),
    (mod === MOD_A ? posA : posB).at(s.b)))),
  ...steps.map(s => new NFA(moonWhisperSpec, 'moon-whisper',
    s.id, moonDigit(s.a), moonDigit(s.b))),
  new Given(posA.at(SEAM), POS_START),
  new Given(posB.at(SEAM), POS_START),
  new Pair(seamOrientKey, 'moon-seam', seamSteps[0].id, seamSteps[1].id),
];

return [
  shape,
  ...layers,
  ...domains,
  ...intersections,
  ...eclipses,
  ...sunRules,
  ...moonRules,
  new WhiteDot(...WHITE_DOT),
];
