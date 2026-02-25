import React, { useState } from 'react';
import { ChevronLeft, Info, HelpCircle } from 'lucide-react';

const CalculatorForm = ({ onBack, onSubmit }) => {
    const [formData, setFormData] = useState({
        monthlyIncome: '',
        dependents: 1,
        existingCover: '',
    });

    const [result, setResult] = useState(null);

    const calculateNeeds = () => {
        const monthly = parseFloat(formData.monthlyIncome) || 0;
        const annual = monthly * 12;
        const existing = parseFloat(formData.existingCover) || 0;

        let multiplier = 10;
        if (formData.dependents === 2) multiplier = 12;
        if (formData.dependents >= 3) multiplier = 15;

        const recommendedRaw = (annual * multiplier) - existing;
        const floor = annual * 5;

        // Recommended Cover = max(RecommendedRaw, Floor)
        // Round to nearest ₹1 Lakh (100,000)
        const recommended = Math.max(Math.ceil(recommendedRaw / 100000) * 100000, Math.ceil(floor / 100000) * 100000);

        setResult({
            annual,
            recommended,
            multiplier
        });
    };

    if (result) {
        return (
            <div className="flex flex-col h-full bg-background p-6 animate-fade-in">
                <button onClick={() => setResult(null)} className="flex items-center gap-2 text-primary font-bold mb-8">
                    <ChevronLeft size={20} /> Back to Calculator
                </button>

                <div className="glass-card p-8 space-y-6 text-center">
                    <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-primary">Calculation Complete</h2>
                    <div className="space-y-2">
                        <p className="text-gray-600 font-medium">Recommended Protection Cover</p>
                        <p className="text-4xl font-black text-success">
                            ₹{(result.recommended / 100000).toFixed(1)} Lakh
                        </p>
                    </div>
                    <p className="text-sm text-gray-500 italic">
                        Based on {result.multiplier}x annual income replacement for your dependents.
                    </p>
                </div>

                <button
                    onClick={() => onSubmit(result.recommended)}
                    className="btn-primary w-full mt-auto"
                >
                    Secure This Cover
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background p-6 animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-8">
                <ChevronLeft size={20} /> Back
            </button>

            <div className="space-y-8 flex-1">
                <h2 className="text-3xl font-black text-primary leading-tight">
                    Financial Protection Calculator
                </h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-primary font-bold block">Monthly Income (₹)</label>
                        <input
                            type="number"
                            value={formData.monthlyIncome}
                            onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                            placeholder="e.g. 50,000"
                            className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 text-lg font-bold focus:border-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-primary font-bold block">Number of Dependents</label>
                        <div className="flex gap-4">
                            {[1, 2, 3].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setFormData({ ...formData, dependents: num })}
                                    className={`flex-1 py-4 rounded-xl font-bold transition-all ${formData.dependents === num
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-white text-gray-400 border-2 border-gray-100'
                                        }`}
                                >
                                    {num}{num === 3 ? '+' : ''}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-primary font-bold block flex items-center gap-2">
                            Existing Cover (₹) <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="number"
                            value={formData.existingCover}
                            onChange={(e) => setFormData({ ...formData, existingCover: e.target.value })}
                            placeholder="e.g. 10,00,000"
                            className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 text-lg font-bold focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={calculateNeeds}
                disabled={!formData.monthlyIncome}
                className="btn-primary w-full mt-8"
            >
                Calculate Recommended Cover
            </button>
        </div>
    );
};

export default CalculatorForm;
