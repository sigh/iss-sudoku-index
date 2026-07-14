// Title: Modular Mayhem
// Author: RandyDan
// Video: https://www.youtube.com/watch?v=3gtvi6g3Rbc
// Source: https://sudokupad.app/svg41662qt

// Modular cage: the cage's digit sum must be a multiple of N (the small clue
// in its top-left cell). Digits may repeat within the cage -- only the
// ordinary row/column/box rules force distinctness -- so this is a
// disjunction of Sum (not Cage) totals, one per multiple of N that fits the
// cage's naive digit-sum range [size, 9*size]. Extra out-of-range disjuncts
// are harmless: Sum simply rejects a target no assignment can reach.
const modularCage = (n, ...cells) => {
  const sums = [];
  for (let total = n; total <= 9 * cells.length; total += n) {
    sums.push(new Sum(total, ...cells));
  }
  return new Or(sums);
};

const modularCages = [
  modularCage(5, 'R1C2', 'R1C3'),
  modularCage(5, 'R1C7', 'R1C8'),
  modularCage(5, 'R2C4', 'R2C5', 'R2C6'),
  modularCage(3, 'R2C7', 'R3C7', 'R3C8', 'R3C9'),
  modularCage(3, 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R3C4'),
  modularCage(3, 'R4C4', 'R4C5', 'R4C6'),
  modularCage(5, 'R4C7', 'R4C8'),
  modularCage(5, 'R6C2', 'R6C3'),
  modularCage(4, 'R6C4', 'R6C5', 'R6C6'),
  modularCage(5, 'R6C7', 'R6C8'),
  modularCage(5, 'R7C1', 'R8C1', 'R9C1'),
  modularCage(3, 'R8C2', 'R8C3', 'R9C2', 'R9C3'),
  modularCage(4, 'R8C4', 'R8C5', 'R9C4', 'R9C5'),
  modularCage(5, 'R7C7', 'R7C8', 'R8C7', 'R8C8'),
];

// Renban lines (purple): a non-repeating set of consecutive digits, any order.
// Two of the three lines bend through a single diagonal step (drawn corner to
// corner in the art) into their final cell.
const renbanLines = [
  new Renban('R5C4', 'R5C5', 'R5C6', 'R6C7'),
  new Renban('R6C8', 'R7C9', 'R8C9', 'R9C9'),
  new Renban('R1C9', 'R2C9', 'R3C9', 'R4C9'),
];

// German whisper lines (green): adjacent digits on the line differ by >= 5
// (Whisper's default difference). The R3-4/C2-3 line is drawn as an open
// 3-segment zigzag (up, diagonal, up); its start and end cells are
// diagonally adjacent but the stroke does not return to its start, so no
// closing edge between R3C3 and R4C2 is encoded.
const whisperLines = [
  new Whisper('R4C2', 'R3C2', 'R4C3', 'R3C3'),
  new Whisper('R3C7', 'R3C8'),
  new Whisper('R6C6', 'R7C5', 'R8C4', 'R9C3', 'R8C2', 'R7C1'),
];

return [
  new Shape('9x9'),
  ...modularCages,
  ...renbanLines,
  ...whisperLines,
];
