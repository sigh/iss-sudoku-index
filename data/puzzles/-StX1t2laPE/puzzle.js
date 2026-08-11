// Title: City Planning
// Author: Auul
// Video: https://www.youtube.com/watch?v=-StX1t2laPE
// Source: https://app.crackingthecryptic.com/sudoku/th7jjqF7hL

// Normal sudoku rules (default 9x9 Shape: rows, columns and the nine 3x3
// boxes below are all-different).
//
// 18 outside clues. Each is either a skyscraper clue (Skyscraper's own
// semantics: counts digits visible into the line from that side, a digit
// visible only once it exceeds every digit already seen) or a
// self-numbered room clue: printed value N means the Nth cell from that
// same edge holds digit N -- both the cell and its value come from the
// single printed number, unlike ISS's NumberedRoom class, whose position
// is instead read off a separate first cell's digit. A self-numbered room
// clue is therefore just a Given at the computed cell.
//
// Which reading applies to which printed clue is not marked anywhere in
// the puzzle -- the rules state only that every digit 1-9 labels exactly
// one skyscraper clue and one self-numbered room clue. That is encoded
// below as: every clue is one reading or the other (clueChoices), and
// for each digit's pair of clues, at least one is a room reading and at
// least one is a skyscraper reading (digitSplits) -- together pinning
// each pair to exactly one of each.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// [line id, direction (1 = from top/left, -1 = from bottom/right),
// printed value]. Transcribed from the drawn outside-clue badges.
const clues = [
  ['C2', 1, 5],   // top, column 2
  ['C3', 1, 3],   // top, column 3
  ['C4', 1, 1],   // top, column 4
  ['C7', 1, 9],   // top, column 7
  ['C9', 1, 4],   // top, column 9
  ['C3', -1, 7],  // bottom, column 3
  ['C4', -1, 7],  // bottom, column 4
  ['C6', -1, 8],  // bottom, column 6
  ['C9', -1, 3],  // bottom, column 9
  ['R2', 1, 2],   // left, row 2
  ['R4', 1, 2],   // left, row 4
  ['R6', 1, 8],   // left, row 6
  ['R7', 1, 6],   // left, row 7
  ['R9', 1, 5],   // left, row 9
  ['R3', -1, 9],  // right, row 3
  ['R6', -1, 1],  // right, row 6
  ['R7', -1, 6],  // right, row 7
  ['R8', -1, 4],  // right, row 8
];

// The clue's own line, oriented from its own edge (near cell first).
function orientedLine([line, dir]) {
  const axis = line[0];
  const index = Number(line.slice(1));
  const cells = axis === 'C' ? graph.column(index) : graph.row(index);
  return dir === 1 ? cells : cells.slice().reverse();
}

// The cell a self-numbered room clue pins: N cells in from the clue's own
// edge, along the clue's own line.
function roomCell(clue) {
  return orientedLine(clue)[clue[2] - 1];
}

const skyscraperReading = (clue) => Skyscraper.fromCells(clue[2], orientedLine(clue), geometry);
const roomReading = (clue) => new Given(roomCell(clue), clue[2]);

const clueChoices = clues.map(clue => new Or([skyscraperReading(clue), roomReading(clue)]));

// Group the 18 clues by printed digit (exactly 2 clues per digit 1-9).
const byDigit = new Map();
for (const clue of clues) {
  const value = clue[2];
  (byDigit.get(value) ?? byDigit.set(value, []).get(value)).push(clue);
}

const digitSplits = [...byDigit.values()].flatMap(([a, b]) => [
  new Or([roomReading(a), roomReading(b)]),
  new Or([skyscraperReading(a), skyscraperReading(b)]),
]);

return [
  new Shape('9x9'),
  ...clueChoices,
  ...digitSplits,
];
