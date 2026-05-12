import { FormEvent, useState } from "react";
import { Lead } from "../types";
import { CONFIG } from "../constants";
import { updateLeadNew, submitToLMS } from "../utils/api";

interface BookSlotScreenProps {
  lead: Lead;
  onComplete: () => void;
  setShowTcModal: (v: boolean) => void;
}

export function BookSlotScreen({ lead, onComplete, setShowTcModal }: BookSlotScreenProps) {
  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const timeSlots = CONFIG.contact.bookSlotTimeSlots;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Enter your name"); return; }
    if (!phone.match(/^[6-9]\d{9}$/)) { setError("Enter valid mobile"); return; }
    if (!date) { setError("Select a date"); return; }
    if (!time) { setError("Select a time slot"); return; }
    if (!agreed) { setError("Accept T&C to continue"); return; }

    const bookings = JSON.parse(localStorage.getItem("wholeLifeBookings") || "[]");
    localStorage.setItem("wholeLifeBookings", JSON.stringify([...bookings, {
      name,
      phone,
      date,
      time,
      createdAt: new Date().toISOString()
    }]));

    try {
      const leadNo = sessionStorage.getItem("wholeLifeGalagaLeadNo");
      if (leadNo) {
        await updateLeadNew(leadNo, {
          name: name.trim(),
          mobile: phone,
          date: date,
          time: time,
          remarks: "Whole Life Galaga - Appointment",
        });
      } else {
        await submitToLMS({
          name: name.trim(),
          mobile_no: phone,
          date: date,
          timeSlot: time,
          summary_dtls: "Whole Life Galaga - Appointment",
        });
      }
    } catch (err) {
      console.error("Booking submission failed", err);
    }

    onComplete();
  };

  return (
    <div className="bookslot-screen">
      <div className="bookslot-header">
        <h2>Book a Slot</h2>
        <p>Our agent will help secure your family's future.</p>
      </div>
      <form onSubmit={submit}>
        <label className="form-field">
          <span>Your Name</span>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </label>
        <label className="form-field">
          <span>Mobile Number</span>
          <input 
            type="tel" 
            value={phone} 
            maxLength={10} 
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} 
          />
        </label>
        <label className="form-field">
          <span>Preferred Date</span>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
        </label>
        <label className="form-field">
          <span>Preferred Time</span>
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            <option value="">Select Slot</option>
            {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        {error && <div className="form-error">{error}</div>}
        <label className="form-checkbox">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>I agree to <button type="button" onClick={() => setShowTcModal(true)}>Terms & Privacy Policy</button></span>
        </label>
        <button type="submit" className="submit-btn">Confirm Booking</button>
      </form>
      <button className="close-btn" onClick={onComplete}>✕</button>
    </div>
  );
}