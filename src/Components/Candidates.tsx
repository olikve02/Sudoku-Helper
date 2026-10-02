import Grid from "@mui/material/Grid"
import '../App.css'
import { useState } from "react"
function Candidates(props){

    const candidates = [0,1,2,3,4,5,6,7,8]
    const [showCandidate, setShowCandidate] = useState(false)
    const [shownCantidates, setShownCandidates] = useState<{block: number, cell: number, candidates: Array<number>}[]>()

    return(

        <Grid className = "sudoku-candidates" container columns={3}>
            {candidates.map((candidate) => (
                <Grid key={candidate}></Grid>
            ))}
        </Grid>
    )

    function showCandidateForCell(chosenCells, setChosenCells, newCandidate){
        
    }

}export default Candidates