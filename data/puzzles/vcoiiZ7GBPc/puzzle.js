// Title: Fair and Square
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=vcoiiZ7GBPc
// Source: https://sudokupad.app/zsmxjt7v5i

// Normal sudoku, no givens. Nine orange lines, each a closed 2x2 square (seven
// axis-aligned, two rotated 45 degrees onto diagonal neighbours); adjacent
// digits along a line -- i.e. each of its four drawn edges -- differ by at
// least four. Black dots mark 1:2 ratio pairs; the rules say not every such
// pair is dotted, so absence of a dot carries no information (plain BlackDot,
// not a strict/negative Kropki reading).
// Fog and the "foglight" cage (payload cage on R4C4-R6C4,R4C5-R5C5) are the
// progressive-reveal UI, not a rule; not encoded per pipeline convention.

// Each entry is one orange line's cell path, transcribed from the drawn
// line geometry in order with the closing repeat of the first cell kept, so
// Whisper's consecutive-pair binding covers all four square edges.
const orangeLines = [
  ['R5C8', 'R6C8', 'R6C9', 'R5C9', 'R5C8'],
  ['R2C8', 'R3C8', 'R3C9', 'R2C9', 'R2C8'],
  ['R2C6', 'R3C6', 'R3C7', 'R2C7', 'R2C6'],
  ['R1C2', 'R2C2', 'R2C3', 'R1C3', 'R1C2'],
  ['R6C3', 'R7C4', 'R8C3', 'R7C2', 'R6C3'],
  ['R8C7', 'R9C7', 'R9C8', 'R8C8', 'R8C7'],
  ['R7C5', 'R8C4', 'R9C5', 'R8C6', 'R7C5'],
  ['R6C6', 'R6C7', 'R7C7', 'R7C6', 'R6C6'],
  ['R4C4', 'R5C4', 'R5C5', 'R4C5', 'R4C4'],
];

// Edge-centred overlay marks from the drawn geometry, each a black ratio dot
// between the two named cells.
const blackDots = [
  ['R4C6', 'R5C6'],
  ['R6C4', 'R6C5'],
  ['R7C5', 'R7C6'],
  ['R8C6', 'R8C7'],
  ['R6C2', 'R6C3'],
  ['R2C4', 'R2C5'],
  ['R1C5', 'R1C6'],
];

return [
  ...orangeLines.map(cells => new Whisper(4, ...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
