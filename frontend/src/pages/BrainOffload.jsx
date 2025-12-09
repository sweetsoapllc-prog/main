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
      // Call AI to organize the brain dump
      const sessionId = "brain-offload-" + Date.now();
      const prompt = `The user just did a brain dump. Please organize these thoughts into three categories:
1. Today (urgent, needs attention today)
2. This Week (important but not urgent)
3. Later (can be parked for now)

User's brain dump:
${input}

Please respond with a JSON object in this format:
{
  "today": ["task 1", "task 2"],
  "this_week": ["task 3", "task 4"],
  "later": ["task 5", "task 6"]
}

Be gentle and supportive. Extract clear, actionable items.`;

      const chatRes = await axios.post(`${API}/chat`, {
        user_id: USER_ID,
        session_id: sessionId,
        message: prompt,
      });

      // Parse AI response
      let aiResponse = chatRes.data.message;
      
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setOrganized(parsed);
      } else {
        // Fallback: create simple organization
        const lines = input.split('\n').filter(l => l.trim());
        setOrganized({
          today: lines.slice(0, Math.ceil(lines.length / 3)),
          this_week: lines.slice(Math.ceil(lines.length / 3), Math.ceil(2 * lines.length / 3)),
          later: lines.slice(Math.ceil(2 * lines.length / 3)),
        });
      }
    } catch (error) {
      console.error("Error processing offload:", error);
      toast.error("Something went wrong. Please try again.");
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

      toast.success("Everything is organized. You can breathe now.");
      navigate("/tasks");
    } catch (error) {
      console.error("Error saving tasks:", error);
      toast.error("Failed to save tasks");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" data-testid="brain-offload-page">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="text-primary" strokeWidth={1.5} size={32} />
          <h1 className="text-4xl md:text-5xl" data-testid="brain-offload-title">Brain Offload</h1>
        </div>
        <p className="text-lg text-stone-600 leading-relaxed font-caveat">
          Empty your mind here. I'll organize it for you.
        </p>
      </div>

      {!organized ? (
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8">
          <p className="text-stone-600 mb-4 leading-relaxed">
            Type everything that's swirling in your head. Tasks, worries, reminders, ideas — anything. Don't worry about organizing it. Just let it out.
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Everything on my mind right now...\n\nExample:\nPick up groceries\nCall mom\nKids dentist appointment\nPay electric bill\nMeal prep for week\nRemember to breathe..."
            disabled={processing}
            data-testid="brain-offload-textarea"
            className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl p-6 outline-none resize-none font-mono text-stone-700"
            rows={12}
          />
          <button
            onClick={processOffload}
            disabled={!input.trim() || processing}
            data-testid="brain-offload-process-btn"
            className="w-full mt-4 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-4 rounded-full disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Organizing your thoughts...
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
          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8">
            <h2 className="text-2xl mb-4 font-fraunces">Here's what I organized for you</h2>
            <p className="text-stone-600 leading-relaxed font-caveat text-lg mb-6">
              I sorted everything into gentle steps. You can adjust these anytime.
            </p>

            {/* Today */}
            <div className="mb-6">
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
            <div className="mb-6">
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