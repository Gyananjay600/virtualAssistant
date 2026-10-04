import React, { useContext, useState } from 'react'
import bg from "../assets/assistantbgimage.png"
import { IoEye, IoEyeOff, IoSparkles, IoMic, IoPersonAddOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const { serverUrl, setUserData } = useContext(userDataContext)
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")

  const handleSignUp = async (e) => {
    e.preventDefault()
    setErr("")
    setLoading(true)
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signup`, {
        name, email, password
      }, { withCredentials: true })
      setUserData(result.data)
      setLoading(false)
      navigate("/customize")
    } catch (error) {
      console.log(error)
      setUserData(null)
      setLoading(false)
      setErr(error.response?.data?.message || "Sign up failed. Please try again.")
    }
  }

  return (
    <div 
      className='w-full h-screen overflow-hidden bg-cover bg-center bg-no-repeat flex flex-col md:flex-row justify-center md:justify-between items-center p-4 sm:p-6 md:p-8 lg:p-12 relative select-none'
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Very subtle dark gradient overlay to keep character vibrant while ensuring text contrast */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none'></div>

      {/* Left Container - Desktop & Tablet Text Panel (Framed to left so center character is visible) */}
      <div className='hidden md:flex flex-col justify-between w-[350px] lg:w-[420px] max-h-[88vh] bg-black/20 backdrop-blur-md border border-white/20 rounded-3xl p-6 lg:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative z-10'>
        <div>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm'>
            <span className='w-2 h-2 rounded-full bg-cyan-400 animate-pulse'></span>
            Start Your Journey
          </div>

          <h1 className='text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg'>
            Build Your Own <br />
            <span className='bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent'>
              Virtual Assistant
            </span>
          </h1>

          <p className='text-gray-200 text-xs lg:text-sm leading-relaxed mb-6 drop-shadow'>
            Create an account to configure your custom AI assistant with custom avatars, unique names, and voice controls.
          </p>

          {/* Feature Highlights */}
          <div className='space-y-3'>
            <div className='flex items-center gap-3 bg-white/5 p-2.5 rounded-2xl border border-white/10'>
              <div className='p-2 rounded-xl bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shrink-0'>
                <IoSparkles className='w-4 h-4' />
              </div>
              <div>
                <h3 className='text-white font-semibold text-xs drop-shadow'>Tailored Intelligence</h3>
                <p className='text-gray-300 text-[11px]'>Configure your assistant persona & tone.</p>
              </div>
            </div>

            <div className='flex items-center gap-3 bg-white/5 p-2.5 rounded-2xl border border-white/10'>
              <div className='p-2 rounded-xl bg-blue-500/25 text-blue-300 border border-blue-400/40 shrink-0'>
                <IoMic className='w-4 h-4' />
              </div>
              <div>
                <h3 className='text-white font-semibold text-xs drop-shadow'>Hands-Free Voice Control</h3>
                <p className='text-gray-300 text-[11px]'>Speak commands to launch search and tasks.</p>
              </div>
            </div>

            <div className='flex items-center gap-3 bg-white/5 p-2.5 rounded-2xl border border-white/10'>
              <div className='p-2 rounded-xl bg-indigo-500/25 text-indigo-300 border border-indigo-400/40 shrink-0'>
                <IoPersonAddOutline className='w-4 h-4' />
              </div>
              <div>
                <h3 className='text-white font-semibold text-xs drop-shadow'>Instant Setup</h3>
                <p className='text-gray-300 text-[11px]'>Get running with your companion in seconds.</p>
              </div>
            </div>
          </div>
        </div>

        <div className='pt-4 border-t border-white/15'>
          <p className='text-[11px] text-gray-300 drop-shadow'>
            Experience next-generation voice AI assistance.
          </p>
        </div>
      </div>

      {/* Right Container - Register Form (Framed to right on desktop/tab, centered on mobile) */}
      <div className='w-full max-w-[360px] md:max-w-none md:w-[340px] lg:w-[390px] max-h-[88vh] bg-black/25 backdrop-blur-md border border-white/20 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative z-10 flex flex-col justify-center'>
        
        {/* Mobile Header (only visible on mobile to save vertical space and avoid scroll) */}
        <div className='mb-3 text-center md:text-left'>
          <div className='inline-flex md:hidden items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-semibold uppercase tracking-wider mb-1'>
            <span className='w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse'></span>
            Virtual Assistant
          </div>
          <h2 className='text-2xl font-bold text-white mb-0.5 drop-shadow-lg'>Create Account</h2>
          <p className='text-gray-200 text-xs drop-shadow'>Register to begin using your assistant</p>
        </div>

        {err && (
          <div className='mb-3 p-2 rounded-xl bg-red-500/30 border border-red-500/40 text-red-100 text-xs flex items-center gap-2'>
            <span className='font-bold'>•</span>
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSignUp} className='space-y-2.5 sm:space-y-3'>
          <div>
            <label className='block text-xs font-medium text-gray-200 mb-1 ml-1 drop-shadow'>Full Name</label>
            <input 
              type="text" 
              placeholder='Your Name here' 
              className='w-full h-10 sm:h-11 outline-none border border-white/30 bg-black/25 focus:bg-black/45 focus:border-cyan-400 text-white placeholder-gray-400 px-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-inner' 
              required 
              onChange={(e) => setName(e.target.value)} 
              value={name}
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-200 mb-1 ml-1 drop-shadow'>Email Address</label>
            <input 
              type="email" 
              placeholder='name@example.com' 
              className='w-full h-10 sm:h-11 outline-none border border-white/30 bg-black/25 focus:bg-black/45 focus:border-cyan-400 text-white placeholder-gray-400 px-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-inner' 
              required 
              onChange={(e) => setEmail(e.target.value)} 
              value={email}
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-200 mb-1 ml-1 drop-shadow'>Password</label>
            <div className='w-full h-10 sm:h-11 border border-white/30 bg-black/25 focus-within:bg-black/45 focus-within:border-cyan-400 text-white rounded-xl text-xs sm:text-sm relative transition-all shadow-inner'>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder='Create password' 
                className='w-full h-full rounded-xl outline-none bg-transparent placeholder-gray-400 px-3.5 pr-10 text-xs sm:text-sm text-white' 
                required 
                onChange={(e) => setPassword(e.target.value)} 
                value={password}
              />
              <button 
                type="button" 
                className='absolute top-1/2 -translate-y-1/2 right-3 text-gray-300 hover:text-white transition cursor-pointer'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOff className='w-4 h-4' /> : <IoEye className='w-4 h-4' />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className='w-full h-10 sm:h-11 mt-2 font-semibold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center'
          >
            {loading ? (
              <span className='inline-flex items-center gap-2'>
                <svg className='animate-spin h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z'></path>
                </svg>
                Creating Account...
              </span>
            ) : "Create Account"}
          </button>
        </form>

        <div className='mt-3.5 pt-3 border-t border-white/15 text-center'>
          <p className='text-gray-200 text-xs drop-shadow'>
            Already have an account?{' '}
            <button 
              onClick={() => navigate("/signin")} 
              className='text-cyan-300 hover:text-cyan-200 font-semibold underline underline-offset-4 ml-1 cursor-pointer transition'
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

    </div>
  )
}

export default SignUp
