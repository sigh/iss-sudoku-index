// Title: Palindrome Builder
// Author: Quarterthru
// Video: https://www.youtube.com/watch?v=1NkFoWvtVrU
// Source: https://app.crackingthecryptic.com/sudoku/jMr37pJ23R

// Rules encoded below:
//   Normal sudoku. Nine palindrome lines. Each starts on a filled circle and
//   leaves it in the direction of that circle's arrow; each ends on one of the
//   nine empty circles; the path between is the solver's to find. Consecutive
//   cells of a line are king-move neighbours -- eight of the nine arrows are
//   drawn diagonally and one orthogonally, so a step is any of the eight. The
//   digits along a line read the same in both directions, the number printed
//   beside its filled circle is the total of those digits, and no digit occurs
//   more than twice on one line. Lines may cross but no cell is on two lines.
// Nothing is omitted.

// Drawn art. The nine solid orange circles, each paired with the arrow drawn
// out of it and the number printed at its upper right; then the nine
// white-filled circles.
const LINES = [
  { start: 'R1C1', step: [1, 1], total: 12 },
  { start: 'R1C3', step: [1, 1], total: 30 },
  { start: 'R4C1', step: [-1, 1], total: 22 },
  { start: 'R4C2', step: [1, 1], total: 41 },
  { start: 'R5C5', step: [1, 1], total: 37 },
  { start: 'R5C6', step: [-1, 1], total: 5 },
  { start: 'R4C8', step: [-1, 1], total: 22 },
  { start: 'R6C1', step: [1, 1], total: 4 },
  { start: 'R9C2', step: [-1, 0], total: 26 },
];
const ENDS = [
  'R2C9', 'R3C4', 'R3C8', 'R6C3', 'R6C8', 'R7C3', 'R7C6', 'R8C5', 'R8C9',
];

// A palindrome pairs its cells by mirrored position, and "no digit more than
// twice" makes the ceil(L/2) pair digits of a length-L line distinct. The
// cheapest such line spends 1, 2, 3, ..., so its total is at least k*(k+1) for
// L = 2k and (k+1)^2 for L = 2k+1. maxLen is the longest line a clued total can
// pay for, and maxLevel the highest mirrored position it reaches.
const minTotal = (len) => {
  const pairs = len >> 1;
  return len % 2 === 0 ? pairs * (pairs + 1) : (pairs + 1) * (pairs + 1);
};
for (const line of LINES) {
  let len = 2;
  while (minTotal(len + 1) <= line.total) len++;
  line.maxLen = len;
  line.maxLevel = Math.ceil(len / 2);
}
const MAX_LEVEL = Math.max(...LINES.map((line) => line.maxLevel));

// Three overlays share one value alphabet, so it must be wide enough for the
// largest of them: OFF plus an ascending and a descending code per level.
const NUM_VALUES = 1 + 2 * MAX_LEVEL;

// VA -- which line a cell is on.
const A_OFF = 1;
const labelValue = (index) => index + 2;
const lineOf = (value) => LINES[value - 2];

// VS -- the cell's mirrored position, and which half of the line it is in.
// Level k means "k-th cell from the near end of the line": the ascending codes
// count from the filled circle, the descending codes from the empty one, and
// the two cells sharing a level are the pair the palindrome equates.
const S_OFF = 1;
const ascValue = (level) => 1 + level;
const descValue = (level) => 1 + MAX_LEVEL + level;
const isAsc = (value) => value > S_OFF && value <= 1 + MAX_LEVEL;
const isDesc = (value) => value > 1 + MAX_LEVEL;
const levelOf = (value) => (isAsc(value) ? value - 1 : value - 1 - MAX_LEVEL);

// VD -- the king step to the next cell of the line, or NONE at an end.
const D_NONE = 1;
const dirValue = (index) => index + 2;
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

const shape = new Shape('9x9', NUM_VALUES);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const label = graph.makeOverlay('VA');
const state = graph.makeOverlay('VS');
const direction = graph.makeOverlay('VD');

