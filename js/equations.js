export function calculateGPH(initialWeight, currentWeight, yesterdayFood, elapsedMinutes) {
	initialWeight = parseFloat(initialWeight);
	currentWeight = parseFloat(currentWeight);
	yesterdayFood = parseFloat(yesterdayFood);
	elapsedMinutes = parseFloat(elapsedMinutes);

	// check for empty inputs
	if (isNaN(initialWeight + currentWeight + yesterdayFood)) return;
	let gph = (initialWeight + yesterdayFood - currentWeight) / (elapsedMinutes / 60);
	return gph;
}

export function calculateFood(currentWeight, targetWeight, gph, targetHours) {
	currentWeight = parseFloat(currentWeight);
	targetWeight = parseFloat(targetWeight);
	gph = parseFloat(gph);
	targetHours = parseFloat(targetHours);

	// current weight is used in gph calc so we don't also need to check current weight
	if (!gph || isNaN(targetWeight)) return;

	let maintainWeightFood = gph * targetHours;
	let weightDiff = targetWeight - currentWeight;
	let suggestedFood = maintainWeightFood + weightDiff;
	return suggestedFood;
}
