// Utility helper functions

/**
 * Calculate percentage score
 */
export const calculatePercentage = (score, total) => {
    return Math.round((score / total) * 100);
};

/**
 * Get motivational message based on score
 */
export const getMotivationalMessage = (percentage) => {
    if (percentage === 100) {
        return "Perfect Score!  You're a GST expert!";
    } else if (percentage >= 80) {
        return "Excellent Knowledge!  Keep it up!";
    } else if (percentage >= 60) {
        return "Good Knowledge!  You're on the right track!";
    } else if (percentage >= 40) {
        return "Not Bad!  A little more learning needed!";
    } else {
        return "Keep Learning!  Every expert was once a beginner!";
    }
};

/**
 * Format time in MM:SS
 */
export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (India format)
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Get congratulatory title based on score
 */
export const getCongratulationsTitle = (percentage) => {
    if (percentage === 100) return "Absolutely Perfect! 🏆";
    if (percentage >= 80) return "Excellent Work! ⭐";
    if (percentage >= 60) return "Good Knowledge! 👍";
    return "Keep Improving! 📖";
};

/**
 * Play sound effect (basic implementation)
 */
export const playSound = (soundType) => {
    // This will be enhanced with actual audio files
    try {
        const audio = new Audio(`./sounds/${soundType}.wav`);
        audio.volume = 0.5;
        audio.play().catch(err => {
            // Sound play error
        });
    } catch (error) {
        // Sound not available
    }
};
/**
 * Format date for callback (tomorrow at 09:00 AM)
 * Returns object with date string and time string
 */
export const formatCallbackDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format: YYYY-MM-DD
    const dateStr = tomorrow.toISOString().split('T')[0];

    return {
        date: dateStr,
        time: "09:00 AM - 10:00 AM" // Using the format expected by the existing select slot
    };
};
