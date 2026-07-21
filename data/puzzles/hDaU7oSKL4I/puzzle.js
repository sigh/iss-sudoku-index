// Title: Vampire und ihre Opfer
// Author: Blobz
// Video: https://www.youtube.com/watch?v=hDaU7oSKL4I
// Source: https://sudokupad.app/blobz/vampire-und-ihre-opfer

// A role is natural, vampire, or victim. Each box also exposes its victim's
// digit in a Var. Clue NFAs scan role/digit/box-victim triples and calculate
// values without requiring auxiliary cells to hold the possible values 10-18.
const NATURAL = 1;
const VAMPIRE = 2;
const VICTIM = 3;
const graph = cellGraph('9x9');
const cells = graph.cells();
const roles = graph.makeOverlay('VR');
const roleAt = cell => roles.at(cell);
const victimDigits = new Var('B', 'victim digit by box', 9);
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
      if (value < NATURAL || value > VICTIM) return undefined;
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
  victimDigits.cell(boxNumber.get(cell)),
]);

// A coffin has exactly one vampire or victim, and its two derived values sum
// to the displayed total.
const coffinMachine = target => NFA.encodeSpec({
  startState: { phase: 'role', total: 0, specials: 0 },
  transition: (state, value) => {
    if (state.phase === 'role') {
      if (value < NATURAL || value > VICTIM) return undefined;
      return { ...state, phase: 'digit', role: value };
    }
    if (state.phase === 'digit') {
      return { ...state, phase: 'victim-digit', digit: value };
    }
    const effective = state.role === VICTIM ? 0
      : state.digit + (state.role === VAMPIRE ? value : 0);
    const total = state.total + effective;
    const specials = state.specials + (state.role === NATURAL ? 0 : 1);
    if (total > target || specials > 1) return undefined;
    return { phase: 'role', total, specials };
  },
  accept: state => state.phase === 'role'
    && state.total === target
    && state.specials === 1,
}, 9);

// The same triples let a line compare consecutive derived values directly.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'role', previous: null },
  transition: (state, value) => {
    if (state.phase === 'role') {
      if (value < NATURAL || value > VICTIM) return undefined;
      return { ...state, phase: 'digit', role: value };
    }
    if (state.phase === 'digit') {
      return { ...state, phase: 'victim-digit', digit: value };
    }
    const effective = state.role === VICTIM ? 0
      : state.digit + (state.role === VAMPIRE ? value : 0);
    if (state.previous !== null && Math.abs(effective - state.previous) < 5) {
      return undefined;
    }
    return { phase: 'role', previous: effective };
  },
  accept: state => state.phase === 'role',
}, 9);

const coffins = [
  [14, ['R3C9', 'R4C9']],
  [9, ['R4C5', 'R4C6']],
  [4, ['R7C1', 'R7C2']],
  [16, ['R9C2', 'R9C3']],
  [12, ['R8C6', 'R9C6']],
  [6, ['R8C7', 'R9C7']],
  [16, ['R6C8', 'R7C8']],
  [2, ['R4C8', 'R5C8']],
  [4, ['R8C4', 'R9C4']],
  [4, ['R6C1', 'R6C2']],
  [14, ['R5C2', 'R5C3']],
  [17, ['R2C1', 'R2C2']],
  [7, ['R1C3', 'R1C4']],
  [12, ['R1C5', 'R1C6']],
  [7, ['R3C6', 'R3C7']],
  [14, ['R5C7', 'R6C7']],
  [10, ['R3C4', 'R4C4']],
  [8, ['R1C9', 'R2C9']],
];

const greenLines = [
  ['R7C1', 'R8C1'],
  ['R9C1', 'R9C2', 'R9C3'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R7C9', 'R8C9'],
  ['R4C6', 'R4C5', 'R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C6', 'R6C5', 'R6C4'],
  ['R7C8', 'R6C9', 'R5C8', 'R4C9'],
  ['R1C4', 'R1C3', 'R2C2', 'R3C1'],
  ['R8C4', 'R7C5', 'R8C6'],
  ['R2C7', 'R2C6', 'R3C5', 'R2C4', 'R2C3'],
  ['R3C2', 'R4C2', 'R4C3'],
  ['R4C1', 'R5C1', 'R6C1'],
];

const houses = [...graph.rows(), ...graph.columns(), ...boxes];
const boxRoleCaptures = boxes.flatMap((box, index) => [
  captureRole(box, victimDigits.cell(index + 1), VICTIM, 'box victim digit'),
  captureRole(box, vampireDigits.cell(index + 1), VAMPIRE, 'box vampire digit'),
]);

return [
  new Shape('9x9'),
  roles.toVar('natural, vampire, or victim'),
  roles.makeReplicate(new Given(roles.cells()[0], NATURAL, VAMPIRE, VICTIM)),
  victimDigits,
  vampireDigits,
  ...houses.flatMap(house => [
    new ContainExact(`${VAMPIRE}`, ...roles.at(house)),
    new ContainExact(`${VICTIM}`, ...roles.at(house)),
  ]),
  ...boxRoleCaptures,
  new AllDifferent(...victimDigits.cells()),
  new AllDifferent(...vampireDigits.cells()),
  ...coffins.map(([total, cage]) => new NFA(
    coffinMachine(total),
    'coffin value sum',
    ...valueStream(cage),
  )),
  ...greenLines.map(line => new NFA(
    whisperMachine,
    'value whisper',
    ...valueStream(line),
  )),
];
