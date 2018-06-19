import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_sticker_packs", [
                {
                    type: "stickerpack",
                    name: "Loading Artist",
                    avatarUrl: "mxc://t2bot.io/d7a7c72df5ea59c432eb142646b45a96",
                    isEnabled: true,
                    isPublic: true,
                    description: "The official Loading Artist sticker pack!",
                    authorType: "website",
                    authorReference: "https://loadingartist.com/",
                    authorName: "Gregor Czaykowski",
                    license: "CC BY-NC 4.0",
                    licensePath: "/licenses/cc_by-nc_4.0.txt",
                }
            ]))
            .then(packId => {
                return queryInterface.bulkInsert("dimension_stickers", [
                    { packId: packId, name: 'Argue', description: 'Two people arguing in a heated debate', imageMxc: 'mxc://t2bot.io/cfe97ad50ee1f35de322306f58d9d4a1', thumbnailMxc: 'mxc://t2bot.io/cfe97ad50ee1f35de322306f58d9d4a1', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Awake', description: 'Lying awake at night', imageMxc: 'mxc://t2bot.io/0046a75ce93d1322cf9577ea11a49f04', thumbnailMxc: 'mxc://t2bot.io/0046a75ce93d1322cf9577ea11a49f04', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Bed', description: 'Crying yourself to sleep', imageMxc: 'mxc://t2bot.io/fadda48f250674af3f7e3bee55c91b80', thumbnailMxc: 'mxc://t2bot.io/fadda48f250674af3f7e3bee55c91b80', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Bird', description: 'Angry bird', imageMxc: 'mxc://t2bot.io/8a8603d8d6c375e0e92171fc24e37e49', thumbnailMxc: 'mxc://t2bot.io/35eb7a9e416bc5634fac5c9f0f4b0ced', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Blush', description: 'Blushing and looking away', imageMxc: 'mxc://t2bot.io/535d46b7834885bf13bd9ff833561ce5', thumbnailMxc: 'mxc://t2bot.io/535d46b7834885bf13bd9ff833561ce5', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Celebrate', description: 'Opening up a bottle of champagne', imageMxc: 'mxc://t2bot.io/1377f37c0b6a5c401483c4be99e48938', thumbnailMxc: 'mxc://t2bot.io/1377f37c0b6a5c401483c4be99e48938', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Cold', description: 'Shivering in the cold', imageMxc: 'mxc://t2bot.io/3ba28460aae70d33dd061b3a000f5ee2', thumbnailMxc: 'mxc://t2bot.io/3ba28460aae70d33dd061b3a000f5ee2', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Dead Inside', description: 'I feel dead inside', imageMxc: 'mxc://t2bot.io/15196e0235422de488f2d3909054ab82', thumbnailMxc: 'mxc://t2bot.io/15196e0235422de488f2d3909054ab82', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Detective', description: 'A pondering detective', imageMxc: 'mxc://t2bot.io/5042e46fa9d514694c6cbd0a8a1b23b5', thumbnailMxc: 'mxc://t2bot.io/5042e46fa9d514694c6cbd0a8a1b23b5', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Distraught', description: 'Screaming on my knees', imageMxc: 'mxc://t2bot.io/a4173bc5a9ea16528c8442e800513597', thumbnailMxc: 'mxc://t2bot.io/a4173bc5a9ea16528c8442e800513597', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Donut', description: 'Eating a donut', imageMxc: 'mxc://t2bot.io/e3ca7aaa7318c141fd8d2f0a7cd2c52e', thumbnailMxc: 'mxc://t2bot.io/e3ca7aaa7318c141fd8d2f0a7cd2c52e', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Drawing', description: 'Drawing on a sketchbook', imageMxc: 'mxc://t2bot.io/a6327bc46b23684398ccbfcbedd78c66', thumbnailMxc: 'mxc://t2bot.io/a6327bc46b23684398ccbfcbedd78c66', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Driving', description: 'Angrily driving', imageMxc: 'mxc://t2bot.io/3275e023a6683075a58eea3d991e4673', thumbnailMxc: 'mxc://t2bot.io/3275e023a6683075a58eea3d991e4673', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Excellent', description: 'Pleased with the results', imageMxc: 'mxc://t2bot.io/311ae79d33cdde34ca4241d40a0e6aaf', thumbnailMxc: 'mxc://t2bot.io/311ae79d33cdde34ca4241d40a0e6aaf', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Flower', description: 'Smells like bees', imageMxc: 'mxc://t2bot.io/b6ac9eb8e5377b54f61cd8de9b36edc7', thumbnailMxc: 'mxc://t2bot.io/b6ac9eb8e5377b54f61cd8de9b36edc7', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Gaming', description: 'Playing a game', imageMxc: 'mxc://t2bot.io/bfd7e0fe2ef7af961cb93ae28c0fda69', thumbnailMxc: 'mxc://t2bot.io/bfd7e0fe2ef7af961cb93ae28c0fda69', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Get Outta Here', description: 'Waving it off with a laugh', imageMxc: 'mxc://t2bot.io/a77772dde35fc7a67a782dfc0e8e9ed9', thumbnailMxc: 'mxc://t2bot.io/a77772dde35fc7a67a782dfc0e8e9ed9', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Heartbroken', description: 'My heart has broken', imageMxc: 'mxc://t2bot.io/d36a5f1255c5f34d5e2e5985d0c38a68', thumbnailMxc: 'mxc://t2bot.io/d36a5f1255c5f34d5e2e5985d0c38a68', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Hi', description: 'A friendly wave', imageMxc: 'mxc://t2bot.io/9b74aaaec56ebb8b4d483fc1840827be', thumbnailMxc: 'mxc://t2bot.io/9b74aaaec56ebb8b4d483fc1840827be', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Hide', description: 'Nervously tries to hide away and look discreet', imageMxc: 'mxc://t2bot.io/032d8648065f36a2155654b3d59ab8bf', thumbnailMxc: 'mxc://t2bot.io/032d8648065f36a2155654b3d59ab8bf', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'J', description: 'Mouth agape', imageMxc: 'mxc://t2bot.io/c27889f840a49eb42781ffa1fe692b0d', thumbnailMxc: 'mxc://t2bot.io/c27889f840a49eb42781ffa1fe692b0d', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Keyboard cat', description: 'A cat sits at a keybaord with a confused look', imageMxc: 'mxc://t2bot.io/7d79434b361aa00f9d7de99a4722cc9f', thumbnailMxc: 'mxc://t2bot.io/7d79434b361aa00f9d7de99a4722cc9f', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Lewd', description: 'Blushingly overwhelmed', imageMxc: 'mxc://t2bot.io/3076746d3bda4a0bd581bf1bcd3f04de', thumbnailMxc: 'mxc://t2bot.io/3076746d3bda4a0bd581bf1bcd3f04de', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Money', description: 'Flicking through a wad of cash grinningly', imageMxc: 'mxc://t2bot.io/9c714fb6fa2c12ed9c00a71e442e50fb', thumbnailMxc: 'mxc://t2bot.io/9c714fb6fa2c12ed9c00a71e442e50fb', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Ponder', description: 'Thinking very hard', imageMxc: 'mxc://t2bot.io/921a1ea7ef2c33c730e1b02c06a0818f', thumbnailMxc: 'mxc://t2bot.io/921a1ea7ef2c33c730e1b02c06a0818f', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Popcorn', description: 'Frantically eats popcorn', imageMxc: 'mxc://t2bot.io/5a0d63ca0546135cc361f9a48300a198', thumbnailMxc: 'mxc://t2bot.io/5a0d63ca0546135cc361f9a48300a198', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Relief', description: 'Clutching phone with nervous exhale of relief', imageMxc: 'mxc://t2bot.io/3880de09c46442e090cf1918abc2e511', thumbnailMxc: 'mxc://t2bot.io/3880de09c46442e090cf1918abc2e511', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Say Wha', description: 'Looks to the camera with a \'are you serious?\' look', imageMxc: 'mxc://t2bot.io/55d8e2b01d19f0405a59397caca3a648', thumbnailMxc: 'mxc://t2bot.io/55d8e2b01d19f0405a59397caca3a648', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Scared Cam', description: 'Clutching video camera with a terrified look', imageMxc: 'mxc://t2bot.io/f3b6726c375ca1888a05c47f33a43d18', thumbnailMxc: 'mxc://t2bot.io/f3b6726c375ca1888a05c47f33a43d18', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Scream', description: 'Head back screaming with arms in the air', imageMxc: 'mxc://t2bot.io/d0d65ccff76788eff4450f590917267e', thumbnailMxc: 'mxc://t2bot.io/d0d65ccff76788eff4450f590917267e', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Sick', description: 'Clutching bucket about to vomit', imageMxc: 'mxc://t2bot.io/6bcb81672ed49eaab462001cece30a3f', thumbnailMxc: 'mxc://t2bot.io/6bcb81672ed49eaab462001cece30a3f', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Smug', description: 'Grinning to the side with sparkles', imageMxc: 'mxc://t2bot.io/0313a9f2d54f0db0a282f05a2a1a2e69', thumbnailMxc: 'mxc://t2bot.io/0313a9f2d54f0db0a282f05a2a1a2e69', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Spider', description: 'Smiling spider with a hat', imageMxc: 'mxc://t2bot.io/0404bf77e66df2b5664d024f3c50a269', thumbnailMxc: 'mxc://t2bot.io/0404bf77e66df2b5664d024f3c50a269', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Spy', description: 'Looking from behind a wall suspiciously', imageMxc: 'mxc://t2bot.io/d6f4b554e2c8265416c1a877b2aba6ea', thumbnailMxc: 'mxc://t2bot.io/d6f4b554e2c8265416c1a877b2aba6ea', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Srs', description: 'Fed up and hunched over with a blank stare', imageMxc: 'mxc://t2bot.io/a55955aadcda3a7910976903e20dc76e', thumbnailMxc: 'mxc://t2bot.io/a55955aadcda3a7910976903e20dc76e', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Strong', description: 'Tough guy with shades and stubble', imageMxc: 'mxc://t2bot.io/efdd23e0d2822fd98946e0d764230d8b', thumbnailMxc: 'mxc://t2bot.io/efdd23e0d2822fd98946e0d764230d8b', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Sweat', description: 'A nervous panicky sweaty forced smile', imageMxc: 'mxc://t2bot.io/63387d6c81ed752632781bbdb52faef2', thumbnailMxc: 'mxc://t2bot.io/63387d6c81ed752632781bbdb52faef2', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'VR', description: 'Playing with virtual reality', imageMxc: 'mxc://t2bot.io/d076a025e0d67087f8be75f9c1fdde95', thumbnailMxc: 'mxc://t2bot.io/d076a025e0d67087f8be75f9c1fdde95', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Wait', description: 'Holding phone waiting for a response with a frown', imageMxc: 'mxc://t2bot.io/fcd6dbb649010faef17414f7c6c5611e', thumbnailMxc: 'mxc://t2bot.io/fcd6dbb649010faef17414f7c6c5611e', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'WTF', description: 'Screaming with disgust', imageMxc: 'mxc://t2bot.io/c860ad07370d5986f25ab5427e2d3146', thumbnailMxc: 'mxc://t2bot.io/c860ad07370d5986f25ab5427e2d3146', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Yeah', description: 'Pointing toward with enthusiasm', imageMxc: 'mxc://t2bot.io/4676643f47a448654e7ba55d0c61a9fd', thumbnailMxc: 'mxc://t2bot.io/4676643f47a448654e7ba55d0c61a9fd', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                    { packId: packId, name: 'Yell', description: 'Angrily yelling', imageMxc: 'mxc://t2bot.io/75b451684e4ae0d53427b5c5db2f2953', thumbnailMxc: 'mxc://t2bot.io/75b451684e4ae0d53427b5c5db2f2953', mimetype: 'image/png', thumbnailWidth: 512, thumbnailHeight: 512 },
                ]);
            });
    },
    down: (_queryInterface: QueryInterface) => {
        throw new Error("there is no going back");
    }
}