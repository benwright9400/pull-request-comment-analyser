import camelcaseKeys from "camelcase-keys";

export async function apiGet<T>(url: string): Promise<T> {
    const res = await fetch(url);
    const body = await res.json();

    if (!res.ok) {
        throw new Error(body.error || `Request to ${url} failed`);
    }

    return camelcaseKeys(body, { deep: true }) as T;
}
