"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Search, Send, Paperclip, MoreVertical, CheckCircle2 } from "lucide-react"

export default function MessagesPage() {
  const { user } = useAuth()
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const conversations = [
    {
      id: 1,
      name: "TechGear Pro",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TGP",
      lastMessage: "Great! Looking forward to the content.",
      timestamp: "2 min ago",
      unread: 2,
      online: true,
      campaign: "Product Review Campaign",
    },
    {
      id: 2,
      name: "Fashion Hub",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FH",
      lastMessage: "Can you send the draft by tomorrow?",
      timestamp: "1 hour ago",
      unread: 0,
      online: false,
      campaign: "Spring Collection Launch",
    },
    {
      id: 3,
      name: "Fitness First",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FF",
      lastMessage: "The video looks amazing! 🔥",
      timestamp: "3 hours ago",
      unread: 1,
      online: true,
      campaign: "Workout Routine Series",
    },
    {
      id: 4,
      name: "Foodie Delights",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FD",
      lastMessage: "Thank you for the collaboration!",
      timestamp: "Yesterday",
      unread: 0,
      online: false,
      campaign: "Restaurant Review Campaign",
    },
  ]

  const messages = selectedChat
    ? [
        {
          id: 1,
          sender: "them",
          content: "Hi! Thanks for applying to our campaign.",
          timestamp: "10:30 AM",
        },
        {
          id: 2,
          sender: "me",
          content: "Thank you for considering me! I'm excited about this opportunity.",
          timestamp: "10:32 AM",
        },
        {
          id: 3,
          sender: "them",
          content: "We loved your portfolio. Can you share your content calendar for the next month?",
          timestamp: "10:35 AM",
        },
        {
          id: 4,
          sender: "me",
          content: "I can deliver the first post by next week and complete all deliverables within 3 weeks.",
          timestamp: "10:40 AM",
        },
        {
          id: 5,
          sender: "them",
          content: "Great! Looking forward to the content.",
          timestamp: "10:42 AM",
        },
      ]
    : []

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim()) {
      console.log("[v0] Sending message:", messageInput)
      setMessageInput("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a]">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-gray-400">Communicate with brands and creators</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="bg-[#0f1629]/50 border-white/10 p-4 flex flex-col">
            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1a1f35] border-white/10 text-white pl-10"
              />
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedChat(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedChat?.id === conversation.id
                      ? "bg-blue-600/20 border border-blue-500/50"
                      : "bg-[#1a1f35] hover:bg-[#1a1f35]/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                        <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f1629]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white text-sm truncate">{conversation.name}</h4>
                        <span className="text-xs text-gray-400">{conversation.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1 truncate">{conversation.campaign}</p>
                      <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge className="bg-blue-600 text-white text-xs h-5 w-5 flex items-center justify-center p-0">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="bg-[#0f1629]/50 border-white/10 lg:col-span-2 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedChat.avatar || "/placeholder.svg"} alt={selectedChat.name} />
                        <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {selectedChat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f1629]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{selectedChat.name}</h3>
                      <p className="text-xs text-gray-400">{selectedChat.campaign}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          message.sender === "me" ? "bg-blue-600 text-white" : "bg-[#1a1f35] text-gray-200"
                        } rounded-lg p-3`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <span className="text-xs opacity-70">{message.timestamp}</span>
                          {message.sender === "me" && <CheckCircle2 className="w-3 h-3 opacity-70" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="text-gray-400">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="bg-[#1a1f35] border-white/10 text-white flex-1"
                    />
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#1a1f35] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
                  <p className="text-gray-400">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
