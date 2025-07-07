import React, { useState } from 'react'
import { auth } from '../config/Firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
function LoginPageFireBaseTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleLogin =  async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
    console.log(auth.currentUser.email);
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-2xl font-bold'>Login</h1>
      <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {error && <p>{error}</p>}
      
    </div>
  )
}

export default LoginPageFireBaseTest