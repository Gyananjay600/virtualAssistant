import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
export const userDataContext=createContext()
function UserContext({children}) {
    const serverUrl="http://localhost:8000"
    const [userData,setUserData]=useState(null)
    const [loading,setLoading]=useState(true)
    const [frontendImage,setFrontendImage]=useState(null)
    const [backendImage,setBackendImage]=useState(null)
    const [selectedImage,setSelectedImage]=useState(null)

    const handleCurrentUser=async ()=>{
        try {
            const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
            setUserData(result.data)
            console.log("Current user:", result.data)
        } catch (error) {
            console.log("User not logged in or session expired")
            setUserData(null)
        } finally {
            setLoading(false)
        }
    }

    const getGeminiResponse=async (command)=>{
        try {
            const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
            return result.data
        } catch (error) {
            console.error("Gemini response error:", error)
            return {
                type: "general",
                userInput: command,
                response: error.response?.data?.response || "Sorry, I am having trouble connecting to the server right now."
            }
        }
    }

    useEffect(()=>{
        handleCurrentUser()
    },[])

    const value={
        serverUrl,
        userData,
        setUserData,
        loading,
        setLoading,
        backendImage,
        setBackendImage,
        frontendImage,
        setFrontendImage,
        selectedImage,
        setSelectedImage,
        getGeminiResponse,
        handleCurrentUser
    }

    return (
        <userDataContext.Provider value={value}>
            {children}
        </userDataContext.Provider>
    )
}

export default UserContext
