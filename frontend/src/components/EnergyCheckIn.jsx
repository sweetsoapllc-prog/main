import { useState } from "react";
import axios from "axios";
import { Frown, Meh, Smile, Heart } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function EnergyCheckIn({ userId, onComplete }) {
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const energyLevels = [
    { value: 1, icon: Frown, label: "Exhausted", color: "text-red-400" },
    { value: 2, icon: Frown, label: "Low", color: "text-orange-400" },
    { value: 3, icon: Meh, label: "Okay", color: "text-yellow-400" },
    { value: 4, icon: Smile, label: "Good", color: "text-lime-400" },
    { value: 5, icon: Heart, label: "Energized", color: "text-green-400" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/energy`, {
        user_id: userId,
        energy_level: energy,
        notes: notes || null,
      });
      onComplete?.();
    } catch (error) {
      console.error("Error submitting energy check-in:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="energy-checkin-form">
      <div className="flex justify-between gap-2">
        {energyLevels.map((level) => {
          const Icon = level.icon;
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => setEnergy(level.value)}
              data-testid={`energy-level-${level.value}`}
              className={`flex-1 p-3 rounded-2xl border-2 transition-all duration-300 ${
                energy === level.value
                  ? "border-primary bg-primary/5 scale-105"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <Icon className={`${level.color} mx-auto mb-1`} strokeWidth={1.5} size={24} />
              <p className="text-xs text-stone-600">{level.label}</p>
            </button>
          );
        })}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Anything you'd like to share? (optional)"
        data-testid="energy-notes-input"
        className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl p-4 outline-none resize-none"
        rows={3}
      />

      <button
        type="submit"
        disabled={submitting}
        data-testid="energy-submit-btn"
        className="w-full bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-3 rounded-full disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Save check-in"}
      </button>
    </form>
  );
}