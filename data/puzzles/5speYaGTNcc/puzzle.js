// Title: Pseudo Coup
// Author: Senator Gronk
// Video: https://www.youtube.com/watch?v=5speYaGTNcc
// Source: https://sudokupad.app/GthdP3BQt6

// Normal Sudoku rules apply. Every row, column, and box has one pseudo cell;
// the pseudo cells hold 1-9 once. In every drawn clue, a pseudo cell reads as
// its box number, while another cell reads as its digit. The grey line is a
// thermo, pink lines are renbans, green lines are whispers, and black dots are
// 1:2 Kropki dots.
const graph = cellGraph('9x9');
const pseudo = graph.makeOverlay('VP');
const allCells = graph.cells();
const flag = cell => pseudo.at(cell);
const boxNumber = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
};
const stream = cells => cells.flatMap(cell => [cell, flag(cell)]);

// `boxNumber` depends on the current cell, so each clue receives its own NFA.
function effectivePairs(cells, relation, name) {
  const spec = NFA.encodeSpec({
    startState: { previous: null, digit: null, index: 0 },
    transition: ({ previous, digit, index }, value) => {
      if (digit === null) return { previous, digit: value, index };
      if (index >= cells.length) return undefined;
      const effective = value === 1 ? boxNumber(cells[index]) : digit;
      if (previous !== null && !relation(previous, effective)) return undefined;
      return { previous: effective, digit: null, index: index + 1 };
    },
    accept: ({ digit, index }) => digit === null && index === cells.length,
  }, 9);
  return new NFA(spec, name, ...stream(cells));
}

// This NFA processes one digit/flag pair at a time and requires exactly one
// selected flag in its segment. It is used for rows, columns, and boxes.
const onePseudo = NFA.encodeSpec({
  startState: { count: 0, digit: null },
  transition: ({ count, digit }, value) => {
    if (digit === null) return { count, digit: value };
    const next = count + (value === 1 ? 1 : 0);
    return next > 1 ? undefined : { count: next, digit: null };
  },
  accept: ({ count, digit }) => digit === null && count === 1,
}, 9);

function pseudoDigit(digit) {
  return NFA.encodeSpec({
    startState: { count: 0, value: null },
    transition: ({ count, value }, next) => {
      if (value === null) return { count, value: next };
      const countNext = count + (next === 1 && value === digit ? 1 : 0);
      return countNext > 1 ? undefined : { count: countNext, value: null };
    },
    accept: ({ count, value }) => value === null && count === 1,
  }, 9);
}

function effectiveRenban(cells) {
  const spec = NFA.encodeSpec({
    startState: { mask: 0, digit: null, index: 0 },
    transition: ({ mask, digit, index }, value) => {
      if (digit === null) return { mask, digit: value, index };
      if (index >= cells.length) return undefined;
      const effective = value === 1 ? boxNumber(cells[index]) : digit;
      const bit = 1 << (effective - 1);
      return mask & bit ? undefined : { mask: mask | bit, digit: null, index: index + 1 };
    },
    accept: ({ mask, digit, index }) => {
      if (digit !== null || index !== cells.length) return false;
      const values = [...Array(9)].flatMap((_, i) => mask & (1 << i) ? [i + 1] : []);
      return values.at(-1) - values[0] + 1 === values.length;
    },
  }, 9);
  return new NFA(spec, 'renban', ...stream(cells));
}

const thermos = [
  ['R1C6', 'R1C5', 'R1C4', 'R2C4', 'R2C5', 'R2C6'],
];
const whispers = [
  ['R3C9', 'R3C8', 'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1'],
  ['R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9'],
  ['R6C3', 'R7C3'],
  ['R6C4', 'R6C5', 'R5C5', 'R4C4', 'R4C5', 'R4C6', 'R5C6'],
];
const renbans = [
  ['R7C4', 'R8C5', 'R7C6'], ['R7C2', 'R8C3', 'R9C2'],
  ['R1C7', 'R1C8', 'R1C9'], ['R2C7', 'R2C8', 'R2C9'],
];
const dots = [['R4C9', 'R5C9'], ['R5C9', 'R6C9'], ['R1C1', 'R1C2']];

return [
  new Shape('9x9'),
  pseudo.toVar('pseudo flags'),
  pseudo.makeReplicate(new Given(flag('R1C1'), 1, 2)),
  ...[...graph.rows(), ...graph.columns(), ...graph.boxes()].map(cells =>
    new NFA(onePseudo, 'one pseudo', ...stream(cells))),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit =>
    new NFA(pseudoDigit(digit), 'pseudo digit', ...stream(allCells))),
  ...thermos.map(cells => effectivePairs(cells, (a, b) => a === null || b > a, 'thermo')),
  ...whispers.map(cells => effectivePairs(cells, (a, b) => a === null || Math.abs(a - b) >= 5, 'whisper')),
  ...renbans.map(effectiveRenban),
  ...dots.map(cells => effectivePairs(cells, (a, b) => a === null || a === 2 * b || b === 2 * a, 'black dot')),
];
