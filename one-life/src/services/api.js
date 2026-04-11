// Utility for submitting lead and booking data to the Bajaj LMS (WhatsApp Inhouse API)
export const submitToLMS = async (data) => {
    // __LMS_BASE_URL__ is injected at build time by Vite define (see vite.config.js)
    // UAT: https://bjuat.bajajlife.com/BalicLmsUtil
    // Preprod: https://bajajuat2.bajajlife.com/BalicLmsUtil
    // Production: https://sales.bajajlife.com/BalicLmsUtil
    const UAT_URL = `${__LMS_BASE_URL__}/whatsappInhouse`;

    // Extract userId and gameID from URL parameters (passed by Angular shell)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId') || '';
    const gameID = urlParams.get('gameId') || 'One-Life';

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
        remarks: `Game: ${gameID}${data.score != null ? ` | Score: ${data.score}` : ''} | ${data.summary_dtls || "One Life Lead"}`,
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
    const UAT_URL = `${__LMS_BASE_URL__}/updateLeadNew`;

    // Format date from YYYY-MM-DD to DD/MM/YYYY if present
    let formattedDate = "";
    if (data.date) {
        const [year, month, day] = data.date.split("-");
        if (day && month && year) {
            formattedDate = `${day}/${month}/${year}`;
        } else {
            formattedDate = data.date;
        }
    }

    const payload = {
        leadNo: leadNo,
        tpa_user_id: "",
        miscObj1: {
            stringval1: "",
            stringval2: data.name || data.firstName || "",
            stringval3: data.lastName || "",
            stringval4: formattedDate,
            stringval5: data.time || data.timeSlot || "",
            stringval6: data.remarks || "Slot Booking via Game",
            stringval7: "GAMIFICATION",
            stringval9: data.mobile || data.mobile_no || ""
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
