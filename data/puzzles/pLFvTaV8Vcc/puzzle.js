// Title: Galaxies Collide
// Author: Marty Sears and Dorlir
// Video: https://www.youtube.com/watch?v=pLFvTaV8Vcc
// Source: https://sudokupad.app/2susajautc

// Normal Sudoku applies. The two galaxy labels cover every cell, are connected,
// have a possible 180-degree centre, do not fill a 2x2, and one label has the
// German-whisper adjacency rule. Each arrow digit counts its pointed-at cells
// with the arrow cell's label.

const FIRST = 1;
const SECOND = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const cells = graph.cells();
const galaxy = graph.makeOverlay('VG');
const galaxyCells = galaxy.cells();

const galaxyDomain = galaxy.makeReplicate(
  new Given(galaxyCells[0], FIRST, SECOND));
// Galaxy names are not part of the puzzle, so fix their swap symmetry here.
const labelRepresentative = new Given(galaxy.at('R1C1'), FIRST);

// Both labels are non-empty connected orthogonal regions.
const connectedGalaxies = [
  new ConnectedValues('VG', FIRST),
  new ConnectedValues('VG', SECOND),
];

// Source rule: no 2x2 area is entirely in either galaxy.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = cells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = galaxy.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...galaxy.at(graph.block(cells[0], 2, 2))),
  galaxy.at(blockOrigins));

// A finite galaxy inside this grid has a centre at a cell centre or grid-line
// intersection. Each branch chooses one of those 17 by 17 centres for a label.
function rotationalSymmetry(label) {
  const membershipEqual = Pair.fnToKey(
    (a, b) => (a === label) === (b === label), geometry);
  const other = label === FIRST ? SECOND : FIRST;
  const cellAt = (row, col) => makeCellId(row, col);
  const choices = [];
  for (let twiceRow = 2; twiceRow <= 18; twiceRow++) {
    for (let twiceCol = 2; twiceCol <= 18; twiceCol++) {
      const branch = [];
      for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
          const rotatedRow = twiceRow - row;
          const rotatedCol = twiceCol - col;
          const cell = cellAt(row, col);
          if (rotatedRow < 1 || rotatedRow > 9 ||
              rotatedCol < 1 || rotatedCol > 9) {
            branch.push(new Given(galaxy.at(cell), other));
            continue;
          }
          const rotated = cellAt(rotatedRow, rotatedCol);
          if (cell < rotated) {
            branch.push(new Pair(membershipEqual, '',
              galaxy.at(cell), galaxy.at(rotated)));
          }
        }
      }
      choices.push(new And(branch));
    }
  }
  return new Or(choices);
}

// The unlabelled German-whisper galaxy is selected by this two-way disjunction.
const orthogonalEdges = cells.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  return graph.neighbours(cell)
    .filter(target => {
      const point = parseCellId(target);
      return point.row > row || point.col > col;
    })
    .map(target => [cell, target]);
});
function whisperGalaxy(label) {
  const machine = NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { phase: 1, firstGalaxy: value };
      if (state.phase === 1) return { phase: 2, firstGalaxy: state.firstGalaxy, firstDigit: value };
      if (state.phase === 2) return {
        phase: 3, firstGalaxy: state.firstGalaxy, firstDigit: state.firstDigit,
        secondGalaxy: value,
      };
      if (state.phase === 3) {
        const applies = state.firstGalaxy === label && state.secondGalaxy === label;
        return (!applies || Math.abs(state.firstDigit - value) >= 5)
          ? { done: true } : undefined;
      }
      return undefined;
    },
    accept: state => state.done === true,
  }, geometry.numValues);
  return new And(orthogonalEdges.map(([a, b]) => new NFA(machine, 'galaxy-whisper',
    galaxy.at(a), a, galaxy.at(b), b)));
}
const whispers = new Or([whisperGalaxy(FIRST), whisperGalaxy(SECOND)]);

// Arrow directions come from the source arrowheads; rays stop only at the grid edge.
const arrows = [
  ['R5C5', ['R5C6', 'R5C7', 'R5C8', 'R5C9', 'R4C5', 'R3C5', 'R2C5', 'R1C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1']],
  ['R4C5', ['R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5', 'R3C5', 'R2C5', 'R1C5']],
  ['R2C8', ['R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8']],
  ['R6C4', ['R5C4', 'R4C4', 'R3C4', 'R2C4', 'R1C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C4', 'R8C4', 'R9C4']],
  ['R4C2', ['R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2', 'R3C2', 'R2C2', 'R1C2']],
  ['R5C4', ['R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9']],
];
function arrowCountMachine(rayLength) {
  return NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { phase: 1, label: value };
      if (state.phase === 1) return { phase: 2, label: state.label, digit: value, count: 0 };
      const count = state.count + (value === state.label ? 1 : 0);
      return count <= 9
        ? { phase: 2, label: state.label, digit: state.digit, count }
        : undefined;
    },
    accept: state => state.phase === 2 && state.count === state.digit,
  }, geometry.numValues);
}
const arrowCounts = arrows.map(([cell, ray]) => new NFA(
  arrowCountMachine(ray.length), 'galaxy-arrow-count', galaxy.at(cell), cell,
  ...galaxy.at(ray)));

return [
  new Shape('9x9'),
  galaxy.toVar('galaxies'),
  galaxyDomain,
  labelRepresentative,
  ...connectedGalaxies,
  noMono2x2,
  rotationalSymmetry(FIRST),
  rotationalSymmetry(SECOND),
  whispers,
  ...arrowCounts,
];
