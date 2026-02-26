import React from 'react';
import { INSURANCE_CARDS } from '../constants/gameConstants.js';

export default function InsuranceCards() {
    return (
        <div className="grid grid-cols-2 gap-3 mb-2">
            {INSURANCE_CARDS.map((card) => (
                <div
                    key={card.title}
                    className="rounded-2xl p-4 flex flex-col gap-2"
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.10)',
                    }}
                >
                    <span style={{ fontSize: 26 }}>{card.icon}</span>
                    <p className="font-bold" style={{ fontSize: 13, color: '#ffffff', lineHeight: 1.3 }}>
                        {card.title}
                    </p>
                    <p style={{ fontSize: 11, color: '#ADE8F4', lineHeight: 1.5 }}>{card.desc}</p>
                </div>
            ))}
        </div>
    );
}
