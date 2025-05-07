import { useRef, useState } from "react";
import { CaptionsOff } from "lucide-react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1080,
  height: 1080,
  facingMode: "user",
};

const LiveStream = () => {
  const webcamRef = useRef(null);
  const [members, setMembers] = useState<string[]>();

  return (
    <div className="flex flex-col p-7 h-screen gap-10">
      <div className="hidden" />

      <h1 className="font-semibold text-xl">Live Streaming</h1>

      <div className="flex flex-row  h-full gap-10">
        <Webcam
          audio={false}
          height={70}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={1280}
          videoConstraints={videoConstraints}
          className="border w-2/3 bg-gray-300 rounded-2xl border-black"
        />

        <div className="flex flex-col gap-5 w-1/3">
          <h1 className="font-semibold text-xl"> The Log Reports </h1>
          {members &&
            <ul className="flex flex-col">
              {members.map((value, key) => {
                return (
                  <li key={key}>
                    {value}
                  </li>
                );
              })}
            </ul>}
          {!members &&
            <div className="flex flex-col h-full items-center my-50 w-full">
              <CaptionsOff size={128} className="text-gray-400" />No Logs
              Available
            </div>}
        </div>
      </div>
    </div>
  );
};

export default LiveStream;
