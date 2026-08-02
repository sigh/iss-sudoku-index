// Title: Trick Play
// Author: ViKingPrime
// Video: https://www.youtube.com/watch?v=ZQRdtPmgCuM
// Source: https://sudokupad.app/bgDhfmrfN4

// Normal Sudoku. For each displayed subtype, exactly two of its three instances
// satisfy the ordinary clue rule and the other explicitly fails it.

const arrowSpec = correct => NFA.encodeSpec({
  startState: { head: null, sum: 0 },
  transition: ({ head, sum }, value) => head === null
    ? { head: value, sum: 0 }
    : { head, sum: Math.min(sum + value, 10) },
  accept: ({ head, sum }) => head !== null && (correct ? sum === head : sum !== head),
}, 9);

const paritySpec = odd => NFA.encodeSpec({
  startState: null,
  transition: (_, value) => value,
  accept: value => value !== null && (value % 2 === 1) === odd,
}, 9);

// The first cell is the circle being tested; the remaining two are the other
// purple circles. Count is capped once it can no longer equal the circle digit.
const circleSpec = correct => NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => target === null
    ? { target: value, count: 1 }
    : { target, count: Math.min(count + (value === target ? 1 : 0), target + 1) },
  accept: ({ target, count }) => target !== null && (correct ? count === target : count !== target),
}, 9);

// Each zipper pair is read as [outer cell, middle cell, opposite outer cell].
const zipperPairSpec = correct => NFA.encodeSpec({
  startState: { left: null, middle: null },
  transition: ({ left, middle }, value) => left === null
    ? { left: value, middle: null }
    : middle === null
      ? { left, middle: value }
      : { ok: left + value === middle },
  accept: state => state.ok === correct,
}, 9);

const pair = (predicate, name, a, b) =>
  new Pair(Pair.fnToKey(predicate, 9), name, a, b);
const truthPair = (Constraint, predicate, name, a, b) => [
  new Constraint(a, b),
  pair((x, y) => !predicate(x, y), `not ${name}`, a, b),
];
const truthNfa = (spec, name, cells) => [
  new NFA(spec(true), name, ...cells),
  new NFA(spec(false), `not ${name}`, ...cells),
];

// Select each possible false instance, while requiring the other two true.
const twoOfThree = ([a, b, c]) => new Or([
  new And([a[0], b[0], c[1]]),
  new And([a[0], b[1], c[0]]),
  new And([a[1], b[0], c[0]]),
]);

const arrows = [
  truthNfa(arrowSpec, 'arrow R7C3', ['R7C3', 'R8C2', 'R8C1']),
  truthNfa(arrowSpec, 'arrow R7C8', ['R7C8', 'R6C8', 'R5C7']),
  truthNfa(arrowSpec, 'arrow R1C2', ['R1C2', 'R2C2', 'R3C2', 'R4C3', 'R5C4', 'R6C5']),
];
const circles = ['R5C1', 'R5C9', 'R7C2'].map(cell =>
  truthNfa(circleSpec, `circle ${cell}`, [cell, ...['R5C1', 'R5C9', 'R7C2'].filter(x => x !== cell)]));
const whiteDots = [
  truthPair(WhiteDot, (a, b) => Math.abs(a - b) === 1, 'white dot', 'R7C6', 'R7C7'),
  truthPair(WhiteDot, (a, b) => Math.abs(a - b) === 1, 'white dot', 'R5C2', 'R5C3'),
  truthPair(WhiteDot, (a, b) => Math.abs(a - b) === 1, 'white dot', 'R3C7', 'R3C8'),
];
const blackDots = [
  truthPair(BlackDot, (a, b) => a === 2 * b || b === 2 * a, 'black dot', 'R1C3', 'R2C3'),
  truthPair(BlackDot, (a, b) => a === 2 * b || b === 2 * a, 'black dot', 'R2C8', 'R3C8'),
  truthPair(BlackDot, (a, b) => a === 2 * b || b === 2 * a, 'black dot', 'R9C3', 'R9C4'),
];
const odds = ['R3C1', 'R6C4', 'R8C6'].map(cell => truthNfa(paritySpec, `odd ${cell}`, [cell]));
const evens = ['R1C8', 'R7C9', 'R8C3'].map(cell => truthNfa(odd => paritySpec(!odd), `even ${cell}`, [cell]));
const xs = [
  truthPair(X, (a, b) => a + b === 10, 'X', 'R2C5', 'R3C5'),
  truthPair(X, (a, b) => a + b === 10, 'X', 'R7C5', 'R8C5'),
  truthPair(X, (a, b) => a + b === 10, 'X', 'R5C8', 'R5C9'),
];
const vs = [
  truthPair(V, (a, b) => a + b === 5, 'V', 'R5C1', 'R5C2'),
  truthPair(V, (a, b) => a + b === 5, 'V', 'R7C2', 'R7C3'),
  truthPair(V, (a, b) => a + b === 5, 'V', 'R7C7', 'R7C8'),
];

const zipper = (cells, name) => {
  const middle = cells[(cells.length - 1) / 2];
  const pairs = Array.from({ length: (cells.length - 1) / 2 }, (_, i) =>
    [cells[i], middle, cells[cells.length - 1 - i]]);
  const truePairs = pairs.map(cells => new NFA(zipperPairSpec(true), name, ...cells));
  const falsePairs = pairs.map(cells => new NFA(zipperPairSpec(false), `not ${name}`, ...cells));
  return [new Zipper(...cells), new Or(falsePairs)];
};
const zippers = [
  zipper(['R7C6', 'R8C6', 'R9C6', 'R9C5', 'R9C4', 'R8C4', 'R7C4'], 'zipper lower'),
  zipper(['R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'], 'zipper middle'),
  zipper(['R3C4', 'R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6'], 'zipper upper'),
];

return [
  new Shape('9x9'),
  twoOfThree(arrows),
  twoOfThree(circles),
  twoOfThree(whiteDots),
  twoOfThree(blackDots),
  twoOfThree(odds),
  twoOfThree(evens),
  twoOfThree(xs),
  twoOfThree(vs),
  twoOfThree(zippers),
];
