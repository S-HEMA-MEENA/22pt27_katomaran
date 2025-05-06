import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "@/components/Home";
import Registration from "@/components/Registration";
import LiveStream from "@/components/LiveStream";
import Chat from "@/components/Chat";




const App = () => {
  return <BrowserRouter>
  
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/registration" element={<Registration />}/>
      <Route path="/live" element={<LiveStream />}/>
      <Route path="/chat" element={<Chat/>}/>
    </Routes>

  </BrowserRouter>
}

export default App;
