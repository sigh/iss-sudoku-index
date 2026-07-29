// Title: Caged by a Secret Killer
// Author: PhoenixAki
// Video: https://www.youtube.com/watch?v=6yXzdXQ9SX8
// Source: https://app.crackingthecryptic.com/9J4n47mffJ

// Standard Sudoku, givens, diagonal uniqueness, green whispers, white dots,
// inequalities, and the no-repeat part of each letter cage. Unknown letter
// totals and their cross-letter distinctness are omitted.
const cages=[['R9C1','R9C2'],['R9C3','R9C4'],['R9C5','R9C6'],['R9C7','R9C8'],['R7C9','R8C9'],['R5C9','R6C9'],['R3C9','R4C9'],['R1C2','R1C3'],['R1C4','R1C5'],['R1C6','R1C7'],['R1C8','R1C9'],['R2C1','R3C1'],['R4C1','R5C1'],['R6C1','R7C1']];
const greens=[['R8C2','R8C3'],['R7C2','R7C3'],['R3C7','R3C8'],['R2C7','R2C8'],['R4C1','R5C1'],['R6C9','R5C9']];
return [new Shape('9x9'),new Given('R2C9',6),new Given('R5C5',5),new Given('R8C1',4),new Diagonal(1),new Diagonal(-1),...cages.map(c=>new AllDifferent(...c)),...greens.map(c=>new Whisper(5,...c)),new WhiteDot('R9C5','R9C6'),new WhiteDot('R1C4','R1C5')];
