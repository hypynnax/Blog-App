import { useState } from "react";

interface CommentFormProps {
  onSubmit: (comment: string) => void;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment);
      setComment("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Yorumunuzu yazın..."
        className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={4}
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
      >
        Yorum Yap
      </button>
    </form>
  );
}
