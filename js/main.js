import { getBirdMaster } from './birdSheet.js';
import { signIn, waitForSignIn } from './googleAPIs.js';
import { inputs, outputs, buttons } from './elements.js';
import { getMinsToHrs, getElapsedMins, getDates } from './utils.js';
import { calculateFood, calculateGPH } from './equations.js';

let birdMaster;
const SHEET_ID = '1tSKIYI2_KiFO2SFAkCRcmbV9VGpK3fIVAxSM8TJvbeI';

const { roundedDateString, todayDate, yesterdayDate } = getDates();

let bird, yesterdayInfo;
let birdList = [];

setup();

function setup() {
	inputs.birdOptions.style.display = 'none';
	buttons.signIn.addEventListener('click', () => {
		buttons.signIn.innerText = 'loading...';
		signIn();
	});
	addEventListener('change', updateOutput);

	waitForSignIn().then(onSignIn);
	loadValues();
}

async function onSignIn() {
	buttons.signIn.style.display = 'none';
	birdMaster = await getBirdMaster(SHEET_ID);
	await updateBirdList();
	inputs.birdOptions.style.display = 'block';
	buttons.save.addEventListener('click', saveBirdInfo);
	buttons.newBird.addEventListener('click', newBird);
}

function updateOutput(e) {
	if (e?.target === inputs.birdSelect) updateSelectedBird();

	if (e?.target === inputs.weight.today && inputs.weight.target.value === '')
		inputs.weight.target.value = inputs.weight.today.value;

	const elapsedMinutes = getElapsedMins(inputs.time.yesterday.value, inputs.time.today.value);
	const targetHours = getElapsedMins(inputs.time.today.value, inputs.time.tomorrow.value) / 60;
	const gph = calculateGPH(inputs.weight.yesterday.value, inputs.weight.today.value, inputs.food.value, elapsedMinutes);
	const food = calculateFood(inputs.weight.today.value, inputs.weight.target.value, gph, targetHours);
	outputs.gph.value = gph !== undefined ? Math.round(gph) : '';
	outputs.suggestedFood.value = food !== undefined ? Math.round(food) : '';
}

async function loadValues(birdName) {
	let birdInfo = [];
	document.querySelectorAll('input').forEach(input => (input.value = ''));

	if (birdName) {
		birdInfo = (await birdMaster.getBirdInfo(birdName)) ?? [];
		inputs.overwriteFood.style.display = 'block';
		inputs.overwriteFood.previousElementSibling.style.display = 'block';
		buttons.save.style.display = 'block';
	} else {
		inputs.overwriteFood.style.display = 'none';
		inputs.overwriteFood.previousElementSibling.style.display = 'none';
		buttons.save.style.display = 'none';
	}

	inputs.time.today.value = roundedDateString;
	inputs.time.yesterday.value = roundedDateString;
	inputs.time.tomorrow.value = roundedDateString;

	if (birdInfo.length === 0) return;

	const today = birdInfo.find(bi => bi[0] === todayDate);
	const yesterday = birdInfo.find(bi => bi[0] === yesterdayDate);

	// Set target weight to most recent target weight
	inputs.weight.target.value = birdInfo.at(-1)[5];

	if (today) {
		inputs.time.today.value = today[1];
		inputs.weight.today.value = today[2];
		inputs.overwriteFood.value = today[4];
	}
	if (yesterday) {
		inputs.time.yesterday.value = yesterday[1];
		inputs.weight.yesterday.value = yesterday[2];
		inputs.food.value = yesterday[4];
		yesterdayInfo = yesterday;
	}

	updateOutput();
}

async function updateBirdList() {
	inputs.birdSelect.querySelectorAll('option:not([value="calculator"])').forEach(o => o.remove());
	birdList = await birdMaster.getBirdList();
	birdList.forEach(bird => {
		let option = document.createElement('option');
		option.value = bird;
		option.textContent = bird;
		inputs.birdSelect.appendChild(option);
	});
}

function updateSelectedBird() {
	let selectedBird = inputs.birdSelect.value;
	if (selectedBird === 'calculator') selectedBird = undefined;
	if (selectedBird !== bird) bird = selectedBird;
	loadValues(selectedBird);
}

async function saveBirdInfo() {
	let values = [];

	const birdInfo = await birdMaster.getBirdInfo(bird);

	const yesterday = [
		yesterdayDate,
		inputs.time.yesterday.value,
		inputs.weight.yesterday.value,
		yesterdayInfo?.[3] || '',
		inputs.food.value,
		yesterdayInfo?.[5] || inputs.weight.target.value
	];
	values.push(yesterday);

	const today = [
		todayDate,
		inputs.time.today.value,
		inputs.weight.today.value,
		outputs.suggestedFood.value,
		inputs.overwriteFood.value || outputs.suggestedFood.value,
		inputs.weight.target.value
	];
	values.push(today);

	let index = 0;

	if (birdInfo.find(bi => bi[0] === yesterdayDate)) index--;
	if (birdInfo.find(bi => bi[0] === todayDate)) index--;

	const { updatedEntries, newEntries } = await birdMaster.setBirdInfo(bird, values, index);
	if ((updatedEntries === 200 || updatedEntries === undefined) && (newEntries === 200 || newEntries === undefined))
		alert('Bird info updated successfully');
	else
		alert(
			`Error (${updatedEntries}, ${newEntries}) occurred! Please double check the spreadsheet to ensure nothing was messed up.`
		);
}

async function newBird() {
	const newBirdName = prompt('Enter bird name:');
	if (!newBirdName) return;
	if (birdList.includes(newBirdName)) return alert('That bird name already exists! Pick a new bird name.');

	const res = await birdMaster.newBird(newBirdName);
	if (res.status !== 200) {
		alert(`Error ${res.status} occurred! Please double check the spreadsheet to ensure nothing was messed up.`);
		return;
	}

	await updateBirdList();
	inputs.birdSelect.value = newBirdName;
	updateSelectedBird();
}
