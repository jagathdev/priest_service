export const validateSendOtp = (body) => {
    if (!body?.mobileNumber) return "Mobile number is required";
    const mobile = String(body.mobileNumber).trim();
    if (!/^\d{10}$/.test(mobile)) return "Mobile number must be exactly 10 digits";
    return null;
};

export const validateVerifyOtp = (body) => {
    if (!body?.mobileNumber || !body?.otp) return "Mobile number and OTP are required";
    const mobile = String(body.mobileNumber).trim();
    if (!/^\d{10}$/.test(mobile)) return "Mobile number must be exactly 10 digits";
    const otp = String(body.otp).trim();
    if (!/^\d{6}$/.test(otp)) return "OTP must be exactly 6 digits";
    return null;
};

export const validateCustomerQuery = (body) => {
    if (!body?.name || !String(body.name).trim()) return "Name is required";
    if (!body?.mobileNumber) return "Mobile number is required";
    const mobile = String(body.mobileNumber).trim();
    if (!/^\d{10}$/.test(mobile)) return "Mobile number must be exactly 10 digits";
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return "Invalid email address";
    return null;
};

export const validateApplyPromo = (body) => {
    if (!body?.code || !String(body.code).trim()) return "Promo code is required";
    if (body.orderAmount === undefined || Number(body.orderAmount) <= 0) return "Invalid order amount";
    return null;
};

export const validatePreviewOrder = (body) => {
    if (!body?.poojaId && !body?.serviceId) return "Pooja ID or Service ID is required";
    return null;
};
