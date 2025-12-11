// Centralized toast messages for The Attic Mind
// Following the microcopy library standards

export const toastMessages = {
  // Success Messages
  success: {
    taskAdded: "Captured. One less thing to hold in your mind.",
    taskCompleted: "Done. One soft step forward.",
    taskArchived: "Stored away safely.",
    routineAdded: "Your ritual is set. A small anchor for your day.",
    routineStepAdded: "Perfect. One more soft detail added.",
    billAdded: "I'll remember this date for you.",
    billPaid: "Noted. You're all set.",
    weeklyIntention: "Your week has a calm direction.",
    feelingLogged: "Thank you for telling me. I'm right here with you.",
    offloadSaved: "Thank you for sharing that. It's held here gently.",
    autoSave: "Saved automatically."
  },
  
  // Error Messages
  error: {
    missingField: "Looks like something is missing. Try again when you're ready.",
    invalidInput: "That doesn't seem to fit. Let's adjust it together.",
    networkError: "We couldn't save this right now. Your information is safe — try again in a moment.",
    serverError: "Something didn't load correctly. You're not doing anything wrong.",
    failedSave: "That didn't go through. Let's try that again slowly.",
    offloadFailed: "Your words didn't save this time, but they're still yours. Please try again."
  },
  
  // Loading States
  loading: {
    saving: "Saving softly…"
  }
};
