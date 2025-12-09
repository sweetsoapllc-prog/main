// Gentle toast messages for Quiet Housekeeper

export const toastMessages = {
  // Success messages
  taskAdded: "I've got this down for you. Well done for adding it.",
  taskCompleted: "Well done for showing up for yourself today.",
  taskDeleted: "Got it — I've taken care of that.",
  routineAdded: "I've saved this ritual for you. It's here whenever you need it.",
  routineCompleted: "You completed this ritual. That's something to feel good about.",
  billAdded: "I've got this bill noted. You don't have to remember it now.",
  billPaid: (billName) => `Got it. I've marked ${billName} as paid.`,
  brainOffloadSaved: "I've organized everything for you. Your mind can rest now.",
  energyChecked: "Thank you for checking in",
  onboardingComplete: "Welcome! Your space is ready.",
  
  // Gentle error messages
  loadError: "I'm having trouble loading this right now. Can we try again in a moment?",
  saveError: "Something didn't save properly. It's okay — let's try that again.",
  connectionError: "I can't quite reach the server right now. Maybe check your connection?",
  genericError: "Something unexpected happened. Take a breath — we'll figure this out.",
};
