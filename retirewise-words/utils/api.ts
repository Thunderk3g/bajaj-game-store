// LMS integration for RetireWise: Word Challenge
declare const __LMS_BASE_URL__: string;
declare const __LMS_UPDATE_BASE_URL__: string;

export interface LmsLeadData {
  name?: string;
  fullName?: string;
  mobile_no?: string;
  mobile?: string;
  email_id?: string;
  score?: number;
  summary_dtls?: string;
  date?: string;
  timeSlot?: string;
}

export interface LmsResponse {
  success: boolean;
  leadNo?: string;
  LeadNo?: string;
  error?: string;
  data?: unknown;
  [key: string]: unknown;
}

export const submitToLMS = async (data: LmsLeadData): Promise<LmsResponse> => {
  const url = `${__LMS_BASE_URL__}/whatsappInhouse`;

  const userId = sessionStorage.getItem('gamification_userId') || '';
  const gameID = sessionStorage.getItem('gamification_gameId') || '';

  let appointmentDate = '';
  if (data.date) {
    const d = new Date(data.date);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      appointmentDate = `${day}/${month}/${year}`;
    }
  }

  const payload = {
    cust_name: data.name || data.fullName || '',
    mobile_no: data.mobile_no || data.mobile || '',
    dob: '',
    gender: 'M',
    pincode: '',
    email_id: data.email_id || '',
    life_goal_category: '',
    investment_amount: '',
    product_id: '',
    p_source: 'Marketing Assist',
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
    remarks: `Game: ${gameID}${data.score != null ? ` | Score: ${data.score}` : ''} | ${data.summary_dtls || 'RetireWise Words Lead'}`,
    appointment_date: appointmentDate,
    appointment_time: data.timeSlot || '',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));
    return { success: response.ok, ...json };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export interface SlotData {
  name?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  mobile_no?: string;
  date?: string;
  time?: string;
  timeSlot?: string;
  remarks?: string;
}

export const updateLeadNew = async (
  leadNo: string,
  data: SlotData,
): Promise<LmsResponse> => {
  const url = `${__LMS_UPDATE_BASE_URL__}/updateLeadNew`;

  let formattedDate = '';
  if (data.date) {
    const [year, month, day] = data.date.split('-');
    formattedDate = day && month && year ? `${day}/${month}/${year}` : data.date;
  }

  const payload = {
    leadNo,
    tpa_user_id: '',
    miscObj1: {
      stringval1: '',
      stringval2: data.name || data.firstName || '',
      stringval3: data.lastName || '',
      stringval4: formattedDate,
      stringval5: data.time || data.timeSlot || '',
      stringval6: data.remarks || 'Slot Booking via RetireWise Words',
      stringval7: 'GAMIFICATION',
      stringval9: data.mobile || data.mobile_no || '',
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));
    return { success: response.ok, ...json };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};
