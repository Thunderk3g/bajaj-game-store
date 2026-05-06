import { CONFIG, TC_TEXT } from "../constants";

interface TcModalProps {
  onClose: () => void;
}

export function TcModal({ onClose }: TcModalProps) {
  return (
    <div className="tc-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tc-content">
        <h3>Terms & Conditions</h3>
        <p>{TC_TEXT}</p>
        {CONFIG.contact.privacyPolicyUrl && (
          <a href={CONFIG.contact.privacyPolicyUrl} className="privacy-link" target="_blank">Privacy Policy</a>
        )}
        <button className="agree-btn" onClick={onClose}>I Agree</button>
      </div>
    </div>
  );
}