"use client"

import { useState, useEffect } from "react"
import { useContext } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthContext } from "@/app/providers"

// Sample district data - in a real app, this would come from an API
const districts = [
  { id: 1, name: "Lucknow", code: "lko" },
  { id: 2, name: "Delhi", code: "del" },
  { id: 3, name: "Mumbai", code: "mum" },
  { id: 4, name: "Bangalore", code: "blr" },
  { id: 5, name: "Chennai", code: "chn" },
  { id: 6, name: "Kolkata", code: "kol" },
  { id: 7, name: "Hyderabad", code: "hyd" },
  { id: 8, name: "Ahmedabad", code: "ahd" },
  { id: 9, name: "Pune", code: "pun" },
  { id: 10, name: "Jaipur", code: "jai" },
]

// Service types
const services = [
  {
    id: 1,
    name: "Water Supply",
    description: "Issues related to water quality, supply timings, and infrastructure",
    icon: "💧",
  },
  {
    id: 2,
    name: "Electricity",
    description: "Power outages, voltage issues, and billing concerns",
    icon: "⚡",
  },
  {
    id: 3,
    name: "Sanitation",
    description: "Waste management, sewage systems, and public cleanliness",
    icon: "🧹",
  },
  {
    id: 4,
    name: "Roads",
    description: "Road conditions, traffic management, and street lighting",
    icon: "🛣️",
  },
  {
    id: 5,
    name: "Public Transport",
    description: "Bus services, metro operations, and transport infrastructure",
    icon: "🚌",
  },
  {
    id: 6,
    name: "Healthcare",
    description: "Public hospitals, clinics, and healthcare accessibility",
    icon: "🏥",
  },
]

export default function HomePage() {
  const [selectedDistrict, setSelectedDistrict] = useState<(typeof districts)[0] | null>(null)
  const [open, setOpen] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const { user } = useContext(AuthContext)
  const router = useRouter()
  const { toast } = useToast()

  // Detect user's location on component mount
  useEffect(() => {
    if (user === null) {
      router.replace("/login")
    }
    if (navigator.geolocation && !selectedDistrict) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would use the coordinates to determine the district
          // For demo purposes, we'll just set a default district
          setSelectedDistrict(districts[0]) // Set to Lucknow as default
          setIsLocating(false)
          toast({
            title: "Location detected",
            description: `We've set your district to ${districts[0].name}`,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLocating(false)
          toast({
            variant: "destructive",
            title: "Location detection failed",
            description: "Please select your district manually",
          })
        },
      )
    }
  }, [user, router, toast])

  const handleServiceSelect = (service: (typeof services)[0]) => {
    if (!selectedDistrict) {
      toast({
        variant: "destructive",
        title: "No district selected",
        description: "Please select a district first",
      })
      return
    }

    router.push(`/review/${selectedDistrict.code}/${encodeURIComponent(service.name)}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
            Public Services Feedback
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Help improve your community by providing feedback on public services in your district.
          </p>
        </div>

        <div className="mb-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="w-full sm:w-auto">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full sm:w-[250px] justify-between"
                >
                  {selectedDistrict ? selectedDistrict.name : "Select district..."}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[250px] p-0">
                <Command>
                  <CommandInput placeholder="Search district..." />
                  <CommandEmpty>No district found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {districts.map((district) => (
                        <CommandItem
                          key={district.id}
                          value={district.name}
                          onSelect={() => {
                            setSelectedDistrict(district)
                            setOpen(false)
                          }}
                        >
                          {district.name}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setIsLocating(true)
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  // In a real app, you would use the coordinates to determine the district
                  setSelectedDistrict(districts[0]) // Set to Lucknow for demo
                  setIsLocating(false)
                  toast({
                    title: "Location detected",
                    description: `We've set your district to ${districts[0].name}`,
                  })
                },
                (error) => {
                  console.error("Error getting location:", error)
                  setIsLocating(false)
                  toast({
                    variant: "destructive",
                    title: "Location detection failed",
                    description: "Please select your district manually",
                  })
                },
              )
            }}
            disabled={isLocating}
            className="relative"
          >
            <MapPin className={cn("h-4 w-4", isLocating && "animate-pulse")} />
            <span className="sr-only">Detect location</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className="overflow-hidden transition-all hover:shadow-lg hover:border-purple-500/50 cursor-pointer"
              onClick={() => handleServiceSelect(service)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{service.icon}</span>
                  <CardTitle>{service.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between group"
                  onClick={() => handleServiceSelect(service)}
                >
                  <span>Provide Feedback</span>
                  <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
