<script lang="ts">
	import type { Atmosphere, Projectile } from '$lib/physics/drag-model';
	import { calculateDropTable, findAngle } from '$lib/physics/solver';

	let result: { range: number; drop: number; velocity: number; moa: number; mils: number }[] =
		$state([]);

	// Firearm Parameters
	let scopeheightInches: number = $state(2.5);
	let zeroRangeYards: number = $state(100);
	let muzzleVelocityFps: number = $state(3200);

	// Projectile Parameters
	let bulletMassGrains: number = $state(55);
	let ballisticCoefficient: number = $state(0.125);
	let coefficientType: 'G1' | 'G7' = $state('G7');

	// Atmospheric Conditions
	let tempF = $state(59);
	let pressureinHg = $state(29.92);
	let humidityPercent = $state(0);

	// Output Table Parameters
	let tableMax: number = $state(500);
	let tableStep: number = $state(50);

	function simulate() {
		const initialState = {
			scopeheightInches,
			zeroRangeYards,
			muzzleVelocityFps,
			theta: 0 // placeholder, will be set in findAngle
		};
		const atmosphere: Atmosphere = {
			tempF,
			pressureinHg,
			humidityPercent
		};
		const projectile: Projectile = {
			massGrains: bulletMassGrains,
			ballisticCoefficient,
			coefficientType
		};

		const theta = findAngle({
			theta_min: -0.05,
			theta_max: 0.2,
			dt: 0.0001,
			initialState,
			atmosphere,
			projectile
		});

		result = calculateDropTable({
			theta,
			tableMax,
			tableStep,
			dt: 0.0001,
			initialState,
			atmosphere,
			projectile
		});
	}
</script>

