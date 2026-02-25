"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// EU AI Act knowledge base — Spanish
const knowledgeBaseES: Record<string, string> = {
  "que es|qué es|ai act|eu ai act|reglamento": "El **EU AI Act** (Reglamento UE 2024/1689) es la primera ley integral del mundo que regula la inteligencia artificial. Clasifica los sistemas de IA en 4 niveles de riesgo:\n\n• **Inaceptable** (prohibido): manipulación, scoring social\n• **Alto riesgo**: RRHH, biometría, crédito, educación\n• **Limitado**: chatbots, deepfakes (obligación de transparencia)\n• **Mínimo**: sin obligaciones específicas\n\nLas multas pueden llegar hasta **35M€ o el 7%** de la facturación global.",

  "multa|sanción|sancion|penalización|penalizacion|castigo": "El AI Act establece **3 niveles de sanciones**:\n\n1. **Prácticas prohibidas**: hasta 35M€ o 7% facturación global\n2. **Incumplimiento alto riesgo**: hasta 15M€ o 3%\n3. **Información incorrecta**: hasta 7.5M€ o 1.5%\n\nPara PYMEs se aplica la cantidad menor. Tener un **plan de compliance documentado** es el mejor atenuante.",

  "chatbot|asistente|bot": "Los **chatbots** se clasifican generalmente como **riesgo limitado** (Art. 50). La obligación principal es de **transparencia**: debes informar al usuario de que está interactuan con una IA.\n\nSi tu chatbot toma decisiones que afectan a personas (ej: filtro de candidatos, scoring), podría subir a **alto riesgo**.\n\nCon Audlex puedes clasificar tu chatbot en minutos y generar el aviso de transparencia obligatorio.",

  "clasificar|clasificación|clasificacion|riesgo|nivel": "Para clasificar tu sistema de IA según el AI Act:\n\n1. **Identifica el uso**: ¿Para qué se usa el sistema?\n2. **Comprueba Art. 5**: ¿Es una práctica prohibida?\n3. **Comprueba Anexo III**: ¿Entra en las 8 categorías de alto riesgo?\n4. **Comprueba Art. 50**: ¿Requiere transparencia?\n5. **Si no encaja**: riesgo mínimo\n\nEn Audlex, nuestro **clasificador automático** te guía con preguntas adaptativas basadas en el texto literal del reglamento.",

  "plazo|fecha|cuándo|cuando|deadline|tiempo": "**Plazos del EU AI Act:**\n\n• ✅ Feb 2025: Prácticas prohibidas (YA EN VIGOR)\n• ✅ Ago 2025: IA de propósito general (transparencia)\n• ⏳ **Ago 2026**: Sistemas de alto riesgo (Anexo III)\n• ⏳ Ago 2027: Alto riesgo en productos regulados (Anexo I)\n\nQuedan menos de **1 año** para el plazo de alto riesgo. Empieza ahora.",

  "documento|documentación|documentacion": "Para sistemas de **alto riesgo**, necesitas hasta **13 documentos**:\n\n• Sistema de gestión de riesgos (Art. 9)\n• Plan de gobernanza de datos (Art. 10)\n• Documentación técnica (Art. 11 + Anexo IV)\n• Registro de actividades (Art. 12)\n• Información de transparencia (Art. 13)\n• Protocolo supervisión humana (Art. 14)\n• Declaración de conformidad (Art. 47)\n• Evaluación de impacto en derechos (Art. 27)\n\nAudlex los **genera automáticamente** con tus datos.",

  "rrhh|recursos humanos|cv|empleo|candidato|contratación|contratacion": "Los sistemas de IA en **empleo y RRHH** son de **alto riesgo** (Anexo III, categoría 4). Esto incluye:\n\n• Filtrado de CVs (LinkedIn Recruiter, Workable, etc.)\n• Evaluación de candidatos con IA\n• Scoring de rendimiento de empleados\n• Decisiones de ascenso/despido basadas en IA\n\nNecesitas documentación técnica completa, supervisión humana y evaluación de impacto. Audlex te genera todo automáticamente.",

  "iso|42001|estándar|estandar": "**ISO 42001** y el **EU AI Act** son complementarios pero diferentes:\n\n• ISO 42001 es un **estándar voluntario** de gestión de IA\n• El AI Act es una **ley vinculante** con sanciones\n\nISO 42001 te ayuda con gobernanza, pero **no cubre** los requisitos específicos del AI Act: clasificación de riesgo, documentación técnica obligatoria, registro en base de datos de la UE.\n\nAudlex se centra en los **requisitos legales** del AI Act.",

  "pyme|pequeña|autónomo|autonomo|empresa": "El AI Act **sí afecta a PYMEs**. Si tu empresa usa cualquier herramienta con IA (ChatGPT, CRM con scoring, etc.), te aplica.\n\nBuenas noticias:\n• Las sanciones para PYMEs son **proporcionalmente menores**\n• Hay **exempciones** para ciertas actividades de I+D\n• Herramientas como Audlex simplifican el proceso\n\nCon nuestro **plan gratuito** puedes clasificar tu primer sistema y ver qué obligaciones tienes.",
};

