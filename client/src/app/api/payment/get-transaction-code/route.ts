import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { StatusCode: 400, Status: 'BadRequest', TransactionId: '', error: 'orderId is required' },
        { status: 400 }
      );
    }

    const apiUrl =
      process.env.ASTROVED_GET_TRANSACTION_CODE_URL?.trim() ||
      'https://qawebservice.astroved.com/api/UserAccount/GetTransactionCode';

    const token =
      process.env.ASTROVED_AUTH_API_TOKEN?.trim() ||
      process.env.ASTROVED_API_TOKEN?.trim();

    if (!token) {
      return NextResponse.json(
        { StatusCode: 500, Status: 'InternalServerError', TransactionId: '', error: 'AstroVed auth token not configured' },
        { status: 500 }
      );
    }

    const url = `${apiUrl}?OrderId=${encodeURIComponent(orderId)}`;
    console.log('[get-transaction-code] Calling AstroVed:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const text = await response.text();
    console.log('[get-transaction-code] AstroVed response status:', response.status, '| body:', text);

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { StatusCode: 502, Status: 'ParseError', TransactionId: '' };
    }

    if (!response.ok) {
      const responseData = typeof data === 'string' ? {} : data;
      return NextResponse.json(
        { ...responseData, error: 'AstroVed API returned an error' },
        { status: response.status }
      );
    }

    // StatusCode 200 = found, 404 = not found yet (payment may still be processing)
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[get-transaction-code] Error:', error);
    return NextResponse.json(
      { StatusCode: 500, Status: 'InternalServerError', TransactionId: '', error: error.message },
      { status: 500 }
    );
  }
}
