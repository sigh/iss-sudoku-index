// Title: Quad van de Wetering
// Author: PotatoHead21
// Video: https://www.youtube.com/watch?v=jk4n68pZLG8
// Source: https://sudokupad.app/7gNQ4nBtpn

// Standard Sudoku. Each listed Quad is transcribed from a circle and its
// nearby text, and requires those digits among its surrounding 2x2 cells.
const quads = [
  ['R4C1',[4,5,6]],['R1C4',[2,3,5]],['R4C4',[2,6]],['R8C6',[1,7,9]],
  ['R6C8',[1,7,8]],['R6C6',[8,9]],['R8C1',[2,3,4,6]],['R3C2',[1,7]],
  ['R3C8',[3]],['R3C5',[4,9]],['R7C8',[4]],['R2C2',[3]],['R4C3',[8]],
  ['R5C7',[4]],['R7C3',[6,7]],['R2C8',[2,5,9]],
];
return [new Shape('9x9'),...quads.map(([cell,values])=>new Quad(cell,...values))];
