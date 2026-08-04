// Title: Vampires
// Author: Mad-Tyas
// Video: https://www.youtube.com/watch?v=vD_dIPyhjnU
// Source: https://app.crackingthecryptic.com/sudoku/29B449j9RJ

// Normal sudoku rules apply (rows, columns, 3x3 boxes). Every cage's digits
// are distinct and sum to the cage's displayed total -- but the value a
// digit contributes to that sum depends on a hidden role. Nine cells are
// Vampires and nine are Prey, one of each per row, column, and box; all
// Vampire digits are pairwise different, and separately all Prey digits are
// pairwise different. A cell holds at most one of the two roles. A Prey
// cell contributes 0 to any cage total; a Vampire cell contributes its own
// digit plus the digit of the Prey cell sharing its box; every other cell
// contributes its own digit. No cage may contain two Vampire cells or two
// Prey cells.
//
// A role is normal, vampire, or prey. Each box also exposes its prey's
// digit in a Var. Cage-sum NFAs scan role/digit/box-prey triples and
// compute each cell's contribution (own digit, 0 for prey, own digit plus
// the box's prey digit for vampire) without needing an aux Var to hold
// sums above 9.
const NORMAL = 1;
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
      if (value < NORMAL || value > PREY) return undefined;
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

// A cage's displayed total equals the sum of its cells' contributions (see
// above). "Vampire cells must not repeat in cages" (and, by "the same
// rules", Prey cells too) caps each role's count per cage at one.
const cageSumMachine = target => NFA.encodeSpec({
  startState: {
    phase: 'role', total: 0, vampireSeen: 0, preySeen: 0,
  },
  transition: (state, value) => {
    if (state.phase === 'role') {
      if (value < NORMAL || value > PREY) return undefined;
      return { ...state, phase: 'digit', role: value };
    }
    if (state.phase === 'digit') {
      return { ...state, phase: 'prey-digit', digit: value };
    }
    const vampireSeen = state.vampireSeen + (state.role === VAMPIRE ? 1 : 0);
    const preySeen = state.preySeen + (state.role === PREY ? 1 : 0);
    if (vampireSeen > 1 || preySeen > 1) return undefined;
    const effective = state.role === PREY ? 0
      : state.digit + (state.role === VAMPIRE ? value : 0);
    const total = state.total + effective;
    if (total > target) return undefined;
    return {
      phase: 'role', total, vampireSeen, preySeen,
    };
  },
  accept: state => state.phase === 'role' && state.total === target,
}, 9);

// Cage cells and totals, transcribed from the drawn top-left cage clues.
const cages = [
  [4, ['R2C3', 'R1C3', 'R1C4']],
  [24, ['R1C6', 'R2C6']],
  [30, ['R5C6', 'R6C6', 'R6C5']],
  [8, ['R4C8', 'R4C9']],
  [7, ['R6C8', 'R6C9']],
  [19, ['R6C7', 'R7C7', 'R7C6']],
  [4, ['R8C9', 'R9C9', 'R9C8']],
  [10, ['R8C4', 'R9C4']],
  [7, ['R8C6', 'R9C6']],
  [7, ['R8C1', 'R9C1', 'R9C2']],
  [17, ['R6C1', 'R6C2']],
  [12, ['R4C1', 'R3C1', 'R3C2']],
  [15, ['R3C4', 'R4C4', 'R4C3']],
];

const houses = [...graph.rows(), ...graph.columns(), ...boxes];
const boxRoleCaptures = boxes.flatMap((box, index) => [
  captureRole(box, preyDigits.cell(index + 1), PREY, 'box prey digit'),
  captureRole(box, vampireDigits.cell(index + 1), VAMPIRE, 'box vampire digit'),
]);

return [
  new Shape('9x9'),
  roles.toVar('normal, vampire, or prey'),
  roles.makeReplicate(new Given(roles.cells()[0], NORMAL, VAMPIRE, PREY)),
  preyDigits,
  vampireDigits,
  ...houses.flatMap(house => [
    new ContainExact(`${VAMPIRE}`, ...roles.at(house)),
    new ContainExact(`${PREY}`, ...roles.at(house)),
  ]),
  ...boxRoleCaptures,
  new AllDifferent(...preyDigits.cells()),
  new AllDifferent(...vampireDigits.cells()),
  ...cages.map(([, cells]) => new AllDifferent(...cells)),
  ...cages.map(([total, cells]) => new NFA(
    cageSumMachine(total),
    'cage value sum',
    ...valueStream(cells),
  )),
];
