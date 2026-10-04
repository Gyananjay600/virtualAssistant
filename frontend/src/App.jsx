import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize'
import { userDataContext } from './context/UserContext'
import Home from './pages/Home'
import Customize2 from './pages/Customize2'

function App() {
  const { userData, loading } = useContext(userDataContext)

  if (loading) {
    return (
      <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
          <p className='text-white text-lg font-medium animate-pulse'>Loading Virtual Assistant...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path='/' 
        element={
          !userData ? (
            <Navigate to="/signin" replace />
          ) : (userData.assistantImage && userData.assistantName) ? (
            <Home />
          ) : (
            <Navigate to="/customize" replace />
          )
        } 
      />
      <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to="/" replace />} />
      <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to="/" replace />} />
      <Route path='/customize' element={userData ? <Customize /> : <Navigate to="/signin" replace />} />
      <Route path='/customize2' element={userData ? <Customize2 /> : <Navigate to="/signin" replace />} />
      <Route path='*' element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
