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

    return(
        <Grid 
            onClick = {() => } 
            size = {1} className= "sudoku-cell" 
            cell = {props.cell} 
            block = {props.cell}
            chosenCells = {props.chosenCells}
            >
            
            <Candidates></Candidates>
      </Grid>
    )
    
    
    function cellClicked(){
        props.handleCellClicked(props.block, props.cell)
        

    }

} export default Cell

