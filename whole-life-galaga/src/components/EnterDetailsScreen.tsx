import { FormEvent, useMemo, useState } from "react";
import { Lead } from "../types";
import { CONFIG } from "../constants";

interface EnterDetailsScreenProps {
  lead: Lead;
  setLead: (l: Lead) => void;
  onSubmit: () => void;
  setShowTcModal: (v: boolean) => void;
}

export function EnterDetailsScreen({ lead, setLead, onSubmit, setShowTcModal }: EnterDetailsScreenProps) {
  const [error, setError] = useState("");
  const phoneClean = useMemo(() => lead.phone.replace(/\D/g, ""), [lead.phone]);
  const validPhone = /^[6-9]\d{9}$/.test(phoneClean);
  const validName = lead.name.trim().length >= 2;
  const [agreed, setAgreed] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validName) { setError("Please enter your name."); return; }
    if (!validPhone) { setError("Enter a valid 10-digit mobile."); return; }
    if (!agreed) { setError("Please accept T&C to continue."); return; }
    
    const savedLead = {
      ...lead,
      phone: phoneClean,
      score: 0,
      createdAt: new Date().toISOString(),
      game: CONFIG.meta.gameName
    };
    const existing = JSON.parse(localStorage.getItem("wholeLifeLeads") || "[]");
    localStorage.setItem("wholeLifeLeads", JSON.stringify([...existing, savedLead]));
    onSubmit();
  };

  return (
    <div className="form-screen">
      <div className="form-header">
        <p className="eyebrow">Unlock Results</p>
        <h2>See Your Score</h2>
        <p>Get personalized insights about your whole life insurance coverage.</p>
      </div>
      <form onSubmit={submit}>
        <label className="form-field">
          <span>Your Name</span>
          <input
            type="text"
            value={lead.name}
            placeholder="Enter your full name"
            onChange={(e) => setLead({ ...lead, name: e.target.value })}
          />
        </label>
        <label className="form-field">
          <span>Mobile Number</span>
          <input
            type="tel"
            value={lead.phone}
            placeholder="10-digit number"
            maxLength={10}
            inputMode="numeric"
            onChange={(e) => setLead({ ...lead, phone: e.target.value.replace(/\D/g, "") })}
          />
        </label>
        {error && <div className="form-error">{error}</div>}
        <label className="form-checkbox">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>I agree to <button type="button" onClick={() => setShowTcModal(true)}>Terms & Privacy Policy</button></span>
        </label>
        <button type="submit" className="submit-btn">See Results!</button>
      </form>
    </div>
  );
}