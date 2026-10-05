import Grid from "@mui/material/Grid";
import '../App.css'
import Cell from "./Cell";
function Block(props){

    const cells = [0,1,2,3,4,5,6,7,8]

    return(
        <Grid container columns={3} sx={{borderStyle: "solid", aspectRatio: 1/1}}>
            {cells.map((cellNr) => (
                <Cell 
                    key={cellNr} 
                    block = {props.block} 
                    cell = {cellNr+1} 
                    handleCellClicked = {props.handleCellClicked}
                    chosenCells = {props.chosenCells}
                    >

                    </Cell>
            ))}
        </Grid> 
    )

} export default Block