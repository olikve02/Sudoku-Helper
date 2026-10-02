import Grid from "@mui/material/Grid";
import '../App.css'
import Candidates from "./Candidates";

type CellProps = {
    block: number,
    cell: number,
    handleCellClicked: (block: number, cell: number) => void,
    chosenCells: {block: number, cell: number}[],
}

function Cell(props: CellProps){

    const isChosen = props.chosenCells.some((chosenCell => (
            props.block == chosenCell.block && props.cell == chosenCell.cell
        )))


    return(
        <Grid 
            onClick = {cellClicked} 
            size = {1} className= {isChosen ? "sudoku-cell-chosen" : "sudoku-cell"} 
            cell = {props.cell} 
            block = {props.cell}
            chosenCells = {props.chosenCells}
            >
            <Candidates></Candidates>
      </Grid>
    )
    
    
    function cellClicked(){
        props.handleCellClicked(props.block, props.cell)     
        //console.log("B: " + props.block + " C: " + props.cell + "Chosen: " + isChosen)

    }

} export default Cell

