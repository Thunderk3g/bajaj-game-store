// LMS integration for Stackibility Stack
const LMS_BASE_URL = __LMS_BASE_URL__;
const LMS_UPDATE_BASE_URL = __LMS_UPDATE_BASE_URL__;

export async function submitToLMS({ name, mobile, score, summaryDtls = 'Stackibility Stack Lead' }) {
  const userId = sessionStorage.getItem('gamification_userId') || '';
  const gameID = sessionStorage.getItem('gamification_gameId') || '';

  const payload = {
    cust_name: name || '',
    mobile_no: mobile || '',
    dob: '',
    gender: 'M',
    pincode: '',
    email_id: '',
    life_goal_category: '',
    investment_amount: '',
    product_id: '',
    p_source: sessionStorage.getItem('gamification_referral') === 'Y' ? 'Referral' : 'Marketing Assist',
    p_data_source: 'GAMIFICATION',
    pasa_amount: '',
    product_name: '',
    pasa_product: '',
    associated_rider: '',
    customer_app_product: '',
    p_data_medium: ' GAMIFICATION ',
    utmSource: '',
    userId,
    gameID,
    remarks: `Game: ${gameID}${score != null ? ` | Score: ${score}` : ''} | ${summaryDtls}`,
    appointment_date: '',
    appointment_time: '',
  };

  try {
    const res = await fetch(`${LMS_BASE_URL}/whatsappInhouse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    return { success: res.ok, ...json };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateLeadNew(leadNo, { name, mobile, date, time, remarks }) {
  let formattedDate = '';
  if (date) {
    const [year, month, day] = date.split('-');
    formattedDate = day && month && year ? `${day}/${month}/${year}` : date;
  }

  const payload = {
    leadNo,
    tpa_user_id: '',
    miscObj1: {
      stringval1: '',
      stringval2: name || '',
      stringval3: '',
      stringval4: formattedDate,
      stringval5: time || '',
      stringval6: remarks || 'Slot Booking via Stackibility Stack',
      stringval7: 'GAMIFICATION',
      stringval9: mobile || '',
    },
  };

  try {
    const res = await fetch(`${LMS_UPDATE_BASE_URL}/updateLeadNew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    return { success: res.ok, ...json };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
