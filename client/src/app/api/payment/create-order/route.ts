import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { 
      amount, 
      customerId, 
      shoppingCartId, 
      contactId, 
      name, 
      phone,
      aashirwad,
      pinCode,
      city,
      state,
      house,
      road,
      landmark
    } = await request.json();

    const rawBaseUrl = process.env.ASTROVED_PAYMENT_API_URL || 'https://qawebservice.astroved.com/api/UserAccount/ProceedviaRazorPay';
    const token = process.env.ASTROVED_AUTH_API_TOKEN?.trim() || process.env.ASTROVED_API_TOKEN?.trim();

    // Get client IP address
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      request.headers.get('x-real-ip') || 
                      '192.168.20.96';

    const shippingPreferred = aashirwad === 'yes';

    // Parse first and last name from name
    const nameParts = (name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Moovendhan';
    const lastName = nameParts.slice(1).join(' ') || 'S';

    // Populate address details based on wantsAashirwad
    let street = "123 Main Street";
    let cityField = "Chennai";
    let stateField = "Tamil Nadu";
    let pinCodeField = "600001";
    let countryField = "India";

    if (shippingPreferred && pinCode && city && state && house && road) {
      street = `${house}, ${road}${landmark ? `, Near ${landmark}` : ''}`;
      cityField = city;
      stateField = state;
      pinCodeField = pinCode;
    }

    const contactDetail = {
      CustomerId: Number(customerId) || 1413824,
      FirstName: firstName,
      LastName: lastName,
      ShopName: "AstroVed",
      Street: street,
      City: cityField,
      State: stateField,
      Country: countryField,
      Pincode: pinCodeField,
      Phone: phone || "7358671437"
    };

    const response = await fetch(rawBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        customerId: Number(customerId) || 1145090,
        currencyCode: "INR",
        ipAddress: ipAddress,
        shoppingCartId: Number(shoppingCartId) || 0,
        totalamount: Number(amount) || 0,
        contactId: Number(contactId) || 0,
        localeId: 1,
        trackingCode1: "GOOGLE_CAMPAIGN",
        trackingCode2: "SUMMER_SALE",
        shippingpreferred: shippingPreferred,
        contactDetail: contactDetail
      })
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok || data === "Unauthorized Request" || response.status === 401) {
       console.error("Astroved API Error:", response.status, data);
       return NextResponse.json({ error: data === "Unauthorized Request" || response.status === 401 ? "AstroVed API Token Expired or Unauthorized" : "Failed to create order from Astroved API" }, { status: 400 });
    }

    // Verify if API actually succeeded and returned a valid order ID (not "ExpectationFailed")
    if (data && data.Msg && data.Status && data.Status !== "ExpectationFailed" && !data.Msg.includes("Failed")) {
       return NextResponse.json({
          orderId: data.Msg,
          shoppingCartId: data.Status
       });
    } else {
       const errMsg = (data && data.Msg) ? data.Msg : "Failed to create order from Astroved API";
       return NextResponse.json({ error: errMsg }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
