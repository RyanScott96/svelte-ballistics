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
	.form-container {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 400px;
	}

	.form-col {
		display: flex;
		flex-direction: column;
	}

	.form-row {
		display: flex;
		flex-direction: row;
	}

	label {
		display: flex;
		flex-direction: column;
	}

	button {
		width: 100px;
		padding: 0.5rem;
		margin-top: 1rem;
	}

	.radio-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.radio-group {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		align-items: center;
	}

	.results-container {
		margin-top: 2rem;
		width: 100%;
		max-width: 600px;
	}

	.table-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		text-align: center;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: right;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	}

	th {
		border-bottom: 2px solid #ccc;
		padding: 0.5rem;
	}

	td {
		padding: 0.5rem;
		border-bottom: 1px solid hsl(0, 0%, 93%);
	}

	.drop-neg {
		color: #d32f2f;
	}
	.drop-pos {
		color: #388e3c;
	}

	tr:hover {
		background-color: #f9f9f9;
	}
</style>
