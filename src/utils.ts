export function DecimalToPercentage(newNumber: number, oldNumber: number): number {
    if (oldNumber === 0) return 0;
    const decimalPart = (newNumber - oldNumber) / oldNumber;
    const percentage = decimalPart * 100;
    return Math.floor(percentage * 1000 + 0.5) / 1000;
}