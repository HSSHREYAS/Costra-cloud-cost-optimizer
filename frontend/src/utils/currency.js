// Fallback rate used only if the live API call fails
export const FALLBACK_USD_TO_INR = 84.5;

/**
 * Format a USD amount in the requested currency.
 * @param {number} usdAmount
 * @param {"USD"|"INR"} currency
 * @param {number} decimals
 * @param {number} [liveRate]  - live USD→INR rate from the API (falls back to FALLBACK if omitted)
 */
export function formatCurrency(usdAmount, currency = "USD", decimals = 2, liveRate) {
    if (currency === "INR") {
        const rate = liveRate ?? FALLBACK_USD_TO_INR;
        const inr = usdAmount * rate;
        return "₹" + inr.toLocaleString("en-IN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    }
    return "$" + usdAmount.toFixed(decimals);
}

/** Return just the symbol for a given currency code. */
export function currencySymbol(currency) {
    return currency === "INR" ? "₹" : "$";
}

/** Convert a USD amount to INR using the provided or fallback rate. */
export function toINR(usdAmount, liveRate) {
    return usdAmount * (liveRate ?? FALLBACK_USD_TO_INR);
}
