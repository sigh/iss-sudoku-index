// Title: Rush hour sudoku
// Author: Chameleon
// Video: https://www.youtube.com/watch?v=lotuDH1f5bc
// Source: https://yusitnikov.github.io/puzzletv/#rush-hour

// Normal sudoku: 1-6 in every row, column and 3x2 box (default Shape('6x6')
// boxes). Each car is a rigid 2- or 3-cell block sliding along one row
// (horizontal) or one column (vertical); it may not leave the grid and may
// not end up sharing a cell with another car. A car's printed digits move
// with it, so a printed digit is not a fixed Given -- it is only pinned to
// a grid cell once the car's rest position is chosen. One position Var per
// car (its head cell's row, for a vertical car, or column, for a
// horizontal car) selects among that car's legal rest positions; an
// Or-of-And branch per legal position ties the position to the resulting
// Given(s), the same "Var selects one of several geometric alternatives"
// pattern as rectangle_sums.js. A second layer of Pair constraints across
// every horizontal/vertical car pair forbids position combinations whose
// footprints would overlap -- this is a purely geometric rule (it can
// forbid a combination even where the two cars' printed digits would not
// otherwise conflict), so it needs its own constraint independent of the
// digit Givens above.
//
// Car table transcribed from the drawn per-cell values and highlight
// colours. A car is one maximal run of adjacent same-coloured cells in a
// single row or column -- two colours are each reused by a second,
// separate car elsewhere on the grid, so cars are identified by colour
// *and* adjacency, not colour alone.
const cars = [
  { id: 'A', orientation: 'vertical', line: 2, length: 2, givens: [{ offset: 0, value: 1 }] },
  { id: 'B', orientation: 'vertical', line: 6, length: 2, givens: [{ offset: 0, value: 1 }, { offset: 1, value: 5 }] },
  { id: 'C', orientation: 'horizontal', line: 3, length: 2, givens: [{ offset: 0, value: 1 }, { offset: 1, value: 2 }] },
  { id: 'D', orientation: 'horizontal', line: 6, length: 2, givens: [{ offset: 0, value: 1 }, { offset: 1, value: 3 }] },
  { id: 'E', orientation: 'vertical', line: 3, length: 3, givens: [{ offset: 0, value: 1 }, { offset: 2, value: 2 }] },
  { id: 'F', orientation: 'horizontal', line: 4, length: 3, givens: [{ offset: 0, value: 4 }, { offset: 1, value: 6 }, { offset: 2, value: 3 }] },
  { id: 'G', orientation: 'horizontal', line: 2, length: 2, givens: [{ offset: 0, value: 4 }] },
  { id: 'H', orientation: 'vertical', line: 5, length: 2, givens: [{ offset: 1, value: 3 }] },
  { id: 'I', orientation: 'vertical', line: 1, length: 2, givens: [{ offset: 0, value: 6 }, { offset: 1, value: 4 }] },
];

const GRID_SIZE = 6;

function* rangeI(from, to) {
  for (let i = from; i <= to; i++) yield i;
}

// Cell under a car at head position `pos` (1-indexed row/column of the
// car's first cell) and a given's `offset` (0-indexed from the head cell).
function carCell(car, pos, offset) {
  return car.orientation === 'vertical'
    ? makeCellId(pos + offset, car.line)
    : makeCellId(car.line, pos + offset);
}

for (const car of cars) {
  car.posVar = new Var('P' + car.id, `Car ${car.id} position`);
  car.posCell = car.posVar.cells()[0];
  car.minPos = 1;
  car.maxPos = GRID_SIZE - car.length + 1;
}

// Footprint occupancy test: does a horizontal car at row `rowH`, head
// column `posH` share a cell with a vertical car at column `colV`, head
// row `posV`? (Only horizontal/vertical pairs can ever collide: every
// vertical car here has a distinct column and every horizontal car a
// distinct row, so two cars of the same orientation never share a track.)
function collides(carH, posH, carV, posV) {
  const colInRow = carV.line >= posH && carV.line <= posH + carH.length - 1;
  const rowInCol = carH.line >= posV && carH.line <= posV + carV.length - 1;
  return colInRow && rowInCol;
}

const horizontalCars = cars.filter(c => c.orientation === 'horizontal');
const verticalCars = cars.filter(c => c.orientation === 'vertical');

return [
  new Shape('6x6'),
  ...cars.map(c => c.posVar),

  // Each car's printed digits land on the grid cells its chosen rest
  // position implies; the Or ranges over every legal head position
  // (bounded only by the grid edge -- see maxPos above).
  ...cars.map(car => new Or(
    Array.from(rangeI(car.minPos, car.maxPos)).map(pos => new And([
      new Given(car.posCell, pos),
      ...car.givens.map(g => new Given(carCell(car, pos, g.offset), g.value)),
    ]))
  )),

  // No horizontal/vertical car pair may end up sharing a cell.
  ...horizontalCars.flatMap(carH => verticalCars.map(carV => {
    const key = Pair.fnToKey(
      (posH, posV) => !collides(carH, posH, carV, posV), GRID_SIZE);
    return new Pair(key, `${carH.id}/${carV.id} no overlap`, carH.posCell, carV.posCell);
  })),
];
