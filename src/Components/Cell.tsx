import Grid from "@mui/material/Grid";
import "../App.css";
import Candidates from "./Candidates";

type CellPropsType = {
  row: number;
  cell: number;
  value: number | null;
  candidates: number[];
  selected: boolean;
  handleCellClicked: (row: number, cell: number) => void;
};

function Cell(props: CellPropsType) {
  return (
    <Grid
      size={1}
      className={`sudoku-cell 
        ${props.row == 4 || props.row == 7 ? "border-top-thick" : ""} 
        ${props.cell == 4 || props.cell == 7 ? "border-left-thick" : ""}
        ${props.selected ? "selected" : ""}`}
      onClick={() => props.handleCellClicked(props.row, props.cell)}
    >
      {props.value ? (
        <span className="sudoku-value">{props.value}</span>
      ) : (
        <Candidates candidates={props.candidates}></Candidates>
      )}
    </Grid>
  );
}
export default Cell;
