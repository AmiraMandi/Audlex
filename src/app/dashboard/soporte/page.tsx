"use client";

import { useState } from "react";
import { HelpCircle, Send, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

export default function SoportePage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      if (res.ok) {
        toast.success(i("support.sent"));
        setSubject("");
        setMessage("");
      } else {
        toast.error(i("support.error"));
      }
    } catch {
      toast.error(i("support.error"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text">{i("support.title")}</h1>
        <p className="text-text-secondary mt-1">{i("support.desc")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-brand-500" />
            {i("support.send")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={i("support.subject")}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                {i("support.message")}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none"
              />
            </div>
            <Button type="submit" disabled={sending || !subject.trim() || !message.trim()}>
              <Send className="h-4 w-4" />
              {sending ? i("support.sending") : i("support.send")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-5">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-brand-500" />
            <div>
              <p className="text-sm font-medium text-text">{i("support.email")}</p>
              <a href="mailto:soporte@audlex.com" className="text-sm text-brand-600 hover:text-brand-700">
                soporte@audlex.com
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
