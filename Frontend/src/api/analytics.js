import api from "./client";

function buildParams(filters = {}) {
  const params = {};

  if (filters.time) {
    params.time = filters.time;
  }

  if (filters.provider) {
    params.provider = filters.provider;
  }

  if (filters.model) {
    params.model = filters.model;
  }

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.time === "custom") {
    if (filters.start) {
      params.start = filters.start;
    }

    if (filters.end) {
      params.end = filters.end;
    }
  }

  return params;
}

export async function getOverview(filters = {}) {
  const response = await api.get("/analytics/overview", {
    params: buildParams(filters),
  });

  return response.data;
}

export async function getTimeseries(filters = {}) {
  const response = await api.get("/analytics/timeseries", {
    params: buildParams(filters),
  });

  return response.data;
}

export async function getModels(filters = {}) {
  const response = await api.get("/analytics/models", {
    params: buildParams(filters),
  });

  return response.data;
}

export async function getProviders(filters = {}) {
  const response = await api.get("/analytics/providers", {
    params: buildParams(filters),
  });

  return response.data;
}

export async function getErrors(filters = {}) {
  const response = await api.get("/analytics/errors", {
    params: buildParams(filters),
  });

  return response.data;
}