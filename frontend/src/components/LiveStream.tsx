import { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 640,
  height: 360,
  facingMode: "user",
};

const LiveStream = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processing, setProcessing] = useState(false);
  const [frameRate, setFrameRate] = useState(2);
  const [knownFaces, setKnownFaces] = useState<{name: string, encoding: number[]}[]>([]);

  useEffect(() => {
    const fetchKnownFaces = async () => {
      try {
        const response = await fetch("http://localhost:8000/faces/");
        const data = await response.json();
        setKnownFaces(data.data.map((face: any) => ({
          name: face.name,
          encoding: JSON.parse(face.face_encoding)
        })));
      } catch (error) {
        console.error("Error fetching known faces:", error);
      }
    };
    fetchKnownFaces();
  }, []);

  const processFrame = useCallback(async () => {
    if (!webcamRef.current || processing || !knownFaces.length) return;

    setProcessing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // Load the screenshot image to get its dimensions
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const screenshotWidth = img.width;
      const screenshotHeight = img.height;

      const response = await fetch("http://localhost:8000/recognize/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageSrc.split(',')[1],
          known_faces: knownFaces
        }),
      });

      const result = await response.json();

      if (canvasRef.current && result.detected_faces?.length > 0) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const video = webcamRef.current.video;
        if (!video) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Calculate scaling factors
        const scaleX = canvas.width / screenshotWidth;
        const scaleY = canvas.height / screenshotHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        result.detected_faces.forEach((face: any) => {
          const { top, right, bottom, left } = face.location;
          const confidencePercent = Math.round(face.confidence * 100);

          // Scale coordinates
          const scaledLeft = left * scaleX;
          const scaledTop = top * scaleY;
          const scaledRight = right * scaleX;
          const scaledBottom = bottom * scaleY;

          // Add padding after scaling
          const padding = 10;
          const adjustedLeft = scaledLeft - padding;
          const adjustedTop = scaledTop - padding;
          const adjustedWidth = (scaledRight - scaledLeft) + 2 * padding;
          const adjustedHeight = (scaledBottom - scaledTop) + 2 * padding;

          // Draw bounding box
          ctx.strokeStyle = face.name ? "#00FF00" : "#FF0000";
          ctx.lineWidth = 2;
          ctx.strokeRect(adjustedLeft, adjustedTop, adjustedWidth, adjustedHeight);

          // Draw name and confidence
          ctx.fillStyle = face.name ? "#00FF00" : "#FF0000";
          ctx.font = "16px Arial";
          const label = face.name ? `${face.name} (${confidencePercent}%)` : `Unknown (${confidencePercent}%)`;
          ctx.fillText(label, adjustedLeft, adjustedTop > 20 ? adjustedTop - 5 : adjustedTop + 20);
        });
      }
    } catch (error) {
      console.error("Face recognition error:", error);
    } finally {
      setProcessing(false);
    }
  }, [processing, knownFaces]);

  useEffect(() => {
    const interval = setInterval(processFrame, 1000 / frameRate);
    return () => clearInterval(interval);
  }, [processFrame, frameRate]);

  return (
    <div className="flex flex-col p-7 h-screen gap-10">
      <div className="flex flex-col items-center">
        <h1 className="font-semibold text-xl text-center">Live Face Recognition</h1>
        <div className="flex items-center gap-4 mt-2">
          <span>Frame Rate: {frameRate}fps</span>
          <input
            type="range"
            min="1"
            max="10"
            value={frameRate}
            onChange={(e) => setFrameRate(Number(e.target.value))}
            className="w-32"
          />
        </div>
      </div>

      <div className="relative w-2/3 mx-auto">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="border bg-gray-300 rounded-2xl border-black w-full h-auto object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>
    </div>
  );
};

export default LiveStream;