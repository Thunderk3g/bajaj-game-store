import type { GameConfig } from "./types";

let gameConfig: GameConfig;

try {
  const config = await import("../game.configuration.json", { with: { type: "json" } });
  gameConfig = config.default;
} catch {
  gameConfig = {
    meta: {
      gameId: "whole-life-galaga",
      gameName: "Whole Life Guardian",
      version: "1.0.0",
      product: "Whole Life Insurance",
      port: 8008
    },
    gameplay: {
      sessionCapSeconds: 120,
      maxRounds: null,
      difficultyRampEnabled: true,
      difficultyRampIntervalSeconds: 20
    },
    scoring: {
      maxScore: 100,
      passingScore: 50,
      pointsPerHit: 10,
      penaltyPerMiss: 15,
      timeBonus: true,
      timeBonusThresholdSeconds: 60
    },
    audio: {
      musicEnabledByDefault: true,
      sfxEnabledByDefault: true
    },
    copy: {
      introTitle: "Whole Life Guardian",
      introHookLine: "Protect your family for life. Build savings you can use anytime.",
      introHowToPlay: "Move your shield to catch falling power-ups and destroy risks. Auto-fire protects you automatically!",
      scoringTagline: "Securing your family's tomorrow is within reach!",
      scoringCtaLine: "Connect with our relationship manager now!",
      thankYouBody: "Thank you for sharing your details. Our Relationship Manager will reach out to you shortly."
    },
    contact: {
      callNowNumber: "+91-XXXXXXXXXX",
      bookSlotTimeSlots: [
        "10:00 AM – 11:00 AM",
        "11:00 AM – 12:00 PM",
        "2:00 PM – 3:00 PM",
        "4:00 PM – 5:00 PM"
      ],
      privacyPolicyUrl: ""
    },
    ui: {
      primaryColor: "#003DA6",
      accentColor: "#F26522",
      successColor: "#28A745",
      fontFamily: "Plus Jakarta Sans"
    }
  };
}

export const CONFIG = gameConfig;

export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 640;
export const PLAYER_SIZE = 50;
export const INITIAL_COVERAGE = 10;

export const ENEMY_COLORS: Record<string, string> = {
  risk: "#e74c3c",
  health: "#e67e22",
  death: "#9b59b6",
  emergency: "#3498db"
};

export const ENEMY_ICONS: Record<string, string> = {
  risk: "⚠",
  health: "🏥",
  death: "💀",
  emergency: "🚨"
};

export const POWERUP_COLORS: Record<string, string> = {
  savings: "#3498db",
  coverage: "#f4d03f"
};

export const POWERUP_ICONS: Record<string, string> = {
  savings: "💎",
  coverage: "🛡️"
};

export const DISCLAIMER_TEXT = `DISCLAIMER: THE RESULTS SHOWN IN THIS GAME ARE INDICATIVE AND BASED SOLELY ON THE INFORMATION PROVIDED BY THE PARTICIPANT. THEY ARE INTENDED FOR ENGAGEMENT AND AWARENESS PURPOSES ONLY AND DO NOT CONSTITUTE FINANCIAL ADVICE OR A RECOMMENDATION TO PURCHASE ANY LIFE INSURANCE PRODUCT. PARTICIPANTS SHOULD SEEK INDEPENDENT PROFESSIONAL ADVICE BEFORE MAKING ANY FINANCIAL OR INSURANCE DECISIONS. WHILE DUE CARE HAS BEEN TAKEN IN DESIGNING THE GAME, BAJAJ LIFE INSURANCE LTD. ASSUMES NO LIABILITY FOR ITS OUTCOMES.`;

export const TC_TEXT = `I hereby authorize the company to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication. I have read and understood the Privacy Policy and consent to the processing of my personal data for the purpose of this inquiry.`;