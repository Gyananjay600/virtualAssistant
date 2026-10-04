 import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"
 export const getCurrentUser=async (req,res)=>{
    try {
        const userId=req.userId
        const user=await User.findById(userId).select("-password")
        if(!user){
return res.status(400).json({message:"user not found"})
        }

   return res.status(200).json(user)     
    } catch (error) {
       return res.status(400).json({message:"get current user error"}) 
    }
}

export const updateAssistant=async (req,res)=>{
   try {
      const {assistantName,imageUrl}=req.body
      let assistantImage;
if(req.file){
   assistantImage=await uploadOnCloudinary(req.file.path)
}else{
   assistantImage=imageUrl
}

const user=await User.findByIdAndUpdate(req.userId,{
   assistantName,assistantImage
},{new:true}).select("-password")
return res.status(200).json(user)

      
   } catch (error) {
       return res.status(400).json({message:"updateAssistantError user error"}) 
   }
}


export const askToAssistant=async (req,res)=>{
   try {
      const {command}=req.body
      if (!command) {
         return res.status(400).json({ response: "Command is required." })
      }
      const user=await User.findById(req.userId);
      if (!user) {
         return res.status(404).json({ response: "User not found." })
      }
      user.history.push(command)
      await user.save()
      const userName=user.name || "User"
      const assistantName=user.assistantName || "Assistant"
      const result=await geminiResponse(command,assistantName,userName)

      if (!result) {
         return res.status(500).json({ response: "Sorry, I am unable to connect right now." })
      }

      const jsonMatch=result.match(/{[\s\S]*}/)
      if(!jsonMatch){
         return res.status(400).json({response:"Sorry, I couldn't understand that."})
      }
      let gemResult;
      try {
         gemResult = JSON.parse(jsonMatch[0])
      } catch (parseErr) {
         console.error("JSON parse error:", parseErr)
         return res.status(400).json({ response: "Sorry, could not parse assistant response." })
      }
      console.log(gemResult)
      const type = gemResult.type || 'general'
      const userInput = gemResult.userInput || gemResult.userinput || command
      const spokenResponse = gemResult.response || "Here's what I found."

      switch(type){
         case 'get-date' :
            return res.json({
               type,
               userInput,
               response:`Current date is ${moment().format("YYYY-MM-DD")}`
            });
         case 'get-time':
            return res.json({
               type,
               userInput,
               response:`Current time is ${moment().format("hh:mm A")}`
            });
         case 'get-day':
            return res.json({
               type,
               userInput,
               response:`Today is ${moment().format("dddd")}`
            });
         case 'get-month':
            return res.json({
               type,
               userInput,
               response:`Current month is ${moment().format("MMMM")}`
            });
         case 'google-search':
         case 'youtube-search':
         case 'youtube-play':
         case 'general':
         case "calculator-open":
         case "instagram-open": 
         case "facebook-open": 
         case "weather-show" :
            return res.json({
               type,
               userInput,
               response: spokenResponse,
            });

         default:
            return res.status(200).json({ 
               type: 'general',
               userInput,
               response: spokenResponse 
            })
      }
     

   } catch (error) {
      console.error("askToAssistant error:", error)
      return res.status(500).json({ response: "Assistant processing error." })
   }
}