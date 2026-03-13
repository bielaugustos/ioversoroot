const POINTS_KEY = "nex_points"
const REWARDS_KEY = "nex_rewards"

export function getPoints(){

 const stored = localStorage.getItem(POINTS_KEY)

 return stored ? JSON.parse(stored) : 0

}

export function savePoints(points){

 localStorage.setItem(
  POINTS_KEY,
  JSON.stringify(points)
 )

}

export function getRewards(){

 const stored = localStorage.getItem(REWARDS_KEY)

 return stored ? JSON.parse(stored) : []

}

export function saveRewards(rewards){

 localStorage.setItem(
  REWARDS_KEY,
  JSON.stringify(rewards)
 )

}