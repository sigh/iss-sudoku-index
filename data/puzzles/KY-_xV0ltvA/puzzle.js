// Title: Sleeper Cells
// Author: Bearded Fool
// Video: https://www.youtube.com/watch?v=KY-_xV0ltvA
// Source: https://sudokupad.app/06pymw27cj

// Normal Sudoku applies. VS is a sleeper-cell overlay: 10 marks a sleeper and
// 11 marks an awake cell. Each house and each drawn line has one sleeper; a
// sleeper is on a line and holds its reading-order 3x3-box number.
const SLEEP = 10;
const AWAKE = 11;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const shape = new Shape('9x9', 11);
const graph = cellGraph(shape);
const sleeper = graph.makeOverlay('VS');

// Drawn line cells, transcribed from the colored paths in the source.
const purpleLines = [
  ['R6C6', 'R5C6', 'R4C5', 'R3C6', 'R3C5'],
  ['R2C6', 'R2C7', 'R2C8', 'R1C9', 'R1C8'],
  ['R3C2', 'R4C3', 'R5C4', 'R6C4', 'R7C3', 'R7C4', 'R8C3', 'R8C4'],
];
const greenLines = [['R3C1', 'R4C2', 'R5C3', 'R6C3', 'R6C2']];
const redLines = [['R2C2', 'R3C3', 'R4C4', 'R5C5']];
const blueLines = [
  // The first two source strokes meet at R1C2: one branched blue line.
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C4', 'R2C5', 'R3C4'],
  ['R8C7', 'R7C7', 'R6C7', 'R5C8', 'R5C9'],
  ['R8C8', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C8', 'R3C7'],
  ['R6C5', 'R7C5', 'R8C5', 'R9C4', 'R9C3', 'R9C2'],
];
const allLines = [...purpleLines, ...greenLines, ...redLines, ...blueLines];
const onLine = new Set(allLines.flat());
const stream = cells => cells.flatMap(cell => [sleeper.at(cell), cell]);

// A green line ignores its sleeper, then has adjacent remaining digits differ by >= 5.
const greenMachine = NFA.encodeSpec({
  startState: { phase: 'flag', asleep: false, previous: null },
  transition: ({ phase, asleep, previous }, value) => {
    if (phase === 'flag') {
      if (value !== SLEEP && value !== AWAKE) return undefined;
      return { phase: 'digit', asleep: value === SLEEP, previous };
    }
    if (!asleep && previous !== null && Math.abs(value - previous) < 5) return undefined;
    return { phase: 'flag', asleep: false, previous: asleep ? previous : value };
  },
  accept: ({ phase }) => phase === 'flag',
}, 11);

// A red line ignores its sleeper, then alternates parity among remaining digits.
const redMachine = NFA.encodeSpec({
  startState: { phase: 'flag', asleep: false, parity: null },
  transition: ({ phase, asleep, parity }, value) => {
    if (phase === 'flag') {
      if (value !== SLEEP && value !== AWAKE) return undefined;
      return { phase: 'digit', asleep: value === SLEEP, parity };
    }
    const nextParity = value & 1;
    if (!asleep && parity !== null && parity === nextParity) return undefined;
    return { phase: 'flag', asleep: false, parity: asleep ? parity : nextParity };
  },
  accept: ({ phase }) => phase === 'flag',
}, 11);

// A purple line ignores its sleeper, then its remaining digits are a non-repeating
// consecutive set. It branches over the possible final intervals, so state only
// records which members of that chosen interval have been seen.
const purpleMachine = lineLength => {
  const activeCount = lineLength - 1;  // each purple line has exactly one sleeper
  const targets = [];
  for (let low = 1; low <= 10 - activeCount; low++) {
    let target = 0;
    for (let digit = low; digit < low + activeCount; digit++) target |= 1 << (digit - 1);
    targets.push(target);
  }
  return NFA.encodeSpec({
    startState: targets.map(target => ({ phase: 'flag', asleep: false, target, seen: 0 })),
    transition: ({ phase, asleep, target, seen }, value) => {
      if (phase === 'flag') {
        if (value !== SLEEP && value !== AWAKE) return undefined;
        return { phase: 'digit', asleep: value === SLEEP, target, seen };
      }
      if (asleep) return { phase: 'flag', asleep: false, target, seen };
      const bit = 1 << (value - 1);
      if (!(target & bit) || (seen & bit)) return undefined;
      return { phase: 'flag', asleep: false, target, seen: seen | bit };
    },
    accept: ({ phase, target, seen }) => phase === 'flag' && seen === target,
    maxDepth: lineLength * 2,
  }, 11);
};

// Blue segments are separated by 3x3-box borders. SEGMENT_BREAK finalizes one
// segment; its non-sleeper sum must match the first segment's sum.
const blueMachine = NFA.encodeSpec({
  startState: { phase: 'flag', asleep: false, reference: null, sum: 0 },
  transition: ({ phase, asleep, reference, sum }, value) => {
    if (value === SEGMENT_BREAK) {
      if (phase !== 'flag') return undefined;
      if (reference !== null && sum !== reference) return undefined;
      return { phase: 'flag', asleep: false, reference: reference ?? sum, sum: 0 };
    }
    if (phase === 'flag') {
      if (value !== SLEEP && value !== AWAKE) return undefined;
      return { phase: 'digit', asleep: value === SLEEP, reference, sum };
    }
    if (value < 1 || value > 9) return undefined;
    const nextSum = asleep ? sum : sum + value;
    // A box-bounded segment has at most three cells, hence a maximum sum of 27.
    if (nextSum > 27) return undefined;
    return { phase: 'flag', asleep: false, reference, sum: nextSum };
  },
  accept: ({ phase, reference, sum }) => phase === 'flag' && (reference === null || sum === reference),
}, 11, { multiSegment: true });

const boxNumber = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
};
const sleeperDigit = graph.cells().map(cell => new Pair(
  Pair.fnToKey((flag, digit) => flag !== SLEEP || digit === boxNumber(cell), 11),
  'sleeper box digit', sleeper.at(cell), cell));
