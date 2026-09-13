// Title: Search And Surprise
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=-xbXcGoMlMc
// Source: https://sudokupad.app/sandra-and-nala/search-and-surprise

// Normal sudoku rules on the plain 9x9 grid (standard boxes; no jigsaw
// regions). Fog-of-war is solving UI and is not encoded.
//
// Six outside clues read as "Numbered Rooms": the shown digit must sit in
// the Nth cell looking into the row/column from that side, where N is the
// digit already in the first cell of that direction -- exactly ISS's
// built-in NumberedRoom.
//
// Six thermometers, one per drawn colour (source `lines`, grouped by exact
// colour+thickness since same-coloured strokes are one connected line). Five
// are plain unbranched strokes; "the direction has to be determined by the
// solver" for these, so each is encoded as an Or over reading the drawn path
// forwards or backwards -- a faithful reading of the rule's own stated
// ambiguity, not a relaxation.
//
// The sixth (khaki, three strokes meeting at R5C4) is the puzzle's one
// branching thermometer. "Only the hollow line branches and it does so from
// the lowest digit" fixes its direction: R5C4 is the low end, so each arm is
// a plain Thermo starting there. (A duplicate white outline drawn along the
// same three arms, and three single-cell decorative icon clusters, are
// cosmetic and carry no cell-to-cell path to encode.)

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cells listed from the clue side into the grid (NumberedRoom is directional).
const numberedRoom = (value, startCell, dRow, dCol) =>
  NumberedRoom.fromCells(value, graph.ray(startCell, dRow, dCol), geometry);

// A thermometer whose low end is not marked: accept either direction.
const eitherWayThermo = (...cells) =>
  new Or([new Thermo(...cells), new Thermo(...cells.slice().reverse())]);

return [
  new Shape('9x9'),

  // Outside "Numbered Rooms" clues (source overlays outside the frame).
  numberedRoom(9, 'R1C2', 1, 0),   // top, C2
  numberedRoom(1, 'R9C2', -1, 0),  // bottom, C2
  numberedRoom(3, 'R1C6', 1, 0),   // top, C6
  numberedRoom(4, 'R9C6', -1, 0),  // bottom, C6
  numberedRoom(5, 'R5C1', 0, 1),   // left, R5
  numberedRoom(4, 'R5C9', 0, -1),  // right, R5

  // Unbranched thermometers, direction unknown (source `lines`, one colour
  // each): lightsteelblue, sandybrown, a second/different lightsteelblue
  // shade, hotpink, mediumaquamarine.
  eitherWayThermo('R9C2', 'R8C2', 'R7C2', 'R6C2', 'R7C3', 'R8C3'),
  eitherWayThermo(
    'R4C8', 'R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R7C8', 'R6C8'),
  eitherWayThermo('R1C7', 'R1C8', 'R2C7', 'R1C6', 'R1C5'),
  eitherWayThermo('R1C2', 'R2C3', 'R3C3', 'R4C2', 'R3C2', 'R2C1', 'R2C2'),
  eitherWayThermo('R9C6', 'R8C6', 'R8C5', 'R9C5', 'R9C4'),

  // The one branching (khaki/"hollow") thermometer: low end pinned at the
  // shared branch point R5C4, each arm increasing outward from it.
  new Thermo('R5C4', 'R5C3', 'R5C2', 'R5C1'),
  new Thermo('R5C4', 'R4C3'),
  new Thermo('R5C4', 'R6C3'),
];
