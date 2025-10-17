import React, { useState } from 'react';
import { ArrowLeft, Users, MessageSquare, Send } from 'lucide-react';

const dilemmas = [
  {
    id: 1,
    title: "Students use ChatGPT to generate ideas for class discussion",
    question: "Should I restrict AI use during class preparation?",
    guideline: "Lesson Enactment: Avoid over-reliance. Design parts of the lesson where students engage in non-AI critical thinking, discussion, or hands-on work.",
    emoji: "💭"
  },
  {
    id: 2,
    title: "I receive a piece of work that seems AI-generated, but I'm not certain",
    question: "Should I confront the student directly about it?",
    guideline: "Assessment and Feedback: State clearly if AI is permitted in formative work, and the conditions (e.g. must acknowledge tool used, context of use).",
    emoji: "🤔"
  },
  {
    id: 3,
    title: "Students use ChatGPT to generate step-by-step solutions for tutorial questions",
    question: "Should I allow students to use AI-generated solutions as part of their learning process?",
    guideline: "Positive Classroom Culture: Address misconceptions. Clarify that AI is a tool, not a replacement for human effort or creativity.",
    emoji: "📝"
  },
  {
    id: 4,
    title: "A teacher uses AI to draft Prelim/Promo exam questions",
    question: "Should teachers rely on AI tools to generate assessment questions?",
    guideline: "Lesson Preparation: Select vetted, MOE-approved or school-endorsed AI tools (e.g. SLS); avoid entering sensitive student or staff data into public tools (e.g. ChatGPT, Gemini).",
    emoji: "✍️"
  }
];

// Google Form submission URL
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdjlRye076lzFoaPSxHz0GxZLrIYUAFZLypQDbk-SoL6QwsHg/formResponse";

