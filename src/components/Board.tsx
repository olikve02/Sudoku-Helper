import Grid from "@mui/material/Grid";
import Cell from "./Cell";
import type { CellState } from "../types";
import {
  hasConflict,
  isPeerOfSameValueAsSelected,
  isPeerOfSelectedCell,
  isWrong,
  sameValueAsSelected,
} from "../hooks/useSudokuBoard";

type BoardProps = {
  cells: CellState[];
  onCellClick: (row: number, col: number) => void;
  solution: number[] | null;
  showAllPeers: boolean;
};

function Board({ cells, onCellClick, solution, showAllPeers }: BoardProps) {
  return (
    <Grid container columns={9} className="board">
      {cells.map((cell, index) => (
        <Cell
          key={`${cell.row}-${cell.col}`}
          cell={cell}
          hasConflict={hasConflict(cell, cells)}
          onClick={() => onCellClick(cell.row, cell.col)}
          isPeer={
            showAllPeers
              ? isPeerOfSameValueAsSelected(cell, cells) ||
                isPeerOfSelectedCell(cell, cells)
              : isPeerOfSelectedCell(cell, cells)
          }
          sameValueAsSelected={sameValueAsSelected(cell, cells)}
          isWrong={isWrong(cell, index, solution)}
        />
      ))}
    </Grid>
  );
}

export default Board;
