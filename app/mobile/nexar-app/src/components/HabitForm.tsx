import {useState} from "react"

export default function HabitForm({onSave}){

 const [title,setTitle] = useState("")
 const [goal,setGoal] = useState("short")

 function submit(e){

  e.preventDefault()

  if(!title.trim()) return

  const habit = {

   id:Date.now(),

   title,

   goal,

   createdAt:new Date().toISOString(),

   completed:false

  }

  onSave(habit)

  setTitle("")

 }

 return(

  <form onSubmit={submit} className="card">

   <h3>New Habit</h3>

   <input
    value={title}
    onChange={(e)=>setTitle(e.target.value)}
    placeholder="Habit name"
   />

   <select
    value={goal}
    onChange={(e)=>setGoal(e.target.value)}
   >

    <option value="short">
     Short Term
    </option>

    <option value="medium">
     Medium Term
    </option>

    <option value="long">
     Long Term
    </option>

   </select>

   <button type="submit">
    Create Habit
   </button>

  </form>

 )

}