import { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, Heart } from "lucide-react";
import { toast } from "sonner";
import EnergyCheckIn from "@/components/EnergyCheckIn";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Demo user ID - in production this would come from auth
const USER_ID = "demo-user-123";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [userName, setUserName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [showEnergyCheckIn, setShowEnergyCheckIn] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Create or get user
      try {
        const userRes = await axios.get(`${API}/users/${USER_ID}`);
        setUserName(userRes.data.name);
      } catch {
        await axios.post(`${API}/users`, {
          name: "Friend",
          email: "demo@example.com",
        });
        setUserName("Friend");
      }

      // Get today's tasks
      const tasksRes = await axios.get(`${API}/tasks/${USER_ID}?category=today`);
      setTasks(tasksRes.data.filter((t) => !t.completed));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await axios.patch(`${API}/tasks/${taskId}`, { completed: true });
      setTasks(tasks.filter((t) => t.id !== taskId));
      toast.success("Task completed", {
        icon: <Heart className="text-success" size={16} />,
      });
    } catch (error) {
      toast.error("Failed to complete task");
    }
  };

  const handleEnergyChecked = () => {
    setShowEnergyCheckIn(false);
    toast.success("Thank you for checking in", {
      icon: <Heart className="text-success" size={16} />,
    });
  };

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
      {/* Greeting */}
      <div
        className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8 md:p-12"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1764867179307-fd0767e626d8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxtaW5pbWFsaXN0JTIwaG9tZSUyMGludGVyaW9yJTIwd2FybSUyMHN1bmxpZ2h0fGVufDB8fHx8MTc2NTIzMjQyMnww&ixlib=rb-4.1.0&q=85')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="text-primary" strokeWidth={1.5} size={28} />
            <h1 className="text-4xl md:text-5xl" data-testid="dashboard-greeting">
              Hello, {userName}
            </h1>
          </div>
          <p className="text-xl text-stone-600 leading-relaxed font-caveat">
            How are you feeling today? I'm here to help you feel lighter.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Energy Check-in */}
        <div
          className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-shadow duration-500 p-8"
          data-testid="energy-checkin-card"
        >
          <h2 className="text-2xl mb-4">Energy Check-in</h2>
          <p className="text-stone-600 leading-relaxed mb-6">
            Let me know how you're feeling, so I can adjust your day.
          </p>
          {!showEnergyCheckIn ? (
            <button
              onClick={() => setShowEnergyCheckIn(true)}
              data-testid="show-energy-checkin-btn"
              className="bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 px-6 py-3 rounded-full"
            >
              Check in now
            </button>
          ) : (
            <EnergyCheckIn userId={USER_ID} onComplete={handleEnergyChecked} />
          )}
        </div>

        {/* Today's Focus */}
        <div
          className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-shadow duration-500 p-8"
          data-testid="todays-tasks-card"
        >
          <h2 className="text-2xl mb-4">Today's gentle focus</h2>
          {tasks.length === 0 ? (
            <p className="text-stone-600 leading-relaxed font-caveat text-lg">
              You have a clear day ahead. Rest, or add something small if you'd like.
            </p>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 3).map((task) => (
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
        </div>
      </div>
    </div>
  );
}