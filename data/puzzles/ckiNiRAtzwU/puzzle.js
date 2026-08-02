// Title: Double The Fun
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=ckiNiRAtzwU
// Source: https://sudokupad.app/588su8gaub

// Normal Sudoku; exactly one doubler in every row, column, and box; each
// digit is a doubler once. Arithmetic clues use digit times its 1-or-2 flag.
const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);
const paired = cells => cells.flatMap(cell => [cell, flag(cell)]);
const groups = graph.rowsColumnsBoxes();

// The alternating digit/flag machine accumulates effective values for a fixed total.
const effectiveSum = target => NFA.encodeSpec({
  startState: { digit: 0, sum: 0 },
  transition: ({ digit, sum }, value) => {
    if (!digit) return { digit: value, sum };
    if (value > 2) return undefined;
    const next = sum + digit * value;
    return next <= target ? { digit: 0, sum: next } : undefined;
  },
  accept: ({ digit, sum }) => digit === 0 && sum === target,
}, 9);

// Per-digit machines require exactly one flag of 2 beside that digit.
const occursAsDoubler = target => NFA.encodeSpec({
  startState: { digit: 0, count: 0 },
  transition: ({ digit, count }, value) => {
    if (!digit) return { digit: value, count };
    if (value > 2) return undefined;
    const next = count + (digit === target && value === 2 ? 1 : 0);
    return next <= 1 ? { digit: 0, count: next } : undefined;
  },
  accept: ({ digit, count }) => digit === 0 && count === 1,
}, 9);

// The first digit/flag pair is the arrow bulb; remaining pairs form its arm.
const effectiveArrow = maxDepth => NFA.encodeSpec({
  startState: { digit: 0, target: null, sum: 0 },
  transition: ({ digit, target, sum }, value) => {
    if (!digit) return { digit: value, target, sum };
    if (value > 2) return undefined;
    const effective = digit * value;
    if (target === null) return { digit: 0, target: effective, sum: 0 };
    const next = sum + effective;
    return next <= target ? { digit: 0, target, sum: next } : undefined;
  },
  accept: ({ digit, target, sum }) => digit === 0 && target !== null && sum === target,
  maxDepth,
}, 9);

const cages = [
  [8, ['R1C1', 'R1C2', 'R2C1']],
  [6, ['R3C1', 'R4C1']],
  [15, ['R4C3', 'R5C3']],
  [25, ['R5C4', 'R5C5', 'R6C3', 'R6C4']],
  [13, ['R5C6', 'R6C5', 'R6C6', 'R7C5']],
  [15, ['R7C6', 'R8C6']],
];
const arrows = [
  ['R7C5', ['R6C6', 'R6C7', 'R5C6']],
  ['R2C3', ['R3C3', 'R4C2', 'R4C1']],
  ['R2C1', ['R3C2']],
  ['R5C4', ['R6C3', 'R6C2', 'R7C3']],
  ['R6C8', ['R7C7', 'R8C6']],
  ['R4C4', ['R5C3', 'R5C2']],
  ['R1C6', ['R2C5', 'R2C6', 'R3C7', 'R4C6']],
  ['R9C6', ['R9C5', 'R8C4']],
  ['R8C2', ['R7C2', 'R6C1']],
];

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  ...groups.map(group => new ContainExact('2', ...flags.at(group))),
  ...Array.from({ length: 9 }, (_, digit) =>
    new NFA(occursAsDoubler(digit + 1), `digit ${digit + 1} doubler`, ...paired(graph.cells()))),
  ...cages.flatMap(([total, cells]) => [
    new AllDifferent(...cells),
    new NFA(effectiveSum(total), `effective cage ${total}`, ...paired(cells)),
  ]),
  ...arrows.map(([bulb, arm]) =>
    new NFA(effectiveArrow((arm.length + 1) * 2), 'effective arrow', ...paired([bulb, ...arm]))),
];
