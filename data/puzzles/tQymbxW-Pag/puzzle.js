// Title: Barely a Whisper
// Author: Eclectic Hoosier & Riffclown
// Video: https://www.youtube.com/watch?v=tQymbxW-Pag
// Source: https://app.crackingthecryptic.com/rjkytrn10q

// Normal Sudoku rules apply. Orthogonally adjacent digits are not consecutive.
// Consecutive cells on the green lines differ by at least 5; the outside clues
// give the sums of their indicated diagonals.
const greenLines = [
  ['R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2'],
  ['R1C9', 'R2C8'],
  ['R3C7', 'R3C8', 'R4C8', 'R4C7', 'R3C7'],
  ['R3C2', 'R4C2', 'R4C1'],
  ['R5C3', 'R6C3', 'R7C2', 'R8C2'],
  ['R6C7', 'R6C8'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9'],
]; // Green lines transcribed from the drawn paths; the repeated cell closes the loop.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...greenLines.map((cells) => new Whisper(5, ...cells)),
  LittleKiller.fromCells(14, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R1C7', 1, 1), geometry),
];
