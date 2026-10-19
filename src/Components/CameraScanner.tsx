import Box from "@mui/material/Box";
import { Camera, Flashlight, FlashlightOff, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [useFlash, setUseFlash] = useState(false);

  useEffect(() => {
    let cameraStream: MediaStream | undefined;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "environment" },
        });
        const track = stream.getVideoTracks()[0];

        try {
          const capabilities =
            track.getCapabilities() as MediaTrackCapabilities & {
              torch?: boolean;
            };

          if (capabilities.torch) {
            await track.applyConstraints({
              advanced: [{ torch: false } as MediaTrackConstraintSet],
            });

            setUseFlash(false);
          } else {
            console.log("Lommelykta er ikkje støtta.");
          }
        } catch (error) {
          console.error("Kunne ikkje slå av lommelykta:", error);
        }

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
        {useFlash ? (
          <Flashlight
            className="icon-button"
            onClick={() => handleToggleFlash()}
          />
        ) : (
          <FlashlightOff
            className="icon-button"
            onClick={() => handleToggleFlash()}
          />
        )}
      </Box>
    </Box>
  );

  async function handleToggleFlash() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks()[0];

    if (!track) return;

    const capabilities = track.getCapabilities() as MediaTrackCapabilities & {
      torch?: boolean;
    };

    if (!capabilities.torch) {
      console.log("Lommelykta er ikkje støtta.");
      return;
    }

    const newState = !useFlash;

    try {
      await track.applyConstraints({
        advanced: [{ torch: newState } as MediaTrackConstraintSet],
      });

      setUseFlash(newState);
    } catch (error) {
      console.error("Kunne ikkje endre lommelykta:", error);
    }
  }
}

export default CameraScanner;
