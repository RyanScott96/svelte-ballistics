import { derivative, type Atmosphere, type Projectile } from '$lib/physics/drag-model';
import { lerp, RK4Step, type State } from '$lib/utils/math';
import { feetToInches, inchesToFt, yardsToFeet, radsToMils, radsToMOA } from '$lib/utils/units';

export type SolverParams = {
	scopeheightInches: number;
	zeroRangeYards: number;
	muzzleVelocityFps: number;
};
export function initialState(params: SolverParams, theta: number): [State, number] {
	const scopeHeightFt = -inchesToFt(params.scopeheightInches);
	const zeroRangeFt = yardsToFeet(params.zeroRangeYards);

	const vx = params.muzzleVelocityFps * Math.cos(theta);
	const vy = params.muzzleVelocityFps * Math.sin(theta);

	return [
		{
			x: 0,
			y: scopeHeightFt,
			vx,
			vy
		},
		zeroRangeFt
	];
}

export type AngleSolverParams = {
	theta_min: number;
	theta_max: number;
	dt: number;
	initialState: SolverParams;
	atmosphere: Atmosphere;
	projectile: Projectile;
};

export function findAngle(params: AngleSolverParams): number {
	let theta_min = params.theta_min;
	let theta_max = params.theta_max;

	// Fixed number of bisections is cheap
	// compared to while loop and tolerance
	for (let i = 0; i < 50; i++) {
		const theta_mid = (theta_min + theta_max) / 2;
		const [state, x_zero] = initialState(params.initialState, theta_mid);
		const dF = (state: State) => {
			return derivative(state, params.atmosphere, params.projectile);
		};

		while (state.x < x_zero) {
			RK4Step(state, params.dt, dF);
			// boundary condition invalidated
			if (state.y < -100) break;
		}

		if (state.y > 0) {
			theta_max = theta_mid;
		} else {
			theta_min = theta_mid;
		}
	}
	return (theta_min + theta_max) / 2;
}

export type DropTableParams = {
	theta: number;
	dt: number;
	tableStep: number;
	tableMax: number;
	initialState: SolverParams;
	atmosphere: Atmosphere;
	projectile: Projectile;
};

export function calculateDropTable(params: DropTableParams) {
	const [state] = initialState(params.initialState, params.theta);

	let iteration = 1;
	const dropTable: { range: number; drop: number; velocity: number; moa: number; mils: number }[] =
		[];

	const maxRangeFeet = yardsToFeet(params.tableMax);

	const dF = (state: State) => {
		return derivative(state, params.atmosphere, params.projectile);
	};

	while (state.x < maxRangeFeet) {
		const prevX = state.x;
		const prevY = state.y;
		const prevVx = state.vx;
		const prevVy = state.vy;

		RK4Step(state, params.dt, dF);

		const currentTargetYards = iteration * params.tableStep;
		const currentTargetFeet = yardsToFeet(currentTargetYards);

		if (prevX <= currentTargetFeet && state.x >= currentTargetFeet) {
			// Interpolate results
			const interYFeet = lerp(prevX, prevY, state.x, state.y, currentTargetFeet);
			const interVx = lerp(prevX, prevVx, state.x, state.vx, currentTargetFeet);
			const interVy = lerp(prevX, prevVy, state.x, state.vy, currentTargetFeet);

			const speed = Math.sqrt(interVx * interVx + interVy * interVy);

			const dropInches = feetToInches(interYFeet);
			const angleRads = Math.atan2(Math.abs(interYFeet), currentTargetFeet);
			const moa = radsToMOA(angleRads);
			const mils = radsToMils(angleRads);

			dropTable.push({
				range: currentTargetYards,
				drop: dropInches,
				velocity: speed,
				moa,
				mils
			});
			iteration += 1;
		}
	}
	return dropTable;
}
