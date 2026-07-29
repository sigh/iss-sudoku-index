// Title: Giant's Deep
// Author: 99%Sneaky
// Video: https://www.youtube.com/watch?v=8Jo_0fHIcys
// Source: https://app.crackingthecryptic.com/vsuh3lbq7r
// Standard Sudoku. Arrows sum to their circle, thermometers increase, cages
// are distinct sums, grey circles/squares set odd/even parity, and dots use
// standard consecutive or 1:2 semantics. All clue geometry is from raw data.
const arrows=[['R8C8','R8C9','R9C9'],['R8C2','R8C1','R9C1'],['R2C2','R2C1','R1C1'],['R2C7','R2C8','R1C9'],['R2C4','R2C3','R1C3'],['R4C5','R5C4','R6C4']];
const thermos=[['R1C4','R1C5','R2C6'],['R9C5','R9C4','R8C3'],['R3C5','R3C4','R4C3','R5C3'],['R7C4','R7C5','R6C6','R5C6']];
const cages=[[9,['R6C7','R7C7']],[8,['R3C7','R4C7']],[15,['R5C8','R6C8']],[11,['R6C2','R6C3']],[8,['R5C5','R6C5']]];
return [new Shape('9x9'),new Given('R2C5',1,3,5,7,9),...['R9C7','R1C7','R3C9','R3C1','R7C1','R7C9','R4C4','R5C1'].map(c=>new Given(c,2,4,6,8)),...arrows.map(([b,...a])=>new Arrow(b,...a)),...thermos.map(c=>new Thermo(...c)),...cages.map(([s,c])=>new Cage(s,...c)),new WhiteDot('R7C6','R7C5'),new WhiteDot('R2C6','R3C6'),new WhiteDot('R6C6','R5C6'),new WhiteDot('R8C6','R9C6'),new BlackDot('R5C4','R5C3'),new BlackDot('R4C2','R5C2')];
