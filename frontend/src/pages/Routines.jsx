import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, CheckCircle2, Edit2, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const USER_ID = "demo-user-123";

export default function Routines() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [newRoutine, setNewRoutine] = useState({
    name: "",
    time_of_day: "morning",
    items: [""],
  });

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const res = await axios.get(`${API}/routines/${USER_ID}`);
      setRoutines(res.data);
    } catch (error) {
      console.error("Error fetching routines:", error);
      toast.error("We couldn't save this right now. Your information is safe — try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const addRoutine = async (e) => {
    e.preventDefault();
    if (!newRoutine.name.trim()) return;

    try {
      await axios.post(`${API}/routines`, {
        user_id: USER_ID,
        name: newRoutine.name,
        time_of_day: newRoutine.time_of_day,
        items: newRoutine.items.filter((item) => item.trim()),
      });
      setNewRoutine({ name: "", time_of_day: "morning", items: [""] });
      setShowAdd(false);
      fetchRoutines();
      toast.success("Your ritual is set. A small anchor for your day.");
    } catch (error) {
      console.error("Error adding routine:", error);
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  const completeRoutine = async (routineId) => {
    try {
      await axios.patch(`${API}/routines/${routineId}/complete`);
      fetchRoutines();
      toast.success("Done. One soft step forward.");
    } catch (error) {
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  const startEditRoutine = (routine) => {
    setEditingRoutine(routine.id);
    setNewRoutine({
      name: routine.name,
      time_of_day: routine.time_of_day,
      items: [...routine.items],
    });
    setShowAdd(false);
  };

  const cancelEdit = () => {
    setEditingRoutine(null);
    setNewRoutine({ name: "", time_of_day: "morning", items: [""] });
  };

  const saveEditRoutine = async (e) => {
    e.preventDefault();
    if (!newRoutine.name.trim()) return;

    try {
      await axios.patch(`${API}/routines/${editingRoutine}`, {
        user_id: USER_ID,
        name: newRoutine.name,
        time_of_day: newRoutine.time_of_day,
        items: newRoutine.items.filter((item) => item.trim()),
      });
      setNewRoutine({ name: "", time_of_day: "morning", items: [""] });
      setEditingRoutine(null);
      fetchRoutines();
      toast.success("Your ritual is set. A small anchor for your day.");
    } catch (error) {
      console.error("Error updating routine:", error);
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  const deleteRoutine = async (routineId) => {
    try {
      await axios.delete(`${API}/routines/${routineId}`);
      fetchRoutines();
      toast.success("Stored away safely.");
    } catch (error) {
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  const addItem = () => {
    setNewRoutine({ ...newRoutine, items: [...newRoutine.items, ""] });
  };

  const updateItem = (index, value) => {
    const updated = [...newRoutine.items];
    updated[index] = value;
    setNewRoutine({ ...newRoutine, items: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading routines...</p>
        </div>
      </div>
    );
  }

  // Remove duplicate routines by ID (keep only latest version)
  const uniqueRoutines = new Map();
  routines.forEach(routine => {
    if (!routine.id || !routine.time_of_day) return; // Skip invalid routines
    
    if (uniqueRoutines.has(routine.id)) {
      const existing = uniqueRoutines.get(routine.id);
      if (new Date(routine.created_at) > new Date(existing.created_at)) {
        uniqueRoutines.set(routine.id, routine);
      }
    } else {
      uniqueRoutines.set(routine.id, routine);
    }
  });
  
  const deduplicatedRoutines = Array.from(uniqueRoutines.values());

  // Normalize category values and group
  const normalizeCategory = (category) => {
    if (!category) return '';
    return category.toLowerCase().trim();
  };

  const groupedRoutines = {
    morning: deduplicatedRoutines
      .filter((r) => normalizeCategory(r.time_of_day) === "morning")
      .sort((a, b) => a.name.localeCompare(b.name)), // Alphabetical order
    evening: deduplicatedRoutines
      .filter((r) => normalizeCategory(r.time_of_day) === "evening")
      .sort((a, b) => a.name.localeCompare(b.name)), // Alphabetical order
    weekly: deduplicatedRoutines
      .filter((r) => normalizeCategory(r.time_of_day) === "weekly")
      .sort((a, b) => a.name.localeCompare(b.name)), // Alphabetical order
  };

  return (
    <div className="space-y-8" data-testid="routines-page">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4" data-testid="routines-title">Routines</h1>
        <p className="text-lg text-stone-600 leading-relaxed font-caveat">
          Small rituals that anchor your day.
        </p>
      </div>

      {/* Add Routine Button */}
      {!showAdd && (
        <div className="text-center">
          <button
            onClick={() => setShowAdd(true)}
            data-testid="show-add-routine-btn"
            className="bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 px-6 py-3 rounded-full inline-flex items-center gap-2"
          >
            <Plus strokeWidth={1.5} size={18} />
            Add New Routine
          </button>
        </div>
      )}

      {/* Add/Edit Routine Form */}
      {(showAdd || editingRoutine) && (
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6">
          <form onSubmit={editingRoutine ? saveEditRoutine : addRoutine} className="space-y-4" data-testid="add-routine-form">
            <input
              type="text"
              value={newRoutine.name}
              onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
              placeholder="Name this ritual…"
              data-testid="routine-name-input"
              className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            />

            <select
              value={newRoutine.time_of_day}
              onChange={(e) => setNewRoutine({ ...newRoutine, time_of_day: e.target.value })}
              data-testid="routine-time-select"
              className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            >
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="weekly">Weekly</option>
            </select>

            <div className="space-y-2">
              <label className="text-sm text-stone-600">Steps:</label>
              {newRoutine.items.map((item, index) => (
                <input
                  key={index}
                  type="text"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder="Describe the small step you want to add to this routine…"
                  data-testid={`routine-item-input-${index}`}
                  className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
                />
              ))}
              <button
                type="button"
                onClick={addItem}
                data-testid="add-routine-item-btn"
                className="text-primary hover:text-primary/80 text-sm"
              >
                + Add step
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  cancelEdit();
                }}
                data-testid="cancel-routine-btn"
                className="flex-1 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all duration-300 py-3 rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                data-testid="save-routine-btn"
                className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-3 rounded-full"
              >
                {editingRoutine ? "Update Routine" : "Save Routine"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Routines by Time */}
      <div className="space-y-8">
        {["morning", "evening", "weekly"].map((timeOfDay) => {
          const timeRoutines = groupedRoutines[timeOfDay];
          const label = timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1);

          return (
            <div key={timeOfDay} data-testid={`routines-${timeOfDay}`}>
              <h2 className="text-2xl mb-4">{label}</h2>
              {timeRoutines.length === 0 ? (
                <p className="text-stone-500 font-caveat text-lg">You haven't added any rituals yet. Choose a few gentle anchors whenever you're ready.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {timeRoutines.map((routine) => (
                    <div
                      key={routine.id}
                      className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6"
                      data-testid={`routine-${routine.id}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-fraunces flex-1">{routine.name}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditRoutine(routine)}
                            data-testid={`edit-routine-btn-${routine.id}`}
                            className="text-stone-400 hover:text-primary transition-colors duration-300"
                          >
                            <Edit2 strokeWidth={1.5} size={18} />
                          </button>
                          <button
                            onClick={() => deleteRoutine(routine.id)}
                            data-testid={`delete-routine-btn-${routine.id}`}
                            className="text-stone-400 hover:text-red-500 transition-colors duration-300"
                          >
                            <Trash2 strokeWidth={1.5} size={18} />
                          </button>
                          <button
                            onClick={() => completeRoutine(routine.id)}
                            data-testid={`complete-routine-btn-${routine.id}`}
                            className={`${
                              routine.completed_today
                                ? "text-success"
                                : "text-stone-300 hover:text-primary"
                            } transition-colors duration-300`}
                          >
                            <CheckCircle2 strokeWidth={1.5} size={24} />
                          </button>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {routine.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-stone-600">
                            <span className="text-primary mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}