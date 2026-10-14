// Title: Wet Blankets 2: Soggy Monday
// Author: Jorava
// Video: https://www.youtube.com/watch?v=mKzm3hMF_VA
// Source: https://sudokupad.app/hkzobuop6w

// Normal Sudoku with one negative digit in each house, each digit negated once.
// XV and white dots use signed values. All white dots are given; all XV are
// given except where a white dot can be placed. Dynamic fog is solving UI.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const negated = graph.makeOverlay('VN');
// The overlay is 0 for an ordinary cell and the digit itself for a negative cell.
const modifierKey = Pair.fnToKey((digit, modifier) => modifier === 0 || modifier === digit, shape);
// Four phases read digit A, its modifier, digit B, its modifier. The stored
// effective value is digit - 2*modifier; the final phase tests the edge relation.
function edgeSpec(predicate) {
  return NFA.encodeSpec({
    startState: {phase: 'digitA'},
    transition: (state, value) => {
      if (state.phase === 'digitA') return value > 0 ? {phase: 'modifierA', digit: value} : undefined;
      if (state.phase === 'modifierA') return value === 0 || value === state.digit ? {phase: 'digitB', a: state.digit - 2 * value} : undefined;
      if (state.phase === 'digitB') return value > 0 ? {phase: 'modifierB', a: state.a, digit: value} : undefined;
      if (state.phase === 'modifierB') {
        if (value !== 0 && value !== state.digit) return undefined;
        return predicate(state.a, state.digit - 2 * value) ? {phase: 'accepted'} : undefined;
      }
      return undefined;
    },
    accept: state => state.phase === 'accepted',
    maxDepth: 4,
  }, shape);
}
const specs = {
  W: edgeSpec((a, b) => Math.abs(a - b) === 1),
  X: edgeSpec((a, b) => a + b === 10 && Math.abs(a - b) !== 1),
  V: edgeSpec((a, b) => a + b === 5 && Math.abs(a - b) !== 1),
  blank: edgeSpec((a, b) => Math.abs(a - b) !== 1 && a + b !== 5 && a + b !== 10),
};
// Edge tables transcribed from the drawn V, X and white-dot marks.
const marks = {
  "V": [
    [
      "R4C4",
      "R4C5"
    ],
    [
      "R6C6",
      "R6C7"
    ],
    [
      "R6C1",
      "R6C2"
    ],
    [
      "R5C4",
      "R6C4"
    ],
    [
      "R7C6",
      "R8C6"
    ],
    [
      "R9C1",
      "R9C2"
    ]
  ],
  "X": [
    [
      "R1C4",
      "R2C4"
    ],
    [
      "R1C3",
      "R1C4"
    ],
    [
      "R2C3",
      "R3C3"
    ],
    [
      "R3C1",
      "R4C1"
    ],
    [
      "R5C1",
      "R6C1"
    ],
    [
      "R7C2",
      "R8C2"
    ],
    [
      "R7C5",
      "R8C5"
    ],
    [
      "R4C5",
      "R4C6"
    ],
    [
      "R2C5",
      "R3C5"
    ],
    [
      "R1C8",
      "R2C8"
    ],
    [
      "R7C9",
      "R8C9"
    ],
    [
      "R7C7",
      "R7C8"
    ],
    [
      "R9C7",
      "R9C8"
    ]
  ],
  "W": [
    [
      "R1C8",
      "R1C9"
    ],
    [
      "R2C7",
      "R2C8"
    ],
    [
      "R3C8",
      "R4C8"
    ],
    [
      "R2C2",
      "R3C2"
    ],
    [
      "R8C2",
      "R9C2"
    ],
    [
      "R9C6",
      "R9C7"
    ]
  ]
};
const edgeKey = (a, b) => [a, b].sort().join('|');
const marked = new Map(Object.entries(marks).flatMap(([kind, pairs]) => pairs.map(([a, b]) => [edgeKey(a, b), kind])));
const edges = graph.cells().flatMap(a => graph.neighbours(a).filter(b => a < b).map(b => [a, b]));
const edgeRules = edges.map(([a, b]) => {
  const kind = marked.get(edgeKey(a, b)) || 'blank';
  return new NFA(specs[kind], kind + ' signed edge', [a, negated.at(a), b, negated.at(b)]);
});
return [
  shape,
  // The sole printed given.
  new Given('R5C6', 2),
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  negated.toVar('negated digit or zero'),
  ...graph.cells().map(cell => new Pair(modifierKey, 'digit or zero', cell, negated.at(cell))),
  ...graph.rowsColumnsBoxes().map(house => new ContainExact('0_0_0_0_0_0_0_0', ...negated.at(house))),
  new ContainExact('1_2_3_4_5_6_7_8_9', ...negated.cells()),
  ...edgeRules,
];
