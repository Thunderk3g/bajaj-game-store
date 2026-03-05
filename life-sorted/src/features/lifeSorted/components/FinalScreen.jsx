import React from 'react';
import { motion } from 'framer-motion';
import { Share2, RefreshCw } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ScoreRing from '../../../components/ui/ScoreRing';
import CTASection from './CTASection';
import { getArchetypeDetails } from '../utils/archetypeResolver';

const FinalScreen = ({ results, onRetry, leadService }) => {
    const archetype = getArchetypeDetails(results.archetype);

    const handleShare = async () => {
        const text = `I just achieved a Life Clarity Score of ${results.score}! I'm a ${results.archetype} in Life Sorted 3D. See your clarity score here!`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Life Sorted 3D',
                    text,
                    url: window.location.href,
                });
            } catch (err) {
                copyToClipboard(text);
            }
        } else {
            copyToClipboard(text);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Progress copied to clipboard!');
    };

    return (
        <div className="w-full max-w-md mx-auto px-6 py-8 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
            >
                <ScoreRing score={results.score} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center mb-10"
            >
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Your Archetype</p>
                <h2 className="text-4xl font-heading font-bold mb-4">{results.archetype}</h2>
                <div className="glass-panel p-4 border-white/10 bg-white/5">
                    <p className="text-sm font-bold text-teal mb-2">{archetype.traits}</p>
                    <p className="text-xs text-white/50 leading-relaxed italic">
                        "{archetype.description}"
                    </p>
                </div>
            </motion.div>

            <div className="w-full flex gap-4 mb-12">
                <Button variant="outline" fullWidth onClick={onRetry}>
                    <RefreshCw className="mr-2 w-4 h-4" /> Reset
                </Button>
                <Button variant="secondary" fullWidth onClick={handleShare}>
                    <Share2 className="mr-2 w-4 h-4" /> Share
                </Button>
            </div>

            {/* CTA SECTION */}
            <CTASection results={results} leadService={leadService} />
        </div>
    );
};

export default FinalScreen;
