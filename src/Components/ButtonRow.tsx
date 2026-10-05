import { Button, Stack } from "@mui/material"
type ButtonRowProps = {
    handleButtonClicked: (buttonNr:number) => void
}
function ButtonRow(props: ButtonRowProps){
    const buttons = [0,1,2,3,4,5,6,7,8]
 return(
    <Stack direction={"row"}>
        {buttons.map((button) => (
            <Button key={button} onClick={() => props.handleButtonClicked(button+1)} className="button">{button + 1}</Button>
        ))}
    </Stack>
 )
} export default ButtonRow