import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 5000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.4)',
                            backdropFilter: 'blur(4px)',
                        }}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '2rem',
                            padding: '32px',
                            width: '100%',
                            maxWidth: '340px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            position: 'relative',
                            zIndex: 5001,
                            overflow: 'hidden',
                            textAlign: 'left',
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '24px',
                                right: '24px',
                                background: 'none',
                                border: 'none',
                                color: '#94A3B8',
                                cursor: 'pointer',
                                padding: '4px',
                                transition: 'color 0.2s',
                            }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ marginBottom: '12px' }}>
                            <h2 style={{
                                color: '#005BAC',
                                fontSize: '24px',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                letterSpacing: '-0.025em',
                                margin: 0,
                            }}>
                                Terms & Conditions
                            </h2>
                        </div>

                        <div style={{
                            height: '1px',
                            background: '#E2E8F0',
                            margin: '0 0 20px 0',
                            width: '100%'
                        }} />

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            color: '#475569',
                            fontSize: '11px',
                            fontWeight: '600',
                            lineHeight: '1.6',
                            maxHeight: '350px',
                            overflowY: 'auto',
                            paddingRight: '8px',
                        }}>
                            <p>
                                I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back.
                            </p>
                            <p>
                                I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.
                            </p>
                            <p>
                                Please refer to <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" style={{ color: '#005BAC', fontWeight: '800', textDecoration: 'underline' }}>BALIC Privacy Policy</a>.
                            </p>
                        </div>

                        <div style={{ marginTop: '32px' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    fontSize: '18px',
                                    fontWeight: '900',
                                    color: '#FFFFFF',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: '#005BAC',
                                    boxShadow: '0 4px 6px -1px rgba(0, 91, 172, 0.2)',
                                    transition: 'transform 0.2s, background 0.2s',
                                }}
                                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                I Agree
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TermsModal;
