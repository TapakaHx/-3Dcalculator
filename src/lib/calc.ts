export type CalcInput = {
  printTimeHours: number;
  printerPowerWatts?: number | null;
  electricityUahPerKwh: number;
  materialGrams: number;
  materialPriceUahPerKg?: number | null;
  wastePercent: number;
  laborMinutes: number;
  laborUahPerHour: number;
  fixedServicesUah: number;
  printerAmortUahPerHour?: number | null;
  printerServiceUahPerHour?: number | null;
  includePrinterAmort: boolean;
  includePrinterService: boolean;
};

export type CalcOutput = {
  electricityKwh: number;
  electricityCost: number;
  materialCost: number;
  laborCost: number;
  fixedServicesCost: number;
  printerAmortCost: number;
  printerServiceCost: number;
  postCost: number;
  cogs: number;
};

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function calcCosts(input: CalcInput): CalcOutput {
  const electricityKwh = input.printerPowerWatts
    ? (input.printerPowerWatts / 1000) * input.printTimeHours
    : 0;
  const electricityCost = electricityKwh * input.electricityUahPerKwh;
  const materialCost = input.materialPriceUahPerKg
    ? (input.materialGrams / 1000) *
      input.materialPriceUahPerKg *
      (1 + input.wastePercent / 100)
    : 0;
  const laborCost = (input.laborMinutes / 60) * input.laborUahPerHour;
  const fixedServicesCost = input.fixedServicesUah;
  const printerAmortCost =
    input.includePrinterAmort && input.printerAmortUahPerHour
      ? input.printTimeHours * input.printerAmortUahPerHour
      : 0;
  const printerServiceCost =
    input.includePrinterService && input.printerServiceUahPerHour
      ? input.printTimeHours * input.printerServiceUahPerHour
      : 0;
  const postCost = laborCost + fixedServicesCost;
  const cogs =
    electricityCost +
    materialCost +
    postCost +
    printerAmortCost +
    printerServiceCost;

  return {
    electricityKwh: round2(electricityKwh),
    electricityCost: round2(electricityCost),
    materialCost: round2(materialCost),
    laborCost: round2(laborCost),
    fixedServicesCost: round2(fixedServicesCost),
    printerAmortCost: round2(printerAmortCost),
    printerServiceCost: round2(printerServiceCost),
    postCost: round2(postCost),
    cogs: round2(cogs)
  };
}

export function calcPricing({
  cogs,
  saleMode,
  markupPercent,
  manualSalePriceUah
}: {
  cogs: number;
  saleMode: "markup" | "manual";
  markupPercent: number;
  manualSalePriceUah: number;
}) {
  const salePrice =
    saleMode === "markup"
      ? cogs * (1 + markupPercent / 100)
      : manualSalePriceUah;
  const profit = salePrice - cogs;
  const marginPercent = salePrice > 0 ? (profit / salePrice) * 100 : 0;

  return {
    salePrice: round2(salePrice),
    profit: round2(profit),
    marginPercent: round2(marginPercent)
  };
}
