import Grid from "@mui/material/Grid";
import '../App.css'
import Candidates from "./Candidates";

type CellProps = {
    block: number,
    cell: number,
    handleCellClicked: (block: number, cell: number) => void,
    chosenCells: {block: number, cell: number, candidates: number[]}[],
}

function Cell(props: CellProps){

    const isChosen = props.chosenCells.some((chosenCell => (
            props.block == chosenCell.block && props.cell == chosenCell.cell
        )))

    return(
        <Grid 
            onClick = {cellClicked} 
            size = {1} className= {isChosen ? "sudoku-cell-chosen" : "sudoku-cell"}>

            <Candidates 
                chosenCells = {props.chosenCells}
                cell = {props.cell}
                block = {props.block}
                ></Candidates>
      </Grid>
    )
    
    
    function cellClicked(){
        props.handleCellClicked(props.block, props.cell)     
    }

} export default Cell

