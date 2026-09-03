// Title: The Third Law Of Thermodynamics
// Author: gdc
// Video: https://www.youtube.com/watch?v=4sSpZ2U84aU
// Source: https://sudokupad.app/29hyhl8ay5

// Rules encoded here:
//  - Normal sudoku rules apply.
//  - Digits along a grey thermometer increase from the bulb end. Thermometers
//    contain exactly 4 digits, only move horizontally and vertically (never
//    diagonally) and don't branch or overlap. Thermometers are partially
//    invisible: six bulbs are drawn, two thermometers are drawn in full and
//    four are drawn only as far as their third cell, so the fourth cell of
//    those four is disjoined over every cell the "orthogonal step" and
//    "don't overlap" clauses leave open.
//  - Every 2x2 area in the grid contains at least one digit from each of
//    (123), (456), (789).
// Not a condition on the final grid, so not encoded: the fog, the cells that
// clear it, and the "revealing new clues" clause -- these govern what is on
// screen while solving, and the rules state the invisible thermometer segments
// stay invisible even once the fog is gone.

const THERMO_LENGTH = 4;

// Transcribed from the drawn grey strokes, bulb first. Every stroke that stops
// mid-run is faded out over the following 0.35 cells, and that taper is the
// only marker of where a thermometer continues unseen.
//
// Two thermometers are pinned in full because a bulbless drawn fragment can
// only belong to them. A round stroke cap at the centre of R3C4 tapering west
// is a thermometer's far tip entered from R3C3; R4C2 is the only bulb with a
// 4-cell orthogonal path reaching it, and R4C2,R3C2,R3C3,R3C4 is that path. A
// square stroke through the centre of R7C4 tapering both west and east means
// R7C3,R7C4,R7C5 are consecutive on one thermometer; R7C2 is the only bulb that
// reaches it, giving R7C2,R7C3,R7C4,R7C5.
const COMPLETE_THERMOS = [
  ['R4C2', 'R3C2', 'R3C3', 'R3C4'],
  ['R7C2', 'R7C3', 'R7C4', 'R7C5'],
];

// Drawn prefixes of the other four thermometers: the cells the stroke actually
// reaches before it fades. The taper direction is what puts the third cell on
// each of these, but it dies short of that cell's centre, so it says nothing
// about which way the thermometer leaves it.
const PARTIAL_THERMOS = [
  ['R4C1', 'R3C1', 'R2C1'],
  ['R3C7', 'R2C7', 'R2C8'],
  ['R4C5', 'R5C5', 'R5C6'],
  ['R6C9', 'R6C8', 'R6C7'],
];

// A thermometer never revisits its own cells and no two of them overlap, so no
// hidden cell may be one that is already drawn on.
const drawnCells = new Set(
  [...COMPLETE_THERMOS, ...PARTIAL_THERMOS].flat());

// The hidden fourth cell is an orthogonal neighbour of the last drawn cell.
const fourthCellOptions = PARTIAL_THERMOS.map(cells => {
  const { row, col } = parseCellId(cells[cells.length - 1]);
  return [[-1, 0], [1, 0], [0, -1], [0, 1]]
    .map(([dRow, dCol]) => [row + dRow, col + dCol])
    .filter(([r, c]) => r >= 1 && r <= 9 && c >= 1 && c <= 9)
    .map(([r, c]) => makeCellId(r, c))
    .filter(cell => !drawnCells.has(cell));
});

// Two of these four can reach a common cell (R5C7 and R6C6 are each in reach of
// both R5C6 and R6C7), and "don't overlap" forbids them both taking it. So the
// choices are made jointly within each connected component of the "shares a
// candidate cell" relation, and independently across components.
const component = PARTIAL_THERMOS.map((_, i) => i);
for (let i = 0; i < PARTIAL_THERMOS.length; i++) {
  for (let j = i + 1; j < PARTIAL_THERMOS.length; j++) {
    const shares = fourthCellOptions[i].some(
      cell => fourthCellOptions[j].includes(cell));
    if (!shares || component[i] === component[j]) continue;
    const [keep, drop] = [component[i], component[j]].sort();
    component.forEach((c, k) => { if (c === drop) component[k] = keep; });
  }
}
const components = [...new Set(component)].map(
  id => component.flatMap((c, i) => c === id ? [i] : []));

// Every way of giving each thermometer in a component a distinct fourth cell.
const distinctChoices = indices => indices.reduce(
  (choices, i) => choices.flatMap(
    choice => fourthCellOptions[i]
      .filter(cell => !choice.includes(cell))
      .map(cell => [...choice, cell])),
  [[]]);

const completedThermo = (i, cell) => new Thermo(...PARTIAL_THERMOS[i], cell);

const hiddenThermos = components.map(indices => new Or(
  distinctChoices(indices).map(
    choice => indices.length === 1
      ? completedThermo(indices[0], choice[0])
      : new And(indices.map((i, k) => completedThermo(i, choice[k]))))));

if (COMPLETE_THERMOS.some(cells => cells.length !== THERMO_LENGTH)
  || PARTIAL_THERMOS.some(cells => cells.length !== THERMO_LENGTH - 1)) {
  throw new Error('thermometers must be exactly 4 cells long');
}

return [
  new Shape('9x9'),

  // The puzzle's single given digit.
  new Given('R3C9', 5),

  ...COMPLETE_THERMOS.map(cells => new Thermo(...cells)),
  ...hiddenThermos,

  new GlobalEntropy(),
];
