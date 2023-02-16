export const inputs = {
	time: {
		yesterday: document.querySelector('#yesterday-time'),
		today: document.querySelector('#today-time'),
		tomorrow: document.querySelector('#tomorrow-time')
	},
	weight: {
		yesterday: document.querySelector('#yesterday-weight'),
		today: document.querySelector('#today-weight'),
		target: document.querySelector('#target-weight')
	},
	food: document.querySelector('#yesterday-food'),
	overwriteFood: document.querySelector('#overwrite-food'),
	birdSelect: document.querySelector('#bird-select'),
	birdOptions: document.querySelector('#bird-options')
};

export const outputs = {
	gph: document.querySelector('#gph'),
	suggestedFood: document.querySelector('#food-to-feed')
};

export const buttons = {
	signIn: document.querySelector('#signin-btn'),
	save: document.querySelector('#save-info'),
	newBird: document.querySelector('#new-bird')
};
