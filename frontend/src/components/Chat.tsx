import { useEffect, useRef, useState } from 'react';

interface Message {
  text: string;
  isUser: boolean;
  image?: string | null;
  graph?: string | null;
}

const MyCard = ({ message }: { message: Message }) => {
  return (
    <div className='flex flex-row items-end justify-end py-3 w-full'>
      <div className='flex flex-col rounded-l-2xl rounded-br-2xl bg-blue-600 py-3 px-5 font-semibold text-lg text-white max-w-[80%]'>
        {message.text}
      </div>
    </div>
  );
};

const AICard = ({ message }: { message: Message }) => {
  return (
    <div className="flex flex-row items-start justify-start py-3 w-full">
      <div className="flex flex-col rounded-r-2xl rounded-bl-2xl bg-slate-200 py-3 px-5 font-semibold text-lg text-black max-w-[80%]">
        {message.text.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
        {message.image && (
          <img src={message.image} alt="Face data" className="mt-2 max-w-[200px] rounded" />
        )}
        {message.graph && (
          <img src={message.graph} alt="Graph" className="mt-2 max-w-[400px] rounded" />
        )}
      </div>
    </div>
  );
};

const Chat = () => {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!textRef.current || !current) return;

    const userMessage: Message = { text: current, isUser: true, image: null, graph: null };
    setMessages(prev => [...prev, userMessage]);
    textRef.current.value = "";
    setCurrent("");

    try {
      const response = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: current })
      });
      const data = await response.json();
      const aiMessage: Message = {
        text: data.text,
        isUser: false,
        image: data.image,
        graph: data.graph
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat request failed:", error);
      setMessages(prev => [...prev, { text: "Error: Failed to process query", isUser: false, image: null, graph: null }]);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const userMessage: Message = { text: "Searching for person in uploaded image...", isUser: true, image: null, graph: null };
    setMessages(prev => [...prev, userMessage]);

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch("http://localhost:8000/search_person/", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      const aiMessage: Message = {
        text: data.text,
        isUser: false,
        image: data.image,
        graph: null
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Image search failed:", error);
      setMessages(prev => [...prev, { text: "Error: Failed to process image search", isUser: false, image: null, graph: null }]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col items-center w-full border h-screen px-[10%]">
      <h1 className="h-[10%] font-semibold text-3xl p-7">
        The Chat Interface
      </h1>
      <div className="flex flex-col h-[75%] w-full overflow-auto scroll-auto">
        {messages.map((message, index) => (
          message.isUser ? <MyCard key={index} message={message} /> : <AICard key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex flex-row items-center w-full h-[15%] p-5 gap-3 bg-white rounded-2xl shadow-md">
        <button
          className="flex h-10 w-10 rounded-full items-center justify-center border border-gray-300 cursor-pointer text-gray-700 hover:bg-gray-100"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-xl">+</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <textarea
          ref={textRef}
          className="border rounded-2xl w-full h-12 py-3 px-4 font-semibold resize-none bg-gray-100 text-black placeholder-gray-500"
          rows={1}
          placeholder="Write a prompt (e.g., 'Who was the last person registered? and Show face data for Aklamaash')"
          onChange={e => setCurrent(e.target.value)}
        />
        <button
          className="flex h-10 w-10 rounded-full items-center justify-center border border-gray-300 cursor-pointer text-gray-700 hover:bg-gray-100"
          onClick={sendMessage}
        >
          <span className="text-xl">↑</span>
        </button>
      </div>
    </div>
  );
};

export default Chat;