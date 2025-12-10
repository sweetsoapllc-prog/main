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

  const getEnergyResponse = () => {
    if (energyLevel === "low") {
      return "Thank you for letting me know. Let's keep the rest of today very light.";
    } else if (energyLevel === "okay") {
      return "Perfect. We can tuck in one or two helpful things and still leave space to breathe.";
    } else {
      return "Lovely. If you'd like, we can gently tackle a bit more — still with lots of room for rest.";
    }
  };

  const shortcuts = [
    { icon: Brain, label: "Offload", subtitle: "Empty your mind into a safe space", path: "/brain-offload" },
    { icon: CheckSquare, label: "Tasks", subtitle: "Today, this week, and later — softly organized", path: "/tasks" },
    { icon: Calendar, label: "Routines", subtitle: "Small rituals to anchor your days", path: "/routines" },
    { icon: DollarSign, label: "Bills", subtitle: "I'll remember dates so you don't have to", path: "/bills" },
    { icon: CalendarDays, label: "Weekly", subtitle: "A calm overview of your week", path: "/weekly" },
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
          Welcome back to The Attic Mind.
        </h1>
        <p className="text-base text-stone-500 leading-relaxed">
          A quiet home for everything on your mind — tasks, routines, reminders, and worries — organized gently so your day feels lighter.
        </p>
      </div>

      {/* Today's Soft Focus */}
      <div
        className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 sm:p-8"
        data-testid="todays-soft-focus"
      >
        <h2 className="text-2xl mb-2">Today's Soft Focus</h2>
        <p className="text-sm text-stone-500 mb-6">
          Just one or two small steps to keep your day moving without overwhelm.
        </p>
        {tasks.length === 0 ? (
          <p className="text-stone-600 leading-relaxed font-caveat text-lg">
            You have a clear day ahead. Rest, or add something small if you'd like.
          </p>
        ) : (
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
        )}
        <p className="text-sm text-stone-500 mt-6 font-caveat">
          You don't have to finish everything. One small step is enough.
        </p>
      </div>

      {/* Energy Check-in */}
      <div
        className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 sm:p-8"
        data-testid="energy-section"
      >
        <h2 className="text-2xl mb-2">How are you feeling today?</h2>
        <p className="text-sm text-stone-500 mb-6">
          Tell me your energy level, and I'll shape your day with care.
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
          You don't have to hold everything alone.<br />
          Your Attic Mind will hold it for you.
        </p>
      </div>
    </div>
  );
}