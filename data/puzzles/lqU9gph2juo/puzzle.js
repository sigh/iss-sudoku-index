// Title: Sir Squared and Paired
// Author: PhysicistFromFunen
// Video: https://www.youtube.com/watch?v=lqU9gph2juo
// Source: https://sudokupad.app/34d3ku00r2

// Cage totals form unique integer/square pairs. There are twelve cages, and
// their maximum possible total is 1+2+3+4+5+6+7+8+9 minus the three smallest
// omitted digits = 39. Consequently the only possible pair roots are 1-6, so
// the twelve role codes below (root, square for each pair) must occur once each.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const digitDomain = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

const cages = [
  ['R1C1'],
  ['R3C7', 'R4C7'],
  ['R3C3', 'R3C4'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6'],
  ['R6C4'],
  ['R6C5', 'R6C6'],
  ['R8C8', 'R8C9', 'R9C8'],
  ['R9C9'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R6C1', 'R6C2', 'R6C3', 'R7C1'],
  ['R9C1'],
  ['R8C2', 'R9C2'],
];

const tens = new Var('T', 'cage-total tens digits', cages.length);
const ones = new Var('O', 'cage-total ones digits', cages.length);
const roles = new Var('P', 'integer-square pair roles', cages.length);
const roleValues = Array.from({length: 12}, (_, i) => i + 1);
const roleDomains = roles.cells().map(cell => new Given(cell, ...roleValues));
const tensDomains = tens.cells().map(cell => new Given(cell, 0, 1, 2, 3));
const onesDomains = ones.cells().map(cell =>
  new Given(cell, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9));
const cageSums = cages.map((cells, i) =>
  new Sum(0, ...cells, [tens.cell(i + 1), -10], [ones.cell(i + 1), -1]));
const cageAllDifferent = cages
  .filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells));

// Odd role 2n-1 represents the integer n; even role 2n represents n squared.
const pairedTotal = role => {
  const root = Math.ceil(role / 2);
  return role % 2 === 1 ? root : root * root;
};
const roleTensKey = Pair.fnToKey((role, digit) => {
  if (role < 1 || role > 12) return false;
  return digit === Math.floor(pairedTotal(role) / 10);
}, shape);
const roleOnesKey = Pair.fnToKey((role, digit) => {
  if (role < 1 || role > 12) return false;
  return digit === pairedTotal(role) % 10;
}, shape);
const roleTotals = cages.flatMap((_, i) => [
  new Pair(roleTensKey, 'pair-role total tens',
    roles.cell(i + 1), tens.cell(i + 1)),
  new Pair(roleOnesKey, 'pair-role total ones',
    roles.cell(i + 1), ones.cell(i + 1)),
]);

// Equal numeric totals have interchangeable auxiliary role labels: 1 is both
// 1 and 1 squared, while 4 is both 2 squared and the root 4. Order those role
// labels by cage index to remove only this invisible auxiliary symmetry.
const orderedRoles = (first, second, name) => new NFA(NFA.encodeSpec({
  startState: false,
  transition: (seenFirst, role) => {
    if (role === second && !seenFirst) return undefined;
    return seenFirst || role === first;
  },
  accept: () => true,
}, shape), name, ...roles.cells());

return [
  shape,
  digitDomain,
  new Given('R1C7', 7),
  new Given('R5C7', 8),
  new Given('R8C4', 9),
  new AntiKnight(),
  ...cageAllDifferent,
  tens,
  ones,
  roles,
  ...roleDomains,
  ...tensDomains,
  ...onesDomains,
  ...cageSums,
  new AllDifferent(...roles.cells()),
  ...roleTotals,
  orderedRoles(1, 2, 'canonical roles for total 1'),
  orderedRoles(4, 7, 'canonical roles for total 4'),
];
