const { readdirSync, readFileSync } = require('fs');
const maps = {};

const files = readdirSync(__dirname);

files.forEach(file => {
	if (file == 'MapLoader.js') return;

	const data = require(`${__dirname}/${file}`);
	const name = file.replace('.js', '');

	console.log(`Loaded map ${name}`);
	maps[name] = data;
});

module.exports = {
	get(name) {
		return maps[name];
	}
};
