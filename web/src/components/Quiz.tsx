import { useState, useEffect } from 'react';
import { api } from '../api';
import { QuizQuestion, QuizSubmitResult } from '../types';
import { Button } from './Button';
import { Card } from './Card';

interface QuizProps {
  moduleId: number;
  isValidated: boolean;
  onSuccess: () => void;
}

export function Quiz({ moduleId, isValidated, onSuccess }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuiz();
  }, [moduleId]);

  const loadQuiz = async () => {
    try {
      console.log('[QUIZ] Loading quiz for module:', moduleId);
      const response = await api.get(`/quiz/${moduleId}`);
      setQuestions(response.data);
      setAnswers(new Array(response.data.length).fill(-1));
    } catch (err) {
      console.error('[QUIZ] Error loading quiz:', err);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a === -1)) {
      setError('Veuillez répondre à toutes les questions');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      console.log('[QUIZ] Submitting answers:', answers);
      const response = await api.post(`/quiz/${moduleId}/submit`, { answers });
      setResult(response.data);
      console.log('[QUIZ] Result:', response.data);

      if (response.data.validated) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      console.error('[QUIZ] Error submitting quiz:', err);
      setError(err.response?.data?.error || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Chargement du quiz...</div>;
  }

  if (isValidated) {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <p className="text-green-400 text-center font-medium">
          ✓ Quiz validé avec succès !
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quiz de validation</h2>
        <span className="text-sm text-gray-400">
          {questions.length} questions
        </span>
      </div>

      {questions.map((q, qIndex) => (
        <Card key={qIndex}>
          <p className="font-medium mb-4">
            {qIndex + 1}. {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((option, oIndex) => (
              <label
                key={oIndex}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  answers[qIndex] === oIndex
                    ? 'border-vibeen-accent bg-vibeen-accent/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  value={oIndex}
                  checked={answers[qIndex] === oIndex}
                  onChange={() => {
                    const newAnswers = [...answers];
                    newAnswers[qIndex] = oIndex;
                    setAnswers(newAnswers);
                    setError('');
                    setResult(null);
                  }}
                  className="mr-3"
                />
                <span className="text-gray-200">{option}</span>
              </label>
            ))}
          </div>
        </Card>
      ))}

      {error && (
        <Card className="bg-red-500/10 border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}

      {result && !result.validated && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <p className="text-yellow-400 text-sm">
            Score: {result.score}/{result.total} - Veuillez réessayer
          </p>
        </Card>
      )}

      {result && result.validated && (
        <Card className="bg-green-500/10 border-green-500/30">
          <p className="text-green-400 font-medium text-center">
            ✓ Quiz validé ! Score: {result.score}/{result.total}
          </p>
        </Card>
      )}

      <Button
        onClick={handleSubmit}
        disabled={submitting || (result && result.validated)}
        className="w-full"
      >
        {submitting ? 'Envoi en cours...' : 'Soumettre'}
      </Button>
    </div>
  );
}
