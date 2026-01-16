import type { State } from '$lib/utils/math';
import {
	farenheitToCelsius,
	farenheitToRankine,
	hpaToPSF,
	inchHgToPSF,
	sqinToSqft
} from '$lib/utils/units';
import {
	GAS_DRY_AIR,
	GAS_WATER_VAPOR,
	GRAVITY_FPS,
	TETENS_C1,
	TETENS_C2,
	TETENS_C3
} from '$lib/physics/constants';
import { G1_TABLE, G7_TABLE, getCoefficient } from '$lib/physics/drag-table';

export type Atmosphere = {
	tempF: number;
	pressureinHg: number;
	humidityPercent: number;
};

export type Projectile = {
	ballisticCoefficient: number;
	coefficientType: 'G1' | 'G7';
	massGrains: number;
};

export function getSpeedOfSound(tempF: number): number {
	return 49.022 * Math.sqrt(farenheitToRankine(tempF));
}

export function calculateAirDensity(
	tempF: number,
	pressureinHg: number,
	humidityPercent: number
): number {
	const T_C = farenheitToCelsius(tempF);
	const T_rankine = farenheitToRankine(tempF);
	const P_psf = inchHgToPSF(pressureinHg);

	// Vapor Pressure calculation (Sat vapor pressure *  humidity)
	const Pvsat_hpa = TETENS_C1 * Math.pow(10, (TETENS_C2 * T_C) / (T_C + TETENS_C3));
	const Pv_psf = hpaToPSF((humidityPercent / 100) * Pvsat_hpa);

	// Ideal Gas Law for Moist Air: rho = (Pd / (Rd * T)) + (Pv / (Rv * T))
	const density =
		(P_psf - Pv_psf) / (GAS_DRY_AIR * T_rankine) + Pv_psf / (GAS_WATER_VAPOR * T_rankine);
	return density;
}

export function computeDrag(
	vx: number,
	vy: number,
	atmosphere: Atmosphere,
	projectile: Projectile
): [number, number] {
	const { tempF, pressureinHg, humidityPercent } = atmosphere;
	const { coefficientType, ballisticCoefficient } = projectile;
	const bc = ballisticCoefficient;
	const speed = Math.sqrt(vx * vx + vy * vy);
	// boundary condition
	if (speed < 0.1) return [0, 0];

	const mach = speed / getSpeedOfSound(tempF);
	const table = coefficientType === 'G1' ? G1_TABLE : G7_TABLE;
	const cd = getCoefficient(mach, table);
	const rho = calculateAirDensity(tempF, pressureinHg, humidityPercent);

	// Acceleration = (0.5 * rho * v^2 * Cd) / BC
	const sd = (bc * 4) / (sqinToSqft(1) * Math.PI); // sectional density in lbs/ft²
	const dragAccel = (rho * speed ** 2 * cd) / (2 * sd);

	return [-dragAccel * (vx / speed), -dragAccel * (vy / speed)];
}

export function derivative(s: State, atmosphere: Atmosphere, projectile: Projectile): State {
	const [dragx, dragy] = computeDrag(s.vx, s.vy, atmosphere, projectile);
	return {
		x: s.vx,
		y: s.vy,
		vx: dragx,
		vy: dragy - GRAVITY_FPS
	};
}