const sleeperHouses = [...graph.rows(), ...graph.columns(), ...graph.boxes()]
  .map(cells => new ContainExact(String(SLEEP), ...sleeper.at(cells)));
const sleeperLines = allLines
  .map(cells => new ContainExact(String(SLEEP), ...sleeper.at(cells)));
const outsideLines = graph.cells()
  .filter(cell => !onLine.has(cell))
  .map(cell => new Given(sleeper.at(cell), AWAKE));
const blueSegments = cells => {
  const segments = [];
  for (const cell of cells) {
    if (!segments.length || boxNumber(segments.at(-1)[0]) !== boxNumber(cell)) segments.push([]);
    segments.at(-1).push(cell);
  }
  return segments;
};

return [
  shape,
  sleeper.toVar('sleeper'),
  graph.makeReplicate(new Given('R1C1', ...DIGITS)),
  sleeper.makeReplicate(new Given(sleeper.cells()[0], SLEEP, AWAKE)),
  ...sleeperDigit,
  ...sleeperHouses,
  ...sleeperLines,
  ...outsideLines,

  // Kropki dots: black is 2:1; white is consecutive.
  new BlackDot('R2C7', 'R2C8'), new BlackDot('R6C1', 'R6C2'),
  new BlackDot('R3C5', 'R4C5'), new BlackDot('R5C2', 'R6C2'),
  new WhiteDot('R7C7', 'R8C7'), new WhiteDot('R7C6', 'R7C7'),

  ...greenLines.map(cells => new NFA(greenMachine, 'green whisper', ...stream(cells))),
  ...redLines.map(cells => new NFA(redMachine, 'red parity', ...stream(cells))),
  ...purpleLines.map(cells => new NFA(purpleMachine(cells.length), 'purple renban', ...stream(cells))),
  ...blueLines.map(cells => new NFA(
    blueMachine, 'blue equal sums', ...blueSegments(cells).map(stream))),
];
