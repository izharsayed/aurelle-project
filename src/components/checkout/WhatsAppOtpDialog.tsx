import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck, RefreshCw, CheckCircle2, Lock, ArrowRight, Sparkles } from "lucide-react";
import type { CustomerDetails } from "@/data/types";

interface WhatsAppOtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mobileNumber: string;
  onVerified: (profile?: Partial<CustomerDetails>) => void;
  onChangeNumber?: () => void;
}

// Crisp official WhatsApp SVG icon
export function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function WhatsAppOtpDialog({
  open,
  onOpenChange,
  mobileNumber,
  onVerified,
  onChangeNumber,
}: WhatsAppOtpDialogProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(25);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send OTP when dialog opens
  useEffect(() => {
    if (open && mobileNumber) {
      setDigits(["", "", "", "", "", ""]);
      setErrorMsg(null);
      setVerifiedSuccess(false);
      handleSendOtp();
    }
  }, [open, mobileNumber]);

  // Resend countdown timer
  useEffect(() => {
    if (!open || resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, resendTimer]);

  // Auto-focus first input when dialog appears
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [open]);

  const handleSendOtp = async () => {
    setIsSending(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/send-whatsapp-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResendTimer(25);
        if (data.sandbox && data.debugOtp) {
          setSandboxCode(data.debugOtp);
        } else {
          setSandboxCode(null);
        }
        toast.success("Verification code sent to WhatsApp", {
          description: `Check WhatsApp message for +91 ${mobileNumber}`,
        });
      } else {
        setErrorMsg(data.message || "Failed to send verification code");
        if (data.resendInSeconds) {
          setResendTimer(data.resendInSeconds);
        }
      }
    } catch {
      setErrorMsg("Network error connecting to verification service.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1).replace(/\D/g, "");
    const updated = [...digits];
    updated[index] = char;
    setDigits(updated);
    setErrorMsg(null);

    // Auto-advance to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (char && index === 5 && updated.every((d) => d !== "")) {
      verifyOtp(updated.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const updated = [...digits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setDigits(updated);

    if (pasted.length === 6) {
      verifyOtp(pasted);
    } else {
      const nextIndex = Math.min(5, pasted.length);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const verifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join("");
    if (code.length !== 6) {
      setErrorMsg("Please enter all 6 digits.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/verify-whatsapp-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber,
          otp: code,
        }),
      });

      const data = await res.json();

      if (res.ok && data.verified) {
        setVerifiedSuccess(true);
        toast.success("Phone verified via WhatsApp!", {
          description: `+91 ${mobileNumber} is confirmed.`,
        });

        setTimeout(() => {
          onVerified(data.customerProfile);
          onOpenChange(false);
        }, 800);
      } else {
        setErrorMsg(data.message || "Invalid verification code.");
      }
    } catch {
      setErrorMsg("Failed to verify code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper to click-to-fill sandbox test OTP
  const fillSandboxCode = () => {
    const target = sandboxCode || "123456";
    const chars = target.split("").slice(0, 6);
    setDigits(chars);
    verifyOtp(target);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 sm:p-7 border-gold/30 bg-card shadow-2xl backdrop-blur-xl">
        <DialogHeader className="text-center sm:text-center space-y-3">
          {/* WhatsApp Badge / Brand Icon */}
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#25D366] shadow-inner">
            <WhatsAppIcon className="size-7 fill-[#25D366]" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-sans font-semibold">
              Zarika Secure Checkout
            </span>
            <DialogTitle className="font-serif text-2xl font-normal text-foreground">
              WhatsApp Verification
            </DialogTitle>
          </div>

          <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            We’ve sent a 6-digit verification code to your WhatsApp at{" "}
            <span className="font-semibold text-foreground font-mono">+91 {mobileNumber}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* 6 Digit Input Group */}
        <div className="py-3 space-y-4">
          <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isVerifying || verifiedSuccess}
                className={`size-11 sm:size-12 text-center text-xl font-mono font-semibold rounded-md border transition-all duration-200 outline-none
                  ${
                    verifiedSuccess
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                      : errorMsg
                        ? "border-destructive bg-destructive/5 text-destructive"
                        : digit
                          ? "border-gold bg-accent/10 text-foreground ring-1 ring-gold/40"
                          : "border-border bg-background hover:border-gold/50 focus:border-gold focus:ring-2 focus:ring-gold/30"
                  }
                `}
              />
            ))}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-center text-xs text-destructive animate-in fade-in-50 duration-200">
              {errorMsg}
            </p>
          )}

          {/* Success State */}
          {verifiedSuccess && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in-50">
              <CheckCircle2 className="size-4" />
              <span>Verified! Preparing your order...</span>
            </div>
          )}

          {/* Sandbox Helper Pill (Click to Auto-fill) */}
          {sandboxCode && !verifiedSuccess && (
            <div className="rounded-lg border border-gold/30 bg-gold/5 p-2.5 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-[11px] text-gold font-medium">
                <Sparkles className="size-3" />
                <span>Sandbox Test Mode</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Your test code is{" "}
                <button
                  type="button"
                  onClick={fillSandboxCode}
                  className="font-mono font-bold text-gold underline underline-offset-2 hover:opacity-80 cursor-pointer"
                >
                  {sandboxCode}
                </button>{" "}
                (Click to auto-fill)
              </p>
            </div>
          )}

          {/* Primary Action Button */}
          <Button
            type="button"
            onClick={() => verifyOtp()}
            disabled={isVerifying || digits.some((d) => !d) || verifiedSuccess}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-medium tracking-wide shadow-md transition-all duration-200 cursor-pointer"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="size-4 animate-spin mr-2" />
                Verifying Code...
              </>
            ) : verifiedSuccess ? (
              <>
                <CheckCircle2 className="size-4 mr-2" />
                Verified
              </>
            ) : (
              <>
                <span>Confirm & Continue</span>
                <ArrowRight className="size-4 ml-2" />
              </>
            )}
          </Button>

          {/* Resend & Change Number Controls */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            {resendTimer > 0 ? (
              <span className="text-[11px] text-muted-foreground/80">
                Resend code in <span className="font-mono font-medium">{resendTimer}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending}
                className="text-[11px] font-medium text-gold hover:underline cursor-pointer disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Resend code via WhatsApp"}
              </button>
            )}

            {onChangeNumber && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onChangeNumber();
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer"
              >
                Change Number
              </button>
            )}
          </div>
        </div>

        {/* Security Assurance */}
        <div className="border-t border-border/40 pt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
          <Lock className="size-3 text-gold/70" />
          <span>End-to-end verified via official WhatsApp Business API</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
