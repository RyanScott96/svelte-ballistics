export function feetToInches(feet: number): number {
	return feet * 12;
}

export function inchesToFt(inches: number): number {
	return inches / 12;
}

export function yardsToFeet(yards: number): number {
	return yards * 3;
}

export function feetToYards(feet: number): number {
	return feet / 3;
}

export function farenheitToRankine(tempF: number): number {
	return tempF + 459.67;
}

export function farenheitToCelsius(tempF: number): number {
	return ((tempF - 32) * 5) / 9;
}

export function inchHgToPSF(pressureinHg: number): number {
	return pressureinHg * 70.7262;
}

export function hpaToPSF(pressurehPa: number): number {
	return pressurehPa * 2.08854;
}

export function lbsToSlugs(massLbs: number): number {
	return massLbs / 32.174;
}

export function slugsToLbs(massSlugs: number): number {
	return massSlugs * 32.174;
}

export function sqinToSqft(areaSqin: number): number {
	return areaSqin / 144;
}

export function sqftToSqin(areaSqft: number): number {
	return areaSqft * 144;
}

export function radsToMils(rads: number): number {
	return rads * 1000;
}

export function radsToMOA(rads: number): number {
	return rads * (180 / Math.PI) * 60;
}
