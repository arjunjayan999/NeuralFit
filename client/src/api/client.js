const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let isRefreshing = false;
let refreshQueue = [];

const drainQueue = (success) => {
	refreshQueue.forEach((cb) => {
		cb(success);
	});
	refreshQueue = [];
};

const refreshAccessToken = async () => {
	try {
		const res = await fetch(`${BASE_URL}/auth/refresh`, {
			method: "POST",
			credentials: "include",
		});
		return res.ok;
	} catch {
		return false;
	}
};

const request = async (endpoint, options = {}, isRetry = false) => {
	const config = {
		...options,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
	};
	if (config.body && typeof config.body !== "string") {
		config.body = JSON.stringify(config.body);
	}

	const res = await fetch(`${BASE_URL}${endpoint}`, config);
	const data = await res.json();

	if (!res.ok && data?.code === "TOKEN_EXPIRED" && !isRetry) {
		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				refreshQueue.push((success) => {
					if (success) {
						try {
							resolve(request(endpoint, options, true));
						} catch (err) {
							reject(err);
						}
					} else {
						reject(new Error("Session expired"));
					}
				});
			});
		}

		isRefreshing = true;
		const refreshed = await refreshAccessToken();
		isRefreshing = false;
		drainQueue(refreshed);

		if (refreshed) {
			return request(endpoint, options, true);
		}

		window.location.href = "/login";
		throw new Error("Session expired");
	}

	if (!res.ok) {
		throw new Error(data?.error || "Something went wrong");
	}

	return data;
};

const api = {
	get: (endpoint) => request(endpoint, { method: "GET" }),
	post: (endpoint, body) => request(endpoint, { method: "POST", body }),
	put: (endpoint, body) => request(endpoint, { method: "PUT", body }),
	delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export default api;