// EU AI Act knowledge base — English
const knowledgeBaseEN: Record<string, string> = {
  "what is|ai act|eu ai act|regulation": "The **EU AI Act** (Regulation EU 2024/1689) is the world's first comprehensive law regulating artificial intelligence. It classifies AI systems into 4 risk levels:\n\n• **Unacceptable** (prohibited): manipulation, social scoring\n• **High risk**: HR, biometrics, credit, education\n• **Limited**: chatbots, deepfakes (transparency obligation)\n• **Minimal**: no specific obligations\n\nFines can reach up to **€35M or 7%** of global turnover.",

  "fine|sanction|penalty|punishment": "The AI Act establishes **3 levels of sanctions**:\n\n1. **Prohibited practices**: up to €35M or 7% global turnover\n2. **High-risk non-compliance**: up to €15M or 3%\n3. **Incorrect information**: up to €7.5M or 1.5%\n\nFor SMEs, the lower amount applies. Having a **documented compliance plan** is the best mitigating factor.",

  "chatbot|assistant|bot": "**Chatbots** are generally classified as **limited risk** (Art. 50). The main obligation is **transparency**: you must inform users they are interacting with an AI.\n\nIf your chatbot makes decisions affecting people (e.g., candidate filtering, scoring), it could be classified as **high risk**.\n\nWith Audlex you can classify your chatbot in minutes and generate the required transparency notice.",

  "classify|classification|risk|level": "To classify your AI system under the AI Act:\n\n1. **Identify the use**: What is the system used for?\n2. **Check Art. 5**: Is it a prohibited practice?\n3. **Check Annex III**: Does it fall into the 8 high-risk categories?\n4. **Check Art. 50**: Does it require transparency?\n5. **If none apply**: minimal risk\n\nIn Audlex, our **automatic classifier** guides you with adaptive questions based on the regulation's literal text.",

  "deadline|date|when|timeline": "**EU AI Act Deadlines:**\n\n• ✅ Feb 2025: Prohibited practices (ALREADY IN FORCE)\n• ✅ Aug 2025: General-purpose AI (transparency)\n• ⏳ **Aug 2026**: High-risk systems (Annex III)\n• ⏳ Aug 2027: High-risk in regulated products (Annex I)\n\nLess than **1 year** remains for the high-risk deadline. Start now.",

  "document|documentation": "For **high-risk** systems, you need up to **13 documents**:\n\n• Risk management system (Art. 9)\n• Data governance plan (Art. 10)\n• Technical documentation (Art. 11 + Annex IV)\n• Activity logging (Art. 12)\n• Transparency information (Art. 13)\n• Human oversight protocol (Art. 14)\n• Declaration of conformity (Art. 47)\n• Fundamental rights impact assessment (Art. 27)\n\nAudlex **generates them automatically** with your data.",

  "hr|human resources|cv|employment|candidate|hiring|recruit": "AI systems in **employment and HR** are **high risk** (Annex III, category 4). This includes:\n\n• CV filtering (LinkedIn Recruiter, Workable, etc.)\n• AI-based candidate evaluation\n• Employee performance scoring\n• AI-based promotion/dismissal decisions\n\nYou need complete technical documentation, human oversight and impact assessment. Audlex generates everything automatically.",

  "iso|42001|standard": "**ISO 42001** and the **EU AI Act** are complementary but different:\n\n• ISO 42001 is a **voluntary standard** for AI management\n• The AI Act is a **binding law** with penalties\n\nISO 42001 helps with governance, but **does not cover** the specific AI Act requirements: risk classification, mandatory technical documentation, EU database registration.\n\nAudlex focuses on the **legal requirements** of the AI Act.",

  "sme|small|freelance|business|company": "The AI Act **does affect SMEs**. If your company uses any AI tool (ChatGPT, CRM with scoring, etc.), it applies to you.\n\nGood news:\n• Penalties for SMEs are **proportionally lower**\n• There are **exemptions** for certain R&D activities\n• Tools like Audlex simplify the process\n\nWith our **free plan** you can classify your first system and see what obligations you have.",
};

