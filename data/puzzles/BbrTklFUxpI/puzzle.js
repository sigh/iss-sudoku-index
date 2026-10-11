// Title: Fernwirkung
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=BbrTklFUxpI
// Source: https://sudokupad.app/yvysiky0z8

// Normal Sudoku; cages have distinct digits and distinct totals. Each clue
// is its own total plus one other cage's total; helpers form a bijection.
// Outside cells are a note-taking area, with no final-grid constraints.
const shape = new Shape('9x9', '0-14');
// Cage boundaries and corner clues from the drawn cages.
const drawnCages = [[30, [[1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [2, 7], [3, 7]]], [22, [[7, 4]]], [15, [[6, 3]]], [11, [[4, 1], [4, 2], [5, 1]]], [13, [[8, 6], [9, 5], [9, 6]]], [35, [[7, 1], [8, 1]]], [48, [[8, 2], [8, 3], [9, 2]]], [30, [[3, 9], [4, 9], [5, 9], [6, 9], [7, 7], [7, 8], [7, 9]]], [14, [[5, 5], [6, 5]]], [12, [[4, 7], [4, 8]]], [50, [[3, 4], [3, 5], [4, 4]]], [40, [[3, 6], [4, 6], [5, 6]]], [13, [[1, 1], [2, 1]]], [15, [[9, 8], [9, 9]]]];
const cages = drawnCages.map(([clue, coords]) => ({clue, cells: coords.map(([r,c]) => makeCellId(r,c))}));
const tens = new Var('T', 'Cage total tens', cages.length);
const ones = new Var('U', 'Cage total units', cages.length);
const helper = new Var('H', 'Helper cage index', cages.length);
const digits = [1,2,3,4,5,6,7,8,9];
const gridDomains = cellGraph(shape).makeReplicate(new Given('R1C1', ...digits));
// Totals are decimal pairs: the largest cage has seven distinct digits,
// so its maximum is 3+4+5+6+7+8+9 = 42.
const totalRules = cages.flatMap((cage,i) => [
  new Given(tens.cell(i+1),0,1,2,3,4),
  new Given(ones.cell(i+1),0,1,2,3,4,5,6,7,8,9),
  new Sum(0,...cage.cells,[tens.cell(i+1),-10],[ones.cell(i+1),-1]),
  new Cage(0,...cage.cells),
]);
const unequalTotals = cages.flatMap((_,i) => cages.slice(i+1).map((_,offset) => {
  const j=i+offset+1;
  return new Or([new AllDifferent(tens.cell(i+1),tens.cell(j+1)),
                new AllDifferent(ones.cell(i+1),ones.cell(j+1))]);
}));
// A helper index selects a whole cage, never itself. AllDifferent below
// makes the fourteen selections a bijection rather than independent choices.
const helpingRules = cages.map((cage,i) => new Or(cages.flatMap((other,j) =>
  i===j ? [] : [new And([new Given(helper.cell(i+1),j),
    new Sum(cage.clue,...cage.cells,...other.cells)])])));
return [shape,tens,ones,helper,gridDomains,...totalRules,...unequalTotals,
  new AllDifferent(...helper.cells()),...helpingRules];
