import { useNavigate } from 'react-router-dom';


type optionType = {
  title:string,
  link:string
}


const options:optionType[] = [
  {
    title: "Registration Tab",
    link: "/registration",
  },
  {
    title: "Live Streaming",
    link: "/live",
  },
  {
    title: "Chat using RAG",
    link: "/chat",
  },
];




const Home = () => {
  const navigate = useNavigate()
  return (
    <div className='flex flex-col items-center justify-center h-screen gap-10'>
      <h1>This is the Home Page</h1>

      <div className='flex flex-col gap-5 w-1/2'>
        {options.map((value,key) => {
          return <button key={key} onClick={() => navigate(value.link)} className='border px-10 shadow-md text-lg font-semibold py-5 rounded-xl hover:bg-blue-500 hover:cursor-pointer hover:text-white'>
            {value.title}
          </button>
        })}
      </div>
    </div>
  )
}

export default Home