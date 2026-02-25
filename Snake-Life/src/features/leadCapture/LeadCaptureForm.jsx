import React, { useState } from 'react';
import { ChevronLeft, User, Phone, Clock, CheckCircle } from 'lucide-react';
import { submitToLMS } from '../../services/api';

const LeadCaptureForm = ({ recommendedCover, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        preferredTime: 'Morning',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await submitToLMS({
                ...formData,
                mobile_no: formData.mobile,
                summary_dtls: `Snake Life - Calculator Lead (${(recommendedCover / 100000).toFixed(1)} Lakh)`,
            });
            setIsSuccess(true);
        } catch (error) {
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col h-full bg-background p-6 items-center justify-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-success text-white rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-black text-primary mb-4">Callback Requested!</h2>
                <p className="text-gray-600 font-medium mb-8">
                    A Relationship Manager will call you during your preferred time to discuss your ₹{(recommendedCover / 100000).toFixed(1)} Lakh cover.
                </p>
                <button
                    onClick={onBack}
                    className="btn-primary w-full"
                >
                    Return to Game
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background p-6 animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-8">
                <ChevronLeft size={20} /> Back
            </button>

            <div className="space-y-6 flex-1">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-primary leading-tight">
                        Talk to an Expert
                    </h2>
                    <p className="text-gray-600 font-medium">
                        Get a personalized protection plan for your family.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-primary font-bold flex items-center gap-2">
                            <User size={16} /> Full Name
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your name"
                            className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 font-bold focus:border-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-primary font-bold flex items-center gap-2">
                            <Phone size={16} /> Mobile Number
                        </label>
                        <input
                            required
                            type="tel"
                            pattern="[0-9]{10}"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            placeholder="10-digit mobile number"
                            className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 font-bold focus:border-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-primary font-bold flex items-center gap-2">
                            <Clock size={16} /> Preferred Time
                        </label>
                        <div className="flex gap-3">
                            {['Morning', 'Afternoon', 'Evening'].map(time => (
                                <button
                                    type="button"
                                    key={time}
                                    onClick={() => setFormData({ ...formData, preferredTime: time })}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${formData.preferredTime === time
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-gray-400 border-2 border-gray-100'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Submitting...' : 'Request Callback'}
                        </button>
                    </div>
                </form>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-6">
                By clicking, you agree to our Terms & Privacy Policy.
            </p>
        </div>
    );
};

export default LeadCaptureForm;
