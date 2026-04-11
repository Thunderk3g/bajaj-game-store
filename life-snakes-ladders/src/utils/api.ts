// API function to submit to Bajaj LMS (WhatsApp Inhouse API)

// Using window.__LMS_BASE_URL__ if defined, else fallback to import.meta.env
const getBaseUrl = () => {
    if (typeof window !== 'undefined' && (window as any).__LMS_BASE_URL__) {
        return (window as any).__LMS_BASE_URL__;
    }
    // @ts-ignore
    return import.meta.env.VITE_LMS_BASE_URL || '';
};

// Separate base URL for Lead Update API
const getUpdateBaseUrl = () => {
    if (typeof window !== 'undefined' && (window as any).__LMS_UPDATE_BASE_URL__) {
        return (window as any).__LMS_UPDATE_BASE_URL__;
    }
    // @ts-ignore
    return import.meta.env.VITE_LMS_UPDATE_BASE_URL || getBaseUrl();
};

export const submitToLMS = async (data: any) => {
    // __LMS_BASE_URL__ injected at build time via vite.config.js define or window
    const UAT_URL = `${getBaseUrl()}/whatsappInhouse`;

    // Read userId and gameID from sessionStorage
    const userId = sessionStorage.getItem('gamification_userId') || '';
    const gameID = sessionStorage.getItem('gamification_gameId') || '';

    const payload = {
        cust_name: data.name || data.fullName || "",
        mobile_no: data.mobile_no || data.phone || data.mobile || "",
        dob: "",
        gender: "M", // Default
        pincode: "",
        email_id: data.email_id || "",
        life_goal_category: "",
        investment_amount: "",
        product_id: "",
        p_source: "Marketing Assist",
        p_data_source: "GAMIFICATION",
        pasa_amount: "",
        product_name: "",
        pasa_product: "",
        associated_rider: "",
        customer_app_product: "",
        p_data_medium: " GAMIFICATION ",
        utmSource: "",
        userId: userId,
        gameID: gameID,
        remarks: `Game: ${gameID}${data.score != null ? ` | Score: ${data.score}` : ''} | ${data.summary_dtls || "Snakes and Ladders Game Lead"}`,
        appointment_date: "",
        appointment_time: ""
    };

    console.log("[API] Submitting lead to WhatsApp Inhouse API:", payload);

    try {
        const response = await fetch(UAT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const jsonResponse = await response.json().catch(() => ({}));
        return {
            success: response.ok,
            ...jsonResponse
        };
    } catch (error: any) {
        console.error("LMS Submission Error:", error);
        return { success: false, error: error.message };
    }
};

export const updateLeadNew = async (leadNo: string, data: any) => {
    const UAT_URL = `${getUpdateBaseUrl()}/updateLeadNew`;

    const payload = {
        leadNo: leadNo,
        tpa_user_id: "",
        miscObj1: {
            stringval1: "",
            stringval2: data.name || data.firstName || "",
            stringval3: data.lastName || "",
            stringval4: data.date || data.preferredDate || "", // Appointment Date (YYYY-MM-DD)
            stringval5: data.time || data.preferredTime || "", // Appointment Time
            stringval6: data.remarks || "Slot Booking via Game",
            stringval7: "GAMIFICATION",
            stringval9: data.mobile || data.phone || ""
        }
    };

    console.log("[API] Submitting slot booking to updateLeadNew API:", payload);

    try {
        const response = await fetch(UAT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const jsonResponse = await response.json().catch(() => ({}));
        return {
            success: response.ok,
            ...jsonResponse
        };
    } catch (error: any) {
        console.error("updateLeadNew Submission Error:", error);
        return { success: false, error: error.message };
    }
};
