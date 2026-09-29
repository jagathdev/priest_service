export const calculatePoojaPrice = ({
    pooja,
    participantCount,
}) => {
    const extraParticipantCount = Math.max(
        participantCount - 1,
        0
    );

    const extraParticipantAmount =
        extraParticipantCount *
        pooja.pricing.extraParticipant;

    const basePrice = pooja.basePrice;

    const convenienceFee = pooja.pricing.convenienceFee;

    const panditFee = pooja.pricing.panditFee;

    const recordingFee = pooja.pricing.recordingFee;

    const total =
        basePrice +
        extraParticipantAmount;

    return {
        basePrice,

        extraParticipantCount,

        extraParticipantAmount,

        convenienceFee,

        panditFee,

        recordingFee,

        total,
    };
};