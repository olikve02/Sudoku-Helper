import { Box, Button, Stack } from '@mui/material'
import Board from './Components/Board'
import ButtonRow from './Components/ButtonRow'
import { useState } from 'react'

function App() {
    const [chosenCells, setChosenCells] = useState<{block: number, cell: number, candidates: number[]}[]>([])
    
  return (
    <Box className = "screen-container">
        <Board 
          chosenCells = {chosenCells} 
          handleCellClicked = {handleCellClicked}
          >
            
        </Board>

        <ButtonRow 
        handleButtonClicked={handleButtonClicked}>
        </ButtonRow>
    </Box>
  )



 function handleCellClicked(block: any, cell: any){

        const cellAlreadyClicked = chosenCells.some((cellArray) => block == cellArray.block && cell == cellArray.cell)
        if(cellAlreadyClicked){
            setChosenCells(chosenCells.filter((cellArray) => block != cellArray.block || cell != cellArray.cell))
        }else{
            setChosenCells([...chosenCells, {block: block, cell: cell, candidates: []}])
        }        
    }


  function handleButtonClicked(buttonNr: number){
    const newCandidates = chosenCells.map((cell) => (
      {block: cell.block, cell: cell.cell, candidates: cell.candidates.push(buttonNr)}
      
    ))

    console.log(newCandidates)

  }
}

export default App
