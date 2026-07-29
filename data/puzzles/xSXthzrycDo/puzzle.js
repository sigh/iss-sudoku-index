// Title: One-Man Band
// Author: Bren77
// Video: https://www.youtube.com/watch?v=xSXthzrycDo
// Source: https://app.crackingthecryptic.com/4RFJTgRBQ2

// Normal Sudoku rules apply. Each row, column, and box has exactly one hot
// cell (digit + 1) and one cold cell (digit - 1), and each digit occurs once
// in each role. Blue lines have equal value sums in every box-delimited
// segment; the white dot marks consecutive values. No negative-dot rule.
const shape = new Shape('9x9', '0-10');
const graph = cellGraph('9x9');
const cells = graph.cells();
const role = graph.makeOverlay('VR');
const value = graph.makeOverlay('VV');
const allRoles = role.at(cells);
const entries = cells.flatMap((cell, index) => [cell, allRoles[index]]);

const rows = Array.from({length: 9}, (_, row) =>
  cells.slice(row * 9, row * 9 + 9));
const columns = Array.from({length: 9}, (_, col) =>
  cells.filter((_, index) => index % 9 === col));
const boxes = Array.from({length: 9}, (_, box) =>
  graph.block(cells[Math.floor(box / 3) * 27 + (box % 3) * 3], 3, 3));
const units = [...rows, ...columns, ...boxes];
const sudokuDigits = '1_2_3_4_5_6_7_8_9';

// A role is cold=1, ordinary=2, or hot=3. Value = digit + role - 2.
const roleValueConstraints = cells.flatMap(cell => [
  new Sum(-2, value.at(cell), [cell, -1], [role.at(cell), -1]),
]);

// For a fixed digit and role, scan digit/role pairs and accept exactly one match.
function oneRoleForDigitSpec(requiredRole, requiredDigit) {
  return NFA.encodeSpec({
    startState: {count: 0, digit: null},
    transition: ({count, digit}, input) => {
      if (digit === null) return {count, digit: input};
      const next = count + (digit === requiredDigit && input === requiredRole);
      return next > 1 ? undefined : {count: next, digit: null};
    },
    accept: ({count, digit}) => digit === null && count === 1,
    maxDepth: 162,
  }, shape);
}

const digitRoleConstraints = [1, 3].flatMap(requiredRole =>
  Array.from({length: 9}, (_, index) => {
    const digit = index + 1;
    return new NFA(
      oneRoleForDigitSpec(requiredRole, digit),
      `${requiredRole === 3 ? 'hot' : 'cold'} digit ${digit}`,
      ...entries,
    );
  }));

const equalSegments = segments => new EqualSum(
  ...value.at(segments));

// These cell lists are the blue paths, split at each 3x3 box border.
const blueLineConstraints = [
  equalSegments([['R3C3'], ['R4C4', 'R4C5', 'R5C5', 'R5C4'], ['R6C3']]),
  equalSegments([['R3C2'], ['R4C3', 'R5C3', 'R6C2']]),
  equalSegments([['R6C1'], ['R7C1', 'R8C2', 'R7C3', 'R7C2']]),
  equalSegments([['R5C6'], ['R4C7']]),
  equalSegments([['R1C3'], ['R1C4', 'R2C4', 'R3C4']]),
  equalSegments([['R9C7'], ['R9C6', 'R8C6', 'R7C6'], ['R6C5']]),
  equalSegments([['R3C7'], ['R4C8']]),
  equalSegments([['R5C2', 'R4C1'], ['R3C1', 'R2C1', 'R1C1']]),
  equalSegments([['R1C7', 'R2C7'], ['R2C6', 'R3C6']]),
];

const consecutiveValues = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, shape);

return [
  shape,
  ...rows.map(row => new ContainExact(sudokuDigits, ...row)),
  role.toVar('hot cold roles'),
  value.toVar('modified values'),
  role.makeReplicate(new Given(role.cells()[0], 1, 2, 3)),
  ...roleValueConstraints,
  ...units.flatMap(unit => [
    new ContainExact('1', ...role.at(unit)),
    new ContainExact('3', ...role.at(unit)),
  ]),
  ...digitRoleConstraints,
  ...blueLineConstraints,
  new Pair(consecutiveValues, 'consecutive values', value.at('R7C8'), value.at('R7C9')),
];
