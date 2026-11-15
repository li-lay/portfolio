"use client";

import { useEffect, useState } from "react";

const quotes = [
  '"The best way to predict the future is to create it." - Peter Drucker',
  '"Code is poetry." - Unknown',
  '"Knowledge cut efforts." - Lilay',
  '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
  '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler',
  "\"Programming isn't about what you know; it's about what you can figure out.\" - Chris Pine",
  '"First, solve the problem. Then, write the code." - John Johnson',
  '"The most disastrous thing that you can ever learn is your first programming language." - Alan Kay',
  '"Simplicity is the ultimate sophistication." - Leonardo da Vinci',
  '"The only limit to our realization of tomorrow will be our doubts of today." - Franklin D. Roosevelt',
  '"Creativity is intelligence having fun." - Albert Einstein',
  '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
];

export default function Fortune() {
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="min-w-0">
      <p className="font-mono text-gray">$ fortune</p>
      <p className="mt-2 break-words font-sans text-base leading-relaxed text-fg1">
        {quote ?? "\u00a0"}
      </p>
    </div>
  );
}
