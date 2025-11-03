"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Building2, CreditCard, AlertCircle, CheckCircle2, Shield } from "lucide-react"

interface WithdrawModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableBalance: number
}

export function WithdrawModal({ open, onOpenChange, availableBalance }: WithdrawModalProps) {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("bank")
  const [isProcessing, setIsProcessing] = useState(false)
  const [kycVerified] = useState(true) // In real app, fetch from user data

  const numAmount = Number.parseFloat(amount) || 0
  const platformFee = numAmount * 0.02 // 2% platform fee
  const tds = numAmount * 0.1 // 10% TDS
  const netAmount = numAmount - platformFee - tds

  const handleWithdraw = async () => {
    if (numAmount < 500) return
    if (numAmount > availableBalance) return
    if (!kycVerified) return

    setIsProcessing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    onOpenChange(false)
    // Show success toast
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Withdraw Funds</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* KYC Warning */}
          {!kycVerified && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-500">KYC Verification Required</p>
                <p className="text-xs text-gray-400 mt-1">Complete your KYC verification to withdraw funds</p>
                <Button size="sm" className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-black">
                  Verify Now
                </Button>
              </div>
            </div>
          )}

          {/* Available Balance */}
          <div className="p-4 bg-[#1a1f35] rounded-lg">
            <p className="text-sm text-gray-400">Available Balance</p>
            <p className="text-2xl font-bold text-white mt-1">₹{availableBalance.toLocaleString()}</p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm text-gray-400">
              Withdrawal Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="pl-8 bg-[#1a1f35] border-white/10 text-white"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-400"
                onClick={() => setAmount(availableBalance.toString())}
              >
                Max
              </Button>
            </div>
            {numAmount > 0 && numAmount < 500 && (
              <p className="text-xs text-red-500">Minimum withdrawal amount is ₹500</p>
            )}
            {numAmount > availableBalance && <p className="text-xs text-red-500">Amount exceeds available balance</p>}
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-sm text-gray-400">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-3 p-4 bg-[#1a1f35] rounded-lg border border-white/10 hover:border-blue-500/50 transition-colors cursor-pointer">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Bank Account</p>
                    <p className="text-xs text-gray-400">HDFC Bank **** 4567</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-[#1a1f35] rounded-lg border border-white/10 hover:border-purple-500/50 transition-colors cursor-pointer">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">UPI</p>
                    <p className="text-xs text-gray-400">****2345@paytm</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Fees Breakdown */}
          {numAmount > 0 && (
            <div className="p-4 bg-[#1a1f35] rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Withdrawal Amount</span>
                <span className="text-white">₹{numAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Platform Fee (2%)</span>
                <span className="text-red-400">-₹{platformFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">TDS (10%)</span>
                <span className="text-red-400">-₹{tds.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex items-center justify-between font-bold">
                <span className="text-white">Net Amount</span>
                <span className="text-green-500">₹{netAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">
              Your withdrawal will be processed within 2-3 business days. You'll receive a confirmation email once
              completed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-[#1a1f35] bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleWithdraw}
              disabled={!kycVerified || numAmount < 500 || numAmount > availableBalance || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Withdrawal
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
