import { useEffect, useState } from "react";
import { getRewards, saveRewards } from "../services/appStorage";

export default function RewardStore({points,setPoints}){

 const rewards = [
  {name:"New Theme",cost:100},
  {name:"Advanced Stats",cost:200},
  {name:"Focus Mode",cost:300}
 ];

 const [unlocked,setUnlocked] = useState(getRewards());

useEffect(()=>{

 saveRewards(unlocked)

},[unlocked])

 function unlockReward(reward){

  if(points < reward.cost){
   alert("Not enough points");
   return;
  }

  setPoints(points - reward.cost);

  setUnlocked([...unlocked,reward.name]);

 }

 return(

  <div>

   <h3>Reward Store</h3>

   {rewards.map((reward,index)=>{

    const isUnlocked = unlocked.includes(reward.name);

    return(

     <div key={index} className="card">

      <p>{reward.name}</p>

      <p>Cost: {reward.cost}</p>

      {isUnlocked ? (
       <p>Unlocked</p>
      ) : (
       <button onClick={()=>unlockReward(reward)}>
        Unlock
       </button>
      )}

     </div>

    )

   })}

  </div>

 )

}