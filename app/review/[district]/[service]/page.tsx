"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useContext } from "react"
import { AuthContext } from "@/app/providers"

// Sample district data for display purposes
const districtMap: Record<string, string> = {
  lko: "Lucknow",
  del: "Delhi",
  mum: "Mumbai",
  blr: "Bangalore",
  chn: "Chennai",
  kol: "Kolkata",
  hyd: "Hyderabad",
  ahd: "Ahmedabad",
  pun: "Pune",
  jai: "Jaipur",
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { getToken, user } = useContext(AuthContext)

  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)

  const district = params.district as string
  const service = decodeURIComponent(params.service as string)
  const districtName = districtMap[district] || district

  // Fetch summary on component mount
  useEffect(() => {
    // More robust authentication check
    if (!user) {
      router.replace("/login")
      return
    }

    const abortController = new AbortController()

    const fetchSummary = async () => {
      try {
        setIsLoadingSummary(true)
        const token = await getToken()

        const res = await fetch(
          `https://publicservice-backend.onrender.com/summary/${district}/${encodeURIComponent(service)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal
          }
        )

        // Handle HTTP errors
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        setSummary(data.summary)
      } catch (error: any) {
        if (error.name === 'AbortError') return

        console.error("Error fetching summary:", error)
        toast({
          variant: "destructive",
          title: "Error fetching summary",
          description: "Could not load the feedback summary. Please try again later.",
        })
      } finally {
        setIsLoadingSummary(false)
      }
    }

    fetchSummary()

    return () => abortController.abort()
  }, [district, service, getToken, toast, user]) // Removed router

  const handleSubmit = useCallback(async () => {
    if (!feedback.trim()) {
      toast({
        variant: "destructive",
        title: "Empty feedback",
        description: "Please provide some feedback before submitting",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const token = await getToken()
      const res = await fetch("https://publicservice-backend.onrender.com/submit_feedback", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          district_name: district,
          service_type: service,
          user_feedback: feedback,
        }),
      })

      // Handle HTTP errors
      if (!res.ok) {
        const statusCode = res.status;
        const statusText = res.statusText;
        const url = res.url;

        let errorMessage = `HTTP Error!\n`;
        errorMessage += `Status Code: ${statusCode}\n`;
        errorMessage += `Status Text: ${statusText}\n`;
        errorMessage += `Requested URL: ${url}\n`;

        // Optionally, try to parse the error body (if any)
        try {
          const errorBody = await res.text(); // or res.json() if you expect JSON
          errorMessage += `Response Body:\n${errorBody}`;
        } catch (e) {
          errorMessage += `Could not read response body.`;
        }

        throw new Error(errorMessage);
      }


      const data = await res.json()
      setResponse(data.response)
      setFeedback("")

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      })
    } catch (error: any) {
      console.error("Error submitting feedback:", error)
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message || "Could not submit your feedback. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [feedback, district, service, getToken, toast])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-6 group" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Services
        </Button>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{service}</CardTitle>
                <CardDescription>Provide feedback for {districtName}</CardDescription>
              </div>
              <div className="text-3xl">
                {service === "Water Supply" && "💧"}
                {service === "Electricity" && "⚡"}
                {service === "Sanitation" && "🧹"}
                {service === "Roads" && "🛣️"}
                {service === "Public Transport" && "🚌"}
                {service === "Healthcare" && "🏥"}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Share your experience, concerns, or suggestions about this service in your district..."
              className="min-h-[150px] resize-none"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  Submit Feedback
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {response && (
          <Alert className="mb-8 border-purple-500/50 bg-purple-500/10">
            <AlertTitle>Response from the department</AlertTitle>
            <AlertDescription className="mt-2">{response}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Feedback Summary</h2>
          {isLoadingSummary ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
          ) : summary ? (
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {summary.split("\n\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-muted-foreground">No summary available for this service in your district.</p>
          )}
        </div>
      </div>
    </div>
  )
}
