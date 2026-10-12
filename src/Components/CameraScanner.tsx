import Box from "@mui/material/Box";
import { Camera } from "lucide-react";
import { useEffect, useRef } from "react";

type CameraScannerProps = {
  goToPictureScreen: boolean;
  handlegoToPictureScreenClicked: () => void;
};

function CameraScanner(props: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    let cameraStream: MediaStream | undefined;

    async function startCamera() {
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
      } catch (error) {
        console.log("Camera didnt start: " + error);
      }
    }
    startCamera();
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  return (
    <Box>
      <Camera
        className={`icon-button ${props.goToPictureScreen ? "selected " : ""}`}
        onClick={() => {
          props.handlegoToPictureScreenClicked();
        }}
      />
      <video ref={videoRef} autoPlay playsInline muted></video>
    </Box>
  );

  function takePicture() {}
}
export default CameraScanner;
