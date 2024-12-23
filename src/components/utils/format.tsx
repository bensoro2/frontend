export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatNumber = (number: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(number);
};
