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

const effectVar = new Var('E', 'Effective value', 81);
const selectedVar = new Var('S', 'Loose-ten digit marker', 81);
const totalTensVar = new Var('T', 'Cage total tens', 24);
const totalOnesVar = new Var('O', 'Cage total ones', 24);

const effectCell = (r, c) => effectVar.cell((r - 1) * 9 + c);
const selectedCell = (r, c) => selectedVar.cell((r - 1) * 9 + c);
const totalTensCell = (i) => totalTensVar.cell(i + 1);
const totalOnesCell = (i) => totalOnesVar.cell(i + 1);

constraints.push(new Shape('9x9', 16));
constraints.push(effectVar);
constraints.push(selectedVar);
constraints.push(totalTensVar);
constraints.push(totalOnesVar);
constraints.push(new SearchPriority(100, ...graph.cells()));

// Grid-digit domain givens: all 81 grid cells share the DIGITS value set, so
// stamp one Given via Replicate instead of 81 hand-written copies.
const gridOrigin = graph.cells()[0];
constraints.push(new Replicate(
  [new Given(gridOrigin, DIGITS)],
  Replicate.encodeTargetCells(graph.cells(), gridOrigin, graph),
  gridOrigin,
));

// Effective-value domain givens: all 81 effect-Var cells share EFFECTIVE_VALUES.
const effectTargets = graph.cells().map((cell) => {
  const { row, col } = parseCellId(cell);
  return effectCell(row, col);
});
const effectLocator = graph.makeOverlay('VE');
const effectOrigin = effectTargets[0];
constraints.push(new Replicate(
  [new Given(effectOrigin, EFFECTIVE_VALUES)],
  Replicate.encodeTargetCells(effectTargets, effectOrigin, effectLocator),
  effectOrigin,
));

// Loose-ten marker domain givens: all 81 selected-Var cells share SELECTED_VALUES.
const selectedTargets = graph.cells().map((cell) => {
  const { row, col } = parseCellId(cell);
  return selectedCell(row, col);
});
const selectedLocator = graph.makeOverlay('VS');
const selectedOrigin = selectedTargets[0];
constraints.push(new Replicate(
  [new Given(selectedOrigin, SELECTED_VALUES)],
  Replicate.encodeTargetCells(selectedTargets, selectedOrigin, selectedLocator),
  selectedOrigin,
));

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

for (const boxCells of graph.boxes()) {
  const box = boxCells.map((cell) => {
    const { row, col } = parseCellId(cell);
    return effectCell(row, col);
  });
  constraints.push(new ContainExact('10', ...box));
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

// Cage-total ones-digit domain givens: all 24 total-ones-Var cells share
// TOTAL_ONES (the same value set as EFFECTIVE_VALUES/SELECTED_VALUES above).
const totalOnesTargets = cages.map((_, i) => totalOnesCell(i));
const totalOnesLocator = graph.makeOverlay('VO', graph.cells().slice(0, cages.length));
const totalOnesOrigin = totalOnesTargets[0];
constraints.push(new Replicate(
  [new Given(totalOnesOrigin, TOTAL_ONES)],
  Replicate.encodeTargetCells(totalOnesTargets, totalOnesOrigin, totalOnesLocator),
  totalOnesOrigin,
));

for (let i = 0; i < cages.length; i++) {
  const cage = effectiveCages[i];
  const tens = totalTensCell(i);
  const ones = totalOnesCell(i);
  constraints.push(new Given(tens, TOTAL_TENS));
  constraints.push(new Sum(-11, ...cage, [tens, -10], [ones, -1]));
}

for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) {
    constraints.push(new Or([
      new AllDifferent(totalTensCell(i), totalTensCell(j)),
      new AllDifferent(totalOnesCell(i), totalOnesCell(j)),
    ]));
  }
}

return constraints;
