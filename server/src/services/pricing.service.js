import Puja from "../models/pujaModel.js";
import Homa from "../models/homaModel.js";
import { validatePromoCode } from "./promoCode.service.js";
import { normalizeServiceType } from "../utils/serviceType.js";

const DEFAULT_EXTRA_PARTICIPANT_PRICE = 300;


export const calculateServicePrice = ({
    service,
    participantCount,
}) => {
    // Base price
    const basePrice =
        service.basePrice ||
        service.packages?.[0]?.priceINR ||
        service.packages?.[0]?.price ||
        service.price;

    // Extra participants
    const serviceTitle = String(service.title || service.name || "").toLowerCase();
    const serviceSlug = String(service.slug || "").toLowerCase();
    const isTarpanam = serviceTitle.includes("tharpanam") || serviceTitle.includes("tarpanam") ||
        serviceSlug.includes("tharpanam") || serviceSlug.includes("tarpanam");
    const baseIncludedCount = isTarpanam ? 2 : 1;

    const extraParticipantCount = Math.max(
        participantCount - baseIncludedCount,
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

/**
 * Computes exact package and extra participant pricing on the server,
 * mirroring client calculations in sankalp/page.tsx.
 */
export const computeServerPrice = async ({ serviceId, serviceType, packageId, participantsCount, offerings, promoCode, userId, isTarpanam: isTarpanamParam }) => {
    let service = null;
    const normalizedType = normalizeServiceType(serviceType);

    if (normalizedType === "HOMA") {
        service = await Homa.findById(serviceId).lean();
    } else {
        service = await Puja.findById(serviceId).lean();
    }

    if (!service && serviceId) {
        service = await Puja.findById(serviceId).lean() ||
            await Homa.findById(serviceId).lean();
    }

    if (!service) {
        const err = new Error("Selected service not found");
        err.statusCode = 404;
        throw err;
    }

    const isInactive = (service.status && service.status !== "active") || service.isActive === false;
    if (isInactive) {
        const err = new Error("Selected service is inactive");
        err.statusCode = 400;
        throw err;
    }


    // Determine package
    const packages = service.packages || [];
    let selectedPackage = null;
    if (packageId && packages.length > 0) {
        const cleanPkgId = String(packageId).trim().toLowerCase();
        selectedPackage = packages.find((p, idx) => {
            const pId = String(p.id || p._id || "").toLowerCase();
            return pId === cleanPkgId || `pkg-${idx + 1}` === cleanPkgId;
        }) || packages.find((p) => {
            const pName = String(p.name || "").toLowerCase();
            if (cleanPkgId === pName) return true;
            if (cleanPkgId.includes("group") && pName.includes("group")) return true;
            if (cleanPkgId.includes("couple") && pName.includes("couple")) return true;
            if (cleanPkgId.includes("family") && pName.includes("family")) return true;
            if (cleanPkgId.includes("individual") && pName.includes("individual")) return true;
            return pName.includes(cleanPkgId);
        });
    }

    if (!selectedPackage && packages.length > 0) {
        selectedPackage = packages[0];
    }

    const rawBasePrice = selectedPackage?.priceINR ??
        selectedPackage?.price ??
        service.basePrice ??
        service.price;

    const basePrice = Number(rawBasePrice);

    if (isNaN(basePrice) || basePrice <= 0) {
        const err = new Error("Invalid service base price");
        err.statusCode = 400;
        throw err;
    }

    // Default devotees calculation
    let defaultDevotees = 1;
    const serviceTitle = String(service.title || service.name || "").toLowerCase();
    const serviceSlug = String(service.slug || "").toLowerCase();
    const isTarpanam = Boolean(isTarpanamParam) ||
        serviceTitle.includes("tharpanam") || serviceTitle.includes("tarpanam") ||
        serviceSlug.includes("tharpanam") || serviceSlug.includes("tarpanam");

    if (isTarpanam) {
        // Tarpanam base includes 1 Karta (Devotee) + 1 Ancestor = 2 participants
        defaultDevotees = 2;
    } else if (selectedPackage) {
        const rawDevotees = selectedPackage.devoteeCount ?? selectedPackage.devotees;
        if (rawDevotees !== undefined && rawDevotees !== null && String(rawDevotees).trim() !== "") {
            const parsed = parseInt(String(rawDevotees).replace(/\D/g, ""), 10);
            if (!isNaN(parsed) && parsed > 0) {
                defaultDevotees = parsed;
            }
        } else {
            const pkgName = String(selectedPackage.name || "").toLowerCase();
            if (pkgName.includes("family")) {
                defaultDevotees = 4;
            } else if (pkgName.includes("couple") || pkgName.includes("partner")) {
                defaultDevotees = 2;
            } else if (pkgName.includes("individual")) {
                defaultDevotees = 1;
            } else if (pkgName.includes("group")) {
                defaultDevotees = 1;
            }
        }
    }

    const count = Math.max(1, Number(participantsCount) || 1);
    const maxParticipants = Number(service.maxParticipants) || 20;
    if (count > maxParticipants) {
        const err = new Error(`Maximum ${maxParticipants} participants allowed for this service`);
        err.statusCode = 400;
        throw err;
    }

    const extraParticipantCount = Math.max(0, count - defaultDevotees);
    const extraParticipantFee = extraParticipantCount * 300;

    // Calculate offerings
    let offeringsTotal = 0;
    const validatedOfferings = [];
    const availableOfferings = Array.isArray(service.offerings) ? service.offerings : [];

    if (Array.isArray(offerings) && offerings.length > 0) {
        for (const item of offerings) {
            if (!item) continue;
            const requestedName = String(item.name || item.title || "").trim().toLowerCase();
            const requestedId = String(item.id || item._id || "").trim().toLowerCase();

            // Match offering against service offerings defined in database
            const matched = availableOfferings.find((off) => {
                const offId = String(off.id || off._id || "").trim().toLowerCase();
                const offName = String(off.name || off.title || "").trim().toLowerCase();
                return (requestedId && offId === requestedId) || (requestedName && offName === requestedName);
            });

            // Use verified price from DB offering if available; fallback to item price if positive number
            const unitPrice = matched
                ? (matched.priceINR ?? matched.price ?? 0)
                : (Number(item.priceINR ?? item.price) || 0);

            if (unitPrice > 0) {
                offeringsTotal += unitPrice;
                validatedOfferings.push({
                    name: (matched?.name || matched?.title || item.name || item.title || "Offering").trim(),
                    priceINR: unitPrice,
                    description: matched?.description || item.description || "",
                    imageUrl: matched?.imageUrl || item.imageUrl || "",
                });
            }
        }
    }

    const originalAmount = basePrice + extraParticipantFee + offeringsTotal;

    let discountAmount = 0;
    let promoCodeId = null;

    if (promoCode && String(promoCode).trim()) {
        const promoRes = await validatePromoCode({
            code: promoCode,
            orderAmount: originalAmount,
            serviceType: normalizedType,
            packageId: selectedPackage?.id || selectedPackage?._id || packageId,
            userId: userId || null,
        });

        discountAmount = promoRes.discountAmount || 0;
        promoCodeId = promoRes.promo?._id || null;
    }

    const finalAmount = Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100);

    return {
        service,
        serviceType: normalizedType,
        selectedPackage,
        basePrice,
        extraParticipantCount,
        extraParticipantFee,
        offeringsTotal,
        validatedOfferings,
        originalAmount,
        discountAmount,
        finalAmount,
        promoCodeId,
    };
};
