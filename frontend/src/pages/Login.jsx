import axios from 'axios';
import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e)=> {
        e.preventDefault()
        try {
            const response = await axios.post("http://localhost:3000/api/auth/login", 
            {email, password}
        );
        console.log(response)
        } catch (error) {
            console.log(error);
        }
    }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">TeamSync</h1>
          <p className="text-blue-100 mt-2">Streamline Your Workforce Management</p>
          <div className="mt-8">
            <div className="w-32 h-1 bg-blue-400 mx-auto rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">TeamSync</h1>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Sign in to your account</h2>
          
          <form 
          onSubmit={handleSubmit}
          className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                id='email'
                type="email" 
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" autoComplete='on'
                placeholder="name@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input 
                id='password'
                type="password" 
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" autoComplete='on'
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                Forgot password?
              </a>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;