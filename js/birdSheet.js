import { getG } from './googleAPIs.js';

let SHEET_ID;
let G;
let birdMDPromise;

function updateBirdMetaData() {
	birdMDPromise = new Promise(res => {
		getG().then(G => G.getSheetList(SHEET_ID).then(res));
	});
}

export async function getBirdMaster(sheet) {
	SHEET_ID = sheet;
	G = await getG();
	updateBirdMetaData();
	return {
		getBirdList,
		getBirdInfo,
		setBirdInfo,
		newBird
	};
}

async function getBirdMetaData() {
	return birdMDPromise;
}

async function getBirdList() {
	const metaData = await getBirdMetaData();
	return metaData.result.sheets.map(s => s.properties.title);
}

// todo Cache info
async function getBirdInfo(birdName) {
	const metaData = await getBirdMetaData();
	const birdInfo = metaData.result.sheets.find(s => s.properties.title === birdName);
	if (!birdInfo) return 'Bird not found!';
	let rows = birdInfo.properties.gridProperties.rowCount;

	if (rows <= 1) return [];

	// Get last row if there is only 1 entry (excluding headers)
	// else last two rows to check if current entry is being updated
	let range = [rows > 2 ? rows - 1 : rows, rows];

	return G.getSheetRange(SHEET_ID, `${birdName}!A${range[0]}:F${range[1]}`);
}

async function setBirdInfo(birdName, values, index = 0) {
	const metaData = await getBirdMetaData();
	const birdInfo = metaData.result.sheets.find(s => s.properties.title === birdName);
	if (!birdInfo) return 'Bird not found!';
	let rows = birdInfo.properties.gridProperties.rowCount;

	let newEntries = [];
	let updatedEntries = [];

	if (index === 0) {
		newEntries = values;
	} else if (Math.abs(index) === values.length) {
		updatedEntries = values;
	} else {
		updatedEntries = [values[0]];
		newEntries = [values[1]];
	}

	let responseStatus = {};
	if (updatedEntries.length > 0) {
		let range = [rows, rows];
		if (updatedEntries.length === 2) --range[0];
		const res = await G.setSheetRange(SHEET_ID, `${birdName}!A${range[0]}:F${range[1]}`, updatedEntries);
		responseStatus.updatedEntires = res;
	}
	if (newEntries.length > 0) {
		let res = await G.appendSheetRange(SHEET_ID, `${birdName}!A1:F${newEntries.length}`, newEntries);
		responseStatus.newEntries = res;
	}

	updateBirdMetaData();
	return responseStatus;
}

async function newBird(birdName) {
	let responseStatus = {};
	responseStatus.create = await G.newSheet(SHEET_ID, birdName);
	if (responseStatus.create === 200) {
		responseStatus.titles = await G.setSheetRange(SHEET_ID, birdName + '!A1:F1', [
			['date', 'time', 'weight', 'food suggested', 'food consumed', 'target weight']
		]);
	}

	updateBirdMetaData();
	return responseStatus;
}
