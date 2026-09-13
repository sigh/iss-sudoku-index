// Title: Reserved Parking
// Author: rockratzero
// Video: https://www.youtube.com/watch?v=2FCQiuH1grg
// Source: https://yusitnikov.github.io/puzzletv/#reserved-parking

// Normal sudoku: 1-9 once each in every row, column and 3x3 box (default
// Shape('9x9') boxes).
//
// Rush Hour mechanics: every car is a rigid 2- or 3-cell block that slides
// along one fixed row (horizontal) or column (vertical); a printed digit on
// a car moves with it, so it is not a fixed Given -- it is pinned to a grid
// cell only once the car's rest position is chosen (the "Var selects a
// geometric alternative, pin what follows" pattern used by the sibling 6x6
// Rush Hour puzzle). Cars are transcribed by hand from the drawn per-cell
// highlight colours: a car is one maximal run of orthogonally adjacent
// same-colour cells in a single row/column -- three colours (violet
// #FF80FF, palegreen #B0FFB0, grey #A8A8A8) each recur across several
// disjoint runs, giving 13 cars from 6 distinct colours (confirmed against
// the per-cell colours directly, not merged by colour alone).
//
// Colour-tagged cars carry their line rule with them, applied to their own
// footprint wherever they end up (in addition to the two static drawn
// lines/dots below, which are unrelated to any car):
//   - violet #FF80FF cars ("purple" in the ruleset): Renban among the car's
//     own cells.
//   - palegreen #B0FFB0 cars ("green"): a difference->=5 (German) whisper
//     between the car's own adjacent cells.
//   - grey #A8A8A8 cars (the ruleset's "black" cars, rendered grey here so
//     their printed digits stay legible against the fill): a black-Kropki
//     (2:1) ratio between the car's own adjacent cells.
// The remaining three cars (lavender #D0D0FF, light pink #FFA0A0, slate
// blue #8080F0) carry no line rule.
//
// Six of the 13 cars are Reserved Parking cars: the ruleset requires each to
// end parked exactly in the correspondingly coloured 2-cell cage (see
// reservedCages below), matched here to the one car sharing that cage's row
// (for a horizontal cage) or column (for a vertical cage) and colour --
// asserted unique below rather than assumed. Those six get a single fixed
// rest position; the other seven cars range freely along their own track,
// bounded only by the board edge.
//
// The Escape Rule (no car may leave the drawn 6x6 cage until the Red car --
// the light-pink #FFA0A0 one -- has driven out through the single boundary
// opening at R3C7 into its parking space) and the "hidden ... discovered
// while driving" phrasing of Reserved Parking are both solving-order/reveal
// flavour, not additional restrictions on the *final* grid (fog/reveal is
// solving UI, not a rule). Once every reserved car is parked and no two
// cars' final footprints overlap, that
// configuration is reachable: run the Red car out first (its row-3
// neighbours can always shuffle within the still-closed cage to clear its
// path, since nothing outside the cage has moved yet), then send every
// other car straight to its own target -- the same "independent tracks ->
// any non-colliding final state is trivially reachable" reasoning that
// applies to the sibling 6x6 Rush Hour puzzle. So the cage boundary and its
// opening need no separate encoding: a reserved car's cage already fixes
// its position, and every other car's legal range is bounded only by the
// 9-cell board edge.
//
// Fire Hydrants ("cars may not permanently park adjacent to a Kropki dot"):
// no car's final footprint may include either cell of a drawn ratio pair
// (R7C6/R7C7 or R7C3/R6C3) -- confirmed by the ruleset's own worked example
// ("in row 6 starting positions, the black car is touching[R6C3, one cell
// of the R7C3/R6C3 pair] ... the pink car [violet #FF80FF, R6C5/R6C6] is
// not"). Enforced below by excluding, from each car's legal-position range,
// every position whose footprint would include one of those cells --
// computed from the drawn `ratio` cell list, not hand-picked positions.
//
// The 8 "text" digits at R3C8/R3C9/R4C9/R6C9/R8C1/R8C2/R9C4/R7C5 are plain
// cell Givens, independent of any car: "Reserved Parking spaces (and
// perhaps other cells in the grid) have hidden given digits ... Revealed
// digits do not move" ties them to the *cell*, not to whichever car (if
// any) later parks there -- again reveal/fog flavour, not a mechanic.

const GRID_SIZE = 9;

