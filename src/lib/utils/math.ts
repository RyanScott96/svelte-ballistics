export function lerp(t1: number, f1: number, t2: number, f2: number, x: number): number {
	const alpha = (x - t1) / (t2 - t1);
	return f1 + alpha * (f2 - f1);
}

export type State = {
	x: number;
	y: number;
	vx: number;
	vy: number;
};

export function RK4Step(s: State, dt: number, derivative: (s: State) => State) {
	const k1 = derivative(s);
	const k2 = derivative({
		x: s.x + (k1.x * dt) / 2,
		y: s.y + (k1.y * dt) / 2,
		vx: s.vx + (k1.vx * dt) / 2,
		vy: s.vy + (k1.vy * dt) / 2
	});
	const k3 = derivative({
		x: s.x + (k2.x * dt) / 2,
		y: s.y + (k2.y * dt) / 2,
		vx: s.vx + (k2.vx * dt) / 2,
		vy: s.vy + (k2.vy * dt) / 2
	});
	const k4 = derivative({
		x: s.x + k3.x * dt,
		y: s.y + k3.y * dt,
		vx: s.vx + k3.vx * dt,
		vy: s.vy + k3.vy * dt
	});

	s.x += (dt * (k1.x + 2 * k2.x + 2 * k3.x + k4.x)) / 6;
	s.y += (dt * (k1.y + 2 * k2.y + 2 * k3.y + k4.y)) / 6;
	s.vx += (dt * (k1.vx + 2 * k2.vx + 2 * k3.vx + k4.vx)) / 6;
	s.vy += (dt * (k1.vy + 2 * k2.vy + 2 * k3.vy + k4.vy)) / 6;
}
