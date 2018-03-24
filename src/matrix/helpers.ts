import * as dns from "dns-then";
import { LogService } from "matrix-js-snippets";
import { Cache, CACHE_FEDERATION } from "../MemoryCache";
import * as request from "request";

export function getFederationUrl(serverName: string): Promise<string> {
    const cachedUrl = Cache.for(CACHE_FEDERATION).get(serverName);
    if (cachedUrl) {
        LogService.verbose("matrix", "Cached federation URL for " + serverName + " is " + cachedUrl);
        return Promise.resolve(cachedUrl);
    }

    let serverUrl = null;
    let expirationMs = 4 * 60 * 60 * 1000; // default is 4 hours
    const dnsPromise = dns.resolveSrv("_matrix._tcp." + serverName);
    return Promise.resolve(dnsPromise).then(records => {
        if (records && records.length > 0) {
            serverUrl = "https://" + records[0].name + ":" + records[0].port;
            expirationMs = records[0].ttl * 1000;
        }
    }, _err => {
        // Not having the SRV record isn't bad, it just means that the server operator decided to not use SRV records.
        // When there's no SRV record we default to port 8448 (as per the federation rules) in the lower .then()
        // People tend to think that the lack of an SRV record is bad, but in reality it's only a problem if one was set and
        // it's not being found. Most people don't set up the SRV record, but some do.
        LogService.warn("matrix", "Could not find _matrix._tcp." + serverName + " DNS record. This is normal for most servers.");
    }).then(() => {
        if (!serverUrl) serverUrl = "https://" + serverName + ":8448";
        LogService.verbose("matrix", "Federation URL for " + serverName + " is " + serverUrl + " - caching for " + expirationMs + " ms");
        Cache.for(CACHE_FEDERATION).put(serverName, serverUrl, expirationMs);
        return serverUrl;
    });
}

export function doFederatedApiCall(method: string, serverName: string, endpoint: string, query?: object, body?: object): Promise<any> {
    return getFederationUrl(serverName).then(federationUrl => {
        return new Promise((resolve, reject) => {
            request({
                method: method,
                url: federationUrl + endpoint,
                qs: query,
                json: body,
                rejectUnauthorized: false, // allow self signed certs (for federation)
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("matrix", "Error calling " + endpoint);
                    LogService.error("matrix", err);
                    reject(err);
                } else if (res.statusCode !== 200) {
                    LogService.error("matrix", "Got status code " + res.statusCode + " while calling " + endpoint);
                    reject(new Error("Error in request: invalid status code"));
                } else {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    resolve(res.body);
                }
            });
        });
    });
}