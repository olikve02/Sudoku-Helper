import Grid from "@mui/material/Grid";
import Candidates from "./Candidates";
import type { CellState } from "../types";

type CellProps = {
  cell: CellState;
  onClick: () => void;
  hasConflict: boolean;
  isPeer: boolean;
};

function Cell({ cell, onClick, hasConflict, isPeer }: CellProps) {
  // Tykke linjer mellom 3×3-boksene
  const classes = [
    "sudoku-cell",
    cell.row === 4 || cell.row === 7 ? "border-top-thick" : "",
    cell.col === 4 || cell.col === 7 ? "border-left-thick" : "",
    cell.selected ? "cell-selected" : "",
    isPeer ? "cell-peer" : "",
    hasConflict ? "cell-conflict" : "",
  ];

  return (
    <Grid size={1} className={classes.join(" ")} onClick={onClick}>
      {cell.value ? (
        <span className={`sudoku-value`}>{cell.value}</span>
      ) : (
        <Candidates candidates={cell.candidates} />
      )}
    </Grid>
  );
}

export default Cell;
