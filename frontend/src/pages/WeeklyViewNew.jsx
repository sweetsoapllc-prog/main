import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const USER_ID = "demo-user-123";

export default function WeeklyView() {
  const [tasks, setTasks] = useState([]);
  const [bills, setBills] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetStep, setResetStep] = useState(0); // 0=not started, 1=intro, 2=review, 3=adjust, 4=anchor, 5=complete
  const [weeklyAnchor, setWeeklyAnchor] = useState("");
  const [hasCompletedReset, setHasCompletedReset] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, billsRes, routinesRes] = await Promise.all([
        axios.get(`${API}/tasks/${USER_ID}`),
        axios.get(`${API}/bills/${USER_ID}`),
        axios.get(`${API}/routines/${USER_ID}`),
      ]);
      
      setTasks(tasksRes.data.filter((t) => !t.completed));
      setBills(billsRes.data.filter((b) => !b.paid));
      setRoutines(routinesRes.data);
      
      // Check if reset was completed this week
      try {
        const today = new Date().toISOString().split('T')[0];
        const resetsRes = await axios.get(`${API}/weekly-reset/${USER_ID}`);
        const recentReset = resetsRes.data.find(r => {
          const resetDate = new Date(r.created_at);
          const daysDiff = Math.floor((new Date() - resetDate) / (1000 * 60 * 60 * 24));
          return daysDiff < 7;
        });
        if (recentReset) {
          setHasCompletedReset(true);
        }
      } catch (error) {
        console.log("No recent resets found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("We couldn't save this right now. Your information is safe — try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const startReset = () => {
    setResetStep(1);
  };

  const completeReset = async () => {
    try {
      await axios.post(`${API}/weekly-reset`, {
        user_id: USER_ID,
        wins: "",
        challenges: "",
        feeling: "",
        anchors: weeklyAnchor ? [weeklyAnchor] : [],
      });
      
      toast.success("Weekly reset complete. You're allowed to move at your own pace.");
      setResetStep(0);
      setHasCompletedReset(true);
      setWeeklyAnchor("");
    } catch (error) {
      console.error("Error saving reset:", error);
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  const getThisWeekTasks = () => {
    return tasks.filter(t => t.category === 'this_week' || t.category === 'today');
  };

  const getThisWeekBills = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return bills.filter(b => {
      const dueDate = new Date(b.due_date);
      return dueDate >= today && dueDate <= nextWeek;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-stone-500">Loading your week...</p>
      </div>
    );
  }

  // Step 0: Main weekly view (no reset started)
  if (resetStep === 0) {
    return (
      <div className="space-y-8" data-testid="weekly-view-page">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl mb-4" data-testid="weekly-title">Weekly Reset</h1>
          <p className="text-lg text-stone-600 leading-relaxed font-caveat">
            A calm place to see what's ahead and steady the week with clarity.
          </p>
        </div>

        {/* Empty State or Start Button */}
        {!hasCompletedReset && tasks.length === 0 && bills.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8 text-center">
            <p className="text-stone-600 leading-relaxed mb-6">
              Nothing scheduled yet. When you're ready, the weekly reset is here to help you see things clearly.
            </p>
            <button
              onClick={startReset}
              data-testid="start-reset-btn"
              className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <span>✨</span>
              Start Weekly Reset
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={startReset}
              data-testid="start-reset-btn"
              className="w-full bg-primary text-white px-8 py-4 rounded-full hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
            >
              <span>✨</span>
              Start Weekly Reset
            </button>
          </div>
        )}
      </div>
    );
  }

  // Step 1: Intro Screen
  if (resetStep === 1) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8 sm:p-12">
          <h1 className="text-3xl md:text-4xl font-fraunces mb-6">Let's gently reset the week.</h1>
          <div className="space-y-4 text-stone-600 leading-relaxed mb-8">
            <p>This is a quiet check-in with what already exists — not a place to push or optimize.</p>
            <p>We'll look at what's coming up and leave space where it's needed.</p>
          </div>
          <button
            onClick={() => setResetStep(2)}
            data-testid="begin-reset-btn"
            className="w-full bg-primary text-white px-8 py-4 rounded-full hover:bg-primary/90 transition-all duration-300"
          >
            Begin
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Review What's Scheduled
  if (resetStep === 2) {
    const thisWeekTasks = getThisWeekTasks();
    const thisWeekBills = getThisWeekBills();
    
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8">
          <h2 className="text-3xl font-fraunces mb-2">Here's what's already on your plate.</h2>
          <p className="text-stone-500 mb-8 font-light">No need to do anything yet. Just take a look.</p>
          
          <div className="space-y-6">
            {/* Tasks */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-stone-700">Tasks due this week</h3>
              {thisWeekTasks.length === 0 ? (
                <p className="text-stone-500 font-light italic">Nothing scheduled</p>
              ) : (
                <div className="space-y-2">
                  {thisWeekTasks.map((task) => (
                    <div key={task.id} className="bg-stone-50 rounded-xl p-3 text-stone-700">
                      {task.title}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bills */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-stone-700">Bills due this week</h3>
              {thisWeekBills.length === 0 ? (
                <p className="text-stone-500 font-light italic">Nothing scheduled</p>
              ) : (
                <div className="space-y-2">
                  {thisWeekBills.map((bill) => (
                    <div key={bill.id} className="bg-stone-50 rounded-xl p-3 flex justify-between items-center">
                      <span className="text-stone-700">{bill.name}</span>
                      <span className="text-stone-500 text-sm">
                        {new Date(bill.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Routines */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-stone-700">Routines scheduled</h3>
              {routines.length === 0 ? (
                <p className="text-stone-500 font-light italic">Nothing scheduled</p>
              ) : (
                <div className="space-y-2">
                  {routines.map((routine) => (
                    <div key={routine.id} className="bg-stone-50 rounded-xl p-3 text-stone-700">
                      {routine.name} — {routine.time_of_day}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setResetStep(3)}
            data-testid="continue-btn"
            className="w-full mt-8 bg-primary text-white px-8 py-4 rounded-full hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Adjust Gently (Optional)
  if (resetStep === 3) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8">
          <h2 className="text-3xl font-fraunces mb-2">Would you like to adjust anything?</h2>
          <p className="text-stone-500 mb-8 font-light">
            You can move, remove, or leave things exactly as they are.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => setResetStep(4)}
              className="w-full bg-stone-100 text-stone-700 px-6 py-3 rounded-full hover:bg-stone-200 transition-all duration-300"
            >
              Make a small adjustment
            </button>
            <button
              onClick={() => setResetStep(4)}
              data-testid="leave-unchanged-btn"
              className="w-full bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Leave things as they are
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Choose One Anchor (Optional)
  if (resetStep === 4) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8">
          <h2 className="text-3xl font-fraunces mb-2">Choose one small anchor for the week.</h2>
          <p className="text-stone-500 mb-8 font-light">
            Just one thing that would help the week feel steadier.
          </p>
          
          <textarea
            value={weeklyAnchor}
            onChange={(e) => setWeeklyAnchor(e.target.value)}
            placeholder="One thing to hold onto this week..."
            data-testid="anchor-input"
            className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl p-4 outline-none resize-none h-24 mb-6 font-light"
          />
          
          <button
            onClick={() => setResetStep(5)}
            data-testid="continue-to-complete-btn"
            className="w-full bg-primary text-white px-8 py-4 rounded-full hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Close the Reset
  if (resetStep === 5) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="text-success" size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-fraunces mb-4">Your week is set.</h2>
          <div className="space-y-3 text-stone-600 leading-relaxed mb-8">
            <p>Nothing more is required right now.</p>
            <p>You can come back if something changes.</p>
          </div>
          <button
            onClick={completeReset}
            data-testid="done-reset-btn"
            className="bg-primary text-white px-12 py-4 rounded-full hover:bg-primary/90 transition-all duration-300 text-lg"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return null;
}
