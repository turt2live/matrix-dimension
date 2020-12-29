const fs = require('fs');
const util = require('util');

(async function () {
    if (process.argv.length !== 3) {
        console.error('Wrong number of arguments');
        process.exit(-1);
    }

    const filePath = process.argv.pop();

    const fileExists = await util.promisify(fs.exists)(filePath);

    if (fileExists) {
        const file = await fs.promises.readFile(filePath, { encoding: 'utf-8' });
        await fs.promises.writeFile(
            filePath,
            file
                .replace(/\r\n/g, '\n')
                .replace(/\r/, '\n'),
        );
    }
})();