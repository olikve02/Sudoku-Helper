import { useEffect, useState } from "react";

export default function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function restart() {
    setSeconds(0);
    setRunning(true);
  }
  function stop() {
    setRunning(false);
  }

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;

    const mm = minutes.toString().padStart(2, "0");
    const ss = seconds.toString().padStart(2, "0");

    return `${mm}:${ss}`;
  }

  return { seconds, restart, stop, formatTime, time: formatTime(seconds) };
}
