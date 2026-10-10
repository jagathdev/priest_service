export interface User {
    id: string;
    name: string;
    email: string;
    mobileNumber?: string;
    role: string;
    gender?: string;
    dob?: string;
    placeOfBirth?: string;
    occupation?: string;
    addresses?: any[];
}

export interface Service {
    id: string;
    title: string;
    type: "puja" | "homa";
    slug: string;
    basePrice: number;
    extraParticipantPrice: number;
    maxParticipants: number;
    isActive: boolean;
    eventDate: string | null;
    imageUrl: string;
    description: string;
    // ...other fields
}

export interface Order {
    _id: string;
    orderNumber: string;
    serviceId: string;
    serviceType: string;
    customer: string;
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    orderStatus: "created" | "confirmed" | "scheduled" | "performed" | "completed" | "cancelled";
    pricing: {
        basePrice: number;
        total: number;
        currency: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    _id: string;
    order: string;
    razorpayOrderId: string;
    amount: number;
    status: "created" | "captured" | "failed" | "refunded";
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}
