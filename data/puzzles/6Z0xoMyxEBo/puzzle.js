// Title: Phistomefel's 5
// Author: Exli
// Video: https://www.youtube.com/watch?v=6Z0xoMyxEBo
// Source: https://sudokupad.app/zyd8sdlwmx

// Normal Sudoku, a closed German-whisper loop, one blue region-sum line, two
// grey palindromes, and the explicitly drawn (non-negative) Kropki/X clues.
const whisperLoop = [
  'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R3C6', 'R3C5',
  'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C6',
];

const blackDots = [
  ['R2C6', 'R3C6'], ['R7C7', 'R8C7'], ['R8C6', 'R8C7'],
];
const whiteDots = [
  ['R5C4', 'R5C5'], ['R5C4', 'R6C4'], ['R6C4', 'R6C5'], ['R9C5', 'R9C6'],
];
const xs = [
  ['R1C3', 'R2C3'], ['R8C7', 'R9C7'], ['R3C8', 'R3C9'], ['R7C1', 'R7C2'],
];

return [
  new Shape('9x9'),
  new Whisper(5, ...whisperLoop),
  new RegionSumLine('R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'),
  new Palindrome(
    'R7C2', 'R7C1', 'R6C1', 'R5C1', 'R5C2', 'R5C3', 'R4C4', 'R3C5',
    'R2C6', 'R1C7', 'R2C8', 'R3C9', 'R3C8'),
  new Palindrome('R7C9', 'R8C9', 'R8C8', 'R8C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...xs.map(([a, b]) => new X(a, b)),
];