const startSet = new Set(LINES.map((line) => line.start));
const endSet = new Set(ENDS);
const chebyshev = (a, b) => {
  const p = parseCellId(a);
  const q = parseCellId(b);
  return Math.max(Math.abs(p.row - q.row), Math.abs(p.col - q.col));
};
const toStart = (cell, line) => chebyshev(cell, line.start);
const toEnd = (cell) => Math.min(...ENDS.map((end) => chebyshev(cell, end)));
const dirIndex = ([dRow, dCol]) =>
  DIRS.findIndex(([r, c]) => r === dRow && c === dCol);

// --- Domains ---------------------------------------------------------------

// A cell on line L sits at some position i of a path of length len <= maxLen,
// so it is at least i-1 king steps past the filled circle and at least len-i
// steps short of an empty one. Adding those gives a cell an admissible line
// only when its distance to that line's circle plus its distance to the nearest
// empty circle fits inside maxLen - 1.
const canHold = (cell, line) =>
  toStart(cell, line) + toEnd(cell) <= line.maxLen - 1;
const labelsFor = (cell) => {
  if (startSet.has(cell)) return [labelValue(LINES.findIndex((line) => line.start === cell))];
  const labels = LINES.flatMap((line, index) => canHold(cell, line) ? [labelValue(index)] : []);
  return endSet.has(cell) ? labels : [A_OFF, ...labels];
};
const lineMembers = (line) => gridCells.filter((cell) => labelsFor(cell).includes(
  labelValue(LINES.indexOf(line))));

// Ascending level k is the k-th cell from a filled circle and descending level
// k the k-th from an empty one, so each is bounded below by the distance to the
// nearest circle of that kind.
const statesFor = (cell) => {
  if (startSet.has(cell)) return [ascValue(1)];
  if (endSet.has(cell)) return [descValue(1)];
  const values = [S_OFF];
  const nearestStart = Math.min(...LINES.map((line) => toStart(cell, line)));
  for (let level = nearestStart + 1; level <= MAX_LEVEL; level++) values.push(ascValue(level));
  for (let level = toEnd(cell) + 1; level <= MAX_LEVEL; level++) values.push(descValue(level));
  return values;
};

// A step may not leave the grid, and may not land on a filled circle: those are
// line starts, so nothing precedes them.
const stepsFrom = (cell) => DIRS.flatMap((step, index) => {
  const next = graph.step(cell, ...step);
  return next !== null && !startSet.has(next) ? [dirValue(index)] : [];
});
const directionsFor = (cell) => {
  if (startSet.has(cell)) {
    return [dirValue(dirIndex(LINES.find((line) => line.start === cell).step))];
  }
  if (endSet.has(cell)) return [D_NONE];
  return [D_NONE, ...stepsFrom(cell)];
};

const domains = gridCells.flatMap((cell) => [
  new Given(label.at(cell), ...labelsFor(cell)),
  new Given(state.at(cell), ...statesFor(cell)),
  new Given(direction.at(cell), ...directionsFor(cell)),
]);

// --- Line membership, position and direction agree -------------------------

// A cell carries a level exactly when it is on a line, and the level it carries
// has to fit that line: at ascending level k the cell is k-1 steps past the
// filled circle with at least toEnd more to run, and at descending level k it
// is k-1 steps short of the empty circle with at least toStart already behind.
const levelFits = (cell, line, value) => {
  const level = levelOf(value);
  if (level > line.maxLevel) return false;
  return isAsc(value)
    ? toStart(cell, line) <= level - 1 && level + toEnd(cell) <= line.maxLen
    : toEnd(cell) <= level - 1 && level + toStart(cell, line) <= line.maxLen;
};
// The alphabet is wider than the number of lines, so values past the last
// label are not line labels at all and no cell may hold one.
const isLabel = (value) => value >= labelValue(0) && value < labelValue(LINES.length);
const membership = gridCells.map((cell) => new Pair(
  Pair.fnToKey((labelValue_, stateValue) => (
    labelValue_ === A_OFF
      ? stateValue === S_OFF
      : isLabel(labelValue_) && stateValue !== S_OFF
        && levelFits(cell, lineOf(labelValue_), stateValue)),
    NUM_VALUES),
  'level iff on a line', label.at(cell), state.at(cell)));

