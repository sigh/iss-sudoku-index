// Title: Bridging The Mines
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=0jgxKnNxEvA
// Source: https://sudokupad.app/crqk2uytmu

// Rules encoded here:
//  - Normal sudoku.
//  - White dot = consecutive, black dot = 1:2 ratio; not all dots are given, so
//    the eight drawn dots carry no negative constraint.
//  - For each line, one attached circle holds an odd digit counting the odd
//    digits along the line (excluding itself) and the other holds an even digit
//    counting the even digits along the line (excluding itself).
//  - Shade cells so shaded cells are orthogonally connected, unshaded cells are
//    orthogonally connected, and no 2x2 area is fully shaded or fully unshaded.
//  - Circles are unshaded minesweeper clues: the digit counts shaded cells among
//    the up-to-eight cells touching it orthogonally or diagonally.
// Nothing is omitted.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

// Cells of the four drawn grey polylines, in stroke order (diagonal steps
// included), and the ten drawn circles.
const drawnPaths = [
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R8C5'],
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C6', 'R2C5',
   'R2C4', 'R2C3', 'R2C2', 'R3C2', 'R4C1', 'R4C2', 'R5C2', 'R5C1', 'R6C1',
   'R6C2', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R3C4', 'R3C5'],
  ['R3C8', 'R4C7', 'R3C7', 'R3C6', 'R2C7', 'R1C8', 'R2C9', 'R3C9', 'R4C9',
   'R5C9', 'R6C9', 'R7C9', 'R7C8', 'R7C7', 'R6C6', 'R5C7', 'R6C7'],
  ['R4C5', 'R5C6', 'R5C5', 'R4C4', 'R5C4', 'R6C5', 'R7C6', 'R7C5', 'R6C4'],
];
const circles = ['R9C1', 'R8C5', 'R1C1', 'R2C3', 'R3C5', 'R2C9', 'R3C8',
                 'R6C7', 'R4C5', 'R6C4'];

// The rule gives each line exactly two attached circles ("one attached circle
// ... and the other circle"), but two of the four drawn strokes carry three:
// each of those runs through a further circle (R2C3, R2C9) partway along.  A
// stroke is therefore one line per circle-to-circle run.  The alternative --
// each stroke being a single line counted by its two end circles -- is
// arithmetically impossible for the 25-cell stroke: with circle digits x (odd)
// and y (even), x counts the odd digits along the line other than x and y the
// even digits other than y, so x + y is the number of remaining cells, 23
// there, while x + y <= 9 + 8 = 17.  Splitting at the interior circles leaves
// every run bounded by a circle at each end, and makes every drawn circle an
// end of some run.
const circleSet = new Set(circles);
const lines = drawnPaths.flatMap(path => {
  const stops = path.flatMap((cell, i) => circleSet.has(cell) ? [i] : []);
  return stops.slice(0, -1).map((start, i) => path.slice(start, stops[i + 1] + 1));
});

// Counter machine for one line, read as the segments [firstCircle], interior,
// [lastCircle].  It carries the first circle's digit and the running count of
// odd interior digits; the even interior count is the rest of the interior.
// Each circle counts digits along the line other than itself, and the other
// circle has the opposite parity so contributes nothing to that count: the odd
// circle's digit is exactly the interior odd count and the even circle's the
// interior even count.  Which of the two circles is the odd one is not drawn,
// so both assignments are accepted.
function lineCounterSpec(interiorLength) {
  return NFA.encodeSpec({
    startState: { phase: 'first' },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        if (state.phase === 'read-first') {
          return { phase: 'interior', first: state.first, odds: 0 };
        }
        if (state.phase === 'interior') {
          return { phase: 'last', first: state.first, odds: state.odds };
        }
        return undefined;
      }
      if (state.phase === 'first') return { phase: 'read-first', first: value };
      if (state.phase === 'interior') {
        return {
          phase: 'interior',
          first: state.first,
          odds: state.odds + (value % 2),
        };
      }
      if (state.phase === 'last') {
        const a = state.first;
        const b = value;
        const odds = state.odds;
        const evens = interiorLength - odds;
        const ok = (a % 2 === 1 && b % 2 === 0 && a === odds && b === evens)
                || (a % 2 === 0 && b % 2 === 1 && b === odds && a === evens);
        return ok ? { phase: 'done' } : undefined;
      }
      return undefined;
    },
    accept: state => state.phase === 'done',
    // Two circle cells + the interior cells + one symbol per segment break.
    maxDepth: interiorLength + 4,
  }, geometry, { multiSegment: true });
}

const lineCounters = lines.map(line => new NFA(
  lineCounterSpec(line.length - 2),
  `line-parity-count-${line[0]}-${line[line.length - 1]}`,
  [line[0]], line.slice(1, -1), [line[line.length - 1]]));

// Drawn edge marks: white dots are consecutive pairs, black dots 1:2 pairs.
const whiteDots = [
  ['R4C3', 'R4C4'], ['R3C7', 'R4C7'], ['R5C9', 'R6C9'], ['R9C2', 'R9C3'],
];
const blackDots = [
  ['R5C1', 'R5C2'], ['R8C3', 'R8C4'], ['R9C6', 'R9C7'], ['R7C8', 'R8C8'],
];

// Minesweeper machine: the first segment is the circle cell, supplying the
// target digit; the second is its king neighbourhood, whose shaded members are
// counted.
const mineSpec = NFA.encodeSpec({
  startState: { phase: 'clue' },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return state.phase === 'read-clue'
        ? { phase: 'count', target: state.target, count: 0 } : undefined;
    }
    if (state.phase === 'clue') return { phase: 'read-clue', target: value };
    if (state.phase === 'count') {
      return {
        phase: 'count',
        target: state.target,
        count: state.count + (value === SHADED ? 1 : 0),
      };
    }
    return undefined;
  },
  accept: state => state.phase === 'count' && state.count === state.target,
  // The clue cell + up to eight neighbours + one segment break.
  maxDepth: 10,
}, geometry, { multiSegment: true });

const mineClues = circles.flatMap(circle => [
  new Given(shade.at(circle), UNSHADED),
  new NFA(mineSpec, `minesweeper-${circle}`,
    [circle], shade.at(graph.kingNeighbours(circle))),
]);

return [
  new Shape('9x9'),
  new YinYang(),
  ...mineClues,
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...lineCounters,
];
