import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Sparkles, Heart } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const USER_ID = "demo-user-123";

export default function WeeklyView() {
  const [tasks, setTasks] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [previousResets, setPreviousResets] = useState([]);
  const [resetData, setResetData] = useState({
    wins: "",
    challenges: "",
    feeling: "",
    anchors: ["", "", ""],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, billsRes] = await Promise.all([
        axios.get(`${API}/tasks/${USER_ID}`),
        axios.get(`${API}/bills/${USER_ID}`),
      ]);
      setTasks(tasksRes.data.filter((t) => !t.completed));
      setBills(billsRes.data.filter((b) => !b.paid));
      
      // Fetch user profile for personalization
      try {
        const profileRes = await axios.get(`${API}/onboarding/${USER_ID}`);
        setUserProfile(profileRes.data);
      } catch (profileError) {
        console.log("No onboarding profile found");
      }
      
      // Fetch previous weekly resets
      try {
        const resetsRes = await axios.get(`${API}/weekly-reset/${USER_ID}`);
        setPreviousResets(resetsRes.data);
      } catch (resetsError) {
        console.log("No previous resets found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("We couldn't save this right now. Your information is safe — try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const completeReset = async () => {
    try {
      // Save the reset data to backend
      await axios.post(`${API}/weekly-reset`, {
        user_id: USER_ID,
        wins: resetData.wins,
        challenges: resetData.challenges,
        feeling: resetData.feeling,
        anchors: resetData.anchors.filter(a => a.trim() !== ""),
      });
      
      const tone = userProfile?.tone_preference || "gentle";
      let message = "Your week is gently reset";
      if (tone === "softest") {
        message = "Your reset is complete. I'm proud of you for taking this time.";
      } else if (tone === "neutral") {
        message = "Weekly reset saved.";
      }
      
      toast.success(message, {
        icon: <Heart className="text-success" size={16} />,
      });
      
      setShowReset(false);
      setResetData({
        wins: "",
        challenges: "",
        feeling: "",
        anchors: ["", "", ""],
      });
      
      // Refresh the data to show the new reset
      fetchData();
    } catch (error) {
      console.error("Error saving reset:", error);
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  const updateAnchor = (index, value) => {
    const updated = [...resetData.anchors];
    updated[index] = value;
    setResetData({ ...resetData, anchors: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading weekly view...</p>
        </div>
      </div>
    );
  }

  const todayTasks = tasks.filter((t) => t.category === "today");
  const weekTasks = tasks.filter((t) => t.category === "this_week");
  const laterTasks = tasks.filter((t) => t.category === "later");

  // Get bills due this week
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingBills = bills.filter((b) => {
    const dueDate = new Date(b.due_date);
    return dueDate >= today && dueDate <= nextWeek;
  });

  return (
    <div className="space-y-8" data-testid="weekly-view-page">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4" data-testid="weekly-title">Your Week at a Glance</h1>
        <p className="text-lg text-stone-600 leading-relaxed font-caveat">
          A calm overview to help you move through your week with clarity.
        </p>
      </div>

      {/* Most Recent Reset */}
      {previousResets.length > 0 && !showReset && (
        <div 
          className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 sm:p-8"
          data-testid="previous-reset-display"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-fraunces">Your Last Reset</h2>
            <p className="text-xs text-stone-500">
              {new Date(previousResets[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="space-y-4">
            {previousResets[0].feeling && (
              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                <p className="text-sm text-stone-600 mb-1">How you wanted to feel:</p>
                <p className="font-caveat text-lg text-stone-800">{previousResets[0].feeling}</p>
              </div>
            )}
            {previousResets[0].anchors && previousResets[0].anchors.length > 0 && (
              <div>
                <p className="text-sm text-stone-600 mb-2">Your anchors:</p>
                <ul className="space-y-2">
                  {previousResets[0].anchors.map((anchor, idx) => (
                    <li key={idx} className="text-stone-700 flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{anchor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Reset Flow */}
      {!showReset ? (
        <div className="text-center">
          <button
            onClick={() => setShowReset(true)}
            data-testid="start-weekly-reset-btn"
            className="bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 px-6 py-3 rounded-full inline-flex items-center gap-2"
          >
            <Sparkles strokeWidth={1.5} size={18} />
            Start Weekly Reset
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8" data-testid="weekly-reset-form">
          <h2 className="text-2xl mb-6 font-fraunces">Weekly Reset Flow</h2>
          <p className="text-stone-600 leading-relaxed font-caveat text-lg mb-6">
            Let's gently close last week and set soft intentions for the next.
          </p>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm text-stone-600 mb-2 block">What went well last week?</label>
              <textarea
                value={resetData.wins}
                onChange={(e) => setResetData({ ...resetData, wins: e.target.value })}
                placeholder="Even small wins matter. You showed up, you tried..."
                data-testid="reset-wins-input"
                className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl p-4 outline-none resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm text-stone-600 mb-2 block">What felt heavy?</label>
              <textarea
                value={resetData.challenges}
                onChange={(e) => setResetData({ ...resetData, challenges: e.target.value })}
                placeholder="It's okay to name what was hard. You're not complaining."
                data-testid="reset-challenges-input"
                className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl p-4 outline-none resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm text-stone-600 mb-2 block">How do you want to feel this week?</label>
              <input
                type="text"
                value={resetData.feeling}
                onChange={(e) => setResetData({ ...resetData, feeling: e.target.value })}
                placeholder="Calm? Grounded? Supported? Lighter?"
                data-testid="reset-feeling-input"
                className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-stone-600 mb-2 block">3 gentle anchors for this week</label>
              <p className="text-xs text-stone-500 mb-3">Not a to-do list. Just 3 things that matter.</p>
              <div className="space-y-2">
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={resetData.anchors[idx]}
                    onChange={(e) => updateAnchor(idx, e.target.value)}
                    placeholder={`Anchor ${idx + 1}`}
                    data-testid={`reset-anchor-${idx}`}
                    className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
                  />
                ))}
              </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
              <p className="font-caveat text-lg text-primary leading-relaxed">
                Remember: This week doesn't have to be perfect. You're allowed to adjust, rest, and change your mind. I'm here.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowReset(false)}
              data-testid="cancel-reset-btn"
              className="flex-1 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all duration-300 py-3 rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={completeReset}
              data-testid="complete-reset-btn"
              className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-3 rounded-full"
            >
              Complete Reset
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Today */}
        <div
          className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6"
          data-testid="today-summary"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="text-primary" strokeWidth={1.5} size={20} />
            </div>
            <h2 className="text-xl font-fraunces">Today</h2>
          </div>
          {todayTasks.length === 0 ? (
            <div className="space-y-3">
              <p className="text-stone-500 text-sm font-caveat">Nothing planned. Rest if you need to.</p>
              <a href="/tasks" className="text-xs text-primary hover:text-primary/80 transition-colors">
                Add a task if something comes up →
              </a>
            </div>
          ) : (
            <ul className="space-y-2">
              {todayTasks.map((task) => (
                <li key={task.id} className="text-sm text-stone-600 flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{task.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* This Week */}
        <div
          className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6"
          data-testid="week-summary"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center">
              <Calendar className="text-info" strokeWidth={1.5} size={20} />
            </div>
            <h2 className="text-xl font-fraunces">This Week</h2>
          </div>
          {weekTasks.length === 0 ? (
            <div className="space-y-3">
              <p className="text-stone-500 text-sm font-caveat">Nothing scheduled yet.</p>
              <a href="/tasks" className="text-xs text-primary hover:text-primary/80 transition-colors">
                Plan something gently →
              </a>
            </div>
          ) : (
            <ul className="space-y-2">
              {weekTasks.map((task) => (
                <li key={task.id} className="text-sm text-stone-600 flex items-start gap-2">
                  <span className="text-info mt-1">•</span>
                  <span>{task.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Later */}
        <div
          className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6"
          data-testid="later-summary"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center">
              <Calendar className="text-muted-foreground" strokeWidth={1.5} size={20} />
            </div>
            <h2 className="text-xl font-fraunces">Later</h2>
          </div>
          {laterTasks.length === 0 ? (
            <div className="space-y-3">
              <p className="text-stone-500 text-sm font-caveat">Nothing parked here.</p>
              <a href="/brain-offload" className="text-xs text-primary hover:text-primary/80 transition-colors">
                Offload some thoughts →
              </a>
            </div>
          ) : (
            <p className="text-stone-600 text-sm">
              {laterTasks.length} {laterTasks.length === 1 ? "item" : "items"} gently parked
            </p>
          )}
        </div>
      </div>

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <div
          className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8"
          data-testid="upcoming-bills-section"
        >
          <h2 className="text-2xl mb-4">Bills Due This Week</h2>
          <div className="space-y-3">
            {upcomingBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 bg-warning/5 rounded-2xl"
                data-testid={`upcoming-bill-${bill.id}`}
              >
                <div>
                  <p className="font-medium text-stone-700">{bill.name}</p>
                  <p className="text-sm text-stone-500">
                    Due: {new Date(bill.due_date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xl font-fraunces text-primary">${bill.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div
        className="bg-gradient-to-br from-primary/5 to-info/5 rounded-[2rem] border border-stone-100 p-8"
        data-testid="weekly-summary-card"
      >
        <h2 className="text-2xl mb-4">Weekly Overview</h2>
        <p className="text-stone-600 leading-relaxed mb-3">
          Here's what's coming up — gently organized for you.
        </p>
        <div className="space-y-3 text-stone-600 leading-relaxed">
          <p>You don't have to keep everything in your head.</p>
          <p>Here are the priorities, reminders, and small steps that will guide your week.</p>
        </div>
        <p className="text-stone-600 font-caveat text-lg mt-6">
          Move at your pace. A steady rhythm is all you need.
        </p>
      </div>
    </div>
  );
}