// Title: Nos482
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=WzXuF38hcNY
// Source: https://sudokupad.app/zph1u3t3zq

// A role is natural, vampire, or prey. Each box also exposes its prey's
// digit in a Var. Cage-sum NFAs scan role/digit/box-prey triples and
// compute each cell's "value" (own digit, 0 for prey, own digit plus the
// box's prey digit for vampire) without needing an aux Var to hold sums
// above 9.
const NATURAL = 1;
const VAMPIRE = 2;
const PREY = 3;
const graph = cellGraph('9x9');
const roles = graph.makeOverlay('VR');
const roleAt = cell => roles.at(cell);
const preyDigits = new Var('B', 'prey digit by box', 9);
const vampireDigits = new Var('A', 'vampire digit by box', 9);
const boxes = graph.boxes();
const boxNumber = new Map(boxes.flatMap((box, index) =>
  box.map(cell => [cell, index + 1])));

// Each capture NFA scans digit/role pairs for one box, then binds the final
// Var to the digit carrying the requested role.
const captureMachine = targetRole => NFA.encodeSpec({
  startState: { phase: 'digit', pairsLeft: 9, found: null },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { ...state, phase: 'role', digit: value };
    }
    if (state.phase === 'role') {
      if (value < NATURAL || value > PREY) return undefined;
      const found = value === targetRole ? state.digit : state.found;
      const pairsLeft = state.pairsLeft - 1;
      return {
        phase: pairsLeft === 0 ? 'capture' : 'digit',
        pairsLeft,
        found,
      };
    }
    return value === state.found ? { ...state, phase: 'done' } : undefined;
  },
  accept: state => state.phase === 'done',
}, 9);

const captureRole = (box, output, targetRole, label) => new NFA(
  captureMachine(targetRole),
  label,
  ...box.flatMap(cell => [cell, roleAt(cell)]),
  output,
);

const valueStream = clueCells => clueCells.flatMap(cell => [
  roleAt(cell),
  cell,
  preyDigits.cell(boxNumber.get(cell)),
]);

// A cage's displayed total equals the sum of its cells' "values" (see
// above). Any number of vampire/prey cells may fall in one cage -- unlike a
// two-cell coffin, there is no cap on how many special roles appear.
const cageSumMachine = target => NFA.encodeSpec({
  startState: { phase: 'role', total: 0 },
  transition: (state, value) => {
    if (state.phase === 'role') {
      if (value < NATURAL || value > PREY) return undefined;
      return { ...state, phase: 'digit', role: value };
    }
    if (state.phase === 'digit') {
      return { ...state, phase: 'prey-digit', digit: value };
    }
    const effective = state.role === PREY ? 0
      : state.digit + (state.role === VAMPIRE ? value : 0);
    const total = state.total + effective;
    if (total > target) return undefined;
    return { phase: 'role', total };
  },
  accept: state => state.phase === 'role' && state.total === target,
}, 9);

// Cage cells and target totals, transcribed from the drawn cage clues.
// Each cage's clue text is the same arithmetic expression over the digits
// 4, 8, 2 (kept in the comment so the total can be checked by hand); the
// evaluated total is the cage's required sum of cell "values".
const cages = [
  [24, ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4']], // (4+8)x2
  [16, ['R1C9']], // (4x8)/2
  [0, ['R9C1']], // 4-(8/2)
  [34, ['R6C6', 'R6C7', 'R7C6']], // (4x8)+2
  [10, ['R6C3', 'R6C4', 'R7C3', 'R7C4']], // 4+8-2
  [30, ['R3C6', 'R3C7', 'R4C6', 'R4C7']], // (4x8)-2
  [50, ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1']], // 48+2
  [24, ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8']], // 4*(8-2)
  [40, ['R7C7', 'R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C9']], // 4x(8+2)
  [14, ['R9C2', 'R9C3']], // 4+8+2
  [6, ['R3C9']], // (4+8)/2
];

const houses = [...graph.rows(), ...graph.columns(), ...boxes];
const boxRoleCaptures = boxes.flatMap((box, index) => [
  captureRole(box, preyDigits.cell(index + 1), PREY, 'box prey digit'),
  captureRole(box, vampireDigits.cell(index + 1), VAMPIRE, 'box vampire digit'),
]);

return [
  new Shape('9x9'),
  roles.toVar('natural, vampire, or prey'),
  roles.makeReplicate(new Given(roles.cells()[0], NATURAL, VAMPIRE, PREY)),
  preyDigits,
  vampireDigits,
  ...houses.flatMap(house => [
    new ContainExact(`${VAMPIRE}`, ...roles.at(house)),
    new ContainExact(`${PREY}`, ...roles.at(house)),
  ]),
  ...boxRoleCaptures,
  new AllDifferent(...preyDigits.cells()),
  new AllDifferent(...vampireDigits.cells()),
  // "digits may not repeat" applies to the raw grid digit, not the derived
  // value -- a single-cell cage needs no AllDifferent.
  ...cages.filter(([, cells]) => cells.length > 1)
    .map(([, cells]) => new AllDifferent(...cells)),
  ...cages.map(([total, cells]) => new NFA(
    cageSumMachine(total),
    'cage value sum',
    ...valueStream(cells),
  )),
];