// One entry per car, transcribed from the drawn (initial) position. `line`
// is the car's fixed row (horizontal) or column (vertical); `givens` are
// its printed digits, offset 0-indexed from the drawn head cell; `reserved`
// marks the six cars a Reserved Parking cage claims (matched below).
const cars = [
  // Violet #FF80FF -- Renban.
  { id: 'A', desc: 'purple, row1 cols1-3', orientation: 'horizontal', line: 1, length: 3, givens: [{ offset: 2, value: 7 }], colorRule: 'renban', reserved: false },
  { id: 'B', desc: 'purple, col5 rows1-3', orientation: 'vertical', line: 5, length: 3, givens: [{ offset: 0, value: 3 }], colorRule: 'renban', reserved: false },
  { id: 'C', desc: 'purple, row4 cols1-2 (parks R4C8/9)', orientation: 'horizontal', line: 4, length: 2, givens: [], colorRule: 'renban', reserved: true },
  { id: 'D', desc: 'purple, row6 cols5-6 (parks R6C8/9)', orientation: 'horizontal', line: 6, length: 2, givens: [], colorRule: 'renban', reserved: true },
  // Palegreen #B0FFB0 -- German whisper.
  { id: 'E', desc: 'green, col4 rows1-2 (parks R8/9C4)', orientation: 'vertical', line: 4, length: 2, givens: [], colorRule: 'whisper', reserved: true },
  { id: 'F', desc: 'green, col6 rows1-3', orientation: 'vertical', line: 6, length: 3, givens: [{ offset: 1, value: 2 }], colorRule: 'whisper', reserved: false },
  { id: 'G', desc: 'green, col2 rows5-6 (parks R8/9C2)', orientation: 'vertical', line: 2, length: 2, givens: [], colorRule: 'whisper', reserved: true },
  { id: 'H', desc: 'green, row5 cols4-5', orientation: 'horizontal', line: 5, length: 2, givens: [{ offset: 1, value: 2 }], colorRule: 'whisper', reserved: false },
  // Grey #A8A8A8 -- ruleset's "black" cars: black-Kropki ratio.
  { id: 'I', desc: 'black, col1 rows2-3 (parks R8/9C1)', orientation: 'vertical', line: 1, length: 2, givens: [], colorRule: 'ratio', reserved: true },
  { id: 'J', desc: 'black, row6 cols3-4', orientation: 'horizontal', line: 6, length: 2, givens: [{ offset: 1, value: 2 }], colorRule: 'ratio', reserved: false },
  // Uncoloured (no line rule).
  { id: 'K', desc: 'lavender #D0D0FF, row2 cols2-3', orientation: 'horizontal', line: 2, length: 2, givens: [{ offset: 0, value: 6 }, { offset: 1, value: 9 }], colorRule: null, reserved: false },
  { id: 'L', desc: 'Red car, light pink #FFA0A0, row3 cols3-4 (parks R3C8/9)', orientation: 'horizontal', line: 3, length: 2, givens: [], colorRule: null, reserved: true },
  { id: 'M', desc: 'slate blue #8080F0, col3 rows4-5', orientation: 'vertical', line: 3, length: 2, givens: [{ offset: 0, value: 5 }, { offset: 1, value: 3 }], colorRule: null, reserved: false },
];

// Reserved Parking cages, transcribed from the drawn cage list (the 36-cell
// 6x6 escape-boundary cage is excluded -- see the header note).
const reservedCages = [
  { colorRule: null, cells: ['R3C8', 'R3C9'] }, // outlineC #b60000 (red)
  { colorRule: 'renban', cells: ['R6C8', 'R6C9'] }, // outlineC #b66dff (purple)
  { colorRule: 'renban', cells: ['R4C8', 'R4C9'] }, // outlineC #b66dff (purple)
  { colorRule: 'whisper', cells: ['R8C4', 'R9C4'] }, // outlineC #24ff24 (green)
  { colorRule: 'whisper', cells: ['R8C2', 'R9C2'] }, // outlineC #24ff24 (green)
  { colorRule: 'ratio', cells: ['R8C1', 'R9C1'] }, // outlineC #000000 (black)
];

// A drawn cage's orientation/line/head, derived the same way a car's is.
function cageTrack(cells) {
  const a = parseCellId(cells[0]);
  const b = parseCellId(cells[1]);
  if (a.row === b.row) {
    return { orientation: 'horizontal', line: a.row, head: Math.min(a.col, b.col) };
  }
  return { orientation: 'vertical', line: a.col, head: Math.min(a.row, b.row) };
}

// Cell under a car at head position `pos` (1-indexed row/column of the
// car's first cell) and a given's `offset` (0-indexed from the head cell).
function carCell(car, pos, offset) {
  return car.orientation === 'vertical'
    ? makeCellId(pos + offset, car.line)
    : makeCellId(car.line, pos + offset);
}

function footprint(car, pos) {
  return Array.from({ length: car.length }, (_, i) => carCell(car, pos, i));
}

for (const car of cars) {
  car.minPos = 1;
  car.maxPos = GRID_SIZE - car.length + 1;
}

