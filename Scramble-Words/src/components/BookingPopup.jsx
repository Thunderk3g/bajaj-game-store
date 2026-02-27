import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { updateLeadNew } from "../utils/api";
import { useGameState } from "../hooks/useGameState";

export default function BookingPopup({ isOpen, onClose }) {
  const { leadNo } = useGameState();
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    date: "",
    time: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      mobile: formData.mobile,
      date: formData.date,
      time: formData.time,
      remarks: `Slot: ${formData.date} at ${formData.time}`
    };

    const result = await updateLeadNew(leadNo, payload);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ name: "", mobile: "", date: "", time: "" });
      }, 2000);
    }
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-blue-900/30 hover:text-blue-900 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8">
              {!isSuccess ? (
                <>
                  <h2 className="text-2xl font-black text-blue-700 text-center mb-10 tracking-tight">
                    BOOK A CONVENIENT SLOT
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Your Name
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-lg px-4 py-4 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Mobile Number
                      </label>
                      <input
                        required
                        type="tel"
                        pattern="[0-9]{10}"
                        placeholder="9876543210"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-lg px-4 py-4 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          Preferred Date
                        </label>
                        <div className="relative">
                          <input
                            required
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-slate-50 border-none rounded-lg px-4 py-4 text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          Preferred Time
                        </label>
                        <select
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="w-full bg-slate-50 border-none rounded-lg px-4 py-4 text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm appearance-none"
                        >
                          <option value="">Select Slot</option>
                          <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
                          <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                          <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                          <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                          <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                          <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                          <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                          <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                          <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                          <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                          <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                          <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#ff8a00] hover:bg-[#ff7a00] text-white font-black py-5 rounded-lg shadow-[0_6px_0_#9a5200] active:shadow-none active:translate-y-[6px] transition-all text-xl uppercase tracking-widest mt-4"
                    >
                      {isSubmitting ? "BOOKING..." : "BOOK A SLOT"}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-black text-blue-900 mb-2">SLOT BOOKED!</h3>
                  <p className="text-slate-500 font-bold">Our expert will call you shortly.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
