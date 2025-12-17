import { useState } from "react";
import axios from "axios";
import { Brain, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const USER_ID = "demo-user-123";

export default function BrainOffload() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [organized, setOrganized] = useState(null);

  const processOffload = async () => {
    if (!input.trim() || processing) return;

    setProcessing(true);
    try {
      // Call the brain offload API endpoint
      const response = await axios.post(`${API}/brain-offload`, {
        user_id: USER_ID,
        raw_text: input,
      });

      // Organize tasks by category
      const tasksByCategory = {
        today: [],
        this_week: [],
        later: [],
      };

      response.data.tasks.forEach(task => {
        tasksByCategory[task.category].push(task.title);
      });

      setOrganized(tasksByCategory);
    } catch (error) {
      console.error("Error processing offload:", error);
      toast.error("Your words didn't save this time, but they're still yours. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const saveTasks = async () => {
    if (!organized) return;

    try {
      const allTasks = [
        ...organized.today.map(t => ({ title: t, category: "today" })),
        ...organized.this_week.map(t => ({ title: t, category: "this_week" })),
        ...organized.later.map(t => ({ title: t, category: "later" })),
      ];

      // Save all tasks
      await Promise.all(
        allTasks.map(task =>
          axios.post(`${API}/tasks`, {
            user_id: USER_ID,
            title: task.title,
            category: task.category,
          })
        )
      );

      toast.success("Thank you for sharing that. It's held here gently.");
      navigate("/tasks");
    } catch (error) {
      console.error("Error saving tasks:", error);
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" data-testid="brain-offload-page">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4 font-fraunces" data-testid="brain-offload-title">Brain Offload</h1>
        <div className="text-stone-600 leading-relaxed space-y-1">
          <p>Empty your mind here.</p>
          <p>I'll quietly sort and hold things for you.</p>
        </div>
      </div>

      {!organized ? (
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 sm:p-8">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type everything that's swirling in your head…"
            disabled={processing}
            data-testid="brain-offload-textarea"
            className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl p-6 outline-none resize-none text-stone-700 font-light"
            rows={12}
          />
          <p className="text-sm text-stone-500 mt-4 font-light">
            Tasks, reminders, worries, ideas — no organizing needed.
          </p>
          <button
            onClick={processOffload}
            disabled={!input.trim() || processing}
            data-testid="brain-offload-process-btn"
            className="w-full mt-6 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-4 rounded-full disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Organizing quietly...
              </>
            ) : (
              <>
                <Sparkles strokeWidth={1.5} size={18} />
                Organize for me
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6" data-testid="brain-offload-organized">
          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 sm:p-8">
            <h2 className="text-2xl mb-4 font-fraunces">Here's what I organized for you</h2>
            <p className="text-stone-600 leading-relaxed font-caveat text-lg mb-8">
              I sorted everything into gentle steps. You can adjust these anytime.
            </p>

            {/* Today */}
            <div className="mb-8">
              <h3 className="text-lg font-fraunces text-primary mb-3">Today (1-3 gentle steps)</h3>
              {organized.today.length === 0 ? (
                <p className="text-stone-500 font-caveat">Nothing urgent. Rest if you need to.</p>
              ) : (
                <ul className="space-y-2">
                  {organized.today.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-stone-50 p-3 rounded-xl">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-stone-700">{task}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* This Week */}
            <div className="mb-8">
              <h3 className="text-lg font-fraunces text-info mb-3">This Week</h3>
              {organized.this_week.length === 0 ? (
                <p className="text-stone-500 font-caveat">Nothing here yet.</p>
              ) : (
                <ul className="space-y-2">
                  {organized.this_week.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-stone-50 p-3 rounded-xl">
                      <span className="text-info mt-1">•</span>
                      <span className="text-stone-700">{task}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Later */}
            <div>
              <h3 className="text-lg font-fraunces text-muted-foreground mb-3">Later (parked for now)</h3>
              {organized.later.length === 0 ? (
                <p className="text-stone-500 font-caveat">Nothing parked.</p>
              ) : (
                <ul className="space-y-2">
                  {organized.later.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-stone-50 p-3 rounded-xl">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span className="text-stone-700">{task}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setOrganized(null);
                setInput("");
              }}
              data-testid="brain-offload-restart-btn"
              className="flex-1 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all duration-300 py-4 rounded-full"
            >
              Start Over
            </button>
            <button
              onClick={saveTasks}
              data-testid="brain-offload-save-btn"
              className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-4 rounded-full flex items-center justify-center gap-2"
            >
              Save to My Tasks
              <ArrowRight strokeWidth={1.5} size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}