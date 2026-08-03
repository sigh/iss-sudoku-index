// Title: Lux Umbra
// Author: Crusader175
// Video: https://www.youtube.com/watch?v=JFzuOQDTnr8
// Source: https://app.crackingthecryptic.com/sudoku/LMRnHnF9D4
//
// Normal sudoku on the 9x9 grid. Source cells R2C2-R10C10 are this script's
// R1C1-R9C9 throughout (subtract 1 from each source coordinate).
//
// Every off-grid cell that is not shaded grey in the source is a numbered
// room clue: an unknown digit tied to its row/column by the usual numbered
// -rooms rule (if the cell nearest the clue holds N, the clue equals the
// Nth cell counting inward). Unlike an ordinary numbered-room clue the
// printed value is not given -- it is a solver variable. Shaded off-grid
// cells (including all four corners) carry no clue.
//
// A circle straddles either two adjacent room-clue cells plus their own
// lines' first cells, or four interior grid cells. Its digits must each
// appear at least once (fill #ffffff, "white") or must not appear at all
// (fill #cfcfcf -- the source's "black" circle; solid black would hide the
// printed digits, so the source renders it grey while its black outline is
// the same as the white circles') among the circle's four cells, counting
// a room clue's value the same as a grid digit.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Active (non-shaded) room-clue lines, by the grid row/column they face.
// Transcribed from the drawn shading (shaded = no clue) against the full
// 1-9 row/column range on each side.
const TOP = [1, 2, 6, 7, 8, 9];       // looking down into the column
const BOTTOM = [1, 2, 3, 4, 8, 9];    // looking up into the column
const LEFT = [1, 2, 3, 4, 6, 7, 8, 9]; // looking right into the row
const RIGHT = [1, 2, 6, 7, 8, 9];     // looking left into the row

// One Var per active room-clue cell, plus the line of grid cells (nearest
// cell first) that its numbered-room relation reads.
const rooms = new Var(
  'R', 'room clue digits',
  TOP.length + BOTTOM.length + LEFT.length + RIGHT.length);
let nextIndex = 1;
const roomVar = {};
const roomLine = {};
function addRoom(key, startCell, dRow, dCol) {
  roomVar[key] = rooms.cell(nextIndex++);
  roomLine[key] = graph.ray(startCell, dRow, dCol);
}
TOP.forEach(c => addRoom('T' + c, makeCellId(1, c), 1, 0));
BOTTOM.forEach(c => addRoom('B' + c, makeCellId(9, c), -1, 0));
LEFT.forEach(r => addRoom('L' + r, makeCellId(r, 1), 0, 1));
RIGHT.forEach(r => addRoom('X' + r, makeCellId(r, 9), 0, -1));

// A room-clue Var's value is unknown, so it can't be handed to NumberedRoom
// directly (that class takes a literal printed value). Instead, for each
// candidate value k, ISS's own NumberedRoom already enforces exactly "the
// k-th cell into the grid equals k" for that line; requiring the Var to
// equal k in lockstep with that (over every k) forces the Var to equal
// whichever grid cell the line's own first cell selects -- the same
// relation as a printed numbered-room clue, just with the value discovered
// instead of given.
const roomClueConstraints = Object.keys(roomVar).map(key => new Or(
  DIGITS.map(k => new And([
    new Given(roomVar[key], k),
    NumberedRoom.fromCells(k, roomLine[key], geometry),
  ]))
));

// Circle clues, transcribed from the drawn overlay circles (each anchored on
// a 2x2 block, converted to this script's coordinates; room-clue references
// use the T/B/L/X keys defined above in place of a cell id).
const CIRCLES = [
  { cells: ['T1', 'T2', 'R1C1', 'R1C2'], type: 'white', digits: [2, 9] },
  { cells: ['R1C9', 'X1', 'R2C9', 'X2'], type: 'white', digits: [4, 5, 6] },
  { cells: ['R2C7', 'R2C8', 'R3C7', 'R3C8'], type: 'white', digits: [4, 6] },
  { cells: ['R3C4', 'R3C5', 'R4C4', 'R4C5'], type: 'white', digits: [4, 6] },
  { cells: ['L3', 'R3C1', 'L4', 'R4C1'], type: 'white', digits: [9] },
  { cells: ['R6C5', 'R6C6', 'R7C5', 'R7C6'], type: 'white', digits: [4, 6] },
  { cells: ['R6C9', 'X6', 'R7C9', 'X7'], type: 'white', digits: [7] },
  { cells: ['R9C8', 'R9C9', 'B8', 'B9'], type: 'white', digits: [2, 9] },
  { cells: ['R7C2', 'R7C3', 'R8C2', 'R8C3'], type: 'white', digits: [4, 6] },
  { cells: ['L8', 'R8C1', 'L9', 'R9C1'], type: 'white', digits: [4, 5, 6] },
  { cells: ['T6', 'T7', 'R1C6', 'R1C7'], type: 'black', digits: [2] },
  { cells: ['T8', 'T9', 'R1C8', 'R1C9'], type: 'black', digits: [5, 9] },
  { cells: ['L1', 'R1C1', 'L2', 'R2C1'], type: 'black', digits: [1, 7] },
  { cells: ['R2C2', 'R2C3', 'R3C2', 'R3C3'], type: 'black', digits: [1, 7] },
  { cells: ['R4C6', 'R4C7', 'R5C6', 'R5C7'], type: 'black', digits: [3] },
  { cells: ['R5C3', 'R5C4', 'R6C3', 'R6C4'], type: 'black', digits: [3] },
  { cells: ['L6', 'R6C1', 'L7', 'R7C1'], type: 'black', digits: [7] },
  { cells: ['R7C7', 'R7C8', 'R8C7', 'R8C8'], type: 'black', digits: [3, 8] },
  { cells: ['R8C9', 'X8', 'R9C9', 'X9'], type: 'black', digits: [3, 8] },
  { cells: ['R9C1', 'R9C2', 'B1', 'B2'], type: 'black', digits: [5, 9] },
  { cells: ['R9C3', 'R9C4', 'B3', 'B4'], type: 'black', digits: [9] },
];

const resolveCell = ref => roomVar[ref] || ref;

const whiteConstraints = CIRCLES
  .filter(c => c.type === 'white')
  .map(c => new ContainAtLeast(c.digits.join('_'), ...c.cells.map(resolveCell)));

// Black-circle digits are simply banned from each of the circle's four
// cells outright (a per-cell candidate restriction), which is exactly what
// "must not appear in the four cells" means for a fixed cell.
const blackConstraints = CIRCLES
  .filter(c => c.type === 'black')
  .flatMap(c => c.cells.map(resolveCell).map(
    cell => new Given(cell, ...DIGITS.filter(d => !c.digits.includes(d)))));

return [
  new Shape('9x9'),
  rooms,
  ...roomClueConstraints,
  ...whiteConstraints,
  ...blackConstraints,
];
