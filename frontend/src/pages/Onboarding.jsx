import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: "",
    email: "",
    household_size: "",
    responsibilities: [],
    bills: [],
    energy_pattern: "",
    overwhelm_areas: [],
    support_needed: "",
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
    if (step < 6) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const completeOnboarding = async () => {
    try {
      // Create user profile with onboarding data
      await axios.post(`${API}/users`, {
        name: data.name || "Friend",
        email: data.email || "demo@example.com",
      });
      
      // Store onboarding data
      localStorage.setItem("onboarding_complete", "true");
      localStorage.setItem("user_profile", JSON.stringify(data));
      
      toast.success("Welcome! Your space is ready.");
      navigate("/");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-[#F0EFEA] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-8" data-testid="onboarding-progress">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`w-12 h-1 rounded-full transition-all duration-500 ${
                  s <= step ? "bg-primary" : "bg-stone-200"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-stone-500 text-center">Step {step} of 6</p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8 md:p-12">
          {/* Step 1: About You */}
          {step === 1 && (
            <div className="space-y-6" data-testid="onboarding-step-1">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-primary" strokeWidth={1.5} size={28} />
                <h1 className="text-3xl md:text-4xl">About You</h1>
              </div>
              <p className="text-lg text-stone-600 leading-relaxed font-caveat">
                Let's start gently. I'm here to learn about you, not to judge or rush you.
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
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => updateData("email", e.target.value)}
                  placeholder="Your email (optional, for reminders)"
                  data-testid="onboarding-email-input"
                  className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-14 px-6 text-lg outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Home & Responsibilities */}
          {step === 2 && (
            <div className="space-y-6" data-testid="onboarding-step-2">
              <h1 className="text-3xl md:text-4xl mb-4">Home & Responsibilities</h1>
              <p className="text-lg text-stone-600 leading-relaxed font-caveat">
                What does your daily life look like? Select what resonates.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  value={data.household_size}
                  onChange={(e) => updateData("household_size", e.target.value)}
                  placeholder="How many people in your household?"
                  data-testid="onboarding-household-input"
                  className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-14 px-6 text-lg outline-none"
                />
                <div>
                  <p className="text-sm text-stone-600 mb-3">What do you manage?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Childcare", "Meal planning", "Cleaning", "Laundry", "Scheduling", "Bills", "Grocery shopping", "Pet care"].map((resp) => (
                      <button
                        key={resp}
                        type="button"
                        onClick={() => toggleArrayItem("responsibilities", resp)}
                        data-testid={`responsibility-${resp.toLowerCase().replace(/ /g, '-')}`}
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
              </div>
            </div>
          )}

          {/* Step 3: Bills & Admin */}
          {step === 3 && (
            <div className="space-y-6" data-testid="onboarding-step-3">
              <h1 className="text-3xl md:text-4xl mb-4">Bills & Admin</h1>
              <p className="text-lg text-stone-600 leading-relaxed font-caveat">
                I can help you remember these, so you don't have to hold them all.
              </p>
              <div>
                <p className="text-sm text-stone-600 mb-3">What bills do you typically manage?</p>
                <div className="grid grid-cols-2 gap-3">
                  {["Rent/Mortgage", "Utilities", "Phone/Internet", "Insurance", "Subscriptions", "Credit cards", "Childcare", "Medical"].map((bill) => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => toggleArrayItem("bills", bill)}
                      data-testid={`bill-${bill.toLowerCase().replace(/\//g, '-').replace(/ /g, '-')}`}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                        data.bills.includes(bill)
                          ? "border-primary bg-primary/5"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      {bill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Energy & Check-ins */}
          {step === 4 && (
            <div className="space-y-6" data-testid="onboarding-step-4">
              <h1 className="text-3xl md:text-4xl mb-4">Energy & Check-ins</h1>
              <p className="text-lg text-stone-600 leading-relaxed font-caveat">
                When do you typically feel most overwhelmed?
              </p>
              <div>
                <div className="space-y-3">
                  {[
                    { value: "morning", label: "Mornings (getting everyone ready)" },
                    { value: "afternoon", label: "Afternoons (juggling work & home)" },
                    { value: "evening", label: "Evenings (dinner, bedtime, cleanup)" },
                    { value: "variable", label: "It varies day to day" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateData("energy_pattern", option.value)}
                      data-testid={`energy-pattern-${option.value}`}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                        data.energy_pattern === option.value
                          ? "border-primary bg-primary/5"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Emotional Layer */}
          {step === 5 && (
            <div className="space-y-6" data-testid="onboarding-step-5">
              <h1 className="text-3xl md:text-4xl mb-4">Emotional Layer</h1>
              <p className="text-lg text-stone-600 leading-relaxed font-caveat">
                What feels heaviest right now?
              </p>
              <div>
                <div className="grid grid-cols-2 gap-3">
                  {["Remembering everything", "Feeling behind", "Managing everyone else", "No time for myself", "Financial stress", "Guilt about not doing enough"].map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArrayItem("overwhelm_areas", area)}
                      data-testid={`overwhelm-${area.toLowerCase().replace(/ /g, '-')}`}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                        data.overwhelm_areas.includes(area)
                          ? "border-primary bg-primary/5"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={data.support_needed}
                onChange={(e) => updateData("support_needed", e.target.value)}
                placeholder="Anything else you'd like me to know? (optional)"
                data-testid="onboarding-support-textarea"
                className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl p-4 outline-none resize-none"
                rows={4}
              />
            </div>
          )}

          {/* Step 6: Life Snapshot */}
          {step === 6 && (
            <div className="space-y-6" data-testid="onboarding-step-6">
              <h1 className="text-3xl md:text-4xl mb-4">Your Life Snapshot</h1>
              <p className="text-lg text-stone-600 leading-relaxed font-caveat mb-6">
                Here's what I understand. You can always adjust this later.
              </p>
              <div className="space-y-4 bg-stone-50 rounded-2xl p-6">
                {data.name && (
                  <div>
                    <p className="text-sm text-stone-500">I'll call you</p>
                    <p className="text-lg font-fraunces">{data.name}</p>
                  </div>
                )}
                {data.household_size && (
                  <div>
                    <p className="text-sm text-stone-500">Household</p>
                    <p className="text-lg">{data.household_size} people</p>
                  </div>
                )}
                {data.responsibilities.length > 0 && (
                  <div>
                    <p className="text-sm text-stone-500">You manage</p>
                    <p className="text-lg">{data.responsibilities.join(", ")}</p>
                  </div>
                )}
                {data.overwhelm_areas.length > 0 && (
                  <div>
                    <p className="text-sm text-stone-500">What feels heavy</p>
                    <p className="text-lg">{data.overwhelm_areas.join(", ")}</p>
                  </div>
                )}
              </div>
              <p className="text-stone-600 leading-relaxed font-caveat text-lg text-center mt-6">
                I'm here to hold this with you. Let's get started.
              </p>
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
            {step < 6 ? (
              <button
                onClick={nextStep}
                data-testid="onboarding-next-btn"
                className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-4 rounded-full flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight strokeWidth={1.5} size={18} />
              </button>
            ) : (
              <button
                onClick={completeOnboarding}
                data-testid="onboarding-complete-btn"
                className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-4 rounded-full flex items-center justify-center gap-2"
              >
                Complete Setup
                <Sparkles strokeWidth={1.5} size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}