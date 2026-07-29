// Title: Have you Heard?
// Author: rysmyth
// Video: https://www.youtube.com/watch?v=j5gUSoGqtec
// Source: https://sudokupad.app/bnL6qqT9DT

// Normal Sudoku. Lettered cages and outside clues share one 0-45 value per
// letter; each value is stored as decimal tens and ones Vars. Grid cells are
// restricted back to 1-9 after widening the shape for those Vars.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const letters = ['C', 'E', 'H', 'R', 'S', 'T', 'X', 'Y'];
const letterVars = Object.fromEntries(letters.map(letter => [
  letter,
  new Var(letter, `${letter} clue sum: tens, ones`, 2),
]));
const clue = letter => {
  const [tens, ones] = letterVars[letter].cells();
  return {tens, ones};
};

const gridDomain = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));
const clueDomains = letters.flatMap(letter => {
  const {tens, ones} = clue(letter);
  return [
    new Given(tens, 0, 1, 2, 3, 4),
    new Given(ones, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
    // 45 is the largest possible letter value.
    new Pair(Pair.fnToKey((t, o) => t < 4 || (t === 4 && o <= 5), shape),
      `${letter} is at most 45`, tens, ones),
  ];
});

// Read [tens, ones, line]. The line state starts summing strictly after the
// first crust (1 or 9), stops at the other, and compares that sum to the
// two-digit letter value.
const sandwichSpec = NFA.encodeSpec({
  startState: {step: 0},
  transition: (state, value) => {
    if (state.step === 0) {
      return value >= 0 && value <= 4 ? {step: 1, target: value * 10} : undefined;
    }
    if (state.step === 1) {
      const target = state.target + value;
      return value >= 0 && value <= 9 && target <= 45
        ? {step: 2, target, phase: 0, first: null, sum: 0}
        : undefined;
    }
    if (value < 1 || value > 9) return undefined;
    if (state.phase === 0) {
      return value === 1 || value === 9
        ? {...state, phase: 1, first: value}
        : state;
    }
    if (state.phase === 1) {
      if (value === 10 - state.first) {
        return state.sum === state.target ? {step: 3} : undefined;
      }
      const sum = state.sum + value;
      return sum <= state.target ? {...state, sum} : undefined;
    }
    return state;
  },
  accept: state => state.step === 3,
  maxDepth: 11,
}, shape);

const outsideClues = [
  ...['T', 'H', 'E', 'S', 'E', 'C', 'R', 'E', 'T'].map((letter, i) => {
    const {tens, ones} = clue(letter);
    return new NFA(sandwichSpec, `${letter} above C${i + 1}`,
      [tens, ones, ...graph.columns()[i]]);
  }),
  ...['X', 'Y'].map((letter, i) => {
    const {tens, ones} = clue(letter);
    return new NFA(sandwichSpec, `${letter} left of R${i + 1}`,
      [tens, ones, ...graph.rows()[i]]);
  }),
];

// Cage cell lists are transcribed from the drawn, letter-labelled cages.
const cages = [
  ['E', ['R8C9', 'R9C9']], ['T', ['R1C6', 'R2C6']],
  ['S', ['R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8']],
  ['H', ['R5C5', 'R6C5']], ['T', ['R9C4', 'R9C5']],
  ['C', ['R3C2', 'R3C3', 'R3C4', 'R3C5']],
  ['H', ['R5C7', 'R5C8', 'R6C8']], ['H', ['R7C6', 'R7C7', 'R7C8']],
  ['T', ['R2C2']], ['Y', ['R2C3']], ['X', ['R5C9']], ['E', ['R6C9']],
  ['T', ['R7C9']], ['Y', ['R8C1']], ['X', ['R8C4']], ['T', ['R6C1']],
  ['T', ['R4C4']], ['E', ['R4C5']],
];
const cageConstraints = cages.flatMap(([letter, cells]) => {
  const {tens, ones} = clue(letter);
  return [
    new Sum(0, ...cells, [tens, -10], [ones, -1]),
    new AllDifferent(...cells),
  ];
});

// Different letters denote different two-digit values. This small NFA compares
// two [tens, ones] pairs without treating their separate decimal digits as the
// values that must differ.
const differentLetterSpec = NFA.encodeSpec({
  startState: {step: 0},
  transition: (state, value) => {
    if (state.step === 0) return value <= 4 ? {step: 1, tens: value} : undefined;
    if (state.step === 1) return value <= 9
      ? {step: 2, tens: state.tens, ones: value} : undefined;
    if (state.step === 2) return value <= 4
      ? {...state, step: 3, otherTens: value} : undefined;
    if (state.step === 3) {
      return value <= 9
        ? {step: 4, different: state.tens !== state.otherTens || state.ones !== value}
        : undefined;
    }
    return undefined;
  },
  accept: state => state.step === 4 && state.different,
  maxDepth: 4,
}, shape);
const differentLetters = letters.flatMap((a, i) => letters.slice(i + 1).map(b => {
  const A = clue(a);
  const B = clue(b);
  return new NFA(differentLetterSpec, `${a}/${b} different`,
    [A.tens, A.ones, B.tens, B.ones]);
}));

return [
  shape,
  ...Object.values(letterVars),
  gridDomain,
  ...clueDomains,
  ...outsideClues,
  ...cageConstraints,
  ...differentLetters,
  // Gray squares: R4C3 (the thermometer bulb) and R3C9 are even.
  new Given('R4C3', 2, 4, 6, 8),
  new Given('R3C9', 2, 4, 6, 8),
  new Thermo('R4C3', 'R4C4', 'R4C5'),
  new Arrow('R6C1', 'R6C2', 'R6C3', 'R5C3'),
  new Arrow('R6C9', 'R5C9', 'R4C9', 'R4C8'),
  new Quad('R6C2', 1, 2, 3, 9),
  new Quad('R4C5', 1, 5, 8, 9),
  new Quad('R2C8', 2, 3, 7, 8),
];
