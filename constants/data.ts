const scenarios: { [key: string]: string[] } = {
  Calm: [
    "I was reading a book peacefully.",
    "I played my favorite game without issues.",
    "I listened to my favorite music.",
    "I spent time drawing or coloring.",
    "I went for a walk and enjoyed nature."
  ],
  Annoyed: [
    "Someone took my toy without asking.",
    "I was interrupted while talking.",
    "I was waiting for my turn, but someone cut in line.",
    "I had to redo something because of a small mistake.",
    "I couldn't find something I needed right away."
  ],
  Frustrated: [
    "I couldn't solve a puzzle I worked on for a long time.",
    "My internet stopped working during a game.",
    "I tried to explain something, but no one understood.",
    "I kept making mistakes on something important.",
    "I had to wait a long time for something I really wanted."
  ],
  Angry: [
    "Someone said something mean to me.",
    "I lost a game I really wanted to win.",
    "I was blamed for something I didn't do.",
    "Someone took my stuff without asking.",
    "I was being ignored when I needed help."
  ],
  Enraged: [
    "I was blamed for something I didn't do.",
    "Someone broke my favorite toy.",
    "I was yelled at for no reason.",
    "I was pushed or hit by someone.",
    "I was told I couldn't do something I really wanted."
  ],
};

export default scenarios;
