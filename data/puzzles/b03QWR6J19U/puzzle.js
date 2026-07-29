// Title: Parity loop
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=b03QWR6J19U
// Source: https://app.crackingthecryptic.com/0tzabtgceq

// Normal Sudoku rules apply. Outside the centre box, precisely the even digits
// form one orthogonal, non-branching, non-diagonally-touching closed loop. Each
// circled digit counts its occurrences among all circles; cages sum without
// repeats; thermometers increase from their bulbs.

const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const gridCells = graph.cells();
const centre = gridCells.filter(cell => {
  const { row, col } = parseCellId(cell);
  return row >= 4 && row <= 6 && col >= 4 && col <= 6;
});
const circles = [
  'R1C2', 'R1C4', 'R1C5', 'R2C7', 'R2C8', 'R3C1', 'R3C4',
  'R4C3', 'R4C8', 'R5C6', 'R5C9', 'R6C7', 'R6C9', 'R7C2',
  'R7C5', 'R7C9', 'R8C1', 'R8C3', 'R8C8', 'R9C1', 'R9C3', 'R9C9',
];

// The overlay records loop membership: ON is exactly an even digit outside the
// centre box, while the centre-box overlay cells are fixed OFF.
const evenLoopMembership = Pair.fnToKey((membership, digit) =>
  (membership === ON) === (digit % 2 === 0), geometry.numValues);
const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...centre.map(cell => new Given(loop.at(cell), OFF)),
  ...gridCells.filter(cell => !centre.includes(cell)).map(cell =>
    new Pair(evenLoopMembership, 'even-loop-membership', loop.at(cell), cell)),
];

// Every ON cell has two orthogonal ON neighbours; OFF cells impose no degree.
const degrees = gridCells.map(cell => new Or([
  new Given(loop.at(cell), OFF),
  new ContainExact('1_1', ...loop.at(graph.neighbours(cell))),
]));

// A diagonal-only pair of ON cells in a 2x2 would make the loop touch itself.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'loop-no-diagonal-touch',
    ...loop.at(graph.block('R1C1', 2, 2))),
  loop.at(blockOrigins));

return [
  new Shape('9x9'),
  loop.toVar('even-digit loop membership'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  new CountingCircles(...circles),
  new Cage(10, 'R8C2', 'R9C2'),
  new Cage(9, 'R8C4', 'R9C4'),
  new Thermo('R2C9', 'R1C9', 'R1C8', 'R2C8'),
  new Thermo('R2C5', 'R3C6', 'R4C5'),
];
