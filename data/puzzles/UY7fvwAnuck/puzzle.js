// Title: Auteur
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=UY7fvwAnuck
// Source: https://sudokupad.app/sg7gob420m

// Model hidden "loose ten" values with per-cell Vars, then store each derived
// cage total in two decimal Var cells. The total Vars make uniqueness a compact
// pairwise comparison of states, avoiding a large Or-of-Sum decomposition.
const constraints = [];
const graph = cellGraph('9x9');

const DIGITS = '1_2_3_4_5_6_7_8_9';
const EFFECTIVE_VALUES = '1_2_3_4_5_6_7_8_9_10';
const SELECTED_VALUES = '1_2_3_4_5_6_7_8_9_10';
const TOTAL_TENS = '1_2_3_4'; // encoded as 0, 1, 2, 3
const TOTAL_ONES = '1_2_3_4_5_6_7_8_9_10'; // encoded as 0, 1, ..., 9

const effectCell = (r, c) => `VE${(r - 1) * 9 + c}`;
const selectedCell = (r, c) => `VS${(r - 1) * 9 + c}`;
const totalTensCell = (i) => `VT${i + 1}`;
const totalOnesCell = (i) => `VO${i + 1}`;

constraints.push(new Shape('9x9', 16));
constraints.push(new Var('E', 'Effective value', 81));
constraints.push(new Var('S', 'Loose-ten digit marker', 81));
constraints.push(new Var('T', 'Cage total tens', 24));
constraints.push(new Var('O', 'Cage total ones', 24));
constraints.push(new SearchPriority(100, ...graph.cells()));

for (const gridCell of graph.cells()) {
  const { row, col } = parseCellId(gridCell);
  constraints.push(new Given(gridCell, DIGITS));
  constraints.push(new Given(effectCell(row, col), EFFECTIVE_VALUES));
  constraints.push(new Given(selectedCell(row, col), SELECTED_VALUES));
}

const effectiveValueKey = Pair.fnToKey((digit, effective) => {
  return effective === digit || effective === 10;
}, 16);

const selectedFromEffectiveKey = Pair.fnToKey((effective, selected) => {
  return effective === 10 ? selected < 10 : selected === 10;
}, 16);

const selectedFromDigitKey = Pair.fnToKey((digit, selected) => {
  return selected === 10 || selected === digit;
}, 16);

for (const gridCell of graph.cells()) {
  const { row, col } = parseCellId(gridCell);
  constraints.push(new Pair(effectiveValueKey, 'digit or ten', gridCell, effectCell(row, col)));
  constraints.push(new Pair(selectedFromEffectiveKey, 'selected iff ten', effectCell(row, col), selectedCell(row, col)));
  constraints.push(new Pair(selectedFromDigitKey, 'selected digit', gridCell, selectedCell(row, col)));
}

constraints.push(new SearchPriority(90, ...graph.cells().map((cell) => {
  const { row, col } = parseCellId(cell);
  return effectCell(row, col);
})));
constraints.push(new SearchPriority(80, ...graph.cells().map((cell) => {
  const { row, col } = parseCellId(cell);
  return selectedCell(row, col);
})));

for (let r = 1; r <= 9; r++) {
  constraints.push(new ContainExact('10', ...Array.from({ length: 9 }, (_, i) => effectCell(r, i + 1))));
}

for (let c = 1; c <= 9; c++) {
  constraints.push(new ContainExact('10', ...Array.from({ length: 9 }, (_, i) => effectCell(i + 1, c))));
}

for (let br = 0; br < 3; br++) {
  for (let bc = 0; bc < 3; bc++) {
    const box = [];
    for (let dr = 1; dr <= 3; dr++) {
      for (let dc = 1; dc <= 3; dc++) {
        box.push(effectCell(br * 3 + dr, bc * 3 + dc));
      }
    }
    constraints.push(new ContainExact('10', ...box));
  }
}

for (let digit = 1; digit <= 9; digit++) {
  const selected = [];
  for (let r = 1; r <= 9; r++) {
    for (let c = 1; c <= 9; c++) {
      selected.push(selectedCell(r, c));
    }
  }
  constraints.push(new ContainExact(`${digit}`, ...selected));
}

const cages = [
  ['R1C8', 'R1C9', 'R2C9'],
  ['R2C8', 'R3C8', 'R3C9'],
  ['R7C8', 'R8C8', 'R9C8'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R5C8', 'R6C8'],
  ['R5C5', 'R5C6'],
  ['R5C3', 'R5C4'],
  ['R5C1', 'R5C2'],
  ['R3C7', 'R4C7'],
  ['R7C6', 'R7C7'],
  ['R8C3', 'R8C4'],
  ['R9C3', 'R9C4'],
  ['R6C5', 'R6C6'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R2C1'],
  ['R4C1'],
  ['R4C2'],
  ['R9C1'],
  ['R7C4'],
  ['R8C5'],
  ['R4C6'],
  ['R1C5'],
  ['R1C7'],
  ['R2C7'],
];

const effectiveCages = cages.map((cage) => cage.map((gridCell) => {
    const { row, col } = parseCellId(gridCell);
    return effectCell(row, col);
}));

for (let i = 0; i < cages.length; i++) {
  const cage = effectiveCages[i];
  const tens = totalTensCell(i);
  const ones = totalOnesCell(i);
  constraints.push(new Given(tens, TOTAL_TENS));
  constraints.push(new Given(ones, TOTAL_ONES));
  constraints.push(new Sum(`-11_=_${[...cage.map(() => 1), -10, -1].join('_')}`, ...cage, tens, ones));
}

const notEqualKey = Pair.fnToKey((a, b) => a !== b, 16);
for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) {
    constraints.push(new Or([
      new Pair(notEqualKey, 'different total tens', totalTensCell(i), totalTensCell(j)),
      new Pair(notEqualKey, 'different total ones', totalOnesCell(i), totalOnesCell(j)),
    ]));
  }
}

return constraints;
