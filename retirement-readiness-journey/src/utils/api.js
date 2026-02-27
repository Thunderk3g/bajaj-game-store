// API function to submit to Bajaj LMS (WhatsApp Inhouse API)
export const submitToLMS = async (data) => {
    const UAT_URL = "https://bjuat.bajajlife.com/BalicLmsUtil/whatsappInhouse";

    // Extract userId and gameID from URL parameters (passed by Angular shell)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId') || '';
    const gameID = urlParams.get('gameId') || '';

    const payload = {
        cust_name: data.name || data.fullName || "",
        mobile_no: data.mobile_no || data.contact_number || "",
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
        remarks: `Game: ${gameID}${data.score != null ? ` | Score: ${data.score}` : ''} | ${data.summary_dtls || "Retirement Readiness Lead"}`,
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
    } catch (error) {
        console.error("LMS Submission Error:", error);
        return { success: false, error: error.message };
    }
};

export const updateLeadNew = async (leadNo, data) => {
    const UAT_URL = "https://bjuat.bajajlife.com/BalicLmsUtil/updateLeadNew";

    let formattedDate = "";
    if (data.date) {
        const [year, month, day] = data.date.split('-');
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
            stringval2: data.firstName || data.name || "",
            stringval3: data.lastName || "",
            stringval4: formattedDate,
            stringval5: data.time || "",
            stringval6: data.remarks || "Slot Booking via Game",
            stringval7: "GAMIFICATION",
            stringval9: data.mobile || ""
        }
    };

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
