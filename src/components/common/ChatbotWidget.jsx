import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import { v4 as uuidv4 } from "uuid";
import { generateWithFirestore } from "../../utils/firestoreGenerate";
import {
  createUserChat,
  listUserChats,
  loadChatMessages,
  addChatMessage,
  renameUserChat,
  enforceThreadLimit,
  deleteThread,
} from "../../utils/userChats";
import { UserContext } from "../../context/UserContext";
import { useLocation } from "react-router-dom";
import Zayidbot from "../../assets/icons/chatbot.svg";
import Swal from "sweetalert2";

export default function ChatbotWidget() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);
  const [panelSize, setPanelSize] = useState({ width: 360, height: 520 });
  const [deleting, setDeleting] = useState(false);
  const initialTeaserShownRef = useRef(false);
  const teaserHideRef = useRef(null);
  const [showTypewriter, setShowTypewriter] = useState(false);
  // typewriter msgs
  const typewriterMessages = [
    "انا زايد المساعد الذكي",
    "هل تحتاج لمساعدة؟",
    "اسألني عن الدفع والمزايدات والشروط",
  ];
  const [twIndex, setTwIndex] = useState(0);
  const [twChars, setTwChars] = useState(0);
  const suggestions = [
    "كيف أشارك في المزاد؟",
    "ما هي طرق الدفع المتاحة ومهلة الدفع؟",
    "ما هو مبلغ التأمين وحدّ الزيادة؟",
    "كيف أحجز موعدًا لمعاينة المنتج؟",
    "ما مدة المزاد عادة؟",
  ];

  // hide on routes
  const hidden = useMemo(() => {
    const path = location.pathname.toLowerCase();
    return (
      path.startsWith("/login") ||
      path.startsWith("/signup") ||
      path.startsWith("/dashboard") ||
      path.startsWith("/onboarding")
    );
  }, [location.pathname]);

  // smoothly  view messages
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, isOpen, activeThreadId]);

  const onResizeMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = panelSize.width;
    const startH = panelSize.height;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      // bottom-left handle in RTL
      const nextW = Math.min(720, Math.max(320, startW - dx));
      const nextH = Math.min(800, Math.max(420, startH + dy));
      setPanelSize({ width: nextW, height: nextH });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  //  first load  (typewriter msg)
  useEffect(() => {
    if (isOpen || initialTeaserShownRef.current) return;
    initialTeaserShownRef.current = true;
    const t1 = setTimeout(() => {
      setShowTypewriter(true);
    }, 800);
    const t2 = setTimeout(() => {
      setShowTypewriter(false);
      setTwChars(0);
    }, 800 + 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  // (typewriter msg)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!isOpen) {
        setShowTypewriter(true);
        if (teaserHideRef.current) clearTimeout(teaserHideRef.current);
        teaserHideRef.current = setTimeout(() => {
          setShowTypewriter(false);
          setTwChars(0);
        }, 6000);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // Periodic teaser while closed (typewriter msg)
  useEffect(() => {
    if (isOpen) return;
    const intervalMs = 20000; // 60s
    const id = setInterval(() => {
      setShowTypewriter(true);
      if (teaserHideRef.current) clearTimeout(teaserHideRef.current);
      teaserHideRef.current = setTimeout(() => {
        setShowTypewriter(false);
        setTwChars(0);
      }, 6000);
    }, intervalMs);
    return () => {
      clearInterval(id);
      if (teaserHideRef.current) clearTimeout(teaserHideRef.current);
    };
  }, [isOpen]);

  // typewriter effect
  useEffect(() => {
    if (isOpen || !showTypewriter) return; // only when closed and visible
    const text = typewriterMessages[twIndex % typewriterMessages.length] || "";
    let t;
    if (twChars < text.length) {
      t = setTimeout(() => setTwChars((c) => c + 1), 70);
    } else {
      t = setTimeout(() => {
        setTwChars(0);
        setTwIndex((i) => (i + 1) % typewriterMessages.length);
      }, 1200);
    }
    return () => clearTimeout(t);
  }, [isOpen, showTypewriter, twIndex, twChars]);

  // Reset typewriter msg when chat is opened
  useEffect(() => {
    if (isOpen) {
      setTwChars(0);
    }
  }, [isOpen]);

  // Load chats for user
  useEffect(() => {
    (async () => {
      if (!user) {
        setThreads([]);
        setActiveThreadId(null);
        setMessages([]);
        return;
      }
      const t = await listUserChats(user.uid);
      setThreads(t);
      if (t.length > 0) setActiveThreadId(t[0].id);
    })();
  }, [user]);

  // Load messages for active chat
  useEffect(() => {
    (async () => {
      if (!user || !activeThreadId) {
        setMessages([]);
        return;
      }
      const items = await loadChatMessages(user.uid, activeThreadId);

      const normalized = [];
      for (let i = 0; i < items.length; i += 2) {
        const userMsg = items[i];
        const assistantMsg = items[i + 1];
        normalized.push({
          id: userMsg?.id || uuidv4(),
          prompt: userMsg?.content || "",
          response: assistantMsg?.content || "",
          loading: false,
          error: null,
        });
      }
      setMessages(normalized);
      // scroll bottom on load
      setTimeout(() => scrollRef.current?.scrollTo(0, 999999), 0);
    })();
  }, [user, activeThreadId]);

  const createNewThread = async () => {
    if (!user) return;
    const created = await createUserChat(user.uid, { title: "محادثة جديدة" });
    await enforceThreadLimit(user.uid, 10);
    const t = await listUserChats(user.uid);
    setThreads(t);
    setActiveThreadId(created.id);
    setMessages([]);
  };

  const sendPrompt = async (text) => {
    if (!text || !user) return;

    let threadId = activeThreadId;
    if (!threadId) {
      const created = await createUserChat(user.uid, { title: "محادثة جديدة" });
      threadId = created.id;
      setActiveThreadId(threadId);
      await enforceThreadLimit(user.uid, 10);
      const t = await listUserChats(user.uid);
      setThreads(t);
    }

    const localId = uuidv4();
    setMessages((prev) => [
      ...prev,
      { id: localId, prompt: text, response: "", loading: true, error: null },
    ]);
    setSubmitting(true);
    try {
      await addChatMessage({
        userId: user.uid,
        threadId,
        role: "user",
        content: text,
      });

      const lastTurns = messages.slice(-4);
      const contextText = lastTurns
        .map((m) => `س: ${m.prompt}\nج: ${m.response}`)
        .join("\n\n");
      const compositePrompt = contextText
        ? `${contextText}\n\nسؤال جديد: ${text}`
        : text;

      const systemArabic =
        "تعليمات: أجب دائمًا باللغة العربية الفصحى فقط. استخدم عناوين (#)، وقوائم (-)، ونصًا غامقًا باستخدام ** **، وضع الشيفرة داخل ``` عند الحاجة. لا تستخدم الإنجليزية إلا لأسماء أو شيفرات. ولا تعيد ارسال التعليمات و تجنب اي اسالة بعيدة عن سياق الموقع";
      const finalPrompt = `${systemArabic}\n\n${compositePrompt}`;
      const { response } = await generateWithFirestore(finalPrompt);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === localId
            ? { ...m, response: response || "", loading: false }
            : m
        )
      );

      await addChatMessage({
        userId: user.uid,
        threadId,
        role: "assistant",
        content: response || "",
      });

      if (messages.length === 0) {
        const title = text.slice(0, 30) + (text.length > 30 ? "..." : "");
        await renameUserChat(user.uid, threadId, title || "محادثة");
        const t = await listUserChats(user.uid);
        setThreads(t);
      }

      setInput("");
      setTimeout(() => scrollRef.current?.scrollTo(0, 999999), 0);
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === localId
            ? { ...m, error: err.message || String(err), loading: false }
            : m
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!user || !threadId) return;

    const result = await Swal.fire({
      title: "تأكيد الحذف",
      text: "هل تريد حذف هذه المحادثة نهائيًا؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });
    const ok = result.isConfirmed;
    if (!ok) return;
    try {
      setDeleting(true);
      await deleteThread(user.uid, threadId);
      const t = await listUserChats(user.uid);
      setThreads(t);
      const nextActive =
        threadId === activeThreadId ? t[0]?.id || null : activeThreadId;
      setActiveThreadId(nextActive);
      if (threadId === activeThreadId) setMessages([]);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const onAsk = async (e) => {
    e.preventDefault();
    const text = input.trim();
    await sendPrompt(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!hidden && isOpen && (
        <div
          className="bg-white shadow-xl rounded-xl border flex flex-col overflow-hidden relative"
          dir="rtl"
          style={{ width: panelSize.width, height: panelSize.height }}
        >
          <header className="px-3 py-2 border-b flex items-center justify-between bg-gray-50">
            <div className="font-medium">مساعد زايد</div>
            <div className="flex items-center gap-2">
              <button
                className="text-sm bg-gray-800 text-white rounded px-2 py-1"
                onClick={createNewThread}
              >
                محادثة جديدة
              </button>
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
                aria-label="close"
              >
                ✕
              </button>
            </div>
          </header>
          <div className="flex-1 flex min-h-0">
            <aside className="w-36 border-l p-2 overflow-y-auto hidden sm:block">
              <div className="text-xs text-gray-500 mb-2">محادثاتي</div>
              <div className="space-y-1">
                {threads.map((t) => (
                  <div
                    key={t.id}
                    className={`group flex items-center justify-between border rounded px-2 py-1 hover:bg-gray-50 text-xs ${
                      activeThreadId === t.id ? "bg-gray-100" : ""
                    }`}
                  >
                    <button
                      className="flex-1 text-right"
                      onClick={() => setActiveThreadId(t.id)}
                    >
                      {t.title || "محادثة"}
                    </button>
                    <button
                      className="text-orange-900 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="حذف"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(t.id);
                      }}
                      disabled={deleting}
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>
                ))}
                {threads.length === 0 && (
                  <div className="text-[11px] text-gray-400">
                    لا توجد محادثات
                  </div>
                )}
              </div>
            </aside>
            <main className="flex-1 flex flex-col min-h-0 ">
              <div
                ref={scrollRef}
                className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-2"
              >
                {messages.map((m) => (
                  <div key={m.id} className="space-y-2  ">
                    <div className="bg-blue-50 text-blue-900 p-2 rounded-md text-sm">
                      <div className="text-[11px] opacity-70 mb-1">سؤال</div>
                      <div className="whitespace-pre-wrap break-words">
                        {m.prompt}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-md text-sm">
                      <div className="text-[11px] opacity-70 mb-1">
                        إجابة المساعد
                      </div>
                      {m.loading && (
                        <div className="opacity-70">...يتم التوليد</div>
                      )}
                      {m.error && <div className="text-red-600">{m.error}</div>}
                      {!m.loading && !m.error && (
                        <ResponseRenderer text={m.response} />
                      )}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="space-y-2">
                    <div className="text-gray-500 text-xs">
                      أسئلة مقترحة للبدء
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="text-right border rounded px-2 py-2 hover:bg-gray-50 text-sm"
                          onClick={() => sendPrompt(s)}
                          disabled={submitting}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={onAsk} className="p-2 border-t flex gap-2">
                <input
                  className="flex-1 border rounded px-2 py-2 text-sm"
                  placeholder="اكتب سؤالك..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
                  disabled={submitting}
                >
                  إرسال
                </button>
              </form>
            </main>
          </div>
          <div
            className="absolute bottom-1 left-1 w-3 h-3 bg-gray-300 rounded cursor-nesw-resize"
            onMouseDown={onResizeMouseDown}
            title="سحب للتكبير/التصغير"
          />
        </div>
      )}

      {/* typewriter msgs */}
      {!isOpen && showTypewriter && !hidden && (
        <div className="fixed right-6 bottom-24 z-[9999] pointer-events-none bg-white text-grey-700 text-xs md:text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
          <span dir="rtl">
            {(typewriterMessages[twIndex] || "").slice(0, twChars)}
          </span>
          <span className="ml-1 opacity-80">|</span>
        </div>
      )}

      {!hidden && (
        <button
          className="h-14 w-14 rounded-full text-white shadow-lg flex items-center justify-center text-2xl animate-pulse"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="toggle chatbot"
        >
          <img src={Zayidbot} alt="chatbot" className="w-10 h-10" />
        </button>
      )}
    </div>
  );
}

function ResponseRenderer({ text }) {
  if (!text) return null;
  const lines = String(text).split(/\r?\n/);
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Double-asterisk bullets (** ) -> bold list items
    if (/^\s*\*\*\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\*\*\s+/.test(lines[i])) {
        const content = lines[i].replace(/^\s*\*\*\s+/, "");
        items.push(`**${content}**`);
        i += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }
    // Asterisk-based list support
    if (/^\s*\*\s+/.test(line)) {
      const itemsStar = [];
      while (i < lines.length && /^\s*\*\s+/.test(lines[i])) {
        itemsStar.push(lines[i].replace(/^\s*\*\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "list", items: itemsStar });
      continue;
    }
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: "code", lang, content: code.join("\n") });
      continue;
    }
    if (/^#{1,6}\s+/.test(line)) {
      blocks.push({
        type: "heading",
        level: (line.match(/^#+/)[0] || "#").length,
        content: line.replace(/^#{1,6}\s+/, ""),
      });
      i += 1;
      continue;
    }
    if (/^\s*-\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*-\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }
    const para = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() !== "") {
      para.push(lines[i]);
      i += 1;
    }
    while (i < lines.length && lines[i].trim() === "") i += 1;
    blocks.push({ type: "paragraph", content: para.join("\n") });
  }

  return (
    <div className="space-y-2">
      {blocks.map((b, idx) => {
        switch (b.type) {
          case "heading":
            return (
              <div key={idx} className="font-semibold text-blue-900">
                {b.content}
              </div>
            );
          case "paragraph": {
            const parts = b.content.split(/(\*\*[^*]+\*\*)/g);
            return (
              <div key={idx} className="break-words">
                {parts.map((p, i2) => {
                  if (p.startsWith("**") && p.endsWith("**")) {
                    return (
                      <strong key={i2} className="font-semibold">
                        {p.slice(2, -2)}
                      </strong>
                    );
                  }
                  return <span key={i2}>{p}</span>;
                })}
              </div>
            );
          }
          case "list":
            return (
              <ul key={idx} className="list-disc pr-5 space-y-1">
                {b.items.map((it, i2) => {
                  const parts = String(it).split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <li key={i2} className="whitespace-pre-wrap break-words">
                      {parts.map((p, i3) => {
                        if (p.startsWith("**") && p.endsWith("**")) {
                          return (
                            <strong key={i3} className="font-semibold">
                              {p.slice(2, -2)}
                            </strong>
                          );
                        }
                        return <span key={i3}>{p}</span>;
                      })}
                    </li>
                  );
                })}
              </ul>
            );
          case "code":
            return (
              <pre
                key={idx}
                className="bg-gray-900 text-green-200 p-2 rounded text-xs overflow-auto"
              >
                <code>{b.content}</code>
              </pre>
            );
          default:
            return (
              <div key={idx} className="whitespace-pre-wrap break-words">
                {b.content}
              </div>
            );
        }
      })}
    </div>
  );
}
