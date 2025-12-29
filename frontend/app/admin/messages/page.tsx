"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Mail, MailOpen, ReplyIcon, Loader2, Trash2, RefreshCw, X } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"

interface MessageResponse {
  id: number
  threadId: number
  parentMessageId: number | null
  isReply: boolean
  senderType: "CUSTOMER" | "ADMIN"
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  message: string
  read: boolean
  createdAt: string
  updatedAt: string | null
}

interface ThreadResponse {
  threadId: number
  originalMessage: MessageResponse
  replies: MessageResponse[]
  totalMessages: number
  lastActivityAt: string
  hasUnreadMessages: boolean
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<ThreadResponse[]>([])
  const [selectedThread, setSelectedThread] = useState<ThreadResponse | null>(null)
  const [adminInfo, setAdminInfo] = useState<{ name: string; email: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchResults, setSearchResults] = useState<ThreadResponse[] | null>(null)
  const [threadToDelete, setThreadToDelete] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const getAdminDisplayName = (adminName?: string) => {
    if (!adminName && !adminInfo?.name) return "Admin"
    const fullName = adminName || adminInfo?.name || "Admin"
    const firstName = fullName.split(" ")[0]
    const role = adminInfo?.role || "Admin"
    return `${firstName} (${role})`
  }

  useEffect(() => {
    fetchThreads()
    fetchAdminInfo()
  }, [])

