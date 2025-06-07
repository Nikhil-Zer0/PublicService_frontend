"use client"
import { useState } from "react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { FiEye, FiEyeOff, FiLock, FiMail, FiUserPlus } from "react-icons/fi"
import { FcGoogle } from "react-icons/fc"

type AuthAction = "login" | "register";

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const provider = new GoogleAuthProvider()

  const handleAuth = async (action: AuthAction) => {
    setIsLoading(true)
    setError("")
    try {
      if (action === "login") {
        await signInWithEmailAndPassword(auth, email, pw)
      } else if (action === "register") {
        await createUserWithEmailAndPassword(auth, email, pw)
      }
      router.push("/")
    } catch (err) {
      if (err && typeof err === "object" && "code" in err) {
        setError(getErrorMessage((err as { code: string }).code))
      } else {
        setError("Authentication failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const googleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithPopup(auth, provider)
      router.push("/")
    } catch (err) {
      if (err && typeof err === "object" && "code" in err) {
        setError(getErrorMessage((err as { code: string }).code))
      } else {
        setError("Authentication failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "auth/invalid-email": return "Invalid email address";
      case "auth/user-disabled": return "Account disabled";
      case "auth/user-not-found": return "Account not found";
      case "auth/wrong-password": return "Incorrect password";
      case "auth/email-already-in-use": return "Email already in use";
      case "auth/weak-password": return "Password should be at least 6 characters";
      case "auth/popup-closed-by-user": return "Sign-in cancelled";
      default: return "Authentication failed. Please try again.";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-center border-b border-gray-700">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-900/20 text-red-400 rounded-lg text-sm border border-red-800/50">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-500" />
              </div>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            
            <button
              onClick={() => handleAuth("login")}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                isLoading ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
            
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <button
              onClick={googleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg font-medium text-gray-200 hover:bg-gray-600 transition-all"
            >
              <FcGoogle className="text-xl" />
              Continue with Google
            </button>
            
            <div className="pt-4 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <button 
                  onClick={() => handleAuth("register")}
                  disabled={isLoading}
                  className="text-indigo-400 font-medium inline-flex items-center hover:text-indigo-300 transition-colors"
                >
                  <FiUserPlus className="mr-1" />
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/50 px-8 py-6 text-center border-t border-gray-700">
          <p className="text-gray-500 text-sm">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}