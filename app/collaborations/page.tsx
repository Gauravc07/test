"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Upload, CheckCircle2, Clock, AlertCircle, MessageSquare, Download, Eye, Send } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

const collaborations = [
  {
    id: 1,
    brand: "Fashion Nova",
    campaign: "Summer Fashion Collection Launch",
    status: "in-progress",
    progress: 60,
    startDate: "2025-01-15",
    deadline: "2025-02-15",
    budget: "₹20,000",
    contract: {
      signed: true,
      signedDate: "2025-01-15",
      terms: "Standard collaboration agreement with content rights",
    },
    deliverables: [
      {
        id: 1,
        title: "Instagram Reel 1",
        description: "Summer outfit styling reel",
        status: "approved",
        dueDate: "2025-01-25",
        submittedDate: "2025-01-24",
        file: "/fashion-reel-1.jpg",
        feedback: "Excellent work! The styling is perfect.",
      },
      {
        id: 2,
        title: "Instagram Reel 2",
        description: "Beach wear collection showcase",
        status: "pending-review",
        dueDate: "2025-02-01",
        submittedDate: "2025-01-31",
        file: "/fashion-reel-1.jpg",
        feedback: null,
      },
      {
        id: 3,
        title: "Instagram Reel 3",
        description: "Casual summer looks",
        status: "in-progress",
        dueDate: "2025-02-08",
        submittedDate: null,
        file: null,
        feedback: null,
      },
      {
        id: 4,
        title: "Instagram Stories (5)",
        description: "Behind the scenes content",
        status: "not-started",
        dueDate: "2025-02-12",
        submittedDate: null,
        file: null,
        feedback: null,
      },
    ],
    messages: [
      {
        id: 1,
        sender: "Fashion Nova",
        message: "Looking forward to seeing your creative take on our summer collection!",
        timestamp: "2025-01-15 10:30 AM",
        isCreator: false,
      },
      {
        id: 2,
        sender: "You",
        message: "Thank you! I have some great ideas for the reels. Will share the first draft by tomorrow.",
        timestamp: "2025-01-15 11:45 AM",
        isCreator: true,
      },
    ],
  },
  {
    id: 2,
    brand: "Nykaa",
    campaign: "Beauty Product Review Campaign",
    status: "pending-approval",
    progress: 100,
    startDate: "2025-01-10",
    deadline: "2025-01-30",
    budget: "₹25,000",
    contract: {
      signed: true,
      signedDate: "2025-01-10",
      terms: "Product review with honest feedback agreement",
    },
    deliverables: [
      {
        id: 1,
        title: "YouTube Review Video",
        description: "Detailed skincare routine video",
        status: "pending-review",
        dueDate: "2025-01-28",
        submittedDate: "2025-01-27",
        file: "/beauty-video-1.jpg",
        feedback: null,
      },
      {
        id: 2,
        title: "Instagram Posts (3)",
        description: "Product showcase posts",
        status: "pending-review",
        dueDate: "2025-01-30",
        submittedDate: "2025-01-29",
        file: "/fashion-post-1.jpg",
        feedback: null,
      },
    ],
    messages: [],
  },
]

