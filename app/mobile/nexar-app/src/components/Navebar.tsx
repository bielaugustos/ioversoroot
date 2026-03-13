import { Link } from "react-router-dom";

export default function Navebar(){

 return(

  <nav className="navebar">

   <Link to="/">Home</Link>

   <Link to="/habits">Habits</Link>

   <Link to="/rewards">Rewards</Link>

   <Link to="/profile">Profile</Link>

   <Link to="/chat">Mentor</Link>

  </nav>

 )

}