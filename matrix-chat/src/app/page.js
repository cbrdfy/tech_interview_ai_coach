'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [phase, setPhase] = useState('topic'); // 'topic' | 'answer' | 'reset'
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const [feedback, setFeedback] = useState('');
  // For typing effect
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [displayedFeedback, setDisplayedFeedback] = useState('');

  // Typing animation for question
  useEffect(() => {
    let i = 0;
    if (question) {
      const interval = setInterval(() => {
        setDisplayedQuestion((prev) => prev + question[i]);
        i++;
        if (i >= question.length) clearInterval(interval);
      }, 40); // adjust typing speed here
      return () => clearInterval(interval);
    }
  }, [question]);

  // Typing animation for feedback
  useEffect(() => {
    let i = 0;
    if (feedback) {
      const interval = setInterval(() => {
        setDisplayedFeedback((prev) => prev + feedback[i]);
        i++;
        if (i >= feedback.length) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }
  }, [feedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Handle reset phase first, before checking for empty input
    if (phase === 'reset') {
      setInput('');
      setQuestion('');
      setFeedback('');
      setDisplayedQuestion('');
      setDisplayedFeedback('');
      setPhase('topic');
    }

    // Then check for empty input for other phases
    if (!input.trim()) return;

    if (phase === 'topic') {
      // Step 1: Send topic → Get question
      const res = await fetch('http://localhost:8000/generate_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: input }),
      });
      const data = await res.json();
      setQuestion(data.question);
      setDisplayedQuestion(''); // clear previous data
      setInput('');
      setPhase('answer');
    } else if (phase === 'answer') {
      // Step 2: Send answer → Get evaluation
      const res = await fetch('http://localhost:8000/evaluate_answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer: input }),
      });
      const data = await res.json();
      setFeedback(data.evaluation);
      setDisplayedFeedback(''); // clear before typing effect
      setInput('');
      setPhase('reset');
    }
  };

  return (
    <main className="flex flex-col items-start justify-start h-screen bg-black text-green-500 p-10 font-mono">
      <form onSubmit={handleSubmit} className="w-full">
        <label className="text-green-400 text-lg mb-2 block">
          {phase === 'topic' && 'Enter a topic:'}
          {phase === 'answer' && 'Your answer:'}
          {phase === 'reset' && 'Press Enter to reset'}
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            phase === 'topic' ? 'Type your topic...' :
              phase === 'answer' ? 'Type your answer...' :
                'Press Enter to reset'
          }
          className="w-full bg-black border-b border-green-500 text-green-400 p-2 focus:outline-none"
          readOnly={phase === 'reset'} // Make input read-only in reset phase
        />
      </form>
      {/* Typing effect output */}
      {displayedQuestion && (
        <div className="mt-6 text-green-300 whitespace-pre-wrap">
          <strong>Question:</strong>
          <p>{displayedQuestion}</p>
        </div>
      )}
      {displayedFeedback && (
        <div className="mt-6 text-green-300 whitespace-pre-wrap">
          <strong>Evaluation:</strong>
          <p>{displayedFeedback}</p>
        </div>
      )}
    </main>
  );
}
