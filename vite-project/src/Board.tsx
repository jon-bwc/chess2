import { useState } from "react";

export default function Board() {
  const numRows = 8;
  const numCols = 8;

  const initDisplayBoard : cSquare[][] = new Array<cSquare[]>(numRows);


  // const chessBoard : map<string, >

  for(let i = 0; i < numRows; i++) {
    initDisplayBoard[i] = new Array<cSquare>(numCols);
    for(let j = 0; j < numCols; j++) {
      let x = numRows - 1 -i;
      let y = j;
      if (!isWhite) {

      }
      initDisplayBoard[i][j] = new cSquare(x, j);
    }
  }

  const [displayBoard, setdisplayBoard] = useState(initDisplayBoard)

  return (
      <div id="board">
          { displayBoard.map((row) => row.map((square, i) => <div key={i}>{square.loc.toString()}</div>)) }
      </div>
  );
}