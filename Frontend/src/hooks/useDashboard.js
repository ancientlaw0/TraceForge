import { useEffect, useState } from "react";

import { getMe } from "../api/auth";
import {
    getOverview,
    getTimeseries,
} from "../api/analytics";


export default function useDashboard() {

    const [user, setUser] = useState(null);

    const [overview, setOverview] = useState(null);

    const [timeseries, setTimeseries] = useState([]);

    const [timeRange, setTimeRange] =
        useState("week");

    const [loading, setLoading] =
        useState(true);

    const [chartLoading, setChartLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [lastUpdated, setLastUpdated] =
        useState(null);


    useEffect(() => {

        async function loadUser() {

            try {

                const userData =
                    await getMe();

                setUser(userData);

            } catch (error) {

                console.error(
                    "Failed to load user:",
                    error
                );

            } finally {

                setLoading(false);

            }
        }

        loadUser();

    }, []);


    async function loadDashboardData() {

        try {

            setChartLoading(true);

            setError("");

            const [
                overviewData,
                timeseriesData,
            ] = await Promise.all([

                getOverview({
                    time: timeRange,
                }),

                getTimeseries({
                    time: timeRange,
                }),

            ]);

            setOverview(
                overviewData
            );

            setTimeseries(
                timeseriesData
            );

            setLastUpdated(
                new Date()
            );

        } catch (error) {

            console.error(
                "Failed to load dashboard data:",
                error
            );

            setError(
                error.message ||
                "Failed to load dashboard data."
            );

        } finally {

            setChartLoading(false);

        }

    }


    useEffect(() => {

        loadDashboardData();

    }, [timeRange]);


    useEffect(() => {

        const interval =
            setInterval(
                loadDashboardData,
                30 * 1000
            );

        return () =>
            clearInterval(interval);

    }, [timeRange]);


    return {

        user,

        overview,

        timeseries,

        timeRange,
        setTimeRange,

        loading,

        chartLoading,

        error,

        lastUpdated,

        loadDashboardData,

    };

}