// Match each reserved car to its cage by orientation, line and colour --
// asserted unique rather than assumed, so a transcription slip fails loudly
// instead of silently mismatching.
for (const cage of reservedCages) {
  const track = cageTrack(cage.cells);
  const matches = cars.filter(c =>
    c.reserved && c.colorRule === cage.colorRule &&
    c.orientation === track.orientation && c.line === track.line);
  if (matches.length !== 1) {
    throw new Error(`Reserved cage ${cage.cells} matches ${matches.length} cars, want 1`);
  }
  matches[0].fixedPos = track.head;
}
if (cars.some(c => c.reserved && c.fixedPos === undefined)) {
  throw new Error('A reserved car was not matched to any cage');
}

// Fire Hydrants: no car's final footprint may include either cell of a
// drawn Kropki ratio pair. Cells taken directly from the `ratio` clue list.
const fireHydrantCells = new Set(
  [['R7C7', 'R7C6'], ['R7C3', 'R6C3']].flat());

// Cells the six reserved cars occupy once parked. Those cars are fixed, so
// this is enforced by filtering the free cars' own candidate positions
// below, not by a two-Var Pair.
const parkedCells = new Set(
  cars.filter(c => c.reserved).flatMap(c => footprint(c, c.fixedPos)));

function legalPositions(car) {
  const positions = [];
  for (let pos = car.minPos; pos <= car.maxPos; pos++) {
    const cells = footprint(car, pos);
    if (cells.some(c => fireHydrantCells.has(c))) continue;
    if (cells.some(c => parkedCells.has(c))) continue;
    positions.push(pos);
  }
  return positions;
}

function colorConstraint(car, cells) {
  switch (car.colorRule) {
    case 'renban': return new Renban(...cells);
    case 'whisper': return new Whisper(...cells);
    case 'ratio': return new BlackDot(...cells);
    default: return null;
  }
}

const freeCars = cars.filter(c => !c.reserved);
for (const car of freeCars) {
  car.posVar = new Var('P' + car.id, `Car ${car.id} position`);
  car.posCell = car.posVar.cells()[0];
}

const horizontalFree = freeCars.filter(c => c.orientation === 'horizontal');
const verticalFree = freeCars.filter(c => c.orientation === 'vertical');

// Footprint occupancy test between a horizontal and a vertical free car --
// the only pair that can ever collide: every free horizontal car keeps a
// distinct row (1, 5, 6, 2) and every free vertical car a distinct column
// (5, 6, 3), so two free cars of the same orientation never share a track.
function collides(carH, posH, carV, posV) {
  const colInRow = carV.line >= posH && carV.line <= posH + carH.length - 1;
  const rowInCol = carH.line >= posV && carH.line <= posV + carV.length - 1;
  return colInRow && rowInCol;
}

return [
  new Shape('9x9'),
  ...freeCars.map(c => c.posVar),

  // Each free car's printed digits (and colour-rule constraint, if any)
  // land on the cells implied by its chosen rest position.
  ...freeCars.map(car => new Or(
    legalPositions(car).map(pos => new And([
      new Given(car.posCell, pos),
      ...car.givens.map(g => new Given(carCell(car, pos, g.offset), g.value)),
      ...(car.colorRule ? [colorConstraint(car, footprint(car, pos))] : []),
    ]))
  )),

  // No free horizontal/vertical car pair may end up sharing a cell.
  ...horizontalFree.flatMap(carH => verticalFree.map(carV => {
    const key = Pair.fnToKey(
      (posH, posV) => !collides(carH, posH, carV, posV), GRID_SIZE);
    return new Pair(key, `${carH.id}/${carV.id} no overlap`, carH.posCell, carV.posCell);
  })),

  // Reserved cars: fixed final position, so their colour-rule constraint
  // (if any) applies unconditionally to the parked cage cells.
  ...cars.filter(c => c.reserved && c.colorRule)
    .map(c => colorConstraint(c, footprint(c, c.fixedPos))),

  // Static drawn Renban/Whisper lines and Kropki ratio dots -- unrelated to
  // any car.
  new Renban('R7C8', 'R7C9', 'R8C9'),
  new Whisper('R8C7', 'R9C7', 'R9C8'),
  new BlackDot('R7C7', 'R7C6'),
  new BlackDot('R7C3', 'R6C3'),

  // Hidden/"revealed" cell givens (fog is solving UI, not a rule), from the
  // drawn "text" reveal markers.
  new Given('R3C8', 7),
  new Given('R3C9', 3),
  new Given('R4C9', 4),
  new Given('R6C9', 6),
  new Given('R7C5', 9),
  new Given('R8C1', 8),
  new Given('R8C2', 9),
  new Given('R9C4', 2),
];
