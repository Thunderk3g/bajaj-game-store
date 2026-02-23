/**
 * Utility for submitting lead and booking data to the Bajaj LMS API.
 */
export const submitToLMS = async (data) => {
    // API Call to Bajaj LMS Proxy
    const apiUrl = "https://webpartner.bajajallianz.com/EurekaWSNew/service/pushData";

    // Complete payload with all required fields
    const fullPayload = {
        name: data.name,
        age: data.age || 25,
        mobile_no: data.mobile_no,
        email_id: data.email_id || "",
        goal_name: data.goal_name || "1",
        param1: null,
        param2: null,
        param3: null,
        param4: data.param4 || null,
        param5: "",
        param13: "",
        param18: "",
        param19: data.param19 || "",
        param20: "",
        param23: data.param23 || "",
        param24: data.param24 || "",
        param25: data.param25 || "",
        param26: data.param26 || "",
        param36: "manual",
        summary_dtls: data.summary_dtls || `Booking Request`,
        p_user_eml: data.email_id || "",
        p_data_source: data.p_data_source || "WS_ETOUCH_BUY",
        p_curr_page_path: "https://www.bajajlifeinsurance.com/etouch/",
        p_ip_addsr: "",
        p_remark_url: "",
        prodId: data.prodId || "345",
        medium: "",
        contact_number: "",
        content: "",
        campaign: "",
        source: "",
        keyword: "",
        flag: "",
        parameter: "",
        name1: "",
        param28: "",
        param29: "",
        param30: ""
    };

    try {
        console.log('Final Payload Dne');

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fullPayload)
        });

        console.log('Bajaj LMS Response Status:', response.status);

        try {
            const responseData = await response.json();
            console.log('Bajaj LMS Response Data:', responseData);
            return {
                success: response.ok,
                data: responseData,
                error: response.ok ? null : (responseData?.message || `API error: ${response.status}`)
            };
        } catch (e) {
            console.warn('Bajaj LMS Response is not valid JSON');
            // If JSON parsing fails but response was OK, still return success
            return {
                success: response.ok,
                error: response.ok ? null : `API error: ${response.status}`
            };
        }
    } catch (error) {
        console.error("LMS Submission Error Details:", error);
        // Returning success false to handle error in UI
        return { success: false, error: error.message };
    }
};
