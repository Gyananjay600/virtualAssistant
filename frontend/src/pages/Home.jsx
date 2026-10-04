import React, { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import { 
  IoSparkles, 
  IoSearch, 
  IoLogoYoutube, 
  IoCloudyNightOutline, 
  IoCalculatorOutline, 
  IoVolumeHighOutline,
  IoMic,
  IoMicOff
} from "react-icons/io5";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const [processing, setProcessing] = useState(false)
  const [ham, setHam] = useState(false)

  const isSpeakingRef = useRef(false)
  const isBusyRef = useRef(false)
  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const shouldListenRef = useRef(true)
  const silenceTimerRef = useRef(null)
  const lastProcessedRef = useRef("")
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

  const handleLogOut = async () => {
    try {
      shouldListenRef.current = false
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch (_) {}
      }
      if (synth) synth.cancel()
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
      navigate("/signin")
    }
  }

  const stopRecognition = useCallback(() => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.abort()
    } catch (_) {}
    isRecognizingRef.current = false
    setListening(false)
  }, [])

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || !shouldListenRef.current) return
    if (isSpeakingRef.current || isBusyRef.current || isRecognizingRef.current) return

    try {
      recognitionRef.current.start()
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.warn("Recognition start info:", error)
      }
    }
  }, [])

  const speak = useCallback((text) => {
    if (!synth || !text) {
      isSpeakingRef.current = false
      isBusyRef.current = false
      setProcessing(false)
      if (shouldListenRef.current) {
        setTimeout(startRecognition, 500)
      }
      return
    }

    try {
      synth.cancel()
    } catch (_) {}

    stopRecognition()
    isSpeakingRef.current = true
    isBusyRef.current = true

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = navigator.language || 'en-US'
    const voices = synth.getVoices()
    const preferredVoice = voices.find(v => v.lang.includes('en') || v.lang.includes('hi')) || voices[0]
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    const onSpeechEnd = () => {
      isSpeakingRef.current = false
      isBusyRef.current = false
      setProcessing(false)
      if (shouldListenRef.current) {
        setTimeout(() => {
          if (!isBusyRef.current && !isSpeakingRef.current) {
            startRecognition()
          }
        }, 700)
      }
    }

    utterance.onend = onSpeechEnd
    utterance.onerror = onSpeechEnd

    synth.speak(utterance)
  }, [synth, startRecognition, stopRecognition])

  const handleCommand = useCallback((data) => {
    if (!data) return
    const { type, userInput, response } = data
    
    if (response) {
      speak(response)
    } else {
      isBusyRef.current = false
      setProcessing(false)
      if (shouldListenRef.current) setTimeout(startRecognition, 500)
    }
    
    if (type === 'google-search' && userInput) {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.google.com/search?q=${query}`, '_blank')
    } else if (type === 'calculator-open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank')
    } else if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank')
    } else if (type === "facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank')
    } else if (type === "weather-show") {
      const query = encodeURIComponent(userInput ? `weather ${userInput}` : 'weather')
      window.open(`https://www.google.com/search?q=${query}`, '_blank')
    } else if ((type === 'youtube-search' || type === 'youtube-play') && userInput) {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank')
    }
  }, [speak, startRecognition])

  const processQuery = useCallback(async (queryText) => {
    if (!queryText || !queryText.trim()) return
    const cleanText = queryText.trim()

    if (isBusyRef.current || isSpeakingRef.current) return
    if (lastProcessedRef.current === cleanText.toLowerCase()) return

    lastProcessedRef.current = cleanText.toLowerCase()
    setTimeout(() => {
      lastProcessedRef.current = ""
    }, 4000)

    isBusyRef.current = true
    setProcessing(true)
    setUserText(cleanText)
    setAiText("")
    stopRecognition()

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

    let cleanPrompt = cleanText
    const asstName = userData?.assistantName?.toLowerCase()
    if (asstName && cleanPrompt.toLowerCase().startsWith(asstName)) {
      cleanPrompt = cleanPrompt.slice(asstName.length).replace(/^[,.\s]+/, '') || cleanPrompt
    }

    try {
      const data = await getGeminiResponse(cleanPrompt)
      if (data) {
        setAiText(data.response || "Task completed.")
        handleCommand(data)
        if (userData) {
          setUserData(prev => prev ? ({
            ...prev,
            history: [...(prev.history || []), cleanText]
          }) : prev)
        }
      } else {
        isBusyRef.current = false
        setProcessing(false)
        if (shouldListenRef.current) setTimeout(startRecognition, 500)
      }
    } catch (e) {
      console.error("Error processing query:", e)
      const errReply = "I am ready. What can I do for you?"
      setAiText(errReply)
      speak(errReply)
    }
  }, [getGeminiResponse, handleCommand, stopRecognition, startRecognition, userData, setUserData, speak])

  const handleVoiceToggle = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      }
    } catch (err) {
      console.warn("Microphone access prompt:", err)
    }

    if (synth && synth.speaking) {
      synth.cancel()
      isSpeakingRef.current = false
      isBusyRef.current = false
      setProcessing(false)
    }

    if (listening) {
      shouldListenRef.current = false
      stopRecognition()
    } else {
      shouldListenRef.current = true
      isBusyRef.current = false
      isSpeakingRef.current = false
      setProcessing(false)
      stopRecognition()
      setTimeout(startRecognition, 200)
    }
  }

  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' 
      ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
      : null

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-US'

    recognitionRef.current = recognition
    let isMounted = true

    recognition.onstart = () => {
      isRecognizingRef.current = true
      setListening(true)
    }

    recognition.onresult = (e) => {
      if (isBusyRef.current || isSpeakingRef.current) return

      let interim = ''
      let final = ''

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript
        if (e.results[i].isFinal) {
          final += text
        } else {
          interim += text
        }
      }

      const heard = (final || interim).trim()
      if (heard && !isBusyRef.current && !isSpeakingRef.current) {
        setUserText(heard)
      }

      if (final.trim()) {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        const spoken = final.trim()
        processQuery(spoken)
      } else if (interim.trim()) {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(() => {
          if (!isBusyRef.current && !isSpeakingRef.current) {
            processQuery(interim.trim())
          }
        }, 1300)
      }
    }

    recognition.onend = () => {
      isRecognizingRef.current = false
      setListening(false)

      if (isMounted && shouldListenRef.current && !isSpeakingRef.current && !isBusyRef.current) {
        setTimeout(() => {
          if (isMounted && shouldListenRef.current && !isSpeakingRef.current && !isBusyRef.current) {
            try {
              recognition.start()
            } catch (err) {
              if (err.name !== "InvalidStateError") console.warn(err)
            }
          }
        }, 300)
      }
    }

    recognition.onerror = (event) => {
      isRecognizingRef.current = false
      setListening(false)

      if (event.error === 'no-speech') {
        if (isMounted && shouldListenRef.current && !isSpeakingRef.current && !isBusyRef.current) {
          setTimeout(() => {
            if (isMounted && shouldListenRef.current && !isSpeakingRef.current && !isBusyRef.current) {
              try { recognition.start() } catch (_) {}
            }
          }, 300)
        }
      } else if (event.error === 'not-allowed') {
        console.warn("Microphone access denied.")
      } else if (event.error !== 'aborted') {
        if (isMounted && shouldListenRef.current && !isSpeakingRef.current && !isBusyRef.current) {
          setTimeout(() => {
            if (isMounted && shouldListenRef.current && !isSpeakingRef.current && !isBusyRef.current) {
              try { recognition.start() } catch (_) {}
            }
          }, 500)
        }
      }
    }

    const startTimer = setTimeout(() => {
      if (isMounted && shouldListenRef.current) {
        try {
          recognition.start()
        } catch (_) {}
      }
    }, 600)

    return () => {
      isMounted = false
      clearTimeout(startTimer)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      try {
        recognition.abort()
      } catch (_) {}
      isRecognizingRef.current = false
      setListening(false)
    }
  }, [processQuery])

  return (
    <div 
      className='w-full h-screen overflow-hidden flex flex-col justify-between p-3 sm:p-5 select-none text-white relative'
      style={{
        backgroundColor: '#030712',
        backgroundImage: 'radial-gradient(circle at 50% 15%, #0f172a 0%, #030712 65%, #000000 100%)'
      }}
    >
      {/* Top Header Navigation */}
      <div className='w-full flex items-center justify-between z-20'>
        {/* Status Badge */}
        <div className='flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-400/40 shadow-lg shadow-cyan-500/10'>
          <span className={`w-2.5 h-2.5 rounded-full ${listening ? 'bg-cyan-400 animate-ping' : processing ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400'}`}></span>
          <span className='text-xs font-bold text-cyan-300 tracking-wider uppercase'>
            {listening ? "JARVIS LISTENING" : processing ? "PROCESSING COMMAND" : isSpeakingRef.current ? "SPEAKING" : "STANDBY"}
          </span>
        </div>

        {/* Desktop Controls */}
        <div className='hidden lg:flex items-center gap-3'>
          <button 
            className='h-9 px-4 text-black font-bold bg-cyan-400 hover:bg-cyan-300 rounded-full cursor-pointer text-xs transition duration-200 shadow-md shadow-cyan-500/30'
            onClick={() => navigate("/customize")}
          >
            Customize Persona
          </button>
          <button 
            className='h-9 px-4 text-red-200 font-semibold bg-red-950/80 hover:bg-red-900 border border-red-500/50 rounded-full cursor-pointer text-xs transition duration-200 shadow-md'
            onClick={handleLogOut}
          >
            Log Out
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <CgMenuRight className='lg:hidden text-cyan-400 w-7 h-7 cursor-pointer hover:opacity-80 transition' onClick={() => setHam(true)}/>
      </div>

      {/* Mobile Drawer */}
      <div className={`fixed lg:hidden top-0 left-0 w-full h-full bg-slate-950/95 backdrop-blur-2xl p-6 flex flex-col gap-5 items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 z-30`}>
        <RxCross1 className='text-cyan-400 absolute top-6 right-6 w-6 h-6 cursor-pointer hover:opacity-80 transition' onClick={() => setHam(false)}/>
        <h2 className='text-white font-bold text-xl'>Menu</h2>
        <button className='w-full h-11 text-black font-bold bg-cyan-400 rounded-xl cursor-pointer text-sm shadow-md' onClick={() => navigate("/customize")}>Customize Assistant</button>
        <button className='w-full h-11 text-white font-semibold bg-red-600 rounded-xl cursor-pointer text-sm shadow-md' onClick={handleLogOut}>Log Out</button>

        <div className='w-full h-[1px] bg-slate-800 my-2'></div>
        <h3 className='text-cyan-300 font-semibold text-base'>Recent Voice Log</h3>

        <div className='w-full flex-1 max-h-[300px] gap-2 overflow-y-auto flex flex-col pr-1'>
          {userData?.history?.map((his, idx) => (
            <div key={idx} className='text-gray-200 text-xs bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800 truncate'>{his}</div>
          ))}
          {(!userData?.history || userData.history.length === 0) && (
            <p className='text-gray-400 text-xs italic'>No voice activity yet.</p>
          )}
        </div>
      </div>

      {/* Main Central Stage */}
      <div className='flex flex-col items-center justify-center gap-2 sm:gap-3 my-auto z-10 max-w-[620px] w-full mx-auto'>
        
        {/* Holographic Avatar Display */}
        <div className='relative'>
          <div className='w-[160px] h-[180px] sm:w-[190px] sm:h-[210px] flex justify-center items-center overflow-hidden rounded-2xl border-2 border-cyan-400 bg-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.4)]'>
            <img 
              src={userData?.assistantImage} 
              alt={userData?.assistantName || "Assistant"} 
              className='h-full w-full object-cover'
            />
          </div>

          {/* Assistant Name Pill */}
          <div className='absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-cyan-400 px-4 py-0.5 rounded-full flex items-center gap-2 shadow-lg whitespace-nowrap'>
            <span className={`w-2 h-2 rounded-full ${listening ? 'bg-cyan-400 animate-ping' : 'bg-cyan-500'}`}></span>
            <span className='text-xs font-bold text-cyan-200 tracking-wider'>
              {userData?.assistantName ? userData.assistantName.toUpperCase() : "JARVIS"}
            </span>
          </div>
        </div>

        {/* Seamless Borderless Soundwave - Click to Toggle Voice */}
        <div 
          onClick={handleVoiceToggle}
          className='cursor-pointer flex items-center justify-center mt-3 transition-transform duration-300 hover:scale-105 active:scale-95'
          title={listening ? "Listening (Click to mute)" : "Click to speak"}
        >
          <img 
            src={aiImg} 
            alt="AI Soundwave" 
            className={`w-[220px] h-[80px] sm:w-[280px] sm:h-[95px] object-contain transition-all duration-300 ${
              listening ? 'drop-shadow-[0_0_35px_rgba(6,182,212,1)] scale-105 opacity-100' : 'opacity-65 hover:opacity-95'
            }`}
            style={{
              mixBlendMode: 'screen',
              WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 90%)',
              maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 90%)'
            }}
          />
        </div>

      </div>

    </div>
  )
}

export default Home