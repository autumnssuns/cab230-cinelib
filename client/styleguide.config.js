const path = require('path');
const { version } = require('./package');

module.exports = {
	components: 'src/components/**/[A-Z]*.js',
	defaultExample: true,
};
