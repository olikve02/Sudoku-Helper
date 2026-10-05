import Grid from "@mui/material/Grid"
import '../App.css'
import Block from "./Block"

type BoardProps = {
    chosenCells: {block: number, cell: number, candidates: number[]}[],
    handleCellClicked: (block: number, cell: number) => void,
}


function Board(props: BoardProps){
    const blocks = [0,1,2,3,4,5,6,7,8]

    return(
        
        <Grid 
        container
        columns={3} 
        className = "board">

        {blocks.map((block) => (
             <Grid key={block} size= {1}>
                <Block 
                    block = {block+1} 
                    handleCellClicked = {props.handleCellClicked}
                    chosenCells = {props.chosenCells}
                    >
                    
                </Block>
            </Grid>
        ))}
        
      </Grid>
    )



   
}export default Board