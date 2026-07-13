// Title: Reciprocals
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=ehi5FkxgrWs
// Source: https://sudokupad.app/gf8l5f4s64

// Full encoding. Global Yin-Yang connectivity is one ConnectedValues
// constraint per shade over the shade overlay; local shading and reciprocal
// sum/product cages are encoded below.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const shadeCell = cell => shade.at(cell);
const gridCells = graph.cells();

const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a || 1;
};

const reduce = (num, den) => {
  const divisor = gcd(num, den);
  return { num: num / divisor, den: den / divisor };
};

const addFractions = (aNum, aDen, bNum, bDen) =>
  reduce(aNum * bDen + bNum * aDen, aDen * bDen);

const multiplyFractions = (aNum, aDen, bNum, bDen) =>
  reduce(aNum * bNum, aDen * bDen);

const numericValueRange = shadeValue => shadeValue === SHADED
  ? { min: 1 / 9, max: 1 }
  : { min: 1, max: 9 };

const maskCanReachTarget = (kind, target, mask) => {
  let min = kind === 'sum' ? 0 : 1;
  let max = kind === 'sum' ? 0 : 1;
  for (const shadeValue of mask) {
    const range = numericValueRange(shadeValue);
    if (kind === 'sum') {
      min += range.min;
      max += range.max;
    } else {
      min *= range.min;
      max *= range.max;
    }
  }
  return min <= target + 1e-12 && max >= target - 1e-12;
};

const maskLabel = mask => mask.map(v => v === SHADED ? 'S' : 'U').join('');
const cageNfaCache = new Map();

const fixedShadeCageNFA = (kind, target, mask) => {
  const label = `${kind}-${target}-${maskLabel(mask)}`;
  if (cageNfaCache.has(label)) return cageNfaCache.get(label);

  const minRemaining = Array(mask.length + 1).fill(kind === 'sum' ? 0 : 1);
  const maxRemaining = Array(mask.length + 1).fill(kind === 'sum' ? 0 : 1);
  for (let i = mask.length - 1; i >= 0; i--) {
    const range = numericValueRange(mask[i]);
    if (kind === 'sum') {
      minRemaining[i] = minRemaining[i + 1] + range.min;
      maxRemaining[i] = maxRemaining[i + 1] + range.max;
    } else {
      minRemaining[i] = minRemaining[i + 1] * range.min;
      maxRemaining[i] = maxRemaining[i + 1] * range.max;
    }
  }

  const encoded = NFA.encodeSpec({
  startState: {
    pos: 0,
    num: kind === 'sum' ? 0 : 1,
    den: 1,
  },
  transition: (state, value) => {
    if (state.pos >= mask.length) return undefined;

    const shadeValue = mask[state.pos];
    const valueNum = shadeValue === SHADED ? 1 : value;
    const valueDen = shadeValue === SHADED ? value : 1;
    const next = kind === 'sum'
      ? addFractions(state.num, state.den, valueNum, valueDen)
      : multiplyFractions(state.num, state.den, valueNum, valueDen);

    const remaining = state.pos + 1;
    const current = next.num / next.den;
    if (kind === 'sum') {
      if (next.num > target * next.den) return undefined;
      if (current + minRemaining[remaining] > target + 1e-12) return undefined;
      if (current + maxRemaining[remaining] < target - 1e-12) return undefined;
    } else {
      if (current * minRemaining[remaining] > target + 1e-12) return undefined;
      if (current * maxRemaining[remaining] < target - 1e-12) return undefined;
    }

    return {
      pos: state.pos + 1,
      num: next.num,
      den: next.den,
    };
  },
  accept: state =>
    state.pos === mask.length &&
    state.num === target * state.den,
  }, 9);
  cageNfaCache.set(label, encoded);
  return encoded;
};

const cageConstraint = (kind, target, cells) => {
  const branches = [];
  for (let bits = 0; bits < 2 ** cells.length; bits++) {
    const mask = cells.map((_, index) =>
      (bits & (1 << index)) === 0 ? UNSHADED : SHADED);
    if (!maskCanReachTarget(kind, target, mask)) continue;

    branches.push(new And([
      new NFA(fixedShadeCageNFA(kind, target, mask), `${kind}-${target}`,
        ...cells),
      ...cells.map((cell, index) => new Given(shadeCell(cell), mask[index])),
    ]));
  }
  return new Or(branches);
};

const noMono2x2NFA = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (value !== SHADED && value !== UNSHADED) return undefined;
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, 9);

const cages = [
  ['sum', 1, ['R6C4', 'R6C5', 'R6C6', 'R6C7', 'R7C7', 'R8C6', 'R8C7']],
  ['sum', 1, ['R4C4', 'R4C5', 'R4C6']],
  ['sum', 3, ['R3C7', 'R4C7', 'R5C6', 'R5C7', 'R5C8']],
  ['sum', 2, ['R6C3', 'R7C3', 'R7C4']],
  ['product', 1, ['R7C8', 'R8C8', 'R9C8', 'R9C9']],
  ['product', 1, ['R3C3', 'R3C4', 'R3C5', 'R4C3', 'R5C3', 'R5C4', 'R5C5']],
  ['product', 1, ['R8C4', 'R9C3', 'R9C4']],
  ['product', 1, ['R5C2', 'R6C1', 'R6C2', 'R7C1', 'R7C2']],
  ['sum', 1, ['R8C1', 'R8C2', 'R9C1']],
  ['product', 5, ['R1C2', 'R1C3', 'R2C3', 'R2C4', 'R2C5']],
];

const firstShade = shade.cells()[0];
const monoOrigin = shadeCell('R1C1');

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  new Replicate([new Given(firstShade, SHADED, UNSHADED)],
    Replicate.encodeTargetCells(shade.cells(), firstShade, shade), firstShade),
  // Global Yin-Yang connectivity: each shade forms one orthogonally connected
  // region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  // The no-mono-2x2 NFA is the same machine at every valid 2x2 anchor
  // (R1C1..R8C8), each a uniform translation of the same relative cell
  // pattern over the shade overlay, so Replicate shortens the 64 stamped
  // copies to one template.
  new Replicate(
    [new NFA(noMono2x2NFA, 'no-mono-2x2', ...shade.block(monoOrigin, 2, 2))],
    Replicate.encodeTargetCells(shade.block(monoOrigin, 8, 8), monoOrigin, shade),
    monoOrigin),
  ...cages.map(([kind, target, cells]) => cageConstraint(kind, target, cells)),
];
