import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface FeedbackFormProps {
  onSubmit: (feedback: FeedbackData) => Promise<void>;
  initialData?: FeedbackData | null;
}

export interface FeedbackData {
  courseRating: number;
  comment?: string;
  moduleRatings?: Record<number, number>;
}

export function FeedbackForm({ onSubmit, initialData }: FeedbackFormProps) {
  const [courseRating, setCourseRating] = useState(initialData?.courseRating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (courseRating === 0) {
      alert('Veuillez donner une note au parcours');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        courseRating,
        comment: comment.trim() || undefined,
      });
      setSubmitted(true);
      console.log('[FEEDBACK] Feedback submitted successfully');
    } catch (err) {
      console.error('[FEEDBACK] Error submitting feedback:', err);
      alert('Erreur lors de l\'envoi du feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, setRating: (r: number) => void, hovered: number) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="text-3xl transition-all transform hover:scale-110 focus:outline-none"
            disabled={submitted}
          >
            {star <= (hovered || rating) ? (
              <span className="text-yellow-400">⭐</span>
            ) : (
              <span className="text-gray-600">☆</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  if (submitted && !initialData) {
    return (
      <Card className="bg-green-500/10 border border-green-500/30">
        <div className="text-center py-6">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-green-400 mb-2">
            Merci pour votre feedback !
          </h3>
          <p className="text-gray-300 text-sm">
            Votre avis nous aide à améliorer le parcours Vibeenengineer.
          </p>
          {courseRating && (
            <div className="mt-4 flex justify-center">
              {renderStars(courseRating, () => {}, 0)}
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2">
            {initialData ? '📝 Modifier votre feedback' : '💬 Donnez-nous votre avis'}
          </h3>
          <p className="text-sm text-gray-400">
            Votre retour est précieux pour améliorer le parcours
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Note globale du parcours *
          </label>
          {renderStars(courseRating, setCourseRating, hoveredStar)}
          {courseRating > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              {courseRating === 1 && '😞 Très insatisfait'}
              {courseRating === 2 && '😕 Insatisfait'}
              {courseRating === 3 && '😐 Neutre'}
              {courseRating === 4 && '😊 Satisfait'}
              {courseRating === 5 && '🤩 Très satisfait'}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Commentaire (optionnel)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience, vos suggestions d'amélioration..."
            rows={4}
            disabled={submitted}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibeen-accent focus:border-transparent text-white placeholder-gray-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length} caractères
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting || courseRating === 0}
            className="flex-1"
          >
            {submitting ? '📤 Envoi...' : initialData ? '✏️ Modifier' : '📨 Envoyer mon feedback'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

