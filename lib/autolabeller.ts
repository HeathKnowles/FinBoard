export function humanizeKey(key?: string | null): string {
  if (!key) return "";

  const dictionary: Record<string, string> = {
    c: "Current Price",
    o: "Open Price",
    h: "High Price",
    l: "Low Price",
    pc: "Previous Close",
    d: "Change",
    dp: "Percent Change",
    v: "Volume",
    t: "Timestamp",
    s: "Status",
    vw: "Volume Weighted Price",

    C: "Close Price",
    O: "Open Price",
    H: "High Price",
    L: "Low Price",
    V: "Volume",

    pe: "P/E Ratio",
    marketCap: "Market Capitalization",
    sector: "Sector",
    industry: "Industry",
  };

  if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
    return dictionary[key];
  }

  if (key.includes("_")) {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const camelConverted = key.replace(/([A-Z])/g, " $1");
  if (camelConverted !== key) {
    return camelConverted.trim().replace(/^./, (str) => str.toUpperCase());
  }

  if (key.length <= 3 && key.toUpperCase() === key) {
    return key.toUpperCase().split("").join(" ");
  }

  return key.charAt(0).toUpperCase() + key.slice(1);
}