// Every line cell steps onward except at the empty circle where it stops; both
// of those are already pinned, so this only has to tie the two overlays
// together on the remaining cells.
const stepPresence = gridCells
  .filter((cell) => !startSet.has(cell) && !endSet.has(cell))
  .map((cell) => new Pair(
    Pair.fnToKey((labelValue_, dirValue_) =>
      (labelValue_ === A_OFF) === (dirValue_ === D_NONE), NUM_VALUES),
    'steps on iff on a line', label.at(cell), direction.at(cell)));

// --- The step itself -------------------------------------------------------

// Walking a line from its filled circle, the level climbs by one per step until
// the middle and falls by one per step after it. An even-length line turns
// around between the two cells that share the middle level, an odd-length one
// on its single middle cell; nothing turns back, so no line closes into a loop.
const levelStepOk = (from, to) => {
  if (isAsc(from)) {
    const level = levelOf(from);
    if (isAsc(to)) return levelOf(to) === level + 1;
    return levelOf(to) === level || levelOf(to) === level - 1;
  }
  return isDesc(from) && isDesc(to) && levelOf(to) === levelOf(from) - 1;
};

// One machine per direction rather than one per cell: read in the order of the
// direction, the successor of every cell is the next cell scanned, so a state
// holding just the previous cell's overlay value checks all 81 steps at once.
// Chains run to the grid edge, and `pending` at a break would be a step off the
// grid, which the VD domains already exclude.
const chainsFor = ([dRow, dCol]) => gridCells
  .filter((cell) => graph.step(cell, -dRow, -dCol) === null)
  .map((cell) => graph.ray(cell, dRow, dCol));
const followerSpec = (index, agrees) => NFA.encodeSpec({
  startState: { reading: 'value', pending: false, previous: 0 },
  transition: ({ reading, pending, previous }, value) => {
    if (value === SEGMENT_BREAK) {
      return pending ? undefined : { reading: 'value', pending: false, previous: 0 };
    }
    if (reading === 'value') {
      if (pending && !agrees(previous, value)) return undefined;
      return { reading: 'direction', pending: false, previous: value };
    }
    return { reading: 'value', pending: value === dirValue(index), previous };
  },
  accept: ({ pending }) => !pending,
}, NUM_VALUES, { multiSegment: true });
const stepRules = DIRS.flatMap((step, index) => {
  const chains = chainsFor(step);
  const scan = (overlay) => chains.map(
    (chain) => chain.flatMap((cell) => [overlay.at(cell), direction.at(cell)]));
  return [
    new NFA(followerSpec(index, (a, b) => a === b),
      'successor is on the same line', ...scan(label)),
    new NFA(followerSpec(index, levelStepOk),
      'successor is one position further along', ...scan(state)),
  ];
});

// Exactly one cell steps into each line cell, so a line cannot fork or start
// away from its circle. Filled circles need no machine: no step may land on one.
const inDegreeSpecs = new Map();
const inDegreeSpec = (hits) => {
  const key = hits.join(',');
  if (!inDegreeSpecs.has(key)) {
    inDegreeSpecs.set(key, NFA.encodeSpec({
      startState: { position: 0, onLine: false, count: 0 },
      transition: ({ position, onLine, count }, value) => {
        if (position === 0) {
          return { position: 1, onLine: value !== A_OFF, count: 0 };
        }
        const next = count + (value === hits[position - 1] ? 1 : 0);
        return next > 1 ? undefined : { position: position + 1, onLine, count: next };
      },
      accept: ({ onLine, count }) => count === (onLine ? 1 : 0),
      // The position index is what distinguishes the states, so it has to be
      // stopped at the end of the scan: the label plus one value per neighbour.
      maxDepth: hits.length + 1,
    }, NUM_VALUES));
  }
  return inDegreeSpecs.get(key);
};
const inDegree = gridCells
  .filter((cell) => !startSet.has(cell))
  .map((cell) => {
    const sources = DIRS.map((step, index) => ({
      cell: graph.step(cell, ...step),
      // The neighbour reached by DIRS[index] steps back to this cell along the
      // opposite direction, which is the entry DIRS holds in mirrored order.
      hit: dirValue(DIRS.length - 1 - index),
    })).filter((source) => source.cell !== null);
    return new NFA(inDegreeSpec(sources.map((source) => source.hit)),
      'one step in', label.at(cell), ...sources.map((source) => direction.at(source.cell)));
  });

