const DEFAULT_EXTRA_PARTICIPANT_PRICE = 300;
const DEFAULT_BASE_PRICE = 1251;

export const calculateServicePrice = ({
    service,
    participantCount,
}) => {
    // Base price
    const basePrice =
        service.basePrice ||
        service.packages?.[0]?.priceINR ||
        service.packages?.[0]?.price ||
        service.price ||
        DEFAULT_BASE_PRICE;

    // Extra participants
    const extraParticipantCount = Math.max(
        participantCount - 1,
        0
    );

    const extraParticipantPrice =
        service.pricing?.extraParticipant ||
        service.extraParticipantPrice ||
        DEFAULT_EXTRA_PARTICIPANT_PRICE;

    const extraParticipantAmount =
        extraParticipantCount * extraParticipantPrice;

    // Additional fees
    const convenienceFee =
        service.pricing?.convenienceFee ||
        service.fees?.convenienceFee ||
        0;

    const panditFee =
        service.pricing?.panditFee ||
        service.fees?.panditFee ||
        0;

    const recordingFee =
        service.pricing?.recordingFee ||
        service.fees?.recordingFee ||
        0;

    // Final payable amount
    // Additional fees are not added because they are currently FREE.
    const total =
        basePrice +
        extraParticipantAmount;

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