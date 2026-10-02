import Grid from "@mui/material/Grid";
import '../App.css'
import Candidates from "./Candidates";



function Cell(props){

    return(
        <Grid 
            onClick = {props.handleCellClicked(props.block, props.cell)} 
            size = {1} className= "sudoku-cell" 
            cell = {props.cell} 
            block = {props.cell}>
            chosenCells = {props.chosenCells}
            setChosenCells = {props.setChosenCells}
            <Candidates></Candidates>
      </Grid>
    )
    
    


} export default Cell

