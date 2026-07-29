// Title: Cave of Killers
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=B7KHswO4tCI
// Source: https://sudokupad.app/aem1ckhlvc

// Normal Sudoku rules apply. State 1 is the connected unshaded cave; states
// 2-7 are the six shaded, boundary-touching killer regions anchored by the
// printed corner clues. Circles are unshaded and count visible unshaded cells
// in the four orthogonal directions, including themselves.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph('9x9');
const cells = graph.cells();
const shade = graph.makeOverlay('VS');
const shadeCells = shade.at(cells);
const entries = cells.flatMap((cell, index) => [cell, shadeCells[index]]);
const rows = Array.from({length: 9}, (_, row) =>
  cells.slice(row * 9, row * 9 + 9));
const boundary = cells.filter((_, index) => {
  const row = Math.floor(index / 9);
  const col = index % 9;
  return row === 0 || row === 8 || col === 0 || col === 8;
});
const sudokuDigits = '1_2_3_4_5_6_7_8_9';
const UNSHADED = 1;

// Corner-clue positions and totals were transcribed from the drawn labels.
const regions = [
  {state: 2, cell: 'R1C1', total: 9},
  {state: 3, cell: 'R1C8', total: 11},
  {state: 4, cell: 'R2C3', total: 37},
  {state: 5, cell: 'R5C5', total: 21},
  {state: 6, cell: 'R7C7', total: 24},
  {state: 7, cell: 'R9C3', total: 13},
];

// These are the drawn white circles.
const circles = [
  'R1C5', 'R2C9', 'R4C6', 'R5C1', 'R5C9',
  'R6C4', 'R7C9', 'R8C2', 'R9C5', 'R9C6',
];

function regionSumSpec(state, total) {
  return NFA.encodeSpec({
    startState: {digit: null, sum: 0},
    transition: ({digit, sum}, input) => {
      if (digit === null) return {digit: input, sum};
      const next = sum + (input === state ? digit : 0);
      return next > total ? undefined : {digit: null, sum: next};
    },
    accept: ({digit, sum}) => digit === null && sum === total,
    maxDepth: 162,
  }, shape);
}

function distinctRegionDigitSpec(state, target) {
  return NFA.encodeSpec({
    startState: {digit: null, seen: false},
    transition: ({digit, seen}, input) => {
      if (digit === null) return {digit: input, seen};
      if (digit !== target || input !== state) return {digit: null, seen};
      return seen ? undefined : {digit: null, seen: true};
    },
    accept: ({digit}) => digit === null,
    maxDepth: 162,
  }, shape);
}

function regionSizeSpec(state) {
  return NFA.encodeSpec({
    startState: {target: null, digit: null, count: 0},
    transition: ({target, digit, count}, input) => {
      if (target === null) return {target: input, digit: null, count: 0};
      if (input === SEGMENT_BREAK) return {target, digit: null, count};
      if (digit === null) return {target, digit: input, count};
      const next = count + (input === state ? 1 : 0);
      return next > target ? undefined : {target, digit: null, count: next};
    },
    accept: ({target, digit, count}) => target !== null && digit === null && count === target,
    maxDepth: 164,
  }, shape, {multiSegment: true});
}

function visibilitySpec() {
  return NFA.encodeSpec({
    startState: {target: null, count: 1, blocked: false},
    transition: ({target, count, blocked}, input) => {
      if (target === null) return {target: input, count: 1, blocked: false};
      if (input === SEGMENT_BREAK) return {target, count, blocked: false};
      if (blocked) return {target, count, blocked};
      if (input !== UNSHADED) return {target, count, blocked: true};
      const next = count + 1;
      return next > target ? undefined : {target, count: next, blocked: false};
    },
    accept: ({target, count}) => target !== null && count === target,
    maxDepth: 21,
  }, shape, {multiSegment: true});
}

function raysFrom(cell) {
  const {row, col} = parseCellId(cell);
  const ray = (dr, dc) => {
    const result = [];
    for (let r = row + dr, c = col + dc; r >= 1 && r <= 9 && c >= 1 && c <= 9; r += dr, c += dc) {
      result.push(makeCellId(r, c));
    }
    return shade.at(result);
  };
  return [ray(-1, 0), ray(1, 0), ray(0, -1), ray(0, 1)];
}

// Adjacent shaded cells must belong to the same anchored region.
const sameShadedRegion = Pair.fnToKey(
  (a, b) => a === UNSHADED || b === UNSHADED || a === b, shape);
const horizontalStarts = cells.filter((_, index) => index % 9 !== 8);
const verticalStarts = cells.filter((_, index) => index < 72);

return [
  shape,
  ...rows.map(row => new ContainExact(sudokuDigits, ...row)),
  shade.toVar('cave and killer regions'),
  shade.makeReplicate(new Given(shade.cells()[0], 1, 2, 3, 4, 5, 6, 7)),
  ...regions.map(({state, cell}) => new Given(shade.at(cell), state)),
  ...circles.map(cell => new Given(shade.at(cell), UNSHADED)),
  new ConnectedValues('VS', UNSHADED),
  ...regions.flatMap(({state}) => [
    new ConnectedValues('VS', state),
    new ContainAtLeast(String(state), ...shade.at(boundary)),
  ]),
  shade.makeReplicate(
    new Pair(sameShadedRegion, 'same shaded region', shade.at('R1C1'), shade.at('R1C2')),
    shade.at(horizontalStarts),
  ),
  shade.makeReplicate(
    new Pair(sameShadedRegion, 'same shaded region', shade.at('R1C1'), shade.at('R2C1')),
    shade.at(verticalStarts),
  ),
  ...regions.flatMap(({state, cell, total}) => [
    new NFA(regionSumSpec(state, total), `region ${state} sum`, ...entries),
    ...Array.from({length: 9}, (_, index) => new NFA(
      distinctRegionDigitSpec(state, index + 1),
      `region ${state} digit ${index + 1}`,
      ...entries,
    )),
    new NFA(regionSizeSpec(state), `region ${state} size`, [cell], entries),
  ]),
  ...circles.map(cell => new NFA(
    visibilitySpec(), `visibility ${cell}`, [cell], ...raysFrom(cell))),
];