  const fetchAdminInfo = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.user, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setAdminInfo({
          name: data.name || "Admin",
          email: data.email || "",
          role: data.role || "Admin",
        })
      }
    } catch (error) {
      console.error("Failed to fetch admin info:", error)
    }
  }

  const fetchThreads = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_ENDPOINTS.messages.threads, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch threads: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        const threadData = result.data || []
        setThreads(threadData)
        const unreadThreadsCount = threadData.filter((thread: ThreadResponse) => thread.hasUnreadMessages).length
        setUnreadCount(unreadThreadsCount)
      }
    } catch (error) {
      console.error("Error fetching threads:", error)
      setThreads([])
    } finally {
      setLoading(false)
    }
  }

  const fetchThreadDetails = async (threadId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.messages.thread(threadId), {
        credentials: "include",
      })

      if (!response.ok) return

      const result = await response.json()

      if (result.success) {
        const updatedThread = result.data
        setThreads((prev) => prev.map((t) => (t.threadId === threadId ? updatedThread : t)))

        if (selectedThread?.threadId === threadId) {
          setSelectedThread(updatedThread)
        }
      }
    } catch (error) {
      console.error("Error fetching thread details:", error)
    }
  }

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      const filtered = threads.filter(
          (thread) =>
              thread.originalMessage.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              thread.originalMessage.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              thread.originalMessage.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              thread.originalMessage.message.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(filtered)
    } catch (error) {
      console.error("Error searching messages:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendReply = async () => {
    if (!selectedThread || !replyText.trim() || !adminInfo) {
      alert("Please enter a reply message and ensure you're logged in")
      return
    }

    if (replyText.trim().length < 10) {
      alert("Reply must be at least 10 characters long")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(API_ENDPOINTS.messages.reply(selectedThread.threadId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          parentMessageId: selectedThread.originalMessage.id,
          message: replyText.trim(),
          adminName: adminInfo.name,
          adminEmail: adminInfo.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("[v0] Reply error:", errorData)
        throw new Error(`Failed to send reply: ${response.statusText}`)
      }

      await fetchThreadDetails(selectedThread.threadId)
      setReplyDialogOpen(false)
      setReplyText("")
    } catch (error) {
      console.error("Error sending reply:", error)
      alert("Failed to send reply. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteThread = async () => {
    if (!threadToDelete) return

    try {
      setDeleting(true)
      const response = await fetch(API_ENDPOINTS.messages.deleteThread(threadToDelete), {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete thread: ${response.statusText}`)
      }

      setThreads((prev) => prev.filter((thread) => thread.threadId !== threadToDelete))

      if (selectedThread?.threadId === threadToDelete) {
        setSelectedThread(null)
      }

      setDeleteDialogOpen(false)
      setThreadToDelete(null)
      fetchThreads()
    } catch (error) {
      console.error("Error deleting thread:", error)
      setErrorMessage("Failed to delete thread. Please try again.")
      setErrorDialogOpen(true)
    } finally {
      setDeleting(false)
    }
  }

  const displayThreads = searchResults !== null ? searchResults : threads

  const filteredThreads = displayThreads.filter((thread) => {
    const matchesFilter = filter === "all" || (filter === "unread" && thread.hasUnreadMessages)
    return matchesFilter
  })

  const handleThreadClick = async (thread: ThreadResponse) => {
    setSelectedThread(thread)
    await fetchThreadDetails(thread.threadId)
  }

  const getAllMessages = (thread: ThreadResponse) => {
    return [thread.originalMessage, ...thread.replies].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  }

  const handleMarkAsRead = async (threadId: number, messageId: number) => {
    try {
      await fetch(API_ENDPOINTS.messages.markMessageAsRead(messageId), {
        method: "PATCH",
        credentials: "include",
      })

      setThreads((prev) =>
          prev.map((thread) => {
            if (thread.threadId !== threadId) return thread

            const updatedOriginal =
                thread.originalMessage.id === messageId ? { ...thread.originalMessage, read: true } : thread.originalMessage

            const updatedReplies = thread.replies.map((reply) =>
                reply.id === messageId ? { ...reply, read: true } : reply,
            )

            const allRead = updatedOriginal.read && updatedReplies.every((r) => r.read)

            return {
              ...thread,
              originalMessage: updatedOriginal,
              replies: updatedReplies,
              hasUnreadMessages: !allRead,
            }
          }),
      )
    } catch (error) {
      console.error("Failed to mark message as read:", error)
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        </div>
    )
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
              Messages
            </h2>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              {unreadCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="font-semibold text-red-600">{unreadCount}</span>
              </span>
              )}
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => fetchThreads()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-4 shadow-lg">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-8"
                  />
                  {searchQuery && (
                      <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                  )}
                  {isSearching && (
                      <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-sky-600" />
                  )}
                </div>
              </div>

              {searchQuery && (
                  <div className="text-xs text-gray-600 bg-sky-50 px-3 py-2 rounded-lg">
                    {isSearching
                        ? "Searching..."
                        : searchResults
                            ? `Found ${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`
                            : "No results found"}
                  </div>
              )}

              <div className="flex gap-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className="flex-1"
                >
                  All ({threads.length})
                </Button>
                <Button
                    variant={filter === "unread" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("unread")}
                    className="flex-1"
                >
                <span className="flex items-center gap-1">
                  Unread
                  {unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs px-1.5 py-0 min-w-[20px]">{unreadCount}</Badge>
                  )}
                </span>
                </Button>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {filteredThreads.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">
                        {searchQuery ? "No messages match your search" : "No messages found"}
                      </p>
                    </div>
                ) : (
                    filteredThreads.map((thread) => {
                      const msg = thread.originalMessage
                      const isSelected = selectedThread?.threadId === thread.threadId
                      return (
                          <div
                              key={thread.threadId}
                              onClick={() => handleThreadClick(thread)}
                              className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                                  isSelected
                                      ? "bg-gradient-to-br from-sky-50 to-sky-100 border-sky-500 shadow-md"
                                      : thread.hasUnreadMessages
                                          ? "bg-white border-sky-200 hover:border-sky-300 hover:shadow-md"
                                          : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                              }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {thread.hasUnreadMessages ? (
                                    <Mail className="h-4 w-4 text-sky-600 flex-shrink-0" />
                                ) : (
                                    <MailOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                )}
                                <p className="font-semibold text-sm truncate">
                                  {msg.firstName} {msg.lastName}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                {thread.hasUnreadMessages && (
                                    <Badge className="bg-red-500 text-white text-xs px-2 animate-pulse">New</Badge>
                                )}
                                {thread.totalMessages > 1 && (
                                    <Badge variant="secondary" className="text-xs px-2">
                                      {thread.totalMessages}
                                    </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 truncate">{msg.email}</p>
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">{msg.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(thread.lastActivityAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                      )
                    })
                )}
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 shadow-lg">
            {selectedThread ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between pb-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 text-white p-3 rounded-full shadow-lg">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedThread.originalMessage.firstName} {selectedThread.originalMessage.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{selectedThread.originalMessage.email}</p>
                        {selectedThread.originalMessage.phone && (
                            <p className="text-sm text-gray-600">{selectedThread.originalMessage.phone}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-sky-500 rounded-full"></span>
                          {selectedThread.totalMessages} message{selectedThread.totalMessages !== 1 ? "s" : ""} in thread
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedThread.hasUnreadMessages ? (
                          <Badge className="bg-red-500 animate-pulse">Unread</Badge>
                      ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Read
                          </Badge>
                      )}
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setThreadToDelete(selectedThread.threadId)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                          onClick={() => setReplyDialogOpen(true)}
                          size="sm"
                          className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-md"
                      >
                        <ReplyIcon className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    </div>
                  </div>

                  {(selectedThread.originalMessage.address || selectedThread.originalMessage.createdAt) && (
                      <div className="grid grid-cols-2 gap-4 pb-4 bg-gray-50 p-4 rounded-lg">
                        {selectedThread.originalMessage.address && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</p>
                              <p className="text-sm text-gray-900">{selectedThread.originalMessage.address}</p>
                            </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">First Contact</p>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedThread.originalMessage.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Conversation</h4>
                    <div className="space-y-4 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
                      {getAllMessages(selectedThread).map((msg) => (
                          <div
                              key={msg.id}
                              className={`p-4 rounded-lg transition-all ${
                                  msg.senderType === "ADMIN"
                                      ? "bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-blue-600 ml-8 shadow-sm"
                                      : "bg-white border border-gray-200 shadow-sm mr-8"
                              }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {!msg.read && <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />}
                                <span
                                    className={`font-semibold text-sm ${msg.senderType === "ADMIN" ? "text-blue-700" : "text-gray-900"}`}
                                >
                            {msg.senderType === "ADMIN"
                                ? getAdminDisplayName(msg.firstName)
                                : `${msg.firstName} ${msg.lastName}`}
                          </span>
                                <span className="text-xs text-gray-500">
                            {msg.senderType === "CUSTOMER" ? msg.email : ""}
                          </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
                                {!msg.read && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleMarkAsRead(selectedThread.threadId, msg.id)}
                                    >
                                      Mark Read
                                    </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
                  <div className="bg-gradient-to-br from-sky-100 to-sky-200 p-8 rounded-full mb-6">
                    <Mail className="h-16 w-16 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No message selected</h3>
                  <p className="text-gray-600 max-w-sm">
                    Select a message from the list to view the conversation thread and reply to customers
                  </p>
                </div>
            )}
          </Card>
        </div>

        <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Reply to Message</DialogTitle>
              <DialogDescription className="text-gray-600">
                Send a reply to {selectedThread?.originalMessage.firstName} {selectedThread?.originalMessage.lastName}
              </DialogDescription>
            </DialogHeader>

            {selectedThread && (
                <div className="space-y-4 py-4">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Original Message</p>
                    <p className="text-sm text-gray-900 line-clamp-3">{selectedThread.originalMessage.message}</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reply-message" className="text-sm font-semibold text-gray-700">
                      Your Reply
                    </label>
                    <Textarea
                        id="reply-message"
                        placeholder="Type your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={6}
                        className="resize-none"
                    />
                  </div>
                </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setReplyDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isSubmitting}
                  className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700"
              >
                {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                ) : (
                    <>
                      <ReplyIcon className="h-4 w-4 mr-2" />
                      Send Reply
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600">Delete Thread</DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to delete this entire conversation thread? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button onClick={handleDeleteThread} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
                {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Thread
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600">Error</DialogTitle>
              <DialogDescription className="text-gray-600">{errorMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}
