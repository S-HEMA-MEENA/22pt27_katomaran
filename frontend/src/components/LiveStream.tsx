import { useState } from "react";


const LiveStream = () => {

  const [members,setMembers] = useState<string[]>();

  return (
    <div className="flex flex-col p-7 h-screen gap-10">
      <div className="hidden">
        
      </div>

      <h1 className="font-semibold text-xl">Live Streaming</h1>

      <div className="flex flex-row  h-full gap-10">
        <img src="" alt="" className="border w-2/3 bg-gray-300 rounded-2xl"/>

        <div className="flex flex-col gap-5 w-1/3">
          <h1 className="font-semibold text-xl"> The People found in the image</h1>
          {members && <ul className="flex flex-col h-[40%]">
            {members.map((value,key) => {
              return <li key={key}>
                {value}
              </li>
            })}
          </ul>}
          {!members && <div className="flex flex-col h-[40%] items-center justify-center border w-full">No Members found</div>}

        </div>
      </div>
    </div>
  )
}

export default LiveStream