// Title: Unique Ratios
// Author: Burak Alver
// Video: https://www.youtube.com/watch?v=Nbp5FRyACmA
// Source: https://sudokupad.app/eco0hsqvv4

// Every grid cell uses a digit from 1-9, while the 4x4 rows, columns, and
// boxes retain their normal all-different behaviour. Every pair among the 24
// orthogonal edges is constrained to have different reduced ratios.

const DIGIT_MAX = 9;
const shape = new Shape('4x4', DIGIT_MAX);
const grid = cellGraph(shape);

const edgePairs = grid.cells().flatMap(cell => [
  grid.step(cell, 0, 1),
  grid.step(cell, 1, 0),
].filter(neighbour => neighbour !== null).map(neighbour => [cell, neighbour]));

const differentRatioNFA = NFA.encodeSpec({
  startState: {phase: 'first'},
  transition: (state, value) => {
    if (state.phase === 'first') {
      return {phase: 'second', first: value};
    }
    if (state.phase === 'second') {
      return {phase: 'third', first: state.first, second: value};
    }
    if (state.phase === 'third') {
      return {
        phase: 'fourth',
        first: state.first,
        second: state.second,
        third: value,
      };
    }
    if (state.phase === 'fourth') {
      const sameOrientation = state.first * value === state.second * state.third;
      const oppositeOrientation = state.first * state.third === state.second * value;
      if (!sameOrientation && !oppositeOrientation) return {phase: 'done'};
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
  maxDepth: 4,
}, shape);

const uniqueRatios = edgePairs.flatMap((firstEdge, i) =>
  edgePairs.slice(i + 1).map(secondEdge =>
    new NFA(
      differentRatioNFA,
      'different adjacent ratios',
      ...firstEdge,
      ...secondEdge)));

const whiteDots = [
  new WhiteDot('R2C1', 'R2C2'),
  new WhiteDot('R2C2', 'R3C2'),
  new WhiteDot('R2C3', 'R2C4'),
  new WhiteDot('R4C1', 'R4C2'),
];

const cages = [
  new Cage(17, 'R2C2', 'R3C2'),
  new Cage(6, 'R1C3', 'R2C3'),
  new Cage(5, 'R2C4', 'R3C4'),
];

return [
  shape,
  ...uniqueRatios,
  ...whiteDots,
  new StrictKropki(),
  ...cages,
];
