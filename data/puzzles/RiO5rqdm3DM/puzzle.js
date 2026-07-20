// Title: Teutoburger Wald
// Author: Alchemist
// Video: https://www.youtube.com/watch?v=RiO5rqdm3DM
// Source: https://sudokupad.app/lxla37je17

// Normal sudoku rules apply.
//
// Yin-Yang: every cell has one of two shade states. Each state is one
// orthogonally connected region, and no 2x2 block is monochrome.
//
// A circle or square digit counts the contiguous cells of its own shade seen
// in the four orthogonal directions, including itself. The opposite shade
// blocks sight. Green lines are German whispers (difference at least 5), and
// pink lines are renbans.

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

const circles = [
  'R1C4', 'R4C1', 'R8C9', 'R9C8', 'R1C7', 'R3C8', 'R2C7', 'R1C5',
  'R8C7', 'R9C6', 'R4C7', 'R5C4', 'R6C7', 'R6C5', 'R4C2',
];
const squares = ['R3C4', 'R2C2', 'R7C3'];
const countingCells = [...circles, ...squares];
const sightCounts = new Var(
  'C', 'directional sight counts', 4 * countingCells.length);

const whispers = [
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R8C9', 'R9C8', 'R8C7'],
  ['R1C5', 'R2C6', 'R1C7'],
  ['R9C6', 'R8C5'],
  ['R6C7', 'R7C6', 'R6C5', 'R5C4'],
  ['R4C5', 'R5C4'],
  ['R5C3', 'R4C2'],
  ['R1C8', 'R2C7', 'R3C8', 'R4C7'],
];

const renbans = [
  ['R3C4', 'R3C3', 'R2C2', 'R1C3'],
  ['R7C3', 'R6C3'],
];

// The four directional count Vars for clue i are VC(4i+1)..VC(4i+4).
// Each holds one plus the same-shade run length in that direction, so adding
// all four and subtracting the clue digit equals 3 (the centre was counted
// four times instead of once).
const countVar = (clueIndex, directionIndex) =>
  sightCounts.cell(4 * clueIndex + directionIndex + 1);

const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

// Read [directional count, centre shade, outward shades...]. The count is
// exactly one plus the initial run matching the centre shade; after the first
// opposite-shade cell, later cells are invisible and ignored.
const sightCountSpec = NFA.encodeSpec({
  startState: { phase: 'count' },
  transition: (state, value) => {
    if (state.phase === 'count') {
      return { phase: 'centre', remaining: value - 1 };
    }
    if (state.phase === 'centre') {
      return { phase: 'visible', colour: value, remaining: state.remaining };
    }
    if (state.phase === 'blocked') return state;
    if (value !== state.colour) {
      return state.remaining === 0 ? { phase: 'blocked' } : undefined;
    }
    if (state.remaining === 0) return undefined;
    return { ...state, remaining: state.remaining - 1 };
  },
  accept: state =>
    (state.phase === 'visible' && state.remaining === 0) ||
    state.phase === 'blocked',
}, 9);

function shadeDomainConstraints() {
  const cells = shade.at(graph.cells());
  return [shade.makeReplicate([new Given(cells[0], 1, 2)], cells)];
}

function noMonochrome2x2Constraints() {
  const spec = NFA.encodeSpec({
    startState: null,
    transition: (state, value) => state === null
      ? { first: value, differs: false }
      : { first: state.first, differs: state.differs || value !== state.first },
    accept: state => state !== null && state.differs,
  }, 9);
  const template = [new NFA(spec, 'no monochrome 2x2',
    shade.at('R1C1'), shade.at('R1C2'), shade.at('R2C1'), shade.at('R2C2'))];
  const targets = [];
  for (let row = 1; row <= 8; row++) {
    for (let col = 1; col <= 8; col++) {
      targets.push(shade.at(makeCellId(row, col)));
    }
  }
  return [shade.makeReplicate(template, targets)];
}

function countingConstraints() {
  return countingCells.flatMap((cell, clueIndex) => {
    const directionalCounts = directions.map((direction, directionIndex) => {
      const cells = shade.at(graph.ray(cell, ...direction).slice(1));
      return new NFA(
        sightCountSpec,
        `sight ${cell} direction ${directionIndex + 1}`,
        countVar(clueIndex, directionIndex),
        shade.at(cell),
        ...cells,
      );
    });
    const vars = directions.map((_, directionIndex) =>
      countVar(clueIndex, directionIndex));
    return [
      ...directionalCounts,
      new Sum(3, ...vars, [cell, -1]),
    ];
  });
}

return [
  new Shape('9x9'),
  shade.toVar('forest shade'),
  sightCounts,
  ...shadeDomainConstraints(),
  // Shade labels are interchangeable; this removes only the global swap.
  new Given(shade.at('R1C1'), 1),
  new ConnectedValues('VS', 1),
  new ConnectedValues('VS', 2),
  ...noMonochrome2x2Constraints(),
  ...countingConstraints(),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...renbans.map(cells => new Renban(...cells)),
];
