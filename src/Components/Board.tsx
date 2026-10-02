import Grid from "@mui/material/Grid"
import '../App.css'
import Block from "./Block"
import { useState } from "react"
import { Box, Button } from "@mui/material"

function Board(){
    const blocks = [0,1,2,3,4,5,6,7,8]
    const [chosenCells, setChosenCells] = useState<{block: number, cell: number}[]>([])
    const [chosenCell, setChosenCell] = useState(false)

    return(
        
        <Grid container columns={3} sx={{borderStyle: "solid", aspectRatio: 1/1}}>

        {blocks.map((block) => (
             <Grid key={block} size= {1}>
                <Block 
                    block = {block+1} 
                    handleCellClicked = {handleCellClicked}
                    
                    >
                    
                </Block>
            </Grid>
        ))}
        
      </Grid>
    )



    function handleCellClicked(block: any, cell: any){
        setChosenCell(!chosenCell)
        setChosenCells([...chosenCells, {block: block, cell}])
        console.log("B:" + block + " C:" + cell)
    }
}export default Board