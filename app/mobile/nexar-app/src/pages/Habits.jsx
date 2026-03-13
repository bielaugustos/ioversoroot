import { useState, useEffect } from "react"

import HabitForm from "../components/HabitForm"
import HabitItem from "../components/HabitItem"
import { getPoints, savePoints } from "../services/appStorage"

import { getHabits, saveHabits } from "../services/habitService"

export default function Habits(){

 const [habits,setHabits] = useState([])

 const [points,setPoints] = useState(getPoints())

 useEffect(()=>{

  const storedHabits = getHabits()

  setHabits(storedHabits)

 },[])

 useEffect(()=>{

  savePoints(points)

 },[points])

 useEffect(()=>{

  saveHabits(habits)

 },[habits])


 function addHabit(habit){

  setHabits([...habits,habit])

 }


 function deleteHabit(id){

  const filtered = habits.filter(
   (h)=>h.id !== id
  )

  setHabits(filtered)

 }


 function editHabit(updatedHabit){

  const updated = habits.map((habit)=>{

   if(habit.id === updatedHabit.id){

    return updatedHabit

   }

   return habit

  })

  setHabits(updated)

 }


 function toggleHabit(id){

  const today = new Date()
   .toISOString()
   .split("T")[0]

  const updated = habits.map((habit)=>{

   if(habit.id === id){

    const completed = !habit.completed

    if(completed){

     rewardForGoal(habit.goal)

    }

    return{

     ...habit,

     completed,

     history: completed
      ? [...(habit.history || []), today]
      : habit.history

    }

   }

   return habit

  })

  setHabits(updated)

 }


 function rewardForGoal(goal){

  let reward = 10

  if(goal === "medium") reward = 25

  if(goal === "long") reward = 50

  setPoints((prev)=>prev + reward)

 }


 return(

  <div>

   <h2>Habits</h2>

   <p>Points: {points}</p>

   <HabitForm onSave={addHabit} />

   {habits.map((habit)=>(

    <HabitItem
     key={habit.id}
     habit={habit}
     onToggle={toggleHabit}
     onDelete={deleteHabit}
     onEdit={editHabit}
    />

   ))}

  </div>

 )

}