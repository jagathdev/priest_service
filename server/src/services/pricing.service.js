export const calculateServicePrice = ({
    service,
    participantCount,
}) => {
    // Base price - strictly require service base price, no silent fallback
    const rawBasePrice =
        service.basePrice ??
        service.packages?.[0]?.priceINR ??
        service.packages?.[0]?.price ??
        service.price;

    if (rawBasePrice === undefined || rawBasePrice === null || isNaN(rawBasePrice)) {
        throw new Error(
            `Configuration error: Service ${service.title || service._id} is missing a configured base price.`
        );
    }

    const basePrice = Number(rawBasePrice);

    // Extra participants
    const extraParticipantCount = Math.max(
        participantCount - 1,
        0
    );

    const extraParticipantPrice = Number(
        service.pricing?.extraParticipant ??
        service.extraParticipantPrice ??
        300
    );

    const extraParticipantAmount =
        extraParticipantCount * extraParticipantPrice;

    // Additional fees
    const convenienceFee = Number(
        service.pricing?.convenienceFee ??
        service.fees?.convenienceFee ??
        0
    );

    const panditFee = Number(
        service.pricing?.panditFee ??
        service.fees?.panditFee ??
        0
    );

    const recordingFee = Number(
        service.pricing?.recordingFee ??
        service.fees?.recordingFee ??
        0
    );

    // Final payable amount (in rupees)
    const total = basePrice + extraParticipantAmount;

    return {
        basePrice,
        extraParticipantCount,
        extraParticipantPrice,
        extraParticipantAmount,
        convenienceFee,
        panditFee,
        recordingFee,
        total,
        currency: service.currency || "INR",
    };
};