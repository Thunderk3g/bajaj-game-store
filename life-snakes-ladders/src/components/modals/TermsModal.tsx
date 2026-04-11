import React from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(11, 18, 33, 0.8)',
                    backdropFilter: 'blur(4px)',
                }}
            />
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '32px',
                padding: '32px',
                width: '100%',
                maxWidth: '360px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '5px solid #31CDEC',
                position: 'relative',
                zIndex: 3001,
                overflow: 'hidden',
                animation: 'fadeUp 0.3s ease-out',
            }}>
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
                        transition: 'color 0.2s ease',
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: '#0B1221',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                    }}>Terms & Conditions</h2>
                </div>

                <div className="custom-scrollbar" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    color: '#4B5563',
                    fontSize: '11px',
                    fontWeight: '600',
                    lineHeight: '1.6',
                    maxHeight: '350px',
                    overflowY: 'auto',
                    paddingRight: '8px',
                    textAlign: 'left'
                }}>
                    <p>
                        I hereby authorize Bajaj Life Insurance Limited. to call me on the contact number made available by me on the website with a specific request to call back.
                    </p>
                    <p>
                        I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.
                    </p>
                    <p>
                        Please refer to Bajaj Life <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" style={{ color: '#31CDEC', fontWeight: '800', textDecoration: 'underline' }}>Privacy Policy</a>.
                    </p>
                </div>

                <div style={{ marginTop: '32px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #31CDEC 0%, #0096C7 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '16px',
                            fontSize: '18px',
                            fontWeight: '900',
                            cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(49, 205, 236, 0.3)',
                            transition: 'all 0.2s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        I Agree
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #F1F5F9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #31CDEC;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default TermsModal;
