// Title: Kurtosis
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=33vSAyF-adI
// Source: https://sudokupad.app/npvkzvpizp?setting-digitoutlines=0

// The six grey thermometer paths and two stagger-crossing black dots use the
// rectangular coordinates of the drawn staircase.

const NUM_VALUES = 15;
const shape = new Shape('9x11', NUM_VALUES);
const graph = cellGraph(shape);

const ACTIVE_COLS = {
  1: [1, 9], 2: [1, 9], 3: [1, 9],
  4: [2, 10], 5: [2, 10], 6: [2, 10],
  7: [3, 11], 8: [3, 11], 9: [3, 11],
};

// Six extra values fill the staircase's 18 holes without colliding in any
// native ISS row or column.
const DEAD_VALUES = {
  '1,10': 10, '1,11': 11,
  '2,10': 11, '2,11': 12,
  '3,10': 12, '3,11': 13,
  '4,1': 10, '4,11': 14,
  '5,1': 11, '5,11': 15,
  '6,1': 12, '6,11': 10,
  '7,1': 13, '7,2': 10,
  '8,1': 14, '8,2': 11,
  '9,1': 15, '9,2': 12,
};

const activeCells = [];
const deadGivens = [];
for (let row = 1; row <= 9; row++) {
  const [firstCol, lastCol] = ACTIVE_COLS[row];
  for (let col = 1; col <= 11; col++) {
    const cell = makeCellId(row, col);
    if (col >= firstCol && col <= lastCol) {
      activeCells.push(cell);
    } else {
      deadGivens.push(new Given(cell, DEAD_VALUES[`${row},${col}`]));
    }
  }
}

const activeRange = graph.makeReplicate(
  new Given(activeCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9), activeCells);

const boxes = [];
for (let rowBand = 0; rowBand < 3; rowBand++) {
  for (let colBand = 0; colBand < 3; colBand++) {
    const cells = [];
    const startRow = 3 * rowBand + 1;
    const startCol = 3 * colBand + rowBand + 1;
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        cells.push(makeCellId(startRow + dr, startCol + dc));
      }
    }
    boxes.push(new AllDifferent(...cells));
  }
}

function directionlessThermo(...cells) {
  return new Or([
    new Thermo(...cells),
    new Thermo(...[...cells].reverse()),
  ]);
}

const thermometers = [
  new Thermo('R5C9', 'R6C9', makeCellId(7, 10), 'R8C9', 'R9C9'),
  new Thermo('R7C3', 'R6C2', 'R6C3', 'R6C4', 'R5C4', 'R4C4'),
  directionlessThermo('R8C7', 'R8C8', 'R9C8', 'R9C7'),
  directionlessThermo('R1C3', 'R2C4', 'R3C5', 'R4C7'),
  directionlessThermo('R2C8', 'R3C8', 'R3C9', 'R2C9'),
  directionlessThermo('R1C1', 'R2C1', 'R3C1', 'R4C2'),
];

const whiteDots = [
  new WhiteDot('R1C6', 'R2C6'),
  new WhiteDot('R8C3', 'R9C3'),
  new WhiteDot('R8C5', 'R8C6'),
  new WhiteDot(makeCellId(8, 11), makeCellId(9, 11)),
];

// Pair is used because the first stagger-crossing clue is diagonal in the
// rectangular bounding box even though it joins adjacent un-skewed cells.
const blackDotKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 15);
const blackDots = [
  new Pair(blackDotKey, 'black dot', 'R3C9', makeCellId(4, 10)),
  new Pair(blackDotKey, 'black dot', 'R6C7', 'R7C8'),
];

return [
  shape,
  new NoBoxes(),
  activeRange,
  ...deadGivens,
  ...boxes,
  ...thermometers,
  ...whiteDots,
  ...blackDots,
];
