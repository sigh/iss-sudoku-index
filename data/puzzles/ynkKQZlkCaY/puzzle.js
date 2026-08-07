// Title: Schrodinger Sodkuro
// Author: Ichtues
// Video: https://www.youtube.com/watch?v=ynkKQZlkCaY
// Source: https://app.crackingthecryptic.com/sudoku/qQbmM7j4dM

// Rules encoded here:
//   Every row, column and box holds each of the digits 0-9 exactly once. Nine
//   grid cells hold nine distinct digits and the tenth digit sits in the
//   house's single S-cell, which holds two different digits.
//   Each S-cell is a Kakuro clue rightwards or downwards: the two-digit number
//   its two digits spell, in either order, totals the digits from the next cell
//   along to the edge of the grid.
//   Each outside clue totals the digits from the edge of the grid up to the
//   next S-cell, that cell excluded. Totals may be zero or carry a leading
//   zero, so an S-cell in the first cell of a lane leaves a total of 0.
//   R2C1 holds an even digit -- either of the two, were it an S-cell.
//   The clue boxes above C6 and C7 read "<3" and "<2", so those lane totals are
//   less than 3 and less than 2. The sign belongs to the total: both texts are
//   drawn in the same clue box, the same lower-left triangle, the same
//   quarter-cell offset and the same font as the six plain numeric totals.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const cells = graph.cells();
// VM marks the S-cells: 1 on an S-cell, 0 on every other cell.
const VM = graph.makeOverlay('VM');
// VD carries an S-cell's second digit and is 0 on every other cell.
const VD = graph.makeOverlay('VD');

const houses = graph.rowsColumnsBoxes();
const oneSCellPerHouse = houses.map(house => new ContainExact('1', ...VM.at(house)));

// One extra cell per house, holding the digit that house's nine grid cells
// leave out, in the order rows 1-9, columns 1-9, boxes 1-9.
const omittedDigit = new Var('X', 'omitted digit', houses.length);
const omitted = omittedDigit.cells();
// A house's ten digits are its nine grid cells plus its S-cell's second digit,
// and every one of them is different -- which is the whole of "contains every
// digit exactly once", and is why an S-cell's two digits always differ.
const everyDigitOnce = houses.map((house, i) => new AllDifferent(...house, omitted[i]));
// Every VD cell of a house is 0 except its S-cell's, so their total is that
// second digit; this is what makes it the digit the house's grid cells omit.
const houseDigits = houses.map(
  (house, i) => new EqualSum([omitted[i]], VD.at(house)));

const noSecondDigit = Pair.fnToKey((mark, second) => mark === 1 || second === 0, shape);
const secondDigits = cells.map(
  cell => new Pair(noSecondDigit, 'second-digit', VM.at(cell), VD.at(cell)));

// An S-cell's two digits are an unordered pair, so which of them the encoding
// keeps in the grid cell and which in VD is the encoding's own choice, not the
// puzzle's. Keeping the larger in the grid cell pins one representative and
// drops the 2^9 mirror images it would otherwise count as separate solutions.
// It is vacuous off the S-cells, where VD is 0.
const largerInGrid = Pair.fnToKey((digit, second) => digit >= second, shape);
const sCellOrder = cells.map(
  cell => new Pair(largerInGrid, 'larger-digit-in-grid', cell, VD.at(cell)));

// Every run a Kakuro clue totals lies in the rest of one row or one column, and
// each of those holds a single S-cell -- the one making the clue. So no run
// contains an S-cell, every cell in it holds one digit, and the run's digit
// total is just the total of its grid cells.
// An S-cell's grid digit a and second digit b spell 10a+b or 10b+a.
const spells = (cell, run) => [
  new Sum(0, ...run, [cell, -10], [VD.at(cell), -1]),
  new Sum(0, ...run, [cell, -1], [VD.at(cell), -10]),
];
const sClue = cell => {
  const notAnSCell = new Given(VM.at(cell), 0);
  const runs = [graph.ray(cell, 1, 0), graph.ray(cell, 0, 1)]
    .map(ray => ray.slice(1)).filter(run => run.length);
  const options = runs.flatMap(run => spells(cell, run));
  // R9C9 has no run at all, and a clue of 0 would need two equal digits, so it
  // can never be an S-cell.
  return options.length ? new Or([notAnSCell, ...options]) : notAnSCell;
};

// The nine drawn outside clue boxes, each split by a top-left to bottom-right
// diagonal: a total in the lower-left triangle reads down its column, one in
// the upper-right triangle reads right along its row.
const OUTSIDE = [
  [[35], graph.ray('R1C1', 1, 0)],
  [[34], graph.ray('R1C4', 1, 0)],
  [[33], graph.ray('R1C5', 1, 0)],
  [[0, 1, 2], graph.ray('R1C6', 1, 0)],
  [[0, 1], graph.ray('R1C7', 1, 0)],
  [[35], graph.ray('R1C8', 1, 0)],
  [[29], graph.ray('R1C1', 0, 1)],
  [[3], graph.ray('R4C1', 0, 1)],
  [[35], graph.ray('R5C1', 0, 1)],
];
// One branch per position the lane's next S-cell could take: the run before it
// holds no S-cell, and its digits make the total. A comparison clue lists every
// total that satisfies it.
const outsideClue = (totals, ray) => new Or(ray.flatMap((sCell, i) => {
  const run = ray.slice(0, i);
  const sCellHere = new Given(VM.at(sCell), 1);
  if (!run.length) return totals.includes(0) ? [sCellHere] : [];
  const runIsClear = run.map(cell => new Given(VM.at(cell), 0));
  return totals.map(total => new And(
    [sCellHere, ...runIsClear, new Sum(total, ...run)]));
}));

return [
  shape,
  VM.toVar('S-cell'), VD.toVar('second digit'), omittedDigit,
  VM.makeReplicate(new Given(VM.at(cells[0]), 0, 1)),
  ...oneSCellPerHouse,
  ...everyDigitOnce,
  ...houseDigits,
  ...secondDigits,
  ...sCellOrder,
  ...cells.map(sClue),
  ...OUTSIDE.map(([totals, ray]) => outsideClue(totals, ray)),
  // The shaded R2C1: even is a property of a digit the cell holds, so an
  // S-cell there would satisfy it with either of its two.
  new Or([
    new Given('R2C1', 0, 2, 4, 6, 8),
    new And([new Given(VM.at('R2C1'), 1), new Given(VD.at('R2C1'), 0, 2, 4, 6, 8)]),
  ]),
];
