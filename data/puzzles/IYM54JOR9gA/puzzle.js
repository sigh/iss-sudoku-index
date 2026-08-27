// Title: Hitting the Sweet Spot
// Author: PrissyP
// Video: https://www.youtube.com/watch?v=IYM54JOR9gA
// Source: https://sudokupad.app/tgewrz1n8q

// Normal sudoku, plus five lines. On each line, some unknown cell (the
// "Sweet Spot") splits it into a left and a right hitline (the cells
// strictly on that side, in path order). Its digit equals the NUMBER of
// hits on one hitline and the SUM of hit digits on the other; either side
// may take either role. A hit is a cell whose digit equals its distance
// from the Sweet Spot (1 for the adjacent cell, 2 for the next, ...).
// Digits may not repeat within a hitline. None of this is solver-discovered
// geometry beyond "which cell is the spot": every candidate spot gives a
// fixed, compile-time distance to every other cell on its line, since
// distance only depends on position along the drawn path.
//
// Cell lists below are the drawn path order; "outward" for the distance
// rule follows that order away from the candidate spot.
const LINES = {
  A: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  B: ['R5C8', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R2C8', 'R3C8', 'R3C7', 'R2C7',
    'R2C6', 'R2C5', 'R2C4', 'R3C4', 'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C7'],
  C: ['R6C3', 'R6C2', 'R7C2', 'R8C2', 'R7C3', 'R8C3'],
  D: ['R8C1', 'R7C1', 'R6C1', 'R5C2', 'R4C1', 'R3C2', 'R2C3', 'R2C2', 'R3C1', 'R2C1'],
  E: ['R5C4', 'R6C5', 'R7C6', 'R8C5', 'R9C6', 'R9C7', 'R8C7', 'R7C8', 'R6C9',
    'R6C8', 'R5C7', 'R4C8', 'R4C7'],
};

// One hit key per possible distance 1-9: a Pair between a grid cell and an
// aux "hit indicator" cell (domain restricted to 1=hit, 2=no-hit) that holds
// iff the grid digit equals that fixed distance.
const hitKeyForDistance = {};
for (let d = 1; d <= 9; d++) {
  hitKeyForDistance[d] = Pair.fnToKey(
    (digit, indicator) => (digit === d) === (indicator === 1), 9);
}

// Build the whole Sweet Spot constraint for one line. Returns the aux Var
// group (must be returned at the top level) and the disjunction over which
// cell is the spot (must be returned inside the constraint list).
function sweetSpotLine(prefix, cells) {
  const n = cells.length;

  // A hitline longer than 9 cells can never satisfy "digits may not repeat"
  // (only 9 sudoku digits exist), and an empty hitline can never satisfy
  // "the spot equals this side's hit count/sum" (both are 0, no digit is
  // 0) -- both are eliminated here since they are impossible for any grid,
  // not merely absent from the solution.
  const candidateSplits = [];
  for (let k = 0; k < n; k++) {
    const leftLen = k;
    const rightLen = n - 1 - k;
    if (leftLen >= 1 && leftLen <= 9 && rightLen >= 1 && rightLen <= 9) {
      candidateSplits.push(k);
    }
  }

  // Every surviving candidate has both sides <= 9 cells, so every cell's
  // distance from the spot (1..side length) is itself a valid digit: no
  // cell can be ruled out of hit-eligibility ahead of time.
  const totalIndicators = candidateSplits.length * (n - 1);
  const hitVars = new Var(prefix, `${prefix} sweet-spot hit flags`, totalIndicators);
  let nextIndex = 0;
  const nextIndicatorCell = () => {
    nextIndex += 1;
    return hitVars.cell(nextIndex);
  };

  // side() walks outward from the spot and pairs each cell with its
  // distance (1, 2, 3, ...) and a fresh hit-indicator cell.
  const side = (sideCells) => sideCells.map((cell, i) => ({
    cell,
    distance: i + 1,
    indicator: nextIndicatorCell(),
  }));

  const branches = candidateSplits.map(k => {
    const spot = cells[k];
    const left = side(cells.slice(0, k).reverse());
    const right = side(cells.slice(k + 1));

    const indicatorSetup = [...left, ...right].flatMap(({ cell, distance, indicator }) => [
      new Given(indicator, 1, 2),
      new Pair(hitKeyForDistance[distance], 'sweet-spot hit', cell, indicator),
    ]);

    // hitCount(side) = sum of (2 - indicator) over side = 2*len - sum(indicator).
    // spot == hitCount(side)  <=>  spot + sum(indicator) == 2*len.
    const countEquals = (entries) =>
      new Sum(2 * entries.length, spot, ...entries.map(e => e.indicator));
    // hitSum(side) = sum of distance*(2 - indicator) = 2*sumDist - sum(distance*indicator).
    // spot == hitSum(side)  <=>  spot + sum(distance*indicator) == 2*sumDist.
    // A distance-1 entry has coefficient 1, same as a bare cell; pass those
    // bare so a single-cell side (all coefficients incidentally 1) doesn't
    // read as a coefficient Sum that should have been the plain form.
    const sumEquals = (entries) =>
      new Sum(
        2 * entries.reduce((s, e) => s + e.distance, 0),
        spot, ...entries.map(e => e.distance === 1 ? e.indicator : [e.indicator, e.distance]));

    const roleAssignment = new Or([
      new And([countEquals(left), sumEquals(right)]),
      new And([countEquals(right), sumEquals(left)]),
    ]);

    return new And([
      new AllDifferent(...left.map(e => e.cell)),
      new AllDifferent(...right.map(e => e.cell)),
      ...indicatorSetup,
      roleAssignment,
    ]);
  });

  return { hitVars, constraint: new Or(branches) };
}

const lineResults = Object.entries(LINES).map(([prefix, cells]) => sweetSpotLine(prefix, cells));

return [
  new Shape('9x9'),
  ...lineResults.map(r => r.hitVars),
  ...lineResults.map(r => r.constraint),
];
