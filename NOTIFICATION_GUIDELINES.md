# The Attic Mind - Notification Guidelines

## Core Philosophy

> **"Notifications in this app are invitations, not prompts. Silence is a feature, not a gap."**

## Global Tone Rules

### ❌ Never Use These Words
- urgent, now, overdue, missed, late, behind
- should, must, need to, have to, required
- Any language implying guilt, pressure, or urgency

### ✅ Always Follow These Rules
- **No exclamation points** - They create urgency
- **Max 1 sentence per notification** - Keep it brief and gentle
- **All notifications are optional** - User must enable them
- **User-controlled timing** - They choose when they want to hear from us

## Notification Types

### 🌅 Morning Check-In (Optional)
**Default:** OFF  
**Trigger:** User-selected morning window  
**Purpose:** Gentle invitation to start the day

**Copy Options (rotate):**
- "Good morning, {Name}. We can begin gently when you're ready."
- "Nothing pressing right now. Let's start with what matters most."
- "A soft start is enough today."

---

### 🌙 Evening Wrap-Up (Optional)
**Default:** OFF  
**Trigger:** User-selected evening window  
**Purpose:** Optional invitation to wind down

**Copy Options (rotate):**
- "You've carried enough today. We can wind down together if you'd like."
- "Nothing urgent here. Just a quiet moment, if it helps."
- "When you're ready, we can gently close out the day."

---

### 💸 Bill Reminder - Upcoming
**Default:** ON  
**Trigger:** 3 days before due date  
**Purpose:** Gentle heads-up, no pressure

**Copy:**
```
Your {Bill Name} is coming up in a few days. You're on track.
```

**Example:**
```
Your Water Service bill is coming up in a few days. You're on track.
```

---

### 💸 Bill Reminder - Due Today (Optional)
**Default:** OFF  
**Trigger:** On due date  
**Purpose:** Soft reminder if user enabled it

**Copy:**
```
Today is the due date for {Bill Name}. One small thing, when you're ready.
```

---

### 💸 Bill Marked as Paid
**Type:** In-app confirmation (toast)  
**Trigger:** User marks bill as paid  
**Purpose:** Positive acknowledgment

**Copy:**
```
Marked as paid. One less thing to hold.
```

---

### 🌱 Routine Nudge (Optional)
**Default:** OFF  
**Trigger:** Once per routine window (morning/evening/weekly)  
**Purpose:** Gentle reminder that ritual is available

**Copy Options:**
- "Your {Routine Name} is here if it feels supportive."
- "A gentle ritual is available when you're ready."

**Example:**
```
Your evening ritual is here if it feels supportive.
```

---

## 🚫 Explicitly NO Notifications For

The following will **NEVER** trigger notifications:

- ❌ Tasks (not added, not completed, not overdue)
- ❌ Brain Offload entries
- ❌ Incomplete routines
- ❌ Missed days
- ❌ Streaks (we don't track them)
- ❌ Productivity stats (we don't measure them)
- ❌ "You haven't logged in" messages
- ❌ Any form of guilt, shame, or pressure

## Implementation Guidelines

### For Developers

1. **All notification text must be validated** against `GLOBAL_TONE_RULES`
2. **Use the helper functions** in `/utils/notificationRules.js`
3. **Never hardcode notification copy** - use the centralized config
4. **Test each notification** to ensure it feels gentle and optional
5. **Default to OFF** for all notifications except bill reminders

### Testing Checklist

Before shipping any notification:
- [ ] Contains no banned words
- [ ] Has no exclamation points
- [ ] Is exactly 1 sentence
- [ ] Can be disabled by user
- [ ] Feels like an invitation, not a command
- [ ] Validated using `validateNotificationText()`

### Example Usage

```javascript
import { generateBillReminder, validateNotificationText } from '@/utils/notificationRules';

// Generate notification
const message = generateBillReminder('Electric Bill', 'upcoming');
// Result: "Your Electric Bill is coming up in a few days. You're on track."

// Validate before sending
const validation = validateNotificationText(message);
if (validation.valid) {
  sendNotification(message);
} else {
  console.error('Notification validation failed:', validation.errors);
}
```

## Notification Settings (Future Implementation)

Users should be able to control:
- ✅ Enable/disable each notification type
- ✅ Set their morning/evening windows
- ✅ Choose notification method (push, email, in-app only)
- ✅ Pause all notifications for X days
- ✅ "Do Not Disturb" mode

## Tone Examples

### ✅ Good Examples
- "Your bill is coming up in a few days. You're on track."
- "A gentle ritual is available when you're ready."
- "We can begin gently when you're ready."

### ❌ Bad Examples
- "Don't forget your bill is due!" (exclamation, urgent)
- "You need to complete your morning routine." (pressure)
- "Your task is overdue." (guilt)
- "You haven't logged in for 3 days!" (shame + exclamation)

## Design Principles

1. **Invitations, not commands** - Frame as optional opportunities
2. **Assume positive intent** - User knows what they need
3. **Respect silence** - Not hearing from us is okay
4. **Trust the user** - They'll engage when ready
5. **Remove shame** - Never make them feel bad

## Questions to Ask

Before adding any notification, ask:
- Is this optional?
- Does this respect the user's autonomy?
- Would I want to receive this?
- Does this add value or just noise?
- Can this wait, or be shown only when they open the app?

---

**Remember:** The absence of a notification is not a bug. It's a feature. Silence is supportive.
