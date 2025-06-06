import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

const Registration = () => {
  const webcamRef = useRef<Webcam|null>(null);
  const [name, setName] = useState<string|null>(null);
  const [captured, setCaptured] = useState<string|null>(null);
  const [notCaptured, setNotCaptured] = useState<boolean>(false);

  const capture = useCallback(
    async () => {
      if (!webcamRef.current) return;
      if (!name) {
        setNotCaptured(true);
        return;
      }
      setNotCaptured(false);

      const imageSrc = webcamRef.current.getScreenshot();
      setCaptured(imageSrc);

      if (imageSrc && name) {
        const img = new Image();
        img.src = imageSrc;

        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error("Could not get 2D context from canvas.");
            return;
          }

          ctx.drawImage(img, 0, 0);

          canvas.toBlob(async (blob) => {
            if (!blob) {
              console.error("Failed to convert canvas to blob.");
              return;
            }

            const formData = new FormData();
            formData.append("name", name);
            formData.append("file", blob, "face.jpg");

            try {
              // Register face
              const registerResponse = await fetch("http://localhost:8000/register/", {
                method: "POST",
                body: formData,
              });

              const registerResult = await registerResponse.json();
              console.log("Registration response:", registerResult);

              // Log registration event
              const logResponse = await fetch("http://localhost:8000/log_registration/", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name,
                  timestamp: new Date().toISOString(),
                }),
              });

              const logResult = await logResponse.json();
              console.log("Log response:", logResult);
            } catch (error) {
              console.error("Registration or logging failed", error);
            }
          }, 'image/jpeg');
        };
      }
    },
    [webcamRef, name]
  );

  return (
    <div className="flex flex-col items-center justify-center p-10 gap-5">
      <h1 className="font-semibold text-2xl">
        Kindly Register your face along with your name
      </h1>
      <h2>Allow the camera permission to register</h2>
      <div className="flex flex-col w-1/2 gap-5">
        <Webcam
          audio={false}
          height={720}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={1280}
          videoConstraints={videoConstraints}
          className="rounded-xl border-black border"
        />
      </div>
      <input
        type="text"
        className="border font-semibold px-5 rounded-2xl py-3 w-1/4 in-focus:border-blue-400"
        placeholder="Enter your name"
        onChange={e => setName(e.target.value ? e.target.value : null)}
      />
      <p className={`${notCaptured ? 'inline' : 'hidden'} font-semibold text-red-500`}>Please Enter your name</p>
      <button
        onClick={capture}
        className="font-semibold text-lg border px-10 py-3 rounded-xl shadow-lg cursor-pointer hover:bg-blue-500 hover:text-white"
      >
        Register Face
      </button>
      {captured && <div className="flex flex-row w-1/2 my-3">
        <div className="flex flex-col font-semibold gap-5 w-1/2">
          <h2>The Registered Image</h2>
          <img src={captured} className="border rounded-xl" />
        </div>
        <div className="flex flex-col font-semibold items-center justify-center w-1/2">
          <p className="text-lg">Your Registered name is</p>
          <h1 className="text-3xl text-blue-600">{name}</h1>
        </div>
      </div>}
    </div>
  );
};

export default Registration;