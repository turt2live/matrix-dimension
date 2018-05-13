const request = require('request');

const packId = Number(process.argv[2]);
if (!packId) {
    console.error("No sticker pack ID provided");
    process.exit(1);
}

const url = process.argv[3];
if (!url) {
    console.error("No sticker pack URL provided");
    process.exit(1);
}

request(url, (err, response) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    if (!response.body) {
        console.error("No response body");
        process.exit(3);
    }

    if (typeof(response.body) === "string") {
        response.body = JSON.parse(response.body);
    }

    const migrationLines = [];
    for (const pack of response.body) {
        migrationLines.push(
            '{ packId: ' + packId + ', name: "Sticker", description: "' + pack.filename + '", ' +
            'imageMxc: "' + pack.mxc + '", thumbnailMxc: "' + pack.thumbnail + '", mimetype: "' + pack.mimetype + '", ' +
            'thumbnailWidth: ' + pack.thumbnail_width + ', thumbnailHeight: ' + pack.thumbnail_height + ' },'
        );
    }

    console.log(migrationLines.join("\n"));
});