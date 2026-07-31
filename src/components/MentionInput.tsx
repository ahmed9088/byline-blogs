"use client";

import { useState, useEffect, useRef } from "react";
import { authAPI } from "../services/api";
import { AtSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserSuggestion {
  _id: string;
  name: string;
  profileImage?: string;
  role: string;
}

interface MentionInputProps {
  value: string;
  onChange: (val: string) => void;
  onMentionsChange: (ids: string[]) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export default function MentionInput({
  value,
  onChange,
  onMentionsChange,
  placeholder = "Write your review or insight...",
  rows = 4,
  disabled = false,
}: MentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedUsers, setSelectedUsers] = useState<UserSuggestion[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trigger user search when `@` search query changes
  useEffect(() => {
    if (!showDropdown || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await authAPI.searchUsers(searchQuery);
        if (res.data.success) {
          setSuggestions(res.data.users);
          setActiveIndex(0);
        }
      } catch (err) {
        console.error("Error fetching user suggestions:", err);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, showDropdown]);

  // Click outside to close suggestion popup
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, selectionStart);
    
    // Look for the last '@' symbol in the word before the cursor
    const lastAtIdx = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIdx !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIdx + 1);
      // Ensure there are no spaces or newlines in the query to continue matching
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionStartIndex(lastAtIdx);
        setSearchQuery(textAfterAt);
        setShowDropdown(true);
        return;
      }
    }
    
    setShowDropdown(false);
  };

  const selectUser = (user: UserSuggestion) => {
    if (!textareaRef.current) return;
    
    const text = value;
    const beforeMention = text.substring(0, mentionStartIndex);
    const afterCursor = text.substring(textareaRef.current.selectionStart);
    
    const insertedText = `@${user.name} `;
    const newText = beforeMention + insertedText + afterCursor;
    
    onChange(newText);
    setShowDropdown(false);
    
    // Track mentions list
    const updatedUsers = [...selectedUsers, user];
    setSelectedUsers(updatedUsers);
    onMentionsChange(updatedUsers.map((u) => u._id));

    // Refocus textarea and position cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const cursorPosition = mentionStartIndex + insertedText.length;
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectUser(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full text-xs px-3 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-editorial-accent dark:text-neutral-100 font-sans leading-relaxed transition-colors"
      />
      
      {/* Dropdown Suggestions */}
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute z-50 left-0 w-[240px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl shadow-xl overflow-hidden font-sans bottom-full mb-1.5"
          >
            <div className="p-2 border-b border-neutral-100 dark:border-neutral-900 flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-extrabold text-neutral-450 dark:text-neutral-500">
              <AtSign className="w-3 h-3 text-editorial-accent" />
              <span>Mention User</span>
            </div>
            <div className="max-h-[160px] overflow-y-auto py-1">
              {suggestions.map((s, idx) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => selectUser(s)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                    idx === activeIndex
                      ? "bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {s.profileImage ? (
                    <img
                      src={s.profileImage}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center font-bold text-[8px] uppercase border text-neutral-500">
                      {(s.name || "?")[0]}
                    </div>
                  )}
                  <span className="font-semibold truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