function findAnswer(question: string, kb: Record<string, string>, defaultAnswer: string): string {
  const q = question.toLowerCase();
  for (const [pattern, answer] of Object.entries(kb)) {
    const keywords = pattern.split("|");
    if (keywords.some((kw) => q.includes(kw))) {
      return answer;
    }
  }
  return defaultAnswer;
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { locale } = useLocale();
  const i = (key: string) => td(locale, key);
  const quickQuestions = [i("assistant.q1"), i("assistant.q2"), i("assistant.q3"), i("assistant.q4")];

  // Greeting is computed from locale so it updates instantly on language switch
  const greeting: Message = { role: "assistant", content: i("assistant.greeting") };
  const allMessages: Message[] = [greeting, ...messages];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  function handleSend(text?: string) {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setIsLoading(true);

    // Simulate typing delay for more natural feel
    setTimeout(() => {
      const kb = locale === "en" ? knowledgeBaseEN : knowledgeBaseES;
      const defaultAnswer = i("assistant.defaultAnswer");
      const answer = findAnswer(msg, kb, defaultAnswer);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      setIsLoading(false);
    }, 600);
  }

  function renderMarkdown(text: string) {
    // Simple markdown: **bold**, bullet points
    return text.split("\n").map((line, index) => {
      if (line.startsWith("• ")) {
        const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return (
          <li key={index} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: content }} />
        );
      }
      const content = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return line ? (
        <p key={index} dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <br key={index} />
      );
    });
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-xl shadow-brand-500/30 hover:bg-brand-600 hover:shadow-brand-500/40 transition-all duration-300 group"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">{i("assistant.button")}</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
          </span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[380px] max-h-[100dvh] sm:max-h-[560px] rounded-none sm:rounded-2xl border-0 sm:border border-border bg-surface shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-secondary">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-brand-500" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-surface-secondary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{i("assistant.name")}</p>
                <p className="text-xs text-text-muted">{i("assistant.subtitle")}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 hover:bg-surface transition"
            >
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[380px] scrollbar-thin">
            {allMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-brand-500/10 flex items-center justify-center mt-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-500 text-white rounded-br-md"
                      : "bg-surface-secondary border border-border text-text rounded-bl-md"
                  }`}
                >
                  <div className="space-y-1">{renderMarkdown(msg.content)}</div>
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-brand-500/20 flex items-center justify-center mt-0.5">
                    <User className="h-3.5 w-3.5 text-brand-500" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-brand-500/10 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                </div>
                <div className="bg-surface-secondary border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 text-text-muted animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length === 0 && (
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-surface hover:border-brand-500/30 hover:text-brand-500 text-text-secondary transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={i("assistant.placeholder")}
                className="flex-1 rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-brand-500 transition"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-brand-500 px-3 py-2 text-white hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
