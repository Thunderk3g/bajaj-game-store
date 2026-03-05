import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, User, Smartphone, Send } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const CTASection = ({ results, leadService }) => {
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        date: '',
        time: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await leadService.submitLead({
                ...formData,
                gameResults: results
            });
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="w-full text-center border-growth/30 bg-growth/5">
                <div className="w-12 h-12 bg-growth/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="text-growth w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">Request Received!</h3>
                <p className="text-sm text-white/70">Our experts will contact you soon for your clarity session.</p>
            </Card>
        );
    }

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!showForm ? (
                    <motion.div
                        key="actions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-heading font-bold mb-2">Keep the Clarity Going?</h3>
                            <p className="text-xs text-white/50">Speak with an expert to balance your life goals.</p>
                        </div>

                        <a href="tel:1800-XXX-XXXX" className="block">
                            <Button fullWidth variant="primary" className="h-16">
                                <Phone className="mr-2" /> Call Now
                            </Button>
                        </a>

                        <Button fullWidth variant="secondary" className="h-16" onClick={() => setShowForm(true)}>
                            <Calendar className="mr-2" /> Book a Slot
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full"
                    >
                        <Card className="w-full bg-white/5 border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-heading font-bold">Book Clarity Slot</h3>
                                <button onClick={() => setShowForm(false)} className="text-white/40 text-xs uppercase font-bold px-2 py-1">Back</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="Mobile Number"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input
                                            required
                                            type="date"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-gold transition-colors"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-gold transition-colors appearance-none"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        >
                                            <option value="">Time Slot</option>
                                            <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
                                            <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                                            <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                                            <option value="12:00 PM - 1:00 PM">12:00 PM - 1:00 PM</option>
                                            <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                                            <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                                            <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
                                            <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                                            <option value="5:00 PM - 6:00 PM">5:00 PM - 6:00 PM</option>
                                            <option value="6:00 PM - 7:00 PM">6:00 PM - 7:00 PM</option>
                                            <option value="7:00 PM - 8:00 PM">7:00 PM - 8:00 PM</option>
                                            <option value="8:00 PM - 9:00 PM">8:00 PM - 9:00 PM</option>
                                        </select>
                                    </div>
                                </div>

                                <Button fullWidth size="lg" className="mt-4" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                                </Button>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CTASection;
