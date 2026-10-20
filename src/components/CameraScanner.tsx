import Box from "@mui/material/Box";
import { Camera, Flashlight, FlashlightOff, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./CameraScanner.css";

type CameraScannerProps = {
  onCapture: (video: HTMLVideoElement, guideBox: HTMLDivElement) => Promise<void>;
  onBack: () => void;
};

// Lommelykt (torch) er ikke med i TypeScript sine standardtyper ennå
type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };
const torchConstraint = (on: boolean) => ({
  advanced: [{ torch: on } as MediaTrackConstraintSet],
});

function CameraScanner({ onCapture, onBack }: CameraScannerProps) {
  const guideBoxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [flashOn, setFlashOn] = useState(false);

  // Start bakkameraet når skjermen vises, og stopp det når den lukkes
  useEffect(() => {
    let cameraStream: MediaStream | undefined;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          // Be om høy oppløsning. Uten dette gir mange telefoner bare 640×480
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        cameraStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Sørg for at lommelykta starter avslått. Egen try, så kameraet virker
        // selv om nettleseren ikke støtter getCapabilities
        try {
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities() as TorchCapabilities;
          if (capabilities.torch) {
            await track.applyConstraints(torchConstraint(false));
            setFlashOn(false);
          }
        } catch (error) {
          console.error("Kunne ikke slå av lommelykta:", error);
        }
      } catch (error) {
        console.error("Kameraet startet ikke:", error);
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
        <Camera
          size={40}
          className="icon-button camera-icon"
          onClick={async () => {
            if (videoRef.current && guideBoxRef.current) {
              await onCapture(videoRef.current, guideBoxRef.current);
            }
          }}
        />
        <Undo2 onClick={onBack} />
        {flashOn ? (
          <Flashlight className="icon-button" onClick={toggleFlash} />
        ) : (
          <FlashlightOff className="icon-button" onClick={toggleFlash} />
        )}
      </Box>
    </Box>
  );

  async function toggleFlash() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks()[0];
    if (!track) return;

    const capabilities = track.getCapabilities() as TorchCapabilities;
    if (!capabilities.torch) {
      console.log("Lommelykt støttes ikke på denne enheten.");
      return;
    }

    try {
      await track.applyConstraints(torchConstraint(!flashOn));
      setFlashOn(!flashOn);
    } catch (error) {
      console.error("Kunne ikke endre lommelykta:", error);
    }
  }
}

export default CameraScanner;
