// Title: Parroty Lines
// Author: Michael Lefkowitz and Marty Sears
// Video: https://www.youtube.com/watch?v=5QGtyKkQCOo
// Source: https://sudokupad.app/azp64ejj1v?setting-nogrid=1

// Normal Sudoku rules apply. There are no given digits.
//
// PARROTY LINES: a 'word' is a non-repeating sequence of digits. Each white
// line is one or more copies of the same word, and the digit on the parrot
// speaking to that line is the word's length.
//
// CAGES: the digits in a birdcage sum to the number on its attached tag.
//
// No numeral is printed on any parrot or any tag; each is drawn inside a single
// cell, so the number it carries is that cell's digit. Every rules sentence is
// encoded; nothing is omitted.

// Parrot cell, then its line's cells walking away from the parrot. The parrot
// is the bird whose speech balloon reaches that line's end cell.
const parrotyLines = [
  ['R1C2', ['R1C3', 'R1C4', 'R2C4', 'R3C4', 'R3C3', 'R2C3']],
  ['R4C4', ['R4C5', 'R5C4', 'R6C4', 'R7C4', 'R7C5', 'R7C6', 'R8C7', 'R8C8', 'R8C9']],
  ['R5C2', ['R6C1', 'R6C2', 'R7C3', 'R8C4', 'R9C4', 'R9C3']],
  ['R5C5', ['R5C6', 'R6C7', 'R7C8']],
  ['R5C8', ['R5C7', 'R4C6', 'R3C5']],
  ['R5C9', ['R4C9', 'R3C9', 'R2C9', 'R2C8', 'R2C7', 'R2C6', 'R1C6', 'R1C5']],
  ['R9C8', ['R9C7', 'R9C6', 'R9C5', 'R8C5']],
];

// Tag cell, then the cells its birdcage covers.
const birdcages = [
  ['R1C8', ['R2C8', 'R3C8']],
  ['R3C1', ['R4C2', 'R5C2']],
  ['R3C6', ['R4C7']],
  ['R4C8', ['R5C9', 'R6C9']],
  ['R7C2', ['R8C2', 'R9C2']],
];

// A line of `len` cells is `len / word` copies of a `word`-digit word: the word
// length must divide the line, cells `word` apart repeat, and the first copy
// has no repeated digit. The parrot's digit picks the branch, so the
// disjunction runs over the divisors of the line length and nothing else.
// (Walking the line from the other end gives the reversed word repeated the
// same number of times, so the direction chosen above does not matter.)
function parrotyLine(parrotCell, cells) {
  const len = cells.length;
  const wordLengths = Array.from({ length: len }, (_, i) => i + 1)
    .filter(word => len % word === 0);

  return new Or(wordLengths.map(word => new And([
    new Given(parrotCell, word),
    ...(word > 1 ? [new AllDifferent(...cells.slice(0, word))] : []),
    // One group per position within the word, holding that position's copies:
    // SameValues over single-cell sets makes them all equal.
    ...(len > word
      ? Array.from({ length: word }, (_, offset) => new SameValues(
        len / word, ...cells.filter((_, i) => i % word === offset)))
      : []),
  ])));
}

return [
  new Shape('9x9'),
  // Arrow's circle cell is the tag; its arm cells are the caged cells.
  ...birdcages.map(([tagCell, cells]) => new Arrow(tagCell, ...cells)),
  ...parrotyLines.map(([parrotCell, cells]) => parrotyLine(parrotCell, cells)),
];
