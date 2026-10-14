import Box from "@mui/material/Box";
import { Camera, Undo, Undo2 } from "lucide-react";
import { useEffect, useRef } from "react";
import "./CameraScanner.css";

type CameraScannerProps = {
  goToPictureScreen: boolean;
  handlegoToPictureScreenClicked: () => void;
  handleTakePictureClicked: (
    video: HTMLVideoElement,
    guideBox: HTMLDivElement,
  ) => Promise<void>;
};

function CameraScanner(props: CameraScannerProps) {
  const guideBoxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cameraStream: MediaStream | undefined;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "environment" },
        });

        cameraStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Camera did not start:", error);
      }
    }

    startCamera();

    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <Box className="camera-screen">
      <Box className="camera-view">
        <video ref={videoRef} autoPlay playsInline muted />
        <Box ref={guideBoxRef} className="guide-box" />
      </Box>

      <Box className="camera-button-row">
        {/* 
        <Undo2
          className="icon-button undo-icon-button"
          onClick={() => props.handlegoToPictureScreenClicked()}
        />
        */}
        <Camera
          size={40}
          className="icon-button camera-icon"
          onClick={async () => {
            if (videoRef.current && guideBoxRef.current) {
              await props.handleTakePictureClicked(
                videoRef.current,
                guideBoxRef.current,
              );
            }
          }}
        />
        <Undo2 onClick={() => props.handlegoToPictureScreenClicked()}></Undo2>
      </Box>
    </Box>
  );
}

export default CameraScanner;