<div class="form-container">
	<h1>Ballistic Calculator</h1>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			simulate();
		}}
	>
		<div class="form-row">
			<div class="form-col">
				<label for="scope-height">
					<h4>Scope Height (inches):</h4>
					<input
						bind:value={scopeheightInches}
						type="number"
						step="any"
						id="scope-height"
						placeholder="Enter scope height..."
					/>
				</label>
				<label for="zero-range">
					<h4>Zero Range (yards):</h4>
					<input
						bind:value={zeroRangeYards}
						type="number"
						step="any"
						placeholder="Enter zero distance..."
					/>
				</label>
				<br />
				<label for="muzzle-velocity">
					<h4>Muzzle Velocity (fps):</h4>
					<input
						bind:value={muzzleVelocityFps}
						type="number"
						step="any"
						placeholder="Enter muzzle velocity..."
					/>
				</label>
				<label for="bullet-weight">
					<h4>Bullet Weight (grains):</h4>
					<input
						bind:value={bulletMassGrains}
						type="number"
						step="any"
						placeholder="Enter bullet weight..."
					/>
				</label>
				<br />
				<label for="ballistic-coefficient">
					<h4>Ballistic Coefficient:</h4>
					<input
						bind:value={ballisticCoefficient}
						type="number"
						step="any"
						placeholder="Enter ballistic coefficient..."
					/>
				</label>
				<label class="radio-group" for="coefficient-type">
					<label class="radio-button" for="g1">
						G1
						<input
							bind:group={coefficientType}
							type="radio"
							id="g1"
							name="coefficient-type"
							value="G1"
						/>
					</label>
					<label class="radio-button" for="g7">
						G7
						<input
							bind:group={coefficientType}
							type="radio"
							id="g7"
							name="coefficient-type"
							value="G7"
						/>
					</label>
				</label>
			</div>
			<div class="form-col">
				<label for="table-max">
					<h4>Table Max (yards):</h4>
					<input
						bind:value={tableMax}
						type="number"
						step="any"
						placeholder="Table Max (yards)..."
					/>
				</label>
				<label for="table-step">
					<h4>Table Step (yards):</h4>
					<input
						bind:value={tableStep}
						type="number"
						step="any"
						placeholder="Table Step (yards)..."
					/>
				</label>
				<label for="temperature">
					<h4>Temperature (°F):</h4>
					<input bind:value={tempF} type="number" step="any" placeholder="Enter temperature..." />
				</label>
				<label for="pressure">
					<h4>Pressure (inHg):</h4>
					<input
						bind:value={pressureinHg}
						type="number"
						step="any"
						placeholder="Enter pressure..."
					/>
				</label>
				<label for="humidity">
					<h4>Humidity (%):</h4>
					<input
						bind:value={humidityPercent}
						type="number"
						step="any"
						placeholder="Enter humidity..."
					/>
				</label>
			</div>
		</div>
		<div class="form-row">
			<button type="submit">Calculate</button>
		</div>
	</form>

	{#if result && result.length > 0}
		<div class="results-container">
			<div class="table-container">
				<h2>Ballistic Table</h2>
				<table>
					<thead>
						<tr>
							<th>Range (yd)</th>
							<th>Drop (in)</th>
							<th>Click (MOA)</th>
							<th>Click (MIL)</th>
							<th>Velocity (fps)</th>
						</tr>
					</thead>
					<tbody>
						{#each result as row}
							<tr>
								<td>{row.range}</td>
								<td class={row.drop < 0 ? 'drop-neg' : 'drop-pos'}>
									{row.drop.toFixed(2)}"
								</td>
								<td>
									{row.range > 0 ? row.moa.toFixed(2) : '0.00'}
								</td>
								<td>
									{row.range > 0 ? row.mils.toFixed(2) : '0.00'}
								</td>
								<td>{row.velocity.toFixed(0)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
	/* =========================
	   Theme Variables
	   ========================= */

	:root {
		--bg: #f6f7f9;
		--card: #ffffff;
		--border: #e5e7eb;
		--text: #111827;
		--muted: #6b7280;
		--accent: #2563eb;
		--accent-soft: #e0e7ff;
		--danger: #dc2626;
		--success: #16a34a;
		--row-hover: #f1f5f9;
		--row-alt: #fafafa;
		--radius: 12px;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--bg: #0f172a;
			--card: #020617;
			--border: #1e293b;
			--text: #e5e7eb;
			--muted: #94a3b8;
			--accent: #60a5fa;
			--accent-soft: rgba(96, 165, 250, 0.25);
			--danger: #f87171;
			--success: #4ade80;
			--row-hover: #020617;
			--row-alt: #020617;
		}
	}

	/* =========================
	   Global / Typography
	   ========================= */
	:global(body) {
		background: var(--bg);
		color: var(--text);
		font-family:
			'Inter',
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			'Helvetica Neue',
			Arial,
			'Noto Sans',
			sans-serif;
	}

	h1 {
		font-size: 1.7rem;
		font-weight: 700;
		margin-bottom: 1rem;
		letter-spacing: -0.02em;
	}

	h2 {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--muted);
		margin-bottom: 0.75rem;
	}

	/* =========================
	   Layout
	   ========================= */

	.form-container {
		padding: 3rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	form {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		width: 100%;
		max-width: 500px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
	}

	.form-row {
		display: flex;
		gap: 1.5rem;
	}

	.form-col {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		flex: 1;
	}

	@media (max-width: 768px) {
		.form-row {
			flex-direction: column;
		}
	}

	/* =========================
	   Labels & Inputs
	   ========================= */

	label {
		display: flex;
		flex-direction: column;
	}

	label h4 {
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--muted);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	input[type='number'] {
		padding: 0.55rem 0.65rem;
		font-size: 0.9rem;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--card);
		color: var(--text);
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	input::placeholder {
		color: var(--muted);
	}

	input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-soft);
	}

	/* =========================
	   Radio Buttons (Segmented)
	   ========================= */

	.radio-group {
		display: inline-flex;
		flex-direction: row;
		gap: 0.4rem;
		align-items: center;
		padding: 0.15rem;
		border-radius: 999px;
		background: var(--row-hover);
		width: fit-content;
		margin-top: 0.25rem;
	}

	.radio-button {
		display: flex;
		align-items: center;
		padding: 0.25rem 0.55rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted);
		cursor: pointer;
		user-select: none;
		transition: background 0.15s, color 0.15s;
	}

	.radio-button input {
		display: none;
	}

	.radio-button:has(input:checked) {
		background: var(--accent);
		color: #fff;
	}

	/* =========================
	   Button
	   ========================= */

	button {
		width: 100%;
		padding: 0.7rem 1rem;
		border-radius: 10px;
		border: none;
		background: linear-gradient(180deg, #3b82f6, var(--accent));
		color: #fff;
		font-weight: 600;
		cursor: pointer;
		transition: box-shadow 0.15s, transform 0.05s;
	}

	button:hover {
		box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
	}

	button:active {
		transform: translateY(1px);
	}

	/* =========================
	   Results / Table
	   ========================= */

	.results-container {
		margin-top: 2rem;
		width: 100%;
		max-width: 720px;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
		text-align: right;
		font-family: inherit;
	}

	th,
	td {
		padding: 0.6rem 0.55rem;
		border-bottom: 1px solid var(--border);
	}

	th {
		text-transform: uppercase;
		font-size: 0.65rem;
		letter-spacing: 0.08em;
		color: var(--muted);
		background: var(--card);
		position: sticky;
		top: 0;
	}

	tbody td {
		font-family: 'Inter Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-weight: 500;
		letter-spacing: 0.4px;
	}

	tbody tr:nth-child(even) {
		background: var(--row-alt);
	}

	tbody tr:hover {
		background: var(--row-hover);
	}

	.drop-neg {
		color: var(--danger);
		font-weight: 600;
	}

	.drop-pos {
		color: var(--success);
		font-weight: 600;
	}
</style>

