const SOURCE_LABELS = {
    aws_pricing_api: { label: "Live AWS Pricing API", icon: "🟢", color: "#0f6d64", bg: "rgba(15,109,100,0.1)" },
    aws_spot_api: { label: "Live EC2 Spot API", icon: "⚡", color: "#0f6d64", bg: "rgba(15,109,100,0.1)" },
    mock: { label: "Mock Data", icon: "🔶", color: "#b87d0e", bg: "rgba(244,185,66,0.15)" },
};

const PRICING_MODEL_BADGES = {
    OnDemand: { label: "On-Demand", color: "#2f3c7e", bg: "rgba(47,60,126,0.1)" },
    Reserved: { label: "Reserved (1yr)", color: "#0f6d64", bg: "rgba(15,109,100,0.12)" },
    Spot: { label: "Spot", color: "#b43f3f", bg: "rgba(180,63,63,0.1)" },
};

const SERVICE_ICONS = { EC2: "🖥️", S3: "🗄️", Lambda: "λ", default: "☁️" };

const FRIENDLY_FILTER_NAMES = {
    instance_type: "Instance Type",
    operating_system: "Operating System",
    storage_class: "Storage Class",
    memory_size_mb: "Memory (MB)",
    storage_gb: "Storage (GB)",
};

function Badge({ label, color, bg }) {
    return (
        <span className="meta-badge" style={{ color, background: bg }}>
            {label}
        </span>
    );
}

export default function MetadataPanel({ metadata }) {
    if (!metadata) {
        return (
            <div className="metadata-empty">
                Estimate metadata will appear here after you run a cost estimate.
            </div>
        );
    }

    let {
        service,
        region,
        pricing_model,
        pricing_source,
        filters = {},
        assumptions = [],
    } = metadata;

    // Fix for Lambda where these might be objects like { requests: "...", compute: "..." }
    if (typeof pricing_model === "object" && pricing_model !== null) {
        pricing_model = Object.values(pricing_model)[0];
    }
    if (typeof pricing_source === "object" && pricing_source !== null) {
        pricing_source = Object.values(pricing_source)[0];
    }

    const sourceCfg =
        SOURCE_LABELS[pricing_source] ||
        { label: String(pricing_source), icon: "🔵", color: "#2f3c7e", bg: "rgba(47,60,126,0.1)" };

    const pricingBadge = PRICING_MODEL_BADGES[pricing_model];
    const serviceIcon = SERVICE_ICONS[service] || SERVICE_ICONS.default;

    return (
        <div className="meta-panel">
            {/* Service + Region header */}
            <div className="meta-row meta-row--header">
                <div className="meta-service-badge">
                    <span className="meta-service-icon">{serviceIcon}</span>
                    <div>
                        <strong>{service}</strong>
                        <span className="meta-region">{region}</span>
                    </div>
                </div>
                <div className="meta-badges-group">
                    {pricingBadge && (
                        <Badge label={pricingBadge.label} color={pricingBadge.color} bg={pricingBadge.bg} />
                    )}
                    <span
                        className="meta-badge meta-badge--source"
                        style={{ color: sourceCfg.color, background: sourceCfg.bg }}
                    >
                        {sourceCfg.icon} {sourceCfg.label}
                    </span>
                </div>
            </div>

            {/* Filters */}
            {Object.keys(filters).length > 0 && (
                <div className="meta-section">
                    <span className="meta-section-title">Configuration Filters</span>
                    <div className="meta-kv-grid">
                        {Object.entries(filters).map(([key, value]) => (
                            <div key={key} className="meta-kv">
                                <span className="meta-kv__key">
                                    {FRIENDLY_FILTER_NAMES[key] || key}
                                </span>
                                <span className="meta-kv__value">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Assumptions */}
            <div className="meta-section">
                <span className="meta-section-title">Assumptions</span>
                {assumptions.length > 0 ? (
                    <ul className="meta-assumptions">
                        {assumptions.map((a, i) => (
                            <li key={i}>
                                <span className="meta-assumption-icon">ℹ️</span> {a}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="meta-no-assumptions">No special assumptions — standard pricing applied.</p>
                )}
            </div>
        </div>
    );
}
