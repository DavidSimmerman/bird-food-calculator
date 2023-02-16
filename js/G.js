export let G;

export function onGlibLoad() {
	G = window.gapi.client.sheets.spreadsheets;
}

export async function getSheetList(spreadsheetId) {
	const resp = await G.get({ spreadsheetId });
	return resp;
}

export async function getSheetRange(spreadsheetId, range) {
	const res = await G.values.get({
		spreadsheetId,
		range
	});

	return res.result.values;
}

export async function setSheetRange(spreadsheetId, range, values) {
	const res = await G.values.update({ spreadsheetId, range, valueInputOption: 'USER_ENTERED', resource: { values } });
	return res.status;
}

export async function appendSheetRange(spreadsheetId, range, values) {
	const res = await G.values.append({ spreadsheetId, range, valueInputOption: 'USER_ENTERED', resource: { values } });
	return res.status;
}

export async function newSheet(spreadsheetId, title) {
	const res = await G.batchUpdate({
		spreadsheetId,
		resource: {
			requests: [
				{
					addSheet: {
						properties: {
							title,
							gridProperties: {
								rowCount: 1,
								columnCount: 6
							}
						}
					}
				}
			]
		}
	});
	return res.status;
}
