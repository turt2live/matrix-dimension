import * as dns from "dns-then";
import { LogService } from "matrix-js-snippets";
import { Cache, CACHE_FEDERATION } from "../MemoryCache";
import * as request from "request";
import config from "../config";
import splitHost from 'split-host';
import * as isIP from "isipaddress";
import * as requestPromise from "request-promise";

export interface IFederationConnectionInfo {
    hostname: string;
    url: string;
}

export async function getFederationConnInfo(serverName: string): Promise<IFederationConnectionInfo> {
    const expirationMs = 2 * 60 * 60 * 1000; // 2 hours

    // Check to see if we've cached the hostname at all already
    const cachedUrl = Cache.for(CACHE_FEDERATION).get(serverName);
    if (cachedUrl) {
        LogService.verbose("matrix", "Cached federation URL for " + serverName + " is " + cachedUrl.url);
        return cachedUrl;
    }

    // Rely on the configuration for a federation URL if we can
    if (serverName === config.homeserver.name && config.homeserver.federationUrl) {
        let url = config.homeserver.federationUrl;
        if (url.endsWith("/")) {
            url = url.substring(0, url.length - 1);
        }

        LogService.info("matrix", "Using configured federation URL for " + serverName);
        const fedObj = {url, hostname: serverName};
        Cache.for(CACHE_FEDERATION).put(serverName, fedObj, expirationMs);
        return fedObj;
    }

    // Dev note: The remainder of this is largely transcribed from matrix-media-repo

    const hp = splitHost(serverName);
    if (!hp.host) throw new Error("No hostname provided");
    let defaultPort = false;
    if (!hp.port) {
        defaultPort = true;
        hp.port = 8448;
    }

    // Step 1 of the discovery process: if the hostname is an IP, use that with explicit or default port
    if (isIP.test(hp.host)) {
        const fedUrl = `https://${hp.host}:${hp.port}`;
        const fedObj = {url: fedUrl, hostname: serverName};
        Cache.for(CACHE_FEDERATION).put(serverName, fedObj, expirationMs);
        LogService.info("matrix", `Federation URL for ${serverName} is ${fedUrl} (IP address)`);
        return fedObj;
    }

    // Step 2: if the hostname is not an IP address, and an explicit port is given, use that
    if (!defaultPort) {
        const fedUrl = `https://${hp.host}:${hp.port}`;
        const fedObj = {url: fedUrl, hostname: hp.host};
        Cache.for(CACHE_FEDERATION).put(serverName, fedObj, expirationMs);
        LogService.info("matrix", `Federation URL for ${serverName} is ${fedUrl} (explicit port)`);
        return fedObj;
    }

    // Step 3: if the hostname is not an IP address and no explicit port is given, do .well-known
    try {
        let result = await requestPromise(`https://${hp.host}/.well-known/matrix/server`);
        if (typeof (result) === 'string') result = JSON.parse(result);
        const wkServerAddr = result['m.server'];
        if (wkServerAddr) {
            const wkHp = splitHost(wkServerAddr);
            if (!wkHp.host) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error("No hostname provided for m.server");
            }
            let wkDefaultPort = false;
            if (!wkHp.port) {
                wkDefaultPort = true;
                wkHp.port = 8448;
            }

            // Step 3a: if the delegated host is an IP address, use that (regardless of port)
            if (isIP.test(wkHp.host)) {
                const fedUrl = `https://${wkHp.host}:${wkHp.port}`;
                const fedObj = {url: fedUrl, hostname: wkServerAddr};
                Cache.for(CACHE_FEDERATION).put(serverName, fedObj, expirationMs);
                LogService.info("matrix", `Federation URL for ${serverName} is ${fedUrl} (WK; IP address)`);
                return fedObj;
            }

            // Step 3b: if the delegated host is not an IP and an explicit port is given, use that
            if (!wkDefaultPort) {
                const fedUrl = `https://${wkHp.host}:${wkHp.port}`;
                const fedObj = {url: fedUrl, hostname: wkHp.host};
                Cache.for(CACHE_FEDERATION).put(serverName, fedObj, expirationMs);
                LogService.info("matrix", `Federation URL for ${serverName} is ${fedUrl} (WK; explicit port)`);
                return fedObj;
            }

            // Step 3c: if the delegated host is not an IP and doesn't have a port, start a SRV lookup and use that
            try {
                const records = await dns.resolveSrv("_matrix._tcp." + hp.host);
                if (records && records.length > 0) {
                    const fedUrl = `https://${records[0].name}:${records[0].port}`;
                    const fedObj = {url: fedUrl, hostname: wkHp.host};
                    Cache.for(CACHE_FEDERATION).put(serverName, fedObj, expirationMs);
                    LogService.info("matrix", `Federation URL for ${serverName} is ${fedUrl} (WK; SRV)`);
                    return fedObj;
                }
            } catch (e) {
                LogService.warn("matrix", "Non-fatal error looking up .well-known SRV for " + serverName);
                LogService.warn("matrix", e);
            }

            // Step 3d: use the delegated host as-is
            const fedUrl = `https://${wkHp.host}:${wkHp.port}`;
            const fedObj = {url: fedUrl, hostname: wkHp.host};
            Cache.for(CACHE_FEDERATION).put(serverName, fedObj, expirationMs);
            LogService.info("matrix", `Federation URL for ${serverName} is ${fedUrl} (WK; fallback)`);
            return fedObj;
        }
    } catch (e) {
        LogService.warn("matrix", "Non-fatal error looking up .well-known for " + serverName);
        LogService.warn("matrix", e);
    }

    // Step 4: try resolving a hostname using SRV records and use that
    try {
        const records = await dns.resolveSrv("_matrix._tcp." + hp.host);
        if (records && records.length > 0) {
            const fedUrl = `https://${records[0].name}:${records[0].port}`;
            const fedObj = {url: fedUrl, hostname: hp.host};
            Cache.for(CACHE_FEDERATION).put(serverName, fedObj, expirationMs);
            LogService.info("matrix", `Federation URL for ${serverName} is ${fedUrl} (SRV)`);
            return fedObj;
        }
    } catch (e) {
        LogService.warn("matrix", "Non-fatal error looking up SRV for " + serverName);
        LogService.warn("matrix", e);
    }

    // Step 5: use the target host as-is
    const fedUrl = `https://${hp.host}:${hp.port}`;
    const fedObj = {url: fedUrl, hostname: hp.host};
    Cache.for(CACHE_FEDERATION).put(serverName, fedObj, expirationMs);
    LogService.info("matrix", `Federation URL for ${serverName} is ${fedUrl} (SRV)`);
    return fedObj;
}

