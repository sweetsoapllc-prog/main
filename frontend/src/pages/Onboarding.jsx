import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const USER_ID = "demo-user-123";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    name: "",
    day_type: "",
    responsibilities: [],
    energy_level: "",
    goals: [],
  });

  const updateData = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const toggleArrayItem = (field, item) => {
    const current = data[field];
    if (current.includes(item)) {
      updateData(field, current.filter((i) => i !== item));
    } else {
      updateData(field, [...current, item]);
    }
  };

  const nextStep = () => {
    if (step < 8) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const completeOnboarding = async () => {
    setSaving(true);
    try {
      // Create user if doesn't exist
      try {
        await axios.post(`${API}/users`, {
          name: data.name || "Friend",
          email: "demo@example.com",
        });
      } catch (err) {
        console.log("User may already exist:", err.message);
      }
      
      // Save onboarding profile
      await axios.post(`${API}/onboarding`, {
        user_id: USER_ID,
        name: data.name || "Friend",
        day_type: data.day_type,
        responsibilities: data.responsibilities,
        energy_checkins: data.energy_level,
        emotional_support: data.goals.join(", "),
        tone_preference: "gentle",
        bills_reminders: true,
      });
      
      // Store in localStorage
      localStorage.setItem("onboarding_complete", "true");
      localStorage.setItem("user_profile", JSON.stringify(data));
      localStorage.setItem("user_id", USER_ID);
      
      toast.success("Welcome! Your Attic Mind is ready.", {
        duration: 2000,
      });
      
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something didn't save. Let's try that again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-[#F0EFEA] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-6 sm:mb-8 mt-4 sm:mt-0" data-testid="onboarding-progress">
          <div className="flex justify-between mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-all duration-500 mx-1 ${
                  s <= step ? "bg-primary" : "bg-stone-200"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-stone-500 text-center">Step {step} of 8</p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 sm:p-8 md:p-12">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6 text-center" data-testid="onboarding-step-1">
              <h1 className="text-4xl md:text-5xl font-fraunces font-light">Welcome to The Attic Mind</h1>
              <p className="text-xl text-stone-600 leading-relaxed">
                A quiet place for everything you're carrying.
              </p>
            </div>
          )}

          {/* Step 2: How I'll Support You */}
          {step === 2 && (
            <div className="space-y-6" data-testid="onboarding-step-2">
              <h1 className="text-3xl md:text-4xl mb-2">Here's how I'll support you.</h1>
              <div className="space-y-4 text-stone-600 leading-relaxed">
                <p>
                  The Attic Mind helps you clear mental clutter, stay organized gently, 
                  and move through your days without overwhelm.
                </p>
                <p>
                  I'll keep track of your tasks, routines, bills, and weekly priorities — 
                  and help you check in with how you're feeling along the way.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: What should I call you? */}
          {step === 3 && (
            <div className="space-y-6" data-testid="onboarding-step-3">
              <h1 className="text-3xl md:text-4xl mb-2">What should I call you?</h1>
              <div className="space-y-4">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateData("name", e.target.value)}
                  placeholder="Enter your name"
                  data-testid="onboarding-name-input"
                  className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-14 px-6 text-lg outline-none"
                />
                <p className="text-sm text-stone-500 text-center">Just first name is perfect.</p>
              </div>
            </div>
          )}

          {/* Step 4: How do your days usually feel? */}
          {step === 4 && (
            <div className="space-y-6" data-testid="onboarding-step-4">
              <h1 className="text-3xl md:text-4xl mb-2">How do your days usually feel?</h1>
              <div className="space-y-3">
                {["Calm", "Busy", "Unpredictable", "Overwhelming"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateData("day_type", type)}
                    data-testid={`day-type-${type.toLowerCase()}`}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                      data.day_type === type
                        ? "border-primary bg-primary/5"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-sm text-stone-500 text-center">This helps me shape your suggestions with care.</p>
            </div>
          )}

          {/* Step 5: What do you manage the most? */}
          {step === 5 && (
            <div className="space-y-6" data-testid="onboarding-step-5">
              <h1 className="text-3xl md:text-4xl mb-2">What do you manage the most in your daily life?</h1>
              <p className="text-stone-600 leading-relaxed">
                Choose one or more — tasks, work, home life, kids, bills, or anything else.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Tasks", "Work", "Home life", "Kids", "Bills", "Other"].map((resp) => (
                  <button
                    key={resp}
                    type="button"
                    onClick={() => toggleArrayItem("responsibilities", resp)}
                    data-testid={`responsibility-${resp.toLowerCase().replace(/\s/g, '-')}`}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                      data.responsibilities.includes(resp)
                        ? "border-primary bg-primary/5"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {resp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: How would you describe your energy lately? */}
          {step === 6 && (
            <div className="space-y-6" data-testid="onboarding-step-6">
              <h1 className="text-3xl md:text-4xl mb-2">How would you describe your energy lately?</h1>
              <div className="space-y-3">
                {["Low", "Steady", "High"].map((energy) => (
                  <button
                    key={energy}
                    type="button"
                    onClick={() => updateData("energy_level", energy)}
                    data-testid={`energy-${energy.toLowerCase()}`}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                      data.energy_level === energy
                        ? "border-primary bg-primary/5"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {energy}
                  </button>
                ))}
              </div>
              <p className="text-sm text-stone-500 text-center">No right or wrong — just what feels true.</p>
            </div>
          )}

          {/* Step 7: What would you like The Attic Mind to help you with? */}
          {step === 7 && (
            <div className="space-y-6" data-testid="onboarding-step-7">
              <h1 className="text-3xl md:text-4xl mb-2">What would you like The Attic Mind to help you with?</h1>
              <div className="space-y-3">
                {[
                  "Feeling less overwhelmed",
                  "Staying organized",
                  "Building gentle routines",
                  "Keeping track of important things",
                  "All of the above"
                ].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleArrayItem("goals", goal)}
                    data-testid={`goal-${goal.toLowerCase().replace(/\s/g, '-')}`}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                      data.goals.includes(goal)
                        ? "border-primary bg-primary/5"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Summary */}
          {step === 8 && (
            <div className="space-y-6 text-center" data-testid="onboarding-step-8">
              <h1 className="text-4xl md:text-5xl font-fraunces font-light">Your Attic Mind is ready.</h1>
              <p className="text-xl text-stone-600 leading-relaxed">
                A soft space crafted just for you.
              </p>
              <div className="space-y-4 bg-stone-50 rounded-2xl p-6 mt-6 text-left">
                {data.name && (
                  <div>
                    <p className="text-sm text-stone-500">I'll call you</p>
                    <p className="text-lg font-fraunces">{data.name}</p>
                  </div>
                )}
                {data.day_type && (
                  <div>
                    <p className="text-sm text-stone-500">Your days feel</p>
                    <p className="text-lg">{data.day_type}</p>
                  </div>
                )}
                {data.responsibilities.length > 0 && (
                  <div>
                    <p className="text-sm text-stone-500">You manage</p>
                    <p className="text-lg">{data.responsibilities.join(", ")}</p>
                  </div>
                )}
              </div>
              <p className="text-stone-600 font-caveat text-lg pt-4">
                Let's make life feel lighter — one soft step at a time.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8 sm:mt-10">
            {step > 1 && step < 8 && (
              <button
                onClick={prevStep}
                data-testid="onboarding-back-btn"
                className="flex-1 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all duration-300 py-3 sm:py-4 rounded-full flex items-center justify-center gap-2"
              >
                <ArrowLeft strokeWidth={1.5} size={18} />
                Back
              </button>
            )}
            {step < 8 ? (
              <button
                onClick={nextStep}
                data-testid="onboarding-next-btn"
                className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-3 sm:py-4 rounded-full flex items-center justify-center gap-2"
              >
                {step === 1 ? "Begin →" : "Continue"}
                {step !== 1 && <ArrowRight strokeWidth={1.5} size={18} />}
              </button>
            ) : (
              <button
                onClick={completeOnboarding}
                disabled={saving}
                data-testid="onboarding-complete-btn"
                className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-3 sm:py-4 rounded-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Preparing your space..." : "Enter The Attic Mind →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
