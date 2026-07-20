// Title: Two Truths and a Different Truth
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=axENrc8qYZs
// Source: https://sudokupad.app/cdifwlxo10

// Shade flags are 1 (shaded) or 2 (unshaded). Truth flags are 1 when the
// clue is true with shaded cells doubled, and 2 when it is false. Every clue
// machine also requires the truth value to flip when unshaded cells are doubled.

const SHADED = 1;
const UNSHADED = 2;
const TRUE = 1;
const FALSE = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

const noMono2x2Spec = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Spec, 'no monochrome 2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

function effectiveValue(digit, shadeValue, shadedDoubles) {
  return digit * (shadeValue === shadedDoubles ? 2 : 1);
}

function truthAccept(flag, holdsShaded, holdsUnshaded) {
  return holdsShaded !== holdsUnshaded &&
    (flag === TRUE ? holdsShaded : !holdsShaded);
}

function interleaved(cells) {
  return cells.flatMap(cell => [cell, shade.at(cell)]);
}

function linearTruthSpec(coeffs, target, doubledShade, trueFlagMeansHolds) {
  const length = coeffs.length;
  return {
    startState: { flag: null, idx: 0, digit: null, sum: 0 },
    transition: (state, value) => {
      if (state.flag === null) {
        return value === TRUE || value === FALSE ? { ...state, flag: value } : undefined;
      }
      if (state.idx >= length) return state;
      if (state.digit === null) return { ...state, digit: value };
      if (value !== SHADED && value !== UNSHADED) return undefined;
      const coeff = coeffs[state.idx];
      return {
        flag: state.flag,
        idx: state.idx + 1,
        digit: null,
        sum: state.sum + coeff * effectiveValue(state.digit, value, doubledShade),
      };
    },
    accept: state => {
      const holds = state.sum === target;
      const flagSaysHolds = state.flag === (trueFlagMeansHolds ? TRUE : FALSE);
      return flagSaysHolds ? holds : !holds;
    },
    maxDepth: 1 + 2 * length,
  };
}

function pairTruthSpec(relation) {
  return {
    startState: { flag: null, idx: 0, digit: null, firstS: null, firstU: null,
      holdsS: null, holdsU: null },
    transition: (state, value) => {
      if (state.flag === null) {
        return value === TRUE || value === FALSE ? { ...state, flag: value } : undefined;
      }
      if (state.idx >= 2) return state;
      if (state.digit === null) return { ...state, digit: value };
      if (value !== SHADED && value !== UNSHADED) return undefined;
      const valueS = effectiveValue(state.digit, value, SHADED);
      const valueU = effectiveValue(state.digit, value, UNSHADED);
      if (state.idx === 0) {
        return { ...state, idx: 1, digit: null, firstS: valueS, firstU: valueU };
      }
      return { ...state, idx: 2, digit: null,
        holdsS: relation(state.firstS, valueS),
        holdsU: relation(state.firstU, valueU) };
    },
    accept: state => truthAccept(state.flag, state.holdsS, state.holdsU),
    maxDepth: 5,
  };
}

function effectiveRange(cell, doubledShade, low, high, inside) {
  const key = Pair.fnToKey((digit, shadeValue) => {
    const value = effectiveValue(digit, shadeValue, doubledShade);
    const inRange = value >= low && value <= high;
    return inside ? inRange : !inRange;
  }, 9);
  return new Pair(key, inside ? 'effective value in run' : 'effective value outside run',
    cell, shade.at(cell));
}

function effectiveEquality(a, b, doubledShade, equal) {
  const spec = NFA.encodeSpec({
    startState: { idx: 0, digit: null, first: null, holds: null },
    transition: (state, value) => {
      if (state.idx >= 2) return state;
      if (state.digit === null) return { ...state, digit: value };
      if (value !== SHADED && value !== UNSHADED) return undefined;
      const effective = effectiveValue(state.digit, value, doubledShade);
      if (state.idx === 0) {
        return { idx: 1, digit: null, first: effective, holds: null };
      }
      return { idx: 2, digit: null, first: state.first,
        holds: equal ? state.first === effective : state.first !== effective };
    },
    accept: state => state.holds === true,
    maxDepth: 4,
  }, 9);
  return new NFA(spec, equal ? 'equal effective values' : 'different effective values',
    a, shade.at(a), b, shade.at(b));
}

function cellPairs(cells) {
  return cells.flatMap((a, i) => cells.slice(i + 1).map(b => [a, b]));
}

function renbanHolds(cells, doubledShade) {
  const length = cells.length;
  const starts = Array.from({ length: 19 - length }, (_, i) => i + 1);
  return new Or(starts.map(low => new And([
    ...cells.map(cell => effectiveRange(
      cell, doubledShade, low, low + length - 1, true)),
    ...cellPairs(cells).map(([a, b]) =>
      effectiveEquality(a, b, doubledShade, false)),
  ])));
}

function renbanFails(cells, doubledShade) {
  const length = cells.length;
  const starts = Array.from({ length: 19 - length }, (_, i) => i + 1);
  return new And(starts.map(low => new Or([
    ...cells.map(cell => effectiveRange(
      cell, doubledShade, low, low + length - 1, false)),
    ...cellPairs(cells).map(([a, b]) =>
      effectiveEquality(a, b, doubledShade, true)),
  ])));
}

function renbanTruthConstraint(flag, cells) {
  return new Or([
    new And([
      new Given(flag, TRUE),
      renbanHolds(cells, SHADED),
      renbanFails(cells, UNSHADED),
    ]),
    new And([
      new Given(flag, FALSE),
      renbanFails(cells, SHADED),
      renbanHolds(cells, UNSHADED),
    ]),
  ]);
}

function unaryTruthSpec(relation) {
  return {
    startState: { flag: null, digit: null, holdsS: null, holdsU: null },
    transition: (state, value) => {
      if (state.flag === null) {
        return value === TRUE || value === FALSE ? { ...state, flag: value } : undefined;
      }
      if (state.digit === null) return { ...state, digit: value };
      if (value !== SHADED && value !== UNSHADED) return undefined;
      return { ...state,
        holdsS: relation(effectiveValue(state.digit, value, SHADED)),
        holdsU: relation(effectiveValue(state.digit, value, UNSHADED)) };
    },
    accept: state => truthAccept(state.flag, state.holdsS, state.holdsU),
    maxDepth: 3,
  };
}

function truthGroup(prefix, clues, makeConstraint) {
  const flags = new Var(prefix, `${prefix} truth flags`, 3);
  const flagCells = Array.from({ length: 3 }, (_, i) => flags.cell(i + 1));
  return [
    flags,
    ...flagCells.map(cell => new Given(cell, TRUE, FALSE)),
    ...clues.map((clue, i) => makeConstraint(flagCells[i], clue, i)),
    new ContainExact('1_1_2', ...flagCells),
  ];
}

function linearClue(name, flag, cells, coeffs, target) {
  return new And([
    new NFA(NFA.encodeSpec(
      linearTruthSpec(coeffs, target, SHADED, true), 9), `${name} shaded`,
    flag, ...interleaved(cells)),
    new NFA(NFA.encodeSpec(
      linearTruthSpec(coeffs, target, UNSHADED, false), 9), `${name} unshaded`,
    flag, ...interleaved(cells)),
  ]);
}

function pairClue(name, flag, cells, relation) {
  return new NFA(NFA.encodeSpec(pairTruthSpec(relation), 9), name,
    flag, ...interleaved(cells));
}

const renbans = [
  ['R1C1', 'R2C2', 'R3C2', 'R2C3'],
  ['R8C7', 'R9C7', 'R8C8', 'R9C8'],
  ['R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4'],
];

const arrows = [
  ['R4C7', 'R5C8', 'R6C9', 'R7C9', 'R8C9'],
  ['R3C5', 'R2C4', 'R3C3', 'R4C2'],
  ['R7C2', 'R6C2', 'R5C2', 'R4C3'],
];

const xPairs = [
  ['R2C8', 'R3C8'], ['R2C7', 'R3C7'], ['R2C6', 'R3C6'],
];
const blackDots = [
  ['R3C1', 'R4C1'], ['R1C2', 'R1C3'], ['R7C7', 'R8C7'],
];
const whiteDots = [
  ['R4C4', 'R4C5'], ['R5C7', 'R6C7'], ['R6C5', 'R7C5'],
];
const oddCircles = ['R5C4', 'R6C6', 'R7C3'];
const evenSquares = ['R2C1', 'R1C2', 'R7C8'];

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,

  ...truthGroup('REN', renbans, (flag, cells) =>
    renbanTruthConstraint(flag, cells)),
  ...truthGroup('ARW', arrows, (flag, cells, i) =>
    linearClue(`arrow ${i + 1}`, flag, cells,
      [1, ...Array(cells.length - 1).fill(-1)], 0)),
  ...truthGroup('XTF', xPairs, (flag, cells, i) =>
    linearClue(`X ${i + 1}`, flag, cells, [1, 1], 10)),
  ...truthGroup('BLK', blackDots, (flag, cells, i) =>
    pairClue(`black dot ${i + 1}`, flag, cells,
      (a, b) => a === 2 * b || b === 2 * a)),
  ...truthGroup('WHT', whiteDots, (flag, cells, i) =>
    pairClue(`white dot ${i + 1}`, flag, cells,
      (a, b) => Math.abs(a - b) === 1)),
  ...truthGroup('ODD', oddCircles, (flag, cell, i) =>
    new NFA(NFA.encodeSpec(unaryTruthSpec(value => value % 2 === 1), 9),
      `odd ${i + 1}`, flag, cell, shade.at(cell))),
  ...truthGroup('EVN', evenSquares, (flag, cell, i) =>
    new NFA(NFA.encodeSpec(unaryTruthSpec(value => value % 2 === 0), 9),
      `even ${i + 1}`, flag, cell, shade.at(cell))),
];
