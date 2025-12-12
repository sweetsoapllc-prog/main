/**
 * THE ATTIC MIND - NOTIFICATION RULES
 * 
 * Core Philosophy:
 * "Notifications in this app are invitations, not prompts.
 * Silence is a feature, not a gap."
 */

// ========================================
// GLOBAL TONE RULES
// ========================================

export const GLOBAL_TONE_RULES = {
  // Words to NEVER use in any notification
  bannedWords: [
    'urgent', 'now', 'overdue', 'missed', 'late', 'behind',
    'should', 'must', 'need to', 'have to', 'required'
  ],
  
  // Formatting rules
  noExclamationPoints: true,
  maxSentencesPerNotification: 1,
  
  // Behavior rules
  allNotificationsOptional: true,
  userEnabledOnly: true,
  
  // Never notify about
  neverNotifyFor: [
    'tasks',
    'offload_entries',
    'incomplete_routines',
    'missed_days',
    'streaks',
    'productivity_stats'
  ]
};

// ========================================
// MORNING CHECK-IN (Optional)
// ========================================

export const MORNING_CHECKIN = {
  enabled: false, // User must enable
  userWindow: null, // User selects their morning window
  
  copyOptions: [
    "Good morning, {{userName}}. We can begin gently when you're ready.",
    "Nothing pressing right now. Let's start with what matters most.",
    "A soft start is enough today."
  ],
  
  rotation: 'random', // or 'sequential'
};

// ========================================
// EVENING WRAP-UP (Optional)
// ========================================

export const EVENING_WRAPUP = {
  enabled: false, // User must enable
  userWindow: null, // User selects their evening window
  
  copyOptions: [
    "You've carried enough today. We can wind down together if you'd like.",
    "Nothing urgent here. Just a quiet moment, if it helps.",
    "When you're ready, we can gently close out the day."
  ],
  
  rotation: 'random',
};

// ========================================
// BILL REMINDERS
// ========================================

export const BILL_REMINDERS = {
  upcoming: {
    enabled: true, // Default ON
    trigger: 'days_before',
    daysBeforeDue: 3,
    copy: "Your {{billName}} is coming up in a few days. You're on track."
  },
  
  dueToday: {
    enabled: false, // Optional
    trigger: 'due_date',
    copy: "Today is the due date for {{billName}}. One small thing, when you're ready."
  },
  
  markedAsPaid: {
    type: 'in_app_confirmation',
    copy: "Marked as paid. One less thing to hold."
  }
};

// ========================================
// ROUTINE NUDGES (Optional)
// ========================================

export const ROUTINE_NUDGES = {
  enabled: false, // User must enable
  frequency: 'once_per_window', // Only once per routine window
  
  copyOptions: [
    "Your {{routineName}} is here if it feels supportive.",
    "A gentle ritual is available when you're ready."
  ],
  
  windows: {
    morning: { enabled: false },
    evening: { enabled: false },
    weekly: { enabled: false }
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Replace template variables in notification copy
 */
export const fillTemplate = (template, variables) => {
  let result = template;
  Object.keys(variables).forEach(key => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
  });
  return result;
};

/**
 * Get random copy from options
 */
export const getRandomCopy = (options) => {
  return options[Math.floor(Math.random() * options.length)];
};

/**
 * Validate notification text against global rules
 */
export const validateNotificationText = (text) => {
  const errors = [];
  
  // Check for banned words
  GLOBAL_TONE_RULES.bannedWords.forEach(word => {
    if (text.toLowerCase().includes(word.toLowerCase())) {
      errors.push(`Contains banned word: "${word}"`);
    }
  });
  
  // Check for exclamation points
  if (GLOBAL_TONE_RULES.noExclamationPoints && text.includes('!')) {
    errors.push('Contains exclamation point');
  }
  
  // Check sentence count
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > GLOBAL_TONE_RULES.maxSentencesPerNotification) {
    errors.push(`Too many sentences: ${sentences.length} (max: ${GLOBAL_TONE_RULES.maxSentencesPerNotification})`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// ========================================
// NOTIFICATION GENERATORS
// ========================================

export const generateMorningCheckin = (userName = 'Friend') => {
  const template = getRandomCopy(MORNING_CHECKIN.copyOptions);
  return fillTemplate(template, { userName });
};

export const generateEveningWrapup = () => {
  return getRandomCopy(EVENING_WRAPUP.copyOptions);
};

export const generateBillReminder = (billName, type = 'upcoming') => {
  const config = type === 'upcoming' ? BILL_REMINDERS.upcoming : BILL_REMINDERS.dueToday;
  return fillTemplate(config.copy, { billName });
};

export const generateRoutineNudge = (routineName) => {
  const template = getRandomCopy(ROUTINE_NUDGES.copyOptions);
  return fillTemplate(template, { routineName });
};

// ========================================
// EXPORT ALL
// ========================================

export default {
  GLOBAL_TONE_RULES,
  MORNING_CHECKIN,
  EVENING_WRAPUP,
  BILL_REMINDERS,
  ROUTINE_NUDGES,
  fillTemplate,
  getRandomCopy,
  validateNotificationText,
  generateMorningCheckin,
  generateEveningWrapup,
  generateBillReminder,
  generateRoutineNudge
};
