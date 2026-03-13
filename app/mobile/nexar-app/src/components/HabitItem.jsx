import {useState} from "react"

export default function HabitItem({

 habit,
 onToggle,
 onDelete,
 onEdit

}){

 const [editing,setEditing] = useState(false)

 const [title,setTitle] = useState(habit.title)

 const [goal,setGoal] = useState(habit.goal)

 function save(){

  onEdit({

   ...habit,
   title,
   goal

  })

  setEditing(false)

 }

 if(editing){

  return(

   <div className="card">

    <input
     value={title}
     onChange={(e)=>setTitle(e.target.value)}
    />

    <select
     value={goal}
     onChange={(e)=>setGoal(e.target.value)}
    >

     <option value="short">Short</option>
     <option value="medium">Medium</option>
     <option value="long">Long</option>

    </select>

    <button onClick={save}>
     Save
    </button>

   </div>

  )

 }

 return(

  <div className="card">

   <h3>{habit.title}</h3>

   <p>Goal: {habit.goal}</p>

   <p>
    Created:
    {new Date(habit.createdAt).toLocaleDateString()}
   </p>

   <button onClick={()=>onToggle(habit.id)}>

    {habit.completed
     ? "Completed"
     : "Mark Complete"}

   </button>

   <button onClick={()=>setEditing(true)}>
    Edit
   </button>

   <button onClick={()=>onDelete(habit.id)}>
    Delete
   </button>

  </div>

 )

}