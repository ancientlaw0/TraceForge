import { useCallback, useEffect, useMemo, useState } from "react";

import {
    getOverview,
    getModels,
    getProviders,
    getTimeseries,
    getErrors,
    getTraces,
} from "../api/analytics";

import {
    getErrorMessage,
} from "../utils/errors";

export default function useAnalytics() {
    const [filters, setFilters] = useState({
        time: "week",
        provider: "",
        model: "",
        status: "",
        start: "",
        end: "",
    });

    const [overview, setOverview] = useState(null);
    const [models, setModels] = useState([]);
    const [providers, setProviders] = useState([]);
    const [timeseries, setTimeseries] = useState([]);
    const [errors, setErrors] = useState([]);
    const [traces, setTraces] = useState([]);

    // Unfiltered catalogs for dropdowns.
    const [providerCatalog, setProviderCatalog] = useState([]);
    const [modelCatalog, setModelCatalog] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorsBySection, setErrorsBySection] = useState({});

    const loadAnalytics = useCallback(async () => {
        setRefreshing(true);

        const requests = [
            {
                name: "overview",
                request: getOverview(filters),
            },
            {
                name: "models",
                request: getModels(filters),
            },
            {
                name: "providers",
                request: getProviders(filters),
            },
            {
                name: "timeseries",
                request: getTimeseries(filters),
            },
            {
                name: "errors",
                request: getErrors(filters),
            },
            {
                name: "traces",
                request: getTraces(filters),
            },
        ];

        const results = await Promise.allSettled(
            requests.map((item) => item.request)
        );

        const sectionErrors = {};

        results.forEach((result, index) => {
            const section = requests[index].name;

            if (result.status === "fulfilled") {
                const value = result.value;

                switch (section) {
                    case "overview":
                        setOverview(value);
                        break;

                    case "models": {
                        const data = Array.isArray(value)
                            ? value
                            : [];

                        setModels(data);

                        /*
                         * Populate dropdown catalogs only when
                         * the page has no provider/model filter.
                         */
                        if (
                            !filters.provider &&
                            !filters.model &&
                            !providerCatalog.length
                        ) {
                            const uniqueProviders = [
                                ...new Set(
                                    data
                                        .map(
                                            (item) =>
                                                item.provider
                                        )
                                        .filter(Boolean)
                                ),
                            ];

                            const uniqueModels = data
                                .filter(
                                    (item) =>
                                        item.provider &&
                                        item.model
                                )
                                .map((item) => ({
                                    provider:
                                        item.provider,
                                    model: item.model,
                                }));

                            setProviderCatalog(
                                uniqueProviders
                            );

                            setModelCatalog(
                                uniqueModels
                            );
                        }

                        break;
                    }

                    case "providers": {
                        const data = Array.isArray(value)
                            ? value
                            : [];

                        setProviders(data);

                        /*
                         * Fallback if the models endpoint
                         * didn't provide provider information.
                         */
                        if (
                            !filters.provider &&
                            !providerCatalog.length
                        ) {
                            setProviderCatalog(
                                data
                                    .map(
                                        (item) =>
                                            item.provider
                                    )
                                    .filter(Boolean)
                            );
                        }

                        break;
                    }

                    case "timeseries":
                        setTimeseries(
                            Array.isArray(value)
                                ? value
                                : []
                        );
                        break;

                    case "errors":
                        setErrors(
                            Array.isArray(value)
                                ? value
                                : []
                        );
                        break;

                    case "traces":
                        setTraces(
                            Array.isArray(value)
                                ? value
                                : []
                        );
                        break;

                    default:
                        break;
                }
            } else {
                sectionErrors[section] =
                    getErrorMessage(
                        result.reason
                    );
            }
        });

        setErrorsBySection(sectionErrors);
        setLoading(false);
        setRefreshing(false);
    }, [
        filters,
        providerCatalog.length,
        modelCatalog.length,
    ]);

    /*
     * Initial load only.
     *
     * Filters are applied explicitly with
     * handleApplyFilters().
     */
    useEffect(() => {
        loadAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const availableModels = useMemo(() => {
        if (!filters.provider) {
            return modelCatalog;
        }

        return modelCatalog.filter(
            (item) =>
                item.provider === filters.provider
        );
    }, [
        filters.provider,
        modelCatalog,
    ]);

    const handleFilterChange = useCallback(
        (event) => {
            const { name, value } = event.target;

            setFilters((previous) => {
                const next = {
                    ...previous,
                    [name]: value,
                };

                /*
                 * If provider changes, clear a model that
                 * doesn't belong to the new provider.
                 */
                if (name === "provider") {
                    if (
                        value &&
                        previous.model &&
                        !modelCatalog.some(
                            (item) =>
                                item.provider === value &&
                                item.model === previous.model
                        )
                    ) {
                        next.model = "";
                    }
                }

                /*
                 * Leaving custom mode clears its dates.
                 */
                if (
                    name === "time" &&
                    value !== "custom"
                ) {
                    next.start = "";
                    next.end = "";
                }

                return next;
            });
        },
        [modelCatalog]
    );

    const handleApplyFilters = useCallback(() => {
        if (
            filters.time === "custom" &&
            (!filters.start || !filters.end)
        ) {
            setErrorsBySection({
                filters:
                    "Please select both start and end dates.",
            });

            return;
        }

        if (
            filters.time === "custom" &&
            new Date(filters.start) >=
                new Date(filters.end)
        ) {
            setErrorsBySection({
                filters:
                    "Start date must be before end date.",
            });

            return;
        }

        loadAnalytics();
    }, [filters, loadAnalytics]);

    return {
        filters,
        setFilters,

        overview,
        models,
        providers,
        timeseries,
        errors,
        traces,

        providerCatalog,
        modelCatalog,
        availableModels,

        loading,
        refreshing,
        errorsBySection,

        loadAnalytics,
        handleFilterChange,
        handleApplyFilters,
    };
}