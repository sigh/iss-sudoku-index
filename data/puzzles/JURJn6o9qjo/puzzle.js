// Title: Quad Code
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=JURJn6o9qjo
// Source: https://sudokupad.app/7613uxdt7g

// Rules encoded:
// - Normal 9x9 Sudoku in rows 1-9.
// - A-I are a one-to-one code for digits 1-9.
// - Each quad's 2x2 cells contain the digits represented by its letters.
// - Each grey line partitions into adjacent groups that sum to 10.
// - The blue and yellow cage sums equal their letter-coded totals.
// Fog and the orange code-entry UI add no final-grid rules.

const letterVars = new Var('L', 'A-I digit code', 9);
const code = {
  A: 'VL1',
  B: 'VL2',
  C: 'VL3',
  D: 'VL4',
  E: 'VL5',
  F: 'VL6',
  G: 'VL7',
  H: 'VL8',
  I: 'VL9',
};

// Quad-circle corner anchors and text, from the source-drawn overlays.
const quadClues = [
  ['R6C3', 'CHEF'],
  ['R6C4', 'A'],
  ['R7C3', 'BEEF'],
  ['R7C4', 'DIE'],
  ['R7C5', 'ACID'],
  ['R8C8', 'FADE'],
  ['R7C7', 'FIB'],
  ['R5C1', 'ICE'],
  ['R4C2', 'CAB'],
  ['R3C1', 'BED'],
  ['R2C2', 'IDEA'],
  ['R2C5', 'BID'],
  ['R2C7', 'AGE'],
  ['R2C8', 'BAG'],
  ['R5C8', 'HIDE'],
  ['R8C2', 'BEG'],
];

// This machine first collects the distinct coded digits named by a quad,
// then removes them as matching values appear in the four surrounding cells.
const quadMachineBySize = new Map();
const quadMachine = (numLetters) => {
  if (quadMachineBySize.has(numLetters)) {
    return quadMachineBySize.get(numLetters);
  }
  const machine = NFA.encodeSpec({
    startState: { phase: 'letters', targets: [] },
    transition: (state, value) => {
      if (state.phase === 'letters') {
        if (value === SEGMENT_BREAK) {
          return state.targets.length === numLetters
            ? { phase: 'quad', missing: state.targets }
            : undefined;
        }
        if (state.targets.length >= numLetters ||
            state.targets.includes(value)) {
          return undefined;
        }
        return {
          phase: 'letters',
          targets: [...state.targets, value].sort((a, b) => a - b),
        };
      }
      if (value === SEGMENT_BREAK) return undefined;
      return {
        phase: 'quad',
        missing: state.missing.filter(target => target !== value),
      };
    },
    accept: (state) => state.phase === 'quad' && state.missing.length === 0,
    maxDepth: numLetters + 5,
  }, 9, { multiSegment: true });
  quadMachineBySize.set(numLetters, machine);
  return machine;
};

const graph = cellGraph('9x9');
const quadConstraints = quadClues.map(([topLeft, word]) => {
  const letters = [...new Set(word)].map(letter => code[letter]);
  return new NFA(
    quadMachine(letters.length),
    'coded quad',
    letters,
    graph.block(topLeft, 2, 2),
  );
});

// Grey paths, from the source-drawn line entries.
const greyLines = [
  ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8'],
  ['R2C4', 'R3C5'],
  ['R2C5', 'R2C6'],
  ['R6C6', 'R5C7'],
  ['R6C1', 'R5C2'],
  ['R7C1', 'R8C2'],
  ['R8C4', 'R8C5'],
  ['R6C7', 'R7C7'],
  ['R2C8', 'R3C8'],
];

// The source-drawn yellow cage and the seven cells outside the blue cage.
const yellowCage = ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'];
const outsideBlueCage = new Set([...yellowCage, 'R1C9', 'R2C9']);
const blueCage = graph.cells().filter(cell => !outsideBlueCage.has(cell));

return [
  new Shape('9x9'),
  letterVars,
  new AllDifferent(...Object.values(code)),
  ...quadConstraints,
  ...greyLines.map(cells => new SumLine(10, ...cells)),
  // Blue total BIG and yellow total AA, read through the A-I code.
  new Sum(0, ...blueCage, [code.B, -100], [code.I, -10], [code.G, -1]),
  new Sum(0, ...yellowCage, [code.A, -11]),
];
