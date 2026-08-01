// Title: Kaiserliche Marine
// Author: Oripy
// Video: https://www.youtube.com/watch?v=d0YCq42Dmig
// Source: https://sudokupad.app/anfigouctj?setting-nogrid=1

// Normal 9x9 Sudoku and the drawn Kropki dots. Battleship placement, its four
// outside counts, and the German Whisper paths are omitted because the ships
// are unknown structures rather than fixed lines.
// Board givens transcribed from the two digits inside the framed 9x9 board.
const givens = [
  ['R6C2', 5],
  ['R6C8', 7],
];

// Edges transcribed from the drawn white Kropki dots.
const whiteDots = [
  ['R1C4', 'R1C5'], ['R1C5', 'R1C6'], ['R1C4', 'R2C4'],
  ['R1C6', 'R2C6'], ['R3C9', 'R4C9'], ['R7C4', 'R7C5'],
  ['R8C2', 'R8C3'],
  ['R8C4', 'R8C5'], ['R8C5', 'R8C6'], ['R8C4', 'R9C4'],
  ['R8C6', 'R9C6'], ['R9C5', 'R9C6'],
];

// Edges transcribed from the drawn black Kropki dots.
const blackDots = [
  ['R1C5', 'R2C5'], ['R5C1', 'R5C2'], ['R5C8', 'R5C9'],
  ['R7C2', 'R7C3'], ['R7C5', 'R8C5'], ['R7C7', 'R7C8'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whiteDots.map(edge => new WhiteDot(...edge)),
  ...blackDots.map(edge => new BlackDot(...edge)),
];
