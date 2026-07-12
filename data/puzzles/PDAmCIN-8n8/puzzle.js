// Title: Fractured Symmetry
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=PDAmCIN-8n8
// Source: https://sudokupad.app/nntvpka1p2

// Normal sudoku rules apply.
// German Whisper (green lines): adjacent digits differ by at least 5.
// Palindrome (gray lines): digits read the same in both directions.
// Little Killer: outside clue gives the sum of digits along its diagonal.
// Kropki white dots: joined digits are consecutive.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  new Given('R1C9', 1),

  // German Whisper lines (green, default difference 5).
  new Whisper('R4C4', 'R3C5', 'R2C4', 'R3C3'),
  new Whisper('R6C6', 'R7C5', 'R8C6', 'R7C7'),
  new Whisper('R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2'),
  new Whisper('R1C9', 'R2C8'),
  new Whisper('R4C2', 'R5C3'),
  new Whisper('R2C9', 'R3C8'),

  // Palindrome lines (gray).
  new Palindrome(
    'R7C4', 'R8C5', 'R9C6', 'R8C7', 'R7C8', 'R6C9', 'R5C8', 'R4C7',
    'R3C6', 'R2C5', 'R1C4', 'R2C3', 'R3C2', 'R4C1', 'R5C2', 'R6C3'),
  new Palindrome('R3C4', 'R4C3', 'R5C4', 'R4C5'),
  new Palindrome('R6C5', 'R5C6', 'R6C7', 'R7C6'),
  new Palindrome('R3C7', 'R4C6'),

  // Kropki white dots (consecutive), both touching R7C7.
  new WhiteDot('R7C7', 'R7C8'),
  new WhiteDot('R7C7', 'R8C7'),

  // Little Killer diagonal sums.
  LittleKiller.fromCells(27, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(28, graph.ray('R6C9', -1, -1), geometry),
  LittleKiller.fromCells(28, graph.ray('R4C1', 1, 1), geometry),
];
