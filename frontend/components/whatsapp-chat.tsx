"use client"

import { useState } from "react"
import { MessageCircle, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  const predefinedMessages = [
    "I'd like to schedule an appointment",
    "What are your hours?",
    "Do you accept my insurance?",
    "I have a question about treatment",
    "Emergency consultation needed",
  ]

  const handleSendMessage = (msg?: string) => {
    const messageToSend = msg || message
    if (!messageToSend.trim()) return

    const phoneNumber = "17373682653" // PeakKinetics WhatsApp Business number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageToSend)}`

    window.open(whatsappUrl, "_blank")
    setMessage("")
    setIsOpen(false)
  }

  return (
    <>
      {/* WhatsApp Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">PeakKinetics Support</h3>
                  <p className="text-xs opacity-90">Typically replies instantly</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-gray-50 max-h-80 overflow-y-auto">
              {/* Welcome Message */}
              <div className="mb-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-700">
                    Hi! 👋 How can we help you today? Choose a quick option below or type your message.
                  </p>
                </div>
              </div>

              {/* Quick Reply Buttons */}
              <div className="space-y-2 mb-4">
                {predefinedMessages.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(msg)}
                    className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                  >
                    {msg}
                  </button>
                ))}
              </div>

              {/* Custom Message Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  size="sm"
                  className="bg-[#25D366] hover:bg-[#20B858] text-white px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-100 text-center">
              <p className="text-xs text-gray-600">Powered by WhatsApp Business</p>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-[#25D366] hover:bg-[#20B858] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          aria-label="Open WhatsApp Chat"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6 group-hover:animate-pulse" />}
        </button>

        {/* Notification Badge */}
        {!isOpen && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            1
          </div>
        )}
      </div>
    </>
  )
}
