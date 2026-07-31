"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, Mail, Loader2 } from "lucide-react";
import { newsletterAPI } from "../services/api";

export default function NewsletterInline() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await newsletterAPI.subscribe(email.trim());
      if (res.data.success) {
        setState("success");
        setEmail("");
      } else {
        setErrorMsg(res.data.message || "Could not subscribe.");
        setState("error");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Something went wrong.");
      setState("error");
    }
  };

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {state === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-semibold">You&apos;re subscribed — welcome aboard!</span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
                placeholder="Your email address"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-neutral-900 border text-white placeholder-neutral-500 outline-none focus:border-editorial-accent/60 transition-colors ${
                  state === "error" ? "border-red-500/60" : "border-neutral-800"
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={state === "loading"}
              className="bg-white hover:bg-neutral-100 active:scale-95 text-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 rounded-xl disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-sm min-w-[110px]"
            >
              {state === "loading" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Subscribe"
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === "error" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-[10px] text-red-400 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
