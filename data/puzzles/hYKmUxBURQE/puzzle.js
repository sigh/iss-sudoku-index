// Title: One Of The Two
// Author: oskode
// Video: https://www.youtube.com/watch?v=hYKmUxBURQE
// Source: https://sudokupad.app/ayk7228tr8

// Normal sudoku rules apply.
//
// The puzzle's premise (per the setter's note) is that several pairs of
// identical-looking clues each carry two different rule readings, and the
// assignment of reading to clue is not given -- it is part of the puzzle's
// logic. Each pair below is encoded as Or(And(A on item1, B on item2),
// And(B on item1, A on item2)) so the solver -- not the decode -- resolves
// which member of the pair gets which reading.

return [
  new Shape('9x9'),
  new Given('R5C3', 4),
  new Given('R5C7', 5),

  // Two 5-cell cages (drawn identically). Cage A is explicitly marked
  // all-different in the source payload (a `unique` flag on the cage);
  // cage B carries no such marking. That marking is a fixed structural
  // fact independent of which of the two readings below applies to it.
  // Reading pair: one cage contains exactly one 5 among its cells; the
  // other's digits sum to 15.
  new AllDifferent('R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'),
  new Or([
    new And([
      new Sum(15, 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'),
      new ContainExact('5', 'R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'),
    ]),
    new And([
      new ContainExact('5', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'),
      new Sum(15, 'R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'),
    ]),
  ]),

  // Two red lines. Reading pair: one line is a Renban (distinct consecutive
  // digits in any order); the other is a German Whisper (adjacent digits
  // differ by at least 5).
  new Or([
    new And([
      new Renban('R9C4', 'R8C3', 'R7C2', 'R6C1', 'R5C1'),
      new Whisper(5, 'R9C6', 'R8C7', 'R7C8', 'R6C9', 'R5C9'),
    ]),
    new And([
      new Whisper(5, 'R9C4', 'R8C3', 'R7C2', 'R6C1', 'R5C1'),
      new Renban('R9C6', 'R8C7', 'R7C8', 'R6C9', 'R5C9'),
    ]),
  ]),

  // Two dark-blue lines. Each is drawn with a shared 3-cell trunk
  // (R1C5-R2C5-R3C5, hugging the C4/C5 border) that forks at R3C5 into a
  // 3-cell arm along row 4 -- left arm R4C4-R4C3-R4C2, right arm
  // R4C6-R4C7-R4C8. Reading pair: one full 6-cell line is a palindrome
  // (reads the same from either direction); the other requires every
  // window of 3 adjacent digits to have different remainders mod 3
  // (Modular(3, ...) over all 4 sliding windows of the 6-cell line).
  new Or([
    new And([
      new Palindrome('R1C5', 'R2C5', 'R3C5', 'R4C4', 'R4C3', 'R4C2'),
      new Modular(3, 'R1C5', 'R2C5', 'R3C5', 'R4C6', 'R4C7', 'R4C8'),
    ]),
    new And([
      new Modular(3, 'R1C5', 'R2C5', 'R3C5', 'R4C4', 'R4C3', 'R4C2'),
      new Palindrome('R1C5', 'R2C5', 'R3C5', 'R4C6', 'R4C7', 'R4C8'),
    ]),
  ]),

  // Two light-blue diagonals (main R1C1-R9C9, anti R9C1-R1C9). Reading
  // pair: one diagonal has no repeated digit; the other sums to the same
  // total within every box it passes through (RegionSumLine).
  new Or([
    new And([
      new AllDifferent('R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'),
      new RegionSumLine('R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'),
    ]),
    new And([
      new RegionSumLine('R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'),
      new AllDifferent('R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'),
    ]),
  ]),

  // Two grey lines sharing one bulb cell, R8C5. Reading pair: one arm
  // increases starting from the bulb's digit (Thermo, bulb included as the
  // smallest cell); the other arm sums to the bulb's digit (Arrow, bulb
  // first).
  new Or([
    new And([
      new Thermo('R8C5', 'R8C6', 'R7C6', 'R7C7'),
      new Arrow('R8C5', 'R8C4', 'R7C4', 'R7C3'),
    ]),
    new And([
      new Arrow('R8C5', 'R8C6', 'R7C6', 'R7C7'),
      new Thermo('R8C5', 'R8C4', 'R7C4', 'R7C3'),
    ]),
  ]),

  // Two green lines, each with a circle at both ends. Reading pair: one
  // line's middle digits are strictly between its two circled digits
  // (Between, circles first/last); the other's middle digits sum to the
  // same total as its two circled digits (EqualSum over the middle-cell
  // segment and the two-circle segment).
  new Or([
    new And([
      new Between('R2C8', 'R3C8', 'R3C9', 'R4C9'),
      new EqualSum(['R3C2', 'R3C1'], ['R2C2', 'R4C1']),
    ]),
    new And([
      new EqualSum(['R3C8', 'R3C9'], ['R2C8', 'R4C9']),
      new Between('R2C2', 'R3C2', 'R3C1', 'R4C1'),
    ]),
  ]),

  // Two orange dots. Reading pair: one separates consecutive digits (white
  // Kropki dot); the other separates digits in a 1:2 ratio (black Kropki
  // dot).
  new Or([
    new And([
      new WhiteDot('R8C1', 'R8C2'),
      new BlackDot('R8C8', 'R8C9'),
    ]),
    new And([
      new BlackDot('R8C1', 'R8C2'),
      new WhiteDot('R8C8', 'R8C9'),
    ]),
  ]),

  // Two "Y" marks. Reading pair: one separates digits summing to 5 (V);
  // the other separates digits summing to 10 (X).
  new Or([
    new And([
      new V('R8C1', 'R9C1'),
      new X('R8C9', 'R9C9'),
    ]),
    new And([
      new X('R8C1', 'R9C1'),
      new V('R8C9', 'R9C9'),
    ]),
  ]),

  // Six grey triangles: three point up (R5C4, R5C8, R4C6), three point
  // down (R5C6, R5C2, R4C4). Reading pair: one orientation's cells are all
  // even, the other's are all odd. There is no native parity class, so
  // each cell is restricted via a multi-value Given.
  new Or([
    new And([
      new Given('R5C4', 2, 4, 6, 8), new Given('R5C8', 2, 4, 6, 8), new Given('R4C6', 2, 4, 6, 8),
      new Given('R5C6', 1, 3, 5, 7, 9), new Given('R5C2', 1, 3, 5, 7, 9), new Given('R4C4', 1, 3, 5, 7, 9),
    ]),
    new And([
      new Given('R5C4', 1, 3, 5, 7, 9), new Given('R5C8', 1, 3, 5, 7, 9), new Given('R4C6', 1, 3, 5, 7, 9),
      new Given('R5C6', 2, 4, 6, 8), new Given('R5C2', 2, 4, 6, 8), new Given('R4C4', 2, 4, 6, 8),
    ]),
  ]),
];
