# Svelte Ballistics

A reactive, high-precision exterior ballistics simulator built with SvelteKit and TypeScript. 

Unlike basic kinematic calculators, this engine utilizes a true numerical integrator to model non-linear bullet drag, atmospheric density, and trajectory arcs in real-time.

## 🧠 Core Physics & Architecture

* **Runge-Kutta 4th Order (RK4) Integrator:** Solves the equations of motion using RK4 to handle the complex, non-linear deceleration curves of G1 and G7 drag models, ensuring high stability over long flight times.
* **Atmospheric Modeling:** Calculates true air density by incorporating the Tetens equation for vapor pressure, accounting for the exact impact of humidity on drag.
* **Algorithmic Efficiency:** Utilizes a strict $O(\log n)$ binary search combined with linear interpolation to query 80-point Mach drag tables, allowing the engine to calculate hundreds of trajectory steps in milliseconds without stuttering the browser's main thread.
* **Bisection Angle Solver:** Computes the exact required barrel elevation for a given zero-range using a fixed-iteration binary search, guaranteeing 64-bit float precision without the risk of infinite loops typical in epsilon-tolerance solvers.

## 🛠️ Build and Run

**1. Install Dependencies**
```sh
deno i
```

**2. Run Development Server**
```sh
deno task dev
```

**3. View in Browser**
Visit the address that should be output into your terminal.