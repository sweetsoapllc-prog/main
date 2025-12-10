import { useState, useEffect } from "react";
import axios from "axios";
import { Heart, Brain, CheckSquare, Calendar, DollarSign, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const USER_ID = "demo-user-123";

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [energyLevel, setEnergyLevel] = useState(null);
  const [showEnergyResponse, setShowEnergyResponse] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState("");
  const [bills, setBills] = useState([]);
  const [routines, setRoutines] = useState([]);

  // Determine time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeOfDay("morning");
    } else if (hour >= 12 && hour < 17) {
      setTimeOfDay("midday");
    } else if (hour >= 17 && hour < 22) {
      setTimeOfDay("evening");
    } else {
      setTimeOfDay("night");
    }
  }, []);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem("onboarding_complete");
    if (!onboardingComplete) {
      navigate("/onboarding");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const tasksRes = await axios.get(`${API}/tasks/${USER_ID}?category=today`);
      setTasks(tasksRes.data.filter((t) => !t.completed));
      
      // Fetch user's onboarding profile for personalization
      try {
        const profileRes = await axios.get(`${API}/onboarding/${USER_ID}`);
        setUserProfile(profileRes.data);
      } catch (profileError) {
        console.log("No onboarding profile found, using defaults");
      }

      // Fetch bills and routines data for live integration
      try {
        const billsRes = await axios.get(`${API}/bills/${USER_ID}`);
        setBills(billsRes.data);
      } catch (billsError) {
        console.log("Error fetching bills:", billsError);
      }

      try {
        const routinesRes = await axios.get(`${API}/routines/${USER_ID}`);
        setRoutines(routinesRes.data);
      } catch (routinesError) {
        console.log("Error fetching routines:", routinesError);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await axios.patch(`${API}/tasks/${taskId}`, { completed: true });
      setTasks(tasks.filter((t) => t.id !== taskId));
      toast.success("Well done for showing up for yourself today.", {
        icon: <Heart className="text-success" size={16} />,
      });
    } catch (error) {
      toast.error("Something didn't save properly. It's okay — let's try that again.");
    }
  };

  const handleEnergySelection = async (level) => {
    setEnergyLevel(level);
    setShowEnergyResponse(true);
    try {
      await axios.post(`${API}/energy`, {
        user_id: USER_ID,
        energy_level: level === "low" ? 2 : level === "okay" ? 3 : 4,
        notes: `Energy: ${level}`,
      });
    } catch (error) {
      console.error("Error saving energy level:", error);
    }
  };

  const getTimeAwareGreeting = () => {
    const name = userProfile?.name || "Friend";
    
    if (timeOfDay === "morning") {
      return `Good morning, ${name}.`;
    } else if (timeOfDay === "midday") {
      return `Good afternoon, ${name}.`;
    } else if (timeOfDay === "evening") {
      return `Good evening, ${name}.`;
    } else {
      return `Good evening, ${name}.`;
    }
  };

  const getTimeAwareSubtext = () => {
    if (timeOfDay === "morning") {
      return "Let's begin the day gently. I'll help you see what truly needs your attention.";
    } else if (timeOfDay === "midday") {
      return "Let's take a gentle look at your day so you don't have to hold it all alone.";
    } else if (timeOfDay === "evening") {
      return "You've carried enough today. Let's wind down gently together.";
    } else {
      return "You've carried enough today. Let's wind down gently together.";
    }
  };

  const getSoftFocusTitle = () => {
    if (timeOfDay === "morning") {
      return "Morning Overview";
    } else if (timeOfDay === "midday") {
      return "Afternoon Overview";
    } else if (timeOfDay === "evening") {
      return "Evening Wrap-Up";
    } else {
      return "Evening Wrap-Up";
    }
  };

  const getSoftFocusSubtitle = () => {
    if (timeOfDay === "morning") {
      return "A soft start to what matters today.";
    } else if (timeOfDay === "midday") {
      return "A calm snapshot of what still needs your attention.";
    } else if (timeOfDay === "evening") {
      return "Only what truly needs your attention before you rest.";
    } else {
      return "Only what truly needs your attention before you rest.";
    }
  };

  const getSoftFocusBody = () => {
    if (timeOfDay === "morning") {
      return {
        line1: "You don't have to tackle everything at once.",
        line2: "Here are the small things that may help your morning feel lighter."
      };
    } else if (timeOfDay === "midday") {
      return {
        line1: "You're doing your best — and that's enough for today.",
        line2: "Here are the small things that may still need care."
      };
    } else if (timeOfDay === "evening") {
      return {
        line1: "You've shown up today, and that matters.",
        line2: "Here are the last small things you may want to finish before settling in."
      };
    } else {
      return {
        line1: "You've shown up today, and that matters.",
        line2: "Here are the last small things you may want to finish before settling in."
      };
    }
  };

  const getSoftFocusFooter = () => {
    if (timeOfDay === "morning") {
      return "Start where you are. One calm step forward.";
    } else if (timeOfDay === "midday") {
      return "No rush. No pressure. One soft step at a time.";
    } else if (timeOfDay === "evening") {
      return "Rest is productive too. You can stop when you're ready.";
    } else {
      return "Rest is productive too. You can stop when you're ready.";
    }
  };

  const getDueSoonBills = () => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    return bills.filter(bill => {
      if (bill.paid) return false;
      const dueDate = new Date(bill.due_date);
      return dueDate >= today && dueDate <= sevenDaysFromNow;
    });
  };

  const getTodaysRoutines = () => {
    return routines.filter(routine => {
      if (timeOfDay === "morning") return routine.time_of_day === "morning";
      if (timeOfDay === "evening") return routine.time_of_day === "evening";
      return false;
    });
  };

  const getEnergyResponse = () => {
    const tone = userProfile?.tone_preference || "gentle";
    
    if (energyLevel === "low") {
      if (tone === "softest") {
        return "Thank you for telling me. Rest is what matters today. Everything else can wait.";
      } else if (tone === "neutral") {
        return "Noted. I'll keep your day light.";
      } else {
        return "Thank you for letting me know. Let's keep the rest of today very light.";
      }
    } else if (energyLevel === "okay") {
      if (tone === "softest") {
        return "That's okay. We'll add just one or two gentle things, with plenty of space around them.";
      } else if (tone === "neutral") {
        return "Got it. I'll suggest a few tasks but keep it manageable.";
      } else {
        return "Perfect. We can tuck in one or two helpful things and still leave space to breathe.";
      }
    } else {
      if (tone === "softest") {
        return "Wonderful. If you'd like, we can explore a little more today — but only if it feels right.";
      } else if (tone === "neutral") {
        return "Good. You can take on more if you'd like.";
      } else {
        return "Lovely. If you'd like, we can gently tackle a bit more — still with lots of room for rest.";
      }
    }
  };

  const shortcuts = [
    { icon: Brain, label: "Offload", subtitle: "Empty your mind into a safe space. I'll sort it for you.", path: "/brain-offload" },
    { icon: CheckSquare, label: "Tasks", subtitle: "Today, this week, and later — softly organized so you don't feel overwhelmed.", path: "/tasks" },
    { icon: Calendar, label: "Routines", subtitle: "Small rituals to anchor your days.", path: "/routines" },
    { icon: DollarSign, label: "Bills", subtitle: "I'll remember dates so you don't have to.", path: "/bills" },
    { icon: CalendarDays, label: "Weekly", subtitle: "A calm overview of your week.", path: "/weekly" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4" data-testid="dashboard-greeting">
          {getTimeAwareGreeting()}
        </h1>
        <p className="text-base text-stone-500 leading-relaxed">
          {getTimeAwareSubtext()}
        </p>
      </div>

      {/* Today's Soft Focus */}
      <div
        className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 sm:p-8"
        data-testid="todays-soft-focus"
      >
        <h2 className="text-2xl mb-2">
          {getSoftFocusTitle()}
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          {getSoftFocusMessage()}
        </p>
        {tasks.length === 0 ? (
          <div className="space-y-3 text-stone-600 leading-relaxed">
            <p>You're doing your best — and that's enough for today.</p>
            <p>Here are the small things that may still need care.</p>
            <p className="font-caveat text-lg">No rush. No pressure. One soft step at a time.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              <p className="text-stone-600 leading-relaxed">You're doing your best — and that's enough for today.</p>
              <p className="text-stone-600 leading-relaxed">Here are the small things that may still need care.</p>
            </div>
            <div className="space-y-3">
              {tasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-4 bg-stone-50 rounded-2xl"
                  data-testid={`task-item-${task.id}`}
                >
                  <button
                    onClick={() => completeTask(task.id)}
                    data-testid={`complete-task-${task.id}`}
                    className="mt-0.5 w-5 h-5 rounded-full border-2 border-primary hover:bg-primary hover:border-primary transition-colors duration-300 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-stone-700">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-stone-500 mt-1">{task.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-stone-600 mt-6 font-caveat">
              No rush. No pressure. One soft step at a time.
            </p>
          </>
        )}
      </div>

      {/* Quick Glance - Bills & Routines */}
      {(getDueSoonBills().length > 0 || getTodaysRoutines().length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Due Soon Bills */}
          {getDueSoonBills().length > 0 && (
            <div
              className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6"
              data-testid="due-soon-bills"
            >
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="text-primary" strokeWidth={1.5} size={20} />
                <h3 className="text-lg font-fraunces">Due Soon</h3>
              </div>
              <div className="space-y-3">
                {getDueSoonBills().slice(0, 3).map((bill) => (
                  <div key={bill.id} className="flex items-start justify-between gap-3 p-3 bg-stone-50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-800">{bill.name}</p>
                      <p className="text-xs text-stone-500 mt-1">Due {new Date(bill.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <p className="text-sm font-medium text-stone-700">${bill.amount}</p>
                  </div>
                ))}
              </div>
              {getDueSoonBills().length > 3 && (
                <button
                  onClick={() => navigate("/bills")}
                  className="text-xs text-primary hover:underline mt-3"
                >
                  View all bills →
                </button>
              )}
            </div>
          )}

          {/* Today's Routines */}
          {getTodaysRoutines().length > 0 && (
            <div
              className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6"
              data-testid="todays-routines"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-primary" strokeWidth={1.5} size={20} />
                <h3 className="text-lg font-fraunces">
                  {timeOfDay === "morning" ? "Morning Ritual" : "Evening Ritual"}
                </h3>
              </div>
              <div className="space-y-3">
                {getTodaysRoutines().slice(0, 2).map((routine) => (
                  <div key={routine.id} className="p-3 bg-stone-50 rounded-xl">
                    <p className="text-sm font-medium text-stone-800 mb-2">{routine.name}</p>
                    <div className="space-y-1">
                      {routine.items.slice(0, 3).map((item, idx) => (
                        <p key={idx} className="text-xs text-stone-600 pl-3">• {item}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Energy Check-in */}
      {userProfile?.energy_checkins !== "never" && (
        <div
          className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 sm:p-8"
          data-testid="energy-section"
        >
          <h2 className="text-2xl mb-2">How are you feeling today?</h2>
          <p className="text-sm text-stone-500 mb-6">
            {userProfile?.energy_checkins === "softly" 
              ? "Only if you'd like to share — no pressure." 
              : "Tell me your energy level, and I'll shape your day with care."}
          </p>
          {!showEnergyResponse ? (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  onClick={() => handleEnergySelection("low")}
                  data-testid="energy-low-btn"
                  className="flex-1 bg-stone-100 hover:bg-primary/10 text-stone-700 hover:text-primary border-2 border-transparent hover:border-primary/20 py-3 px-6 rounded-full transition-all duration-300"
                >
                  Low
                </button>
                <button
                  onClick={() => handleEnergySelection("okay")}
                  data-testid="energy-okay-btn"
                  className="flex-1 bg-stone-100 hover:bg-primary/10 text-stone-700 hover:text-primary border-2 border-transparent hover:border-primary/20 py-3 px-6 rounded-full transition-all duration-300"
                >
                  Okay
                </button>
                <button
                  onClick={() => handleEnergySelection("good")}
                  data-testid="energy-good-btn"
                  className="flex-1 bg-stone-100 hover:bg-primary/10 text-stone-700 hover:text-primary border-2 border-transparent hover:border-primary/20 py-3 px-6 rounded-full transition-all duration-300"
                >
                  Good
                </button>
              </div>
              <p className="text-sm text-stone-500 text-center font-caveat">
                Your pace is enough. I'll match you where you are.
              </p>
            </>
          ) : (
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
              <p className="text-stone-700 leading-relaxed font-caveat text-lg">
                {getEnergyResponse()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Your Spaces */}
      <div>
        <h2 className="text-2xl mb-4 text-center">Your Spaces</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="shortcuts">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <button
                key={shortcut.path}
                onClick={() => navigate(shortcut.path)}
                data-testid={`shortcut-${shortcut.label.toLowerCase()}`}
                className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 p-6 text-left"
              >
                <Icon className="text-primary mb-3" strokeWidth={1.5} size={24} />
                <h3 className="font-fraunces text-lg text-stone-800 mb-1">{shortcut.label}</h3>
                <p className="text-sm text-stone-500">{shortcut.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-3xl mx-auto text-center" data-testid="dashboard-footer">
        <p className="text-stone-500 leading-relaxed">
          You don't have to hold everything alone.
        </p>
        <p className="text-stone-500 leading-relaxed mt-2">
          Your Attic Mind will hold it for you.
        </p>
      </div>
    </div>
  );
}