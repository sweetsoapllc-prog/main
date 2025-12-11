import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Edit2, MoveRight, X, Check } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const USER_ID = "demo-user-123";

export default function Tasks() {
  const [tasks, setTasks] = useState({ today: [], this_week: [], later: [] });
  const [newTask, setNewTask] = useState({ title: "", category: "today" });
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [movingTask, setMovingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/tasks/${USER_ID}`);
      const grouped = {
        today: res.data.filter((t) => t.category === "today" && !t.completed),
        this_week: res.data.filter((t) => t.category === "this_week" && !t.completed),
        later: res.data.filter((t) => t.category === "later" && !t.completed),
      };
      setTasks(grouped);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("We couldn't save this right now. Your information is safe — try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await axios.post(`${API}/tasks`, {
        user_id: USER_ID,
        title: newTask.title,
        category: newTask.category,
      });
      setNewTask({ title: "", category: "today" });
      fetchTasks();
      toast.success("Captured. One less thing to hold in your mind.");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  const completeTask = async (taskId) => {
    try {
      await axios.patch(`${API}/tasks/${taskId}`, { completed: true });
      fetchTasks();
      toast.success("Done. One soft step forward.");
    } catch (error) {
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`);
      fetchTasks();
      toast.success("Stored away safely.");
    } catch (error) {
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  const startEditTask = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle("");
  };

  const saveEditTask = async (taskId) => {
    if (!editTitle.trim()) return;

    try {
      await axios.patch(`${API}/tasks/${taskId}`, { title: editTitle });
      setEditingTask(null);
      setEditTitle("");
      fetchTasks();
      toast.success("Captured. One less thing to hold in your mind.");
    } catch (error) {
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  const moveTask = async (taskId, newCategory) => {
    try {
      await axios.patch(`${API}/tasks/${taskId}`, { category: newCategory });
      setMovingTask(null);
      fetchTasks();
      toast.success("Moved gently to a new space.");
    } catch (error) {
      toast.error("Something didn't save properly. It's okay — let's try that again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="tasks-page">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4" data-testid="tasks-title">Tasks</h1>
        <p className="text-lg text-stone-600 leading-relaxed font-caveat">
          Small steps, taken gently. No pressure.
        </p>
      </div>

      {/* Add Task */}
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 sm:p-8">
        <form onSubmit={addTask} className="space-y-5" data-testid="add-task-form">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Add a small step or thought…"
            data-testid="task-input"
            className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              data-testid="task-category-select"
              className="flex-1 bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="later">Later</option>
            </select>
            <button
              type="submit"
              data-testid="add-task-btn"
              className="bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 px-6 py-3 rounded-full flex items-center justify-center gap-2"
            >
              <Plus strokeWidth={1.5} size={18} />
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Task Categories */}
      <div className="space-y-10">
        {["today", "this_week", "later"].map((category) => {
          const categoryTasks = tasks[category];
          const label = category === "today" ? "Today" : category === "this_week" ? "This Week" : "Later";
          const subtitle = category === "today" ? "Just the few things that matter for today." : 
                          category === "this_week" ? "Gentle intentions for the days ahead." : 
                          "Important, but not for right now — safely stored in your Attic Mind.";

          return (
            <div key={category} data-testid={`tasks-category-${category}`}>
              <div className="mb-5">
                <h2 className="text-2xl mb-2">{label}</h2>
                <p className="text-sm text-stone-500">{subtitle}</p>
              </div>
              {categoryTasks.length === 0 ? (
                <p className="text-stone-500 font-caveat text-lg">
                  {category === "today" ? "Nothing urgent here. Choose one small thing if you'd like." :
                   category === "this_week" ? "Nothing added yet. Capture what's on your mind — even the small things matter." :
                   "Nothing here yet. I'll hold things for later when you're ready."}
                </p>
              ) : (
                <div className="space-y-3">
                  {categoryTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-4"
                      data-testid={`task-${task.id}`}
                    >
                      {editingTask === task.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            data-testid={`edit-task-input-${task.id}`}
                            className="flex-1 bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-xl h-10 px-3 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEditTask(task.id)}
                            data-testid={`save-edit-btn-${task.id}`}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <Check strokeWidth={1.5} size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            data-testid={`cancel-edit-btn-${task.id}`}
                            className="text-stone-400 hover:text-stone-600 transition-colors"
                          >
                            <X strokeWidth={1.5} size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => completeTask(task.id)}
                              data-testid={`complete-task-btn-${task.id}`}
                              className="mt-0.5 w-5 h-5 rounded-full border-2 border-primary hover:bg-primary transition-colors duration-300 flex-shrink-0"
                            />
                            <div className="flex-1">
                              <p className="text-stone-700">{task.title}</p>
                              {task.description && (
                                <p className="text-sm text-stone-500 mt-1">{task.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => startEditTask(task)}
                              data-testid={`edit-task-btn-${task.id}`}
                              className="text-stone-400 hover:text-primary transition-colors duration-300"
                            >
                              <Edit2 strokeWidth={1.5} size={16} />
                            </button>
                            <button
                              onClick={() => setMovingTask(task.id)}
                              data-testid={`move-task-btn-${task.id}`}
                              className="text-stone-400 hover:text-info transition-colors duration-300"
                            >
                              <MoveRight strokeWidth={1.5} size={16} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              data-testid={`delete-task-btn-${task.id}`}
                              className="text-stone-400 hover:text-red-500 transition-colors duration-300"
                            >
                              <Trash2 strokeWidth={1.5} size={16} />
                            </button>
                          </div>
                          
                          {/* Move Menu */}
                          {movingTask === task.id && (
                            <div className="mt-3 flex gap-2" data-testid={`move-menu-${task.id}`}>
                              <p className="text-sm text-stone-500 mr-2">Move to:</p>
                              {["today", "this_week", "later"].filter(cat => cat !== category).map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => moveTask(task.id, cat)}
                                  data-testid={`move-to-${cat}-btn-${task.id}`}
                                  className="text-xs bg-stone-100 hover:bg-primary/10 text-stone-700 hover:text-primary px-3 py-1 rounded-full transition-all"
                                >
                                  {cat === "today" ? "Today" : cat === "this_week" ? "This Week" : "Later"}
                                </button>
                              ))}
                              <button
                                onClick={() => setMovingTask(null)}
                                className="text-xs text-stone-400 hover:text-stone-600"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="max-w-3xl mx-auto text-center" data-testid="tasks-footer">
        <p className="text-stone-500 font-caveat text-lg">
          You're allowed to move slowly. One task at a time is enough.
        </p>
      </div>
    </div>
  );
}