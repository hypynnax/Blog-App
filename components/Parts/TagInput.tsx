import { useState } from "react";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onTagsChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onTagsChange([...tags, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Etiketler</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-400 hover:text-blue-600"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={addTag}
        placeholder="Etiket eklemek için yazın ve Enter'a basın"
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
