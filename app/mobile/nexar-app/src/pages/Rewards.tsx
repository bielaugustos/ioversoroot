import { useState } from "react";
import RewardStore from "../components/RewardStore";

export default function Rewards(){

 const [points,setPoints] = useState(150);

 return(

  <div>

   <h2>Rewards</h2>

   <p>Your Points: {points}</p>

   <RewardStore
    points={points}
    setPoints={setPoints}
   />

  </div>

 )

}