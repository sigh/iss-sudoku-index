// Title: Chess Lines
// Author: gdc
// Video: https://www.youtube.com/watch?v=y0QqBWw3Ylw
// Source: https://sudokupad.app/b193jegg4x

// Normal Sudoku applies. Consecutive digits on each grey line make the move
// shown by its chess-piece icon on a 3x3 numpad; pawns move one vertical step.
const numpadMove = (kind) => Pair.fnToKey((a, b) => {
  const ar = Math.floor((a - 1) / 3);
  const ac = (a - 1) % 3;
  const br = Math.floor((b - 1) / 3);
  const bc = (b - 1) % 3;
  const dr = Math.abs(ar - br);
  const dc = Math.abs(ac - bc);
  if (kind === 'knight') return (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
  if (kind === 'bishop') return dr === dc && dr > 0;
  if (kind === 'pawn') return dr === 1 && dc === 0;
  if (kind === 'king') return dr <= 1 && dc <= 1 && (dr > 0 || dc > 0);
  if (kind === 'rook') return (dr === 0) !== (dc === 0);
  return (dr === dc && dr > 0) || (dr === 0) !== (dc === 0);
}, 9);

// Grey lines and their piece icons transcribed from the drawn data.
const knight = numpadMove('knight');
const bishop = numpadMove('bishop');
const pawn = numpadMove('pawn');
const king = numpadMove('king');
const rook = numpadMove('rook');
const queen = numpadMove('queen');

return [
  new Shape('9x9'),
  new Given('R6C6', 7),
  new Pair(knight, 'knight', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R5C5', 'R5C4', 'R5C3', 'R4C3', 'R4C2'),
  new Pair(bishop, 'bishop', 'R5C2', 'R4C1', 'R3C2', 'R2C1', 'R1C2'),
  new Pair(bishop, 'bishop', 'R2C2', 'R2C3', 'R2C4', 'R2C5'),
  new Pair(rook, 'rook', 'R2C6', 'R2C7', 'R2C8', 'R2C9'),
  new Pair(pawn, 'pawn', 'R1C7', 'R1C8', 'R1C9'),
  new Pair(king, 'king', 'R1C4', 'R1C5'),
  new Pair(king, 'king', 'R5C9', 'R5C8', 'R5C7', 'R6C6'),
  new Pair(knight, 'knight', 'R7C1', 'R8C1', 'R9C1'),
  new Pair(knight, 'knight', 'R7C3', 'R7C4', 'R8C5'),
  new Pair(rook, 'rook', 'R9C4', 'R9C5', 'R9C6', 'R8C6'),
  new Pair(queen, 'queen', 'R8C7', 'R8C8', 'R8C9'),
];