// --- The palindrome, the total, and the repeat limit -----------------------

// The two cells a line gives one level are its k-th cells from either end, so
// the palindrome is exactly "same line, same level, same digit". One machine
// per (line, level), reading (VA, VS, digit) over the cells whose domains still
// admit that pair.
const pairingSpec = (line, level) => NFA.encodeSpec({
  startState: { reading: 'label', selected: false, digit: 0 },
  transition: ({ reading, selected, digit }, value) => {
    if (reading === 'label') {
      return { reading: 'state', selected: value === labelValue(LINES.indexOf(line)), digit };
    }
    if (reading === 'state') {
      return {
        reading: 'digit',
        selected: selected && levelOf(value) === level && value !== S_OFF,
        digit,
      };
    }
    if (!selected) return { reading: 'label', selected: false, digit };
    if (digit !== 0 && digit !== value) return undefined;
    return { reading: 'label', selected: false, digit: value };
  },
  accept: ({ reading }) => reading === 'label',
}, NUM_VALUES);
const palindromes = LINES.flatMap((line) => {
  const members = lineMembers(line);
  return Array.from({ length: line.maxLevel }, (unused, index) => index + 1)
    .map((level) => new NFA(pairingSpec(line, level),
      `line at ${line.start}, position ${level}`,
      ...members
        .filter((cell) => statesFor(cell).some(
          (value) => value !== S_OFF && levelOf(value) === level))
        .flatMap((cell) => [label.at(cell), state.at(cell), cell])));
});

// The number beside the filled circle: the digits of its line add to it.
const totalSpec = (line) => NFA.encodeSpec({
  startState: { selected: null, total: 0 },
  transition: ({ selected, total }, value) => {
    if (selected === null) {
      return { selected: value === labelValue(LINES.indexOf(line)), total };
    }
    if (!selected) return { selected: null, total };
    // Clamped: past the clue the total can no longer reach it.
    return total + value > line.total ? undefined : { selected: null, total: total + value };
  },
  accept: ({ selected, total }) => selected === null && total === line.total,
}, NUM_VALUES);
const totals = LINES.map((line) => new NFA(totalSpec(line), `total ${line.total}`,
  ...lineMembers(line).flatMap((cell) => [label.at(cell), cell])));

// No digit repeats on a line more than once: one machine per line and digit,
// rejecting a third cell of that line holding that digit.
const repeatSpec = (line, digit) => NFA.encodeSpec({
  startState: { selected: null, count: 0 },
  transition: ({ selected, count }, value) => {
    if (selected === null) {
      return { selected: value === labelValue(LINES.indexOf(line)), count };
    }
    const next = count + (selected && value === digit ? 1 : 0);
    return next > 2 ? undefined : { selected: null, count: next };
  },
  accept: ({ selected }) => selected === null,
}, NUM_VALUES);
const repeats = LINES.flatMap((line) => {
  const scan = lineMembers(line).flatMap((cell) => [label.at(cell), cell]);
  return Array.from({ length: 9 }, (unused, index) => index + 1)
    .map((digit) => new NFA(repeatSpec(line, digit),
      `at most two ${digit}s on the line at ${line.start}`, ...scan));
});

return [
  shape,
  // The alphabet is widened for the overlays, so the playable cells are put
  // back to 1-9.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  label.toVar('line'),
  state.toVar('position on the line'),
  direction.toVar('step to the next cell'),
  ...domains,
  ...membership,
  ...stepPresence,
  ...stepRules,
  ...inDegree,
  // Nine lines and nine empty circles: each circle ends a different line.
  new AllDifferent(...label.at(ENDS)),
  ...palindromes,
  ...totals,
  ...repeats,
];
