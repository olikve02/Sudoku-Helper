import Box from "@mui/material/Box";
import { ArrowLeft, Flashlight, FlashlightOff, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import "./CameraScanner.css";

// Venter til nettleseren har tegnet skjermen. Den første requestAnimationFrame
// kjører rett før neste tegning, den andre rett etter at den er ferdig.
// Er siden skjult, tegnes ingenting, så da gir vi opp etter 100 ms
const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    setTimeout(resolve, 100);
  });

type CameraScannerProps = {
  onCapture: (
    video: HTMLVideoElement,
    guideBox: HTMLDivElement,
  ) => Promise<void>;
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
  const [torchSupported, setTorchSupported] = useState(false);
  const [scanning, setScanning] = useState(false);

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
            setTorchSupported(true);
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

        {/* Søkeramme med hjørner. Området utenfor blir mørkere */}
        <Box ref={guideBoxRef} className="guide-box">
          <span className="corner top-left" />
          <span className="corner top-right" />
          <span className="corner bottom-left" />
          <span className="corner bottom-right" />
        </Box>

        {scanning && (
          <Box className="scanning-overlay">
            <LoaderCircle className="spinner" size={36} />
            Leser brettet…
          </Box>
        )}
      </Box>

      <p className="camera-hint">Hold sudokubrettet innenfor rammen</p>

      <Box className="camera-controls">
        <button className="camera-round-button" onClick={onBack} aria-label="Tilbake">
          <ArrowLeft size={24} />
        </button>

        <button
          className="shutter-button"
          onClick={capture}
          disabled={scanning}
          aria-label="Ta bilde"
        />

        {/* Lommelykt bare på telefoner som støtter det. Tom plass ellers,
            så utløserknappen holder seg i midten */}
        {torchSupported ? (
          <button
            className={`camera-round-button ${flashOn ? "active" : ""}`}
            onClick={toggleFlash}
            aria-label={flashOn ? "Slå av lommelykt" : "Slå på lommelykt"}
          >
            {flashOn ? <Flashlight size={24} /> : <FlashlightOff size={24} />}
          </button>
        ) : (
          <span className="camera-round-placeholder" />
        )}
      </Box>
    </Box>
  );

  async function capture() {
    if (!videoRef.current || !guideBoxRef.current) return;

    // Vis "Leser brettet…" og vent til nettleseren faktisk har tegnet det.
    // Bildebehandlingen etterpå blokkerer siden helt til den er ferdig, så uten
    // denne ventingen rekker ikke overlayet å vises før skjermen byttes
    flushSync(() => setScanning(true));
    await waitForPaint();

    try {
      await onCapture(videoRef.current, guideBoxRef.current);
    } finally {
      setScanning(false);
    }
  }

  async function toggleFlash() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks()[0];
    if (!track) return;

    try {
      await track.applyConstraints(torchConstraint(!flashOn));
      setFlashOn(!flashOn);
    } catch (error) {
      console.error("Kunne ikke endre lommelykta:", error);
    }
  }
}

export default CameraScanner;
