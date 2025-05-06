import { useEffect, useRef, useState } from 'react'
import { IoSend } from "react-icons/io5";


const MyCard = ({message}) => {

  return <div className='flex flex-row items-end justify-end py-3 w-full'>
    <div className='flex flex-col rounded-l-2xl rounded-br-2xl bg-blue-600 py-3 px-5 font-semibold text-lg text-white max-w-[80%]'>
      {message}
    </div>
  </div>

}

const AICard = ({ message }) => {
  return (
    <div className="flex flex-row items-start justify-start py-3 w-full">
      <div className="flex flex-col rounded-r-2xl rounded-bl-2xl bg-slate-200 py-3 px-5 font-semibold text-lg text-black max-w-[80%]">
        {message}
      </div>
    </div>
  );
};




const Chat = () => {

  const textRef = useRef(null);

  const [current,setCurrent] = useState<string>("");
  const [messages,setMessages] = useState<string[]>([]);
  const [generation,setGeneration] = useState();



  const sendMessage = () => {

    if(!textRef || !textRef.current) return;

    setMessages(prev => [...prev,current])
    textRef.current.value = ""


  }


  useEffect(() => {
    console.log(messages);
  },messages)


  return <div className="flex flex-col items-center w-full border h-screen px-[25%]">
      <h1 className="h-[10%] font-semibold text-3xl p-7">
        {" "}The Chat Interface
      </h1>
      <div className="flex flex-col h-[80%] w-full overflow-auto scroll-auto">
        <MyCard message={"This is a sample message" } />
        <AICard message={"Oh That was a sample message. Here is what a brief description is all about. How would a sample message be an actual message, if actual message was a sample message." }/>
        <MyCard message={"This is a sample message" } />
        <AICard message={"Oh That was a sample message. Here is what a brief description is all about. How would a sample message be an actual message, if actual message was a sample message." }/>
        <MyCard message={"This is a sample message" } />
        <AICard message={"Oh That was a sample message. Here is what a brief description is all about. How would a sample message be an actual message, if actual message was a sample message." }/>
        <MyCard message={"This is a sample message" } />
        <AICard message={"Oh That was a sample message. Here is what a brief description is all about. How would a sample message be an actual message, if actual message was a sample message." }/>
      </div>
      <div className="flex flex-row w-full h-[15%] p-5 gap-5 ">
        <textarea ref={textRef} className="border rounded-2xl w-full h-full py-3 px-4 font-semibold resize-none" rows={3} placeholder="Write a prompt" onChange={e => setCurrent(e.target.value ? e.target.value : null)}/>
        <button className="flex h-15 w-17 rounded-2xl items-center bg-blue-600 justify-center border cursor-pointer" onClick={sendMessage}>
          <IoSend size={28} className="text-white" />
        </button>
      </div>
    </div>;
}

export default Chat