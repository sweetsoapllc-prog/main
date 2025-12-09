import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
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
    tone_preference: "gentle",
    day_type: "",
    responsibilities: [],
    bills_reminders: true,
    emotional_support: "",
    energy_checkins: "daily",
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
        ...data,
        name: data.name || "Friend"
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

          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-6" data-testid="onboarding-step-2">
              <h1 className="text-3xl md:text-4xl mb-2">Tell me a little about you</h1>
              <p className="text-lg text-stone-600 leading-relaxed">
                So I can support your days gently.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateData("name", e.target.value)}
                  placeholder="What should I call you?"
                  data-testid="onboarding-name-input"
                  className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-14 px-6 text-lg outline-none"
                />
                <div>
                  <p className="text-sm text-stone-600 mb-3">Preferred tone</p>
                  <div className="grid grid-cols-3 gap-3">
                    {["Softest", "Gentle", "Neutral"].map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => updateData("tone_preference", tone.toLowerCase())}
                        data-testid={`tone-${tone.toLowerCase()}`}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                          data.tone_preference === tone.toLowerCase()
                            ? "border-primary bg-primary/5"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Your Days */}
          {step === 3 && (
            <div className="space-y-6" data-testid="onboarding-step-3">
              <h1 className="text-3xl md:text-4xl mb-2">What does a typical day look like?</h1>
              <p className="text-lg text-stone-600 leading-relaxed">
                This helps me understand your rhythm.
              </p>
              <div className="space-y-3">
                {["Busy", "Structured", "Unpredictable", "Slow"].map((type) => (
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
            </div>
          )}

          {/* Step 4: Responsibilities */}
          {step === 4 && (
            <div className="space-y-6" data-testid="onboarding-step-4">
              <h1 className="text-3xl md:text-4xl mb-2">What do you manage regularly?</h1>
              <p className="text-lg text-stone-600 leading-relaxed">
                Select all that apply.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Tasks", "Work", "Home care & responsibilities", "Kids", "Errands", "Bills", "Self-care", "Reminders", "Other"].map((resp) => (
                  <button
                    key={resp}
                    type="button"
                    onClick={() => toggleArrayItem("responsibilities", resp)}
                    data-testid={`responsibility-${resp.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
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

          {/* Step 5: Bills & Admin */}
          {step === 5 && (
            <div className="space-y-6" data-testid="onboarding-step-5">
              <h1 className="text-3xl md:text-4xl mb-2">Would you like me to remember important dates?</h1>
              <p className="text-lg text-stone-600 leading-relaxed">
                Bills, renewals, appointments, and gentle reminders.
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => updateData("bills_reminders", true)}
                  data-testid="bills-yes"
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                    data.bills_reminders
                      ? "border-primary bg-primary/5"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  Yes, please remind me gently
                </button>
                <button
                  type="button"
                  onClick={() => updateData("bills_reminders", false)}
                  data-testid="bills-no"
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                    !data.bills_reminders
                      ? "border-primary bg-primary/5"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  No, I'll manage on my own
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Emotional Layer */}
          {step === 6 && (
            <div className="space-y-6" data-testid="onboarding-step-6">
              <h1 className="text-3xl md:text-4xl mb-2">How should The Attic Mind show up for you?</h1>
              <p className="text-lg text-stone-600 leading-relaxed">
                Choose what feels right.
              </p>
              <div className="space-y-3">
                {[
                  "Gently encouraging",
                  "Very soft, minimal nudging",
                  "Open-hearted & supportive",
                  "Quiet & unobtrusive"
                ].map((support) => (
                  <button
                    key={support}
                    type="button"
                    onClick={() => updateData("emotional_support", support)}
                    data-testid={`support-${support.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                      data.emotional_support === support
                        ? "border-primary bg-primary/5"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {support}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Energy Check-ins */}
          {step === 7 && (
            <div className="space-y-6" data-testid="onboarding-step-7">
              <h1 className="text-3xl md:text-4xl mb-2">Would you like gentle daily check-ins?</h1>
              <p className="text-lg text-stone-600 leading-relaxed">
                To help me adjust your day softly.
              </p>
              <div className="space-y-3">
                {[
                  { value: "daily", label: "Yes, daily" },
                  { value: "softly", label: "Yes, but softly" },
                  { value: "when-asked", label: "Only when I ask" },
                  { value: "never", label: "Never" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateData("energy_checkins", option.value)}
                    data-testid={`checkin-${option.value}`}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                      data.energy_checkins === option.value
                        ? "border-primary bg-primary/5"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Life Snapshot */}
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
                    <p className="text-sm text-stone-500">Your days tend to feel</p>
                    <p className="text-lg">{data.day_type}</p>
                  </div>
                )}
                {data.responsibilities.length > 0 && (
                  <div>
                    <p className="text-sm text-stone-500">You manage</p>
                    <p className="text-lg">{data.responsibilities.join(", ")}</p>
                  </div>
                )}
                {data.emotional_support && (
                  <div>
                    <p className="text-sm text-stone-500">Tone preference</p>
                    <p className="text-lg">{data.emotional_support}</p>
                  </div>
                )}
                {data.energy_checkins && (
                  <div>
                    <p className="text-sm text-stone-500">Daily check-in preference</p>
                    <p className="text-lg capitalize">{data.energy_checkins === 'when-asked' ? 'Only when I ask' : data.energy_checkins === 'never' ? 'Never' : data.energy_checkins === 'softly' ? 'Softly' : 'Daily'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={prevStep}
                data-testid="onboarding-back-btn"
                className="flex-1 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all duration-300 py-4 rounded-full flex items-center justify-center gap-2"
              >
                <ArrowLeft strokeWidth={1.5} size={18} />
                Back
              </button>
            )}
            {step < 8 ? (
              <button
                onClick={nextStep}
                data-testid="onboarding-next-btn"
                className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-4 rounded-full flex items-center justify-center gap-2"
              >
                {step === 1 ? "Begin" : "Continue"}
                <ArrowRight strokeWidth={1.5} size={18} />
              </button>
            ) : (
              <button
                onClick={completeOnboarding}
                disabled={saving}
                data-testid="onboarding-complete-btn"
                className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-4 rounded-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Preparing your space..." : "Enter The Attic Mind"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
