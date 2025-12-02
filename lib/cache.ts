import NodeCache from "node-cache";

export const apiCache = new NodeCache({
    stdTTL: 30,
    checkperiod: 60,
})