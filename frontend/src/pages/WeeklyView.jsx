import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const USER_ID = "demo-user-123";

export default function WeeklyView() {
  const [tasks, setTasks] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load weekly view");
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-4xl md:text-5xl mb-4" data-testid="weekly-title">Weekly Overview</h1>
        <p className="text-lg text-stone-600 leading-relaxed font-caveat">
          A gentle look at what's ahead.
        </p>
      </div>

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
            <p className="text-stone-500 text-sm font-caveat">Nothing planned. Rest if you need to.</p>
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
            <p className="text-stone-500 text-sm font-caveat">Nothing scheduled yet.</p>
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
            <p className="text-stone-500 text-sm font-caveat">Nothing parked here.</p>
          ) : (
            <p className="text-stone-600 text-sm">
              {laterTasks.length} {laterTasks.length === 1 ? "item" : "items"} saved for later
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
        className="bg-gradient-to-br from-primary/5 to-info/5 rounded-[2rem] border border-stone-100 p-8 text-center"
        data-testid="weekly-summary-card"
      >
        <p className="text-2xl font-caveat text-stone-700 leading-relaxed">
          You have {todayTasks.length + weekTasks.length} tasks and {upcomingBills.length} bills this week.
          <br />
          Take it one step at a time.
        </p>
      </div>
    </div>
  );
}