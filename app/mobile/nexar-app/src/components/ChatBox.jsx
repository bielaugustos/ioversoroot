import { useState } from "react";

export default function ChatBox(){

 const [messages,setMessages] = useState([
  {role:"ai",text:"Hello. I'm your mentor."}
 ]);

 const [input,setInput] = useState("");

 function sendMessage(){

  if(input === "") return;

  const newMessages = [
   ...messages,
   {role:"user",text:input}
  ];

  setMessages(newMessages);

  setInput("");

  simulateAI(newMessages);

 }

 function simulateAI(history){

  setTimeout(()=>{

   const reply = {
    role:"ai",
    text:"Keep building small habits."
   };

   setMessages([...history,reply]);

  },800);

 }

 return(

  <div className="chat">

   <div className="chat-messages">

    {messages.map((msg,index)=>(

     <div
      key={index}
      className={
       msg.role === "user"
        ? "message user"
        : "message ai"
      }
     >
      {msg.text}
     </div>

    ))}

   </div>

   <div className="chat-input">

    <input
     value={input}
     onChange={(e)=>setInput(e.target.value)}
     placeholder="Write a message..."
    />

    <button onClick={sendMessage}>
     Send
    </button>

   </div>

  </div>

 )

}