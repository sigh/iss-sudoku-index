// Title: Arithmetid Quiy
// Author: mnasti2
// Video: https://www.youtube.com/watch?v=23qeCn9TcWw
// Source: https://sudokupad.app/gbpdlymn6r

const offByOne = (lhs, rhs) => Math.abs(lhs - rhs) === 1;
const pill = (a, b) => 10 * a + b;

function finalDigitMask(lhs, tens) {
  let mask = 0;
  for (const rhs of [lhs - 1, lhs + 1]) {
    const digit = rhs - 10 * tens;
    if (digit >= 1 && digit <= 9) mask |= 1 << digit;
  }
  return mask;
}

function equationMachine(startState, transition, accept) {
  return NFA.encodeSpec({ startState, transition, accept }, 9);
}

const pillTimesDigitEqualsPill = equationMachine(
  { pos: 0 },
  (state, value) => {
    switch (state.pos) {
      case 0: return { pos: 1, a: value };
      case 1: return { pos: 2, left: pill(state.a, value) };
      case 2: return { pos: 3, left: state.left * value };
      case 3: {
        const mask = finalDigitMask(state.left, value);
        return mask ? { pos: 4, mask } : undefined;
      }
      case 4:
        return state.mask & (1 << value) ? { pos: 5 } : undefined;
    }
  },
  state => state.pos === 5,
);

const pillPlusDigitEqualsPill = equationMachine(
  { pos: 0 },
  (state, value) => {
    switch (state.pos) {
      case 0: return { pos: 1, a: value };
      case 1: return { pos: 2, left: pill(state.a, value) };
      case 2: return { pos: 3, left: state.left + value };
      case 3: {
        const mask = finalDigitMask(state.left, value);
        return mask ? { pos: 4, mask } : undefined;
      }
      case 4:
        return state.mask & (1 << value) ? { pos: 5 } : undefined;
    }
  },
  state => state.pos === 5,
);

const alternatingFiveEqualsDigit = equationMachine(
  { pos: 0, acc: 0 },
  (state, value) => {
    if (state.pos < 5) {
      const sign = state.pos % 2 === 0 ? 1 : -1;
      return { pos: state.pos + 1, acc: state.acc + sign * value };
    }
    if (state.pos === 5) {
      return offByOne(state.acc, value) ? { pos: 6 } : undefined;
    }
  },
  state => state.pos === 6,
);

const differenceTimesDigitEqualsDigit = equationMachine(
  { pos: 0 },
  (state, value) => {
    switch (state.pos) {
      case 0: return { pos: 1, first: value };
      case 1: return { pos: 2, diff: state.first - value };
      case 2: return { pos: 3, left: state.diff * value };
      case 3:
        return offByOne(state.left, value) ? { pos: 4 } : undefined;
    }
  },
  state => state.pos === 4,
);

const twoDigitsProductEqualsPill = equationMachine(
  { pos: 0 },
  (state, value) => {
    switch (state.pos) {
      case 0: return { pos: 1, first: value };
      case 1: return { pos: 2, left: state.first * value };
      case 2: {
        const mask = finalDigitMask(state.left, value);
        return mask ? { pos: 3, mask } : undefined;
      }
      case 3:
        return state.mask & (1 << value) ? { pos: 4 } : undefined;
    }
  },
  state => state.pos === 4,
);

const twoDigitsSumEqualsPill = equationMachine(
  { pos: 0 },
  (state, value) => {
    switch (state.pos) {
      case 0: return { pos: 1, first: value };
      case 1: return { pos: 2, left: state.first + value };
      case 2: {
        const mask = finalDigitMask(state.left, value);
        return mask ? { pos: 3, mask } : undefined;
      }
      case 3:
        return state.mask & (1 << value) ? { pos: 4 } : undefined;
    }
  },
  state => state.pos === 4,
);

const productPlusDigitEqualsPill = equationMachine(
  { pos: 0 },
  (state, value) => {
    switch (state.pos) {
      case 0: return { pos: 1, first: value };
      case 1: return { pos: 2, product: state.first * value };
      case 2: return { pos: 3, left: state.product + value };
      case 3: {
        const mask = finalDigitMask(state.left, value);
        return mask ? { pos: 4, mask } : undefined;
      }
      case 4:
        return state.mask & (1 << value) ? { pos: 5 } : undefined;
    }
  },
  state => state.pos === 5,
);

const threeDigitsProductEqualsPill = equationMachine(
  { pos: 0 },
  (state, value) => {
    switch (state.pos) {
      case 0: return { pos: 1, product: value };
      case 1: return { pos: 2, product: state.product * value };
      case 2: return { pos: 3, left: state.product * value };
      case 3: {
        const mask = finalDigitMask(state.left, value);
        return mask ? { pos: 4, mask } : undefined;
      }
      case 4:
        return state.mask & (1 << value) ? { pos: 5 } : undefined;
    }
  },
  state => state.pos === 5,
);

const redLineKey = Pair.fnToKey((a, b) => Math.abs(a - b) <= 2, 9);

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R2C1', 2),
  new Given('R3C1', 3),
  new Given('R4C1', 4),
  new Given('R5C1', 5),
  new Given('R6C1', 6),
  new Given('R7C1', 7),
  new Given('R8C1', 8),

  new NFA(pillTimesDigitEqualsPill, 'R1 off-by-one equation',
    'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'),
  new NFA(pillPlusDigitEqualsPill, 'R2 off-by-one equation',
    'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'),
  new NFA(alternatingFiveEqualsDigit, 'R3 off-by-one equation',
    'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'),
  new NFA(differenceTimesDigitEqualsDigit, 'R4 off-by-one equation',
    'R4C2', 'R4C3', 'R4C4', 'R4C5'),
  new NFA(twoDigitsProductEqualsPill, 'R5 off-by-one equation',
    'R5C2', 'R5C3', 'R5C4', 'R5C5'),
  new NFA(twoDigitsSumEqualsPill, 'R6 off-by-one equation',
    'R6C2', 'R6C3', 'R6C4', 'R6C5'),
  new NFA(productPlusDigitEqualsPill, 'R7 off-by-one equation',
    'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6'),
  new NFA(threeDigitsProductEqualsPill, 'R8 off-by-one equation',
    'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6'),

  new Pair(redLineKey, 'red line difference at most 2',
    'R4C8', 'R4C7', 'R5C7', 'R6C7'),
  new Pair(redLineKey, 'red line difference at most 2',
    'R5C7', 'R5C8'),
];