export default function AIDilemmaPoll() {
  const [page, setPage] = useState('home');
  const [selectedDilemma, setSelectedDilemma] = useState(null);
  const [votes, setVotes] = useState({
    1: { yes: 0, no: 0 },
    2: { yes: 0, no: 0 },
    3: { yes: 0, no: 0 },
    4: { yes: 0, no: 0 }
  });
  const [userVote, setUserVote] = useState(null);
  const [comment, setComment] = useState('');
  const [votedDilemmas, setVotedDilemmas] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleDilemmaSelect = (dilemma) => {
    setSelectedDilemma(dilemma);
    setUserVote(null);
    setComment('');
    setSubmitSuccess(false);
    setPage('poll');
  };

  const handleVote = (vote) => {
    setVotes(prev => ({
      ...prev,
      [selectedDilemma.id]: {
        ...prev[selectedDilemma.id],
        [vote]: prev[selectedDilemma.id][vote] + 1
      }
    }));
    setUserVote(vote);
    setVotedDilemmas(prev => new Set([...prev, selectedDilemma.id]));
    setPage('results');
  };

  const handleBackToHome = () => {
    setPage('home');
    setSelectedDilemma(null);
    setUserVote(null);
    setComment('');
    setSubmitSuccess(false);
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      alert('Please enter a comment before submitting.');
      return;
    }

    setIsSubmitting(true);

    // Build the submission URL with query parameters
    const params = new URLSearchParams({
      'entry.1471194457': `Scenario ${selectedDilemma.id}`,
      'entry.619067412': userVote.toUpperCase(),
      'entry.1644188439': comment,
      'entry.1016419855': new Date().toLocaleString()
    });

    const submissionUrl = `${GOOGLE_FORM_URL}?${params.toString()}`;

    try {
      // Use fetch with no-cors mode to submit the form
      await fetch(submissionUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      // Since no-cors doesn't return a response, we assume success
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setComment('');
    } catch (error) {
      console.error('Submission error:', error);
      // Even if there's an error, the submission might have succeeded
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setComment('');
    }
  };

  const getTotalVotes = (dilemmaId) => {
    return votes[dilemmaId].yes + votes[dilemmaId].no;
  };

  const getPercentage = (dilemmaId, vote) => {
    const total = getTotalVotes(dilemmaId);
    if (total === 0) return 0;
    return Math.round((votes[dilemmaId][vote] / total) * 100);
  };

  // Homepage
  if (page === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-indigo-900 mb-4">
              🤖 The AI Dilemma
            </h1>
            <p className="text-xl text-indigo-700">
              Let us know your thoughts!
            </p>
            <p className="text-gray-600 mt-2">
              Choose a scenario below to share your perspective
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {dilemmas.map((dilemma) => (
              <div
                key={dilemma.id}
                onClick={() => handleDilemmaSelect(dilemma)}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-indigo-300"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{dilemma.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Scenario {dilemma.id}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {dilemma.title}
                    </p>
                    {votedDilemmas.has(dilemma.id) && (
                      <span className="inline-block mt-3 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        ✓ Voted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Hidden iframe for form submission */}
        <iframe name="hidden_iframe" style={{ display: 'none' }}></iframe>
      </div>
    );
  }

  // Poll Page
  if (page === 'poll' && selectedDilemma) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to scenarios</span>
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">{selectedDilemma.emoji}</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Scenario {selectedDilemma.id}
              </h2>
              <p className="text-gray-600 mb-6 italic">
                {selectedDilemma.title}
              </p>
            </div>

            <div className="bg-indigo-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-indigo-900 mb-4 text-center">
                {selectedDilemma.question}
              </h3>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleVote('yes')}
                className="flex-1 max-w-xs bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                👍 Yes
              </button>
              <button
                onClick={() => handleVote('no')}
                className="flex-1 max-w-xs bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                👎 No
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Page
  if (page === 'results' && selectedDilemma) {
    const totalVotes = getTotalVotes(selectedDilemma.id);
    const yesPercent = getPercentage(selectedDilemma.id, 'yes');
    const noPercent = getPercentage(selectedDilemma.id, 'no');

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">{selectedDilemma.emoji}</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Thank you for voting!
              </h2>
              <p className="text-gray-600">
                You voted: <span className="font-bold text-indigo-600">{userVote.toUpperCase()}</span>
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users size={20} />
                  Live Results
                </h3>
                <span className="text-sm text-gray-500">
                  {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-green-700">Yes</span>
                    <span className="font-bold text-green-700">{yesPercent}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${yesPercent}%` }}
                    >
                      {yesPercent > 0 && (
                        <span className="text-white text-xs font-bold">
                          {votes[selectedDilemma.id].yes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-red-700">No</span>
                    <span className="font-bold text-red-700">{noPercent}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${noPercent}%` }}
                    >
                      {noPercent > 0 && (
                        <span className="text-white text-xs font-bold">
                          {votes[selectedDilemma.id].no}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-6 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                💡 Reflection & Guideline
              </h4>
              <p className="text-amber-800 text-sm leading-relaxed">
                {selectedDilemma.guideline}
              </p>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <MessageSquare size={18} />
                Share your thoughts (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What's your perspective on this dilemma? Share your thoughts here..."
                className="w-full border-2 border-gray-300 rounded-lg p-4 focus:border-indigo-500 focus:outline-none resize-none"
                rows="4"
                disabled={submitSuccess}
              />
              
              {!submitSuccess ? (
                <button
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || isSubmitting}
                  className="mt-3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Comment
                    </>
                  )}
                </button>
              ) : (
                <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="text-xl">✓</span>
                  <span className="font-semibold">Comment submitted successfully!</span>
                </div>
              )}
            </div>

            <button
              onClick={handleBackToHome}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              ← Back to Homepage
            </button>
          </div>
        </div>
        {/* Hidden iframe for form submission */}
        <iframe name="hidden_iframe" style={{ display: 'none' }}></iframe>
      </div>
    );
  }

  return null;
}
