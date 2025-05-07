import { useRef, useState, useEffect, useCallback } from "react";
import { CaptionsOff } from "lucide-react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

type RecognizedFace = {
  name: string | null;
  confidence: number;
  timestamp: Date;
  logEntry: string;
};

const LiveStream = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recognizedFaces, setRecognizedFaces] = useState<RecognizedFace[]>([]);
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
      
      if (result.detected_faces?.length > 0) {
        const newRecognitions: RecognizedFace[] = result.detected_faces.map((face: any) => {
          const confidencePercent = Math.round(face.confidence * 100);
          const logEntry = face.name 
            ? `Detected ${face.name} with ${confidencePercent}% confidence at ${new Date().toLocaleString()}`
            : `Detected unknown person with ${confidencePercent}% confidence at ${new Date().toLocaleString()}`;
          
          return {
            name: face.name || null,
            confidence: face.confidence,
            timestamp: new Date(),
            logEntry
          };
        });

        setRecognizedFaces(prev => [...newRecognitions, ...prev].slice(0, 50));
      }

      if (canvasRef.current && result.detected_faces?.length > 0) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const video = webcamRef.current.video;
        if (!video) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        result.detected_faces.forEach((face: any) => {
          const { top, right, bottom, left } = face.location;
          const confidencePercent = Math.round(face.confidence * 100);
          
          // Draw bounding box
          ctx.strokeStyle = face.name ? "#00FF00" : "#FF0000";
          ctx.lineWidth = 2;
          ctx.strokeRect(left, top, right - left, bottom - top);
          
          // Draw name and confidence
          ctx.fillStyle = face.name ? "#00FF00" : "#FF0000";
          ctx.font = "16px Arial";
          const label = face.name ? `${face.name} (${confidencePercent}%)` : `Unknown (${confidencePercent}%)`;
          ctx.fillText(label, left, top > 20 ? top - 5 : top + 20);
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
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-xl">Live Face Recognition</h1>
        <div className="flex items-center gap-4">
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

      <div className="flex flex-row h-full gap-10 relative">
        <div className="relative w-2/3">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="border bg-gray-300 rounded-2xl border-black w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        </div>

        <div className="flex flex-col gap-5 w-1/3">
          <h1 className="font-semibold text-xl">Recognition Log</h1>
          {recognizedFaces.length > 0 ? (
            <ul className="flex flex-col gap-2 overflow-y-auto">
              {recognizedFaces.map((face, index) => (
                <li key={index} className="bg-gray-100 p-3 rounded-lg">
                  <div className="font-medium">
                    {face.name || "Unknown"} ({Math.round(face.confidence * 100)}%)
                  </div>
                  <div className="text-sm text-gray-500">
                    {face.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {face.logEntry}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col h-full items-center justify-center w-full">
              <CaptionsOff size={128} className="text-gray-400" />
              <span className="text-gray-500 mt-4">No faces recognized yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStream;