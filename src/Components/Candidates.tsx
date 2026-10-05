import Grid from "@mui/material/Grid"
import '../App.css'
import { useState } from "react"


type CandidatesProps = {
    block: number,
    cell: number,
    chosenCells: {
        block: number,
        cell: number,
        candidates: number[]
    }[]
}

function Candidates(props: CandidatesProps){

    const candidates = [0,1,2,3,4,5,6,7,8]
    
    const cellData = props.chosenCells.find(
        chosenCell => 
            chosenCell.block == props.block &&
            chosenCell.cell == props.cell
    )

    return(

        <Grid className = "sudoku-candidates" container columns={3}>
            {candidates.map((candidate) => (
                <Grid size={1} key={candidate}>
                  {cellData?.candidates?.includes(candidate + 1) ? candidate + 1 : ""
                  }
                </Grid>
            ))}
        </Grid>
    )

}export default Candidates