// Utility for submitting lead and booking data to the Bajaj LMS (WhatsApp Inhouse API)
export const submitToLMS = async (data) => {
    const UAT_URL = "https://bjuat.bajajlife.com/BalicLmsUtil/whatsappInhouse";

    // Extract userId and gameID from URL parameters (passed by Angular shell)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId') || '';
    const gameID = urlParams.get('gameId') || '';

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
        remarks: data.summary_dtls || "Quiz Game Lead",
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