export default function CollaborationsPage() {
  const [selectedCollab, setSelectedCollab] = useState(collaborations[0])
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedDeliverable, setSelectedDeliverable] = useState<any>(null)
  const [uploadNotes, setUploadNotes] = useState("")
  const [newMessage, setNewMessage] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "pending-review":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "revision-requested":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
      case "not-started":
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4" />
      case "pending-review":
        return <Clock className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "revision-requested":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleUpload = (deliverable: any) => {
    setSelectedDeliverable(deliverable)
    setShowUploadDialog(true)
  }

  const submitDeliverable = () => {
    // Handle file upload
    setShowUploadDialog(false)
    setUploadNotes("")
    setSelectedDeliverable(null)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Collaborations</h1>
            <p className="text-lg text-muted-foreground">Manage your active campaigns and deliverables</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Collaboration List */}
            <div className="lg:col-span-1 space-y-4">
              {collaborations.map((collab) => (
                <Card
                  key={collab.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCollab.id === collab.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedCollab(collab)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-lg">{collab.brand}</CardTitle>
                        <CardDescription className="text-sm">{collab.campaign}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(collab.status)}>{collab.status.replace("-", " ")}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{collab.progress}%</span>
                      </div>
                      <Progress value={collab.progress} className="h-2" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Collaboration Details */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="deliverables" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                  <TabsTrigger value="contract">Contract</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                </TabsList>

                {/* Deliverables Tab */}
                <TabsContent value="deliverables" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Campaign Overview</CardTitle>
                          <CardDescription>{selectedCollab.campaign}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{selectedCollab.budget}</p>
                          <p className="text-sm text-muted-foreground">Total Budget</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                          <p className="font-medium">
                            {new Date(selectedCollab.startDate).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Deadline</p>
                          <p className="font-medium">
                            {new Date(selectedCollab.deadline).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedCollab.deliverables.map((deliverable) => (
                    <Card key={deliverable.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{deliverable.title}</CardTitle>
                              <Badge className={getStatusColor(deliverable.status)}>
                                {getStatusIcon(deliverable.status)}
                                <span className="ml-1">{deliverable.status.replace("-", " ")}</span>
                              </Badge>
                            </div>
                            <CardDescription>{deliverable.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Due Date:</span>
                          <span className="font-medium">
                            {new Date(deliverable.dueDate).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        {deliverable.submittedDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Submitted:</span>
                            <span className="font-medium">
                              {new Date(deliverable.submittedDate).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}

                        {deliverable.file && (
                          <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={deliverable.file || "/placeholder.svg"}
                              alt={deliverable.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {deliverable.feedback && (
                          <div className="p-4 rounded-lg bg-muted">
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Brand Feedback
                            </p>
                            <p className="text-sm text-muted-foreground">{deliverable.feedback}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {deliverable.status === "not-started" || deliverable.status === "in-progress" ? (
                            <Button onClick={() => handleUpload(deliverable)} className="flex-1">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Content
                            </Button>
                          ) : deliverable.status === "pending-review" ? (
                            <Button variant="outline" className="flex-1 bg-transparent" disabled>
                              <Clock className="h-4 w-4 mr-2" />
                              Awaiting Review
                            </Button>
                          ) : deliverable.status === "approved" ? (
                            <Button variant="outline" className="flex-1 bg-transparent" disabled>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approved
                            </Button>
                          ) : null}

                          {deliverable.file && (
                            <>
                              <Button variant="outline" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Contract Tab */}
                <TabsContent value="contract">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Collaboration Contract</CardTitle>
                          <CardDescription>Review your agreement terms</CardDescription>
                        </div>
                        {selectedCollab.contract.signed && (
                          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Signed
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Brand</p>
                          <p className="font-medium">{selectedCollab.brand}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Campaign</p>
                          <p className="font-medium">{selectedCollab.campaign}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Budget</p>
                          <p className="font-medium">{selectedCollab.budget}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Signed Date</p>
                          <p className="font-medium">
                            {new Date(selectedCollab.contract.signedDate).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 rounded-lg border bg-muted/30">
                        <h3 className="font-semibold mb-4">Contract Terms</h3>
                        <div className="space-y-3 text-sm text-muted-foreground">
                          <p>• {selectedCollab.contract.terms}</p>
                          <p>• Creator retains ownership of original content</p>
                          <p>• Brand receives usage rights for marketing purposes</p>
                          <p>• Payment to be released upon approval of all deliverables</p>
                          <p>• Revisions limited to 2 rounds per deliverable</p>
                          <p>• Content must be posted within 48 hours of approval</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <FileText className="h-4 w-4 mr-2" />
                          View Full Contract
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages">
                  <Card className="h-[600px] flex flex-col">
                    <CardHeader>
                      <CardTitle>Campaign Messages</CardTitle>
                      <CardDescription>Communicate with {selectedCollab.brand}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-4">
                      {selectedCollab.messages.length > 0 ? (
                        selectedCollab.messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.isCreator ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[80%] rounded-lg p-4 ${
                                msg.isCreator ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              <p className="text-sm font-medium mb-1">{msg.sender}</p>
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-2">{msg.timestamp}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-center">
                          <div>
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No messages yet</p>
                            <p className="text-sm text-muted-foreground">Start a conversation with the brand</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={2}
                          className="resize-none"
                        />
                        <Button size="icon" disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Deliverable</DialogTitle>
            <DialogDescription>Upload your content for {selectedDeliverable?.title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Upload File</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">MP4, MOV, JPG, PNG (max 100MB)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes for Brand (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any context or notes about this deliverable..."
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitDeliverable}>
              <Upload className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
