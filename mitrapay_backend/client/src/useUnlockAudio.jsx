import { useEffect } from "react";

const useUnlockAudio = () => {
  useEffect(() => {
    const unlockAudio = () => {
        // console.log("Unlocking audio");
      const audio = new Audio();
      audio.play().catch(() => {}); // unlocks audio
      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
  }, []);
};

export default useUnlockAudio;
