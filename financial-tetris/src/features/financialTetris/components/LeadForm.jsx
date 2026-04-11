import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { X } from 'lucide-react';

const LeadForm = ({ onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        time: ''
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = '10-digit mobile number required';
        if (!formData.date) newErrors.date = 'Preferred date is required';
        if (!formData.time) newErrors.time = 'Preferred time is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <div className="w-full">
            <Card className="relative overflow-hidden">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-black text-blue-600 mb-6 uppercase tracking-widest text-center mt-2">
                    Book Your Slot
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={errors.name}
                    />

                    <Input
                        label="Mobile Number"
                        placeholder="10-digit number"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        error={errors.phone}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Preferred Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            error={errors.date}
                        />
                        <Input
                            label="Preferred Time"
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            error={errors.time}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-4"
                    >
                        {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default LeadForm;
