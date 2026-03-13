import { BrowserRouter,Routes,Route } from "react-router-dom";

import Home from "./pages/Home";
import Habits from "./pages/Habits";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import Navebar from "./components/Navebar";
import Chat from "./pages/Chat";

export default function App(){

 return(

  <BrowserRouter>

   <div className="app">

    <h1>NEX</h1>

    <Routes>

     <Route path="/" element={<Home/>} />

     <Route path="/habits" element={<Habits/>} />

     <Route path="/rewards" element={<Rewards/>} />

     <Route path="/profile" element={<Profile/>} />

     <Route path="/chat" element={<Chat/>} />

    </Routes>

    <Navebar />

   </div>

  </BrowserRouter>

 )

}