export async function doFederatedApiCall(method: string, serverName: string, endpoint: string, query?: object, body?: object): Promise<any> {
    const federationInfo = await getFederationConnInfo(serverName);
    LogService.info("matrix", "Doing federated API call: " + federationInfo.url + endpoint);
    return new Promise((resolve, reject) => {
        request({
            method: method,
            url: federationInfo.url + endpoint,
            qs: query,
            json: body,
            // TODO: Remove this for MSC1711 support
            rejectUnauthorized: false, // allow self signed certs (for federation)
            headers: {
                "Host": federationInfo.hostname,
            },
        }, (err, res, _body) => {
            if (err) {
                LogService.error("matrix", "Error calling " + endpoint);
                LogService.error("matrix", err);
                reject(err);
            } else if (res.statusCode !== 200) {
                LogService.error("matrix", "Got status code " + res.statusCode + " while calling federated endpoint " + endpoint);
                reject(new Error("Error in request: invalid status code"));
            } else {
                if (typeof (res.body) === "string") res.body = JSON.parse(res.body);
                resolve(res.body);
            }
        });
    });
}

export async function doClientApiCall(method: string, endpoint: string, query?: object, body?: object | Buffer, contentType = "application/octet-stream"): Promise<any> {
    let url = config.homeserver.clientServerUrl;
    if (url.endsWith("/")) url = url.substring(0, url.length - 1);
    LogService.info("matrix", "Doing client API call: " + url + endpoint);

    const requestOptions = {
        method: method,
        url: url + endpoint,
        qs: query,
    };
    if (Buffer.isBuffer(body)) {
        requestOptions["body"] = body;
        requestOptions["headers"] = {
            "Content-Type": contentType,
        };
    } else {
        requestOptions["json"] = body;
    }

    return new Promise((resolve, reject) => {
        request(requestOptions, (err, res, _body) => {
            if (err) {
                LogService.error("matrix", "Error calling " + endpoint);
                LogService.error("matrix", err);
                reject(err);
            } else if (res.statusCode !== 200) {
                LogService.error("matrix", "Got status code " + res.statusCode + " while calling client endpoint " + endpoint);
                LogService.error("matrix", res.body);
                reject(new Error("Error in request: invalid status code"));
            } else {
                if (typeof (res.body) === "string") res.body = JSON.parse(res.body);
                resolve(res.body);
            }
        });
    });
}
