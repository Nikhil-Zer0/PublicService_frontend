"use client"
import { useState } from "react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { FiEye, FiEyeOff, FiLock, FiMail, FiUserPlus } from "react-icons/fi"
import { FcGoogle } from "react-icons/fc"
import { Button } from "@/components/ui/button" // Added for consistency

type AuthAction = "login" | "register";

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("") // Added for registration
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false) // Separate loading state
  const [error, setError] = useState("")
  const [mode, setMode] = useState<AuthAction>("login") // Track login/register mode
  const router = useRouter()
  const provider = new GoogleAuthProvider()

  const validateForm = (): boolean => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    
    if (mode === "register" && pw !== confirmPw) {
      setError("Passwords do not match")
      return false
    }
    
    if (pw.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    
    return true
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsLoading(true)
    setError("")
    
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pw)
      } else {
        await createUserWithEmailAndPassword(auth, email, pw)
      }
      router.push("/")
    } catch (err) {
      handleAuthError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const googleSignIn = async () => {
    setIsGoogleLoading(true)
    setError("")
    try {
      await signInWithPopup(auth, provider)
      router.push("/")
    } catch (err) {
      handleAuthError(err)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleAuthError = (err: unknown) => {
    if (err && typeof err === "object" && "code" in err) {
      setError(getErrorMessage((err as { code: string }).code))
    } else {
      setError("Authentication failed. Please try again.")
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

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login")
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-center border-b border-gray-700">
          <h1 className="text-3xl font-bold text-white">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-400 mt-2">
            {mode === "login" 
              ? "Sign in to continue" 
              : "Create an account to get started"}
          </p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-900/20 text-red-400 rounded-lg text-sm border border-red-800/50">
              {error}
            </div>
          )}
          
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-500" />
              </div>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
                required
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
                required
                minLength={6}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {mode === "register" && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-500" />
                </div>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                  minLength={6}
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                isLoading ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {isLoading 
                ? (mode === "login" ? "Signing in..." : "Creating account...") 
                : (mode === "login" ? "Sign In" : "Create Account")}
            </button>
            
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <button
              type="button"
              onClick={googleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg font-medium text-gray-200 hover:bg-gray-600 transition-all disabled:opacity-70"
            >
              <FcGoogle className="text-xl" />
              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
            </button>
            
            <div className="pt-4 text-center">
              <p className="text-gray-400 text-sm">
                {mode === "login" 
                  ? "Don't have an account?" 
                  : "Already have an account?"}
                
                <button 
                  type="button"
                  onClick={toggleMode}
                  disabled={isLoading || isGoogleLoading}
                  className="text-indigo-400 font-medium inline-flex items-center hover:text-indigo-300 transition-colors ml-1"
                >
                  {mode === "login" 
                    ? <><FiUserPlus className="mr-1" /> Sign Up</>
                    : "Sign In"}
                </button>
              </p>
            </div>

            {mode === "login" && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push("/reset-password")}
                  className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>
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