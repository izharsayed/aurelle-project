export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const discountPercent = (price: number, salePrice: number | null) =>
  salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

export const effectivePrice = (price: number, salePrice: number | null) => salePrice ?? price;
