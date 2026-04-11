// Utility for submitting lead and booking data to the Bajaj LMS (WhatsApp Inhouse API)
export const submitToLMS = async (data) => {
    // __LMS_BASE_URL__ is injected at build time by Vite define (see vite.config.js)
    // UAT: https://bjuat.bajajlife.com/BalicLmsUtil
    // Preprod: https://bajajuat2.bajajlife.com/BalicLmsUtil
    // Production: https://sales.bajajlife.com/BalicLmsUtil
    const UAT_URL = `${__LMS_BASE_URL__}/whatsappInhouse`;

    // Read userId and gameID from sessionStorage (stored by main.jsx on app load)
    const userId = sessionStorage.getItem('gamification_userId') || '';
    const gameID = sessionStorage.getItem('gamification_gameId') || '';

    // Format date if present (expected DD/MM/YYYY)
    let appointmentDate = "";
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
        cust_name: data.name || data.fullName || "",
        mobile_no: data.mobile_no || "",
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
        remarks: `Game: ${gameID}${data.score != null ? ` | Score: ${data.score}` : ''} | ${data.summary_dtls || "Snake Life Lead"}`,
        appointment_date: appointmentDate,
        appointment_time: data.timeSlot || ""
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

        const responseData = await response.json().catch(() => ({}));

        return {
            success: response.ok,
            data: responseData,
            error: response.ok ? null : (responseData?.message || `API error: ${response.status}`)
        };
    } catch (error) {
        console.error("LMS Submission Error Details:", error);
        return { success: false, error: error.message };
    }
};

export const updateLeadNew = async (leadNo, data) => {
    const UAT_URL = `${__LMS_UPDATE_BASE_URL__}/updateLeadNew`;

    const payload = {
        leadNo: leadNo,
        tpa_user_id: "",
        miscObj1: {
            stringval1: "",
            stringval2: data.name || data.firstName || "",
            stringval3: data.lastName || "",
            stringval4: data.date || "", // Appointment Date (YYYY-MM-DD)
            stringval5: data.time || "", // Appointment Time
            stringval6: data.remarks || "Slot Booking via Game",
            stringval7: "GAMIFICATION",
            stringval9: data.mobile || ""
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
    } catch (error) {
        console.error("updateLeadNew Submission Error:", error);
        return { success: false, error: error.message };
    }
};
