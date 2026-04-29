import { useEffect, useState } from "react";
import apiClient from "../services/apiClient.js";
import { FALLBACK_USD_TO_INR } from "../utils/currency.js";

const CACHE_KEY = "usd_inr_rate_cache";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCached() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { rate, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp > CACHE_TTL_MS) return null; // stale
        return { rate, timestamp };
    } catch {
        return null;
    }
}

function setCache(rate) {
    const timestamp = Date.now();
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, timestamp }));
    return timestamp;
}

/**
 * Fetches the live USD → INR exchange rate through the FastAPI backend proxy
 * (which in turn calls frankfurter.app / ECB).
 *
 * Routing through the backend avoids any ISP/browser/CORS network blocks
 * that would occur when calling an external API directly from the browser.
 *
 * Caches the result in localStorage for 1 hour.
 *
 * Returns: { rate, loading, error, lastUpdated, isLive }
 */
export function useCurrencyRate() {
    const [state, setState] = useState(() => {
        const cached = getCached();
        return {
            rate: cached?.rate ?? FALLBACK_USD_TO_INR,
            loading: !cached,
            error: null,
            lastUpdated: cached ? new Date(cached.timestamp) : null,
            isLive: !!cached,
        };
    });

    useEffect(() => {
        const cached = getCached();
        if (cached) return; // already have a valid cache hit

        let cancelled = false;

        apiClient.get("/exchange-rate")
            .then((res) => {
                if (cancelled) return;
                const data = res.data;
                const rate = data?.rate;
                if (!rate) throw new Error("rate missing from response");

                if (!data.is_live) {
                    // Backend itself fell back — surface the warning but still use the rate
                    setState({
                        rate,
                        loading: false,
                        error: data.error || "upstream unavailable",
                        lastUpdated: null,
                        isLive: false,
                    });
                    return;
                }

                const timestamp = setCache(rate);
                setState({
                    rate,
                    loading: false,
                    error: null,
                    lastUpdated: new Date(timestamp),
                    isLive: true,
                });
            })
            .catch((err) => {
                if (cancelled) return;
                console.warn("[useCurrencyRate] Backend proxy failed, using fallback:", err.message);
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: err.message,
                    isLive: false,
                }));
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}
