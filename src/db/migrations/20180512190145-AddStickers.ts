import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_sticker_packs", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "type": {type: DataType.STRING, allowNull: false},
                "name": {type: DataType.STRING, allowNull: false},
                "avatarUrl": {type: DataType.STRING, allowNull: false},
                "description": {type: DataType.STRING, allowNull: false},
                "isEnabled": {type: DataType.BOOLEAN, allowNull: false},
                "isPublic": {type: DataType.BOOLEAN, allowNull: false},
                "authorType": {type: DataType.STRING, allowNull: false},
                "authorReference": {type: DataType.STRING, allowNull: true},
                "authorName": {type: DataType.STRING, allowNull: true},
                "license": {type: DataType.STRING, allowNull: false},
                "licensePath": {type: DataType.STRING, allowNull: true},
            }))
            .then(() => queryInterface.createTable("dimension_stickers", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "packId": {
                    type: DataType.INTEGER, allowNull: false,
                    references: {model: "dimension_sticker_packs", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "name": {type: DataType.STRING, allowNull: false},
                "description": {type: DataType.STRING, allowNull: false},
                "imageMxc": {type: DataType.STRING, allowNull: false},
                "thumbnailMxc": {type: DataType.STRING, allowNull: false},
                "thumbnailWidth": {type: DataType.INTEGER, allowNull: false},
                "thumbnailHeight": {type: DataType.INTEGER, allowNull: false},
                "mimetype": {type: DataType.STRING, allowNull: false},
            }))
            .then(() => queryInterface.bulkInsert("dimension_sticker_packs", [
                {
                    // id: 1
                    type: "stickerpack",
                    name: "Huskies",
                    avatarUrl: "mxc://t2bot.io/193408b58f5e1eb72d9bea13f23914e6",
                    isEnabled: true,
                    isPublic: true,
                    description: "The most photogenic animal on the planet.",
                    authorType: "none",
                    authorReference: null,
                    authorName: null,
                    license: "GPL-v3.0",
                    licensePath: "/licenses/gpl-v3.0.txt",
                },
                {
                    // id: 2
                    type: "stickerpack",
                    name: "Cats",
                    avatarUrl: "mxc://t2bot.io/8c88a05eb8e5a555830c8fffa36043f5",
                    isEnabled: true,
                    isPublic: true,
                    description: "Cute cats",
                    authorType: "twitter",
                    authorReference: "https://twitter.com/mxyamada",
                    authorName: "Fabi Yamada",
                    license: "CC BY-NC 4.0",
                    licensePath: "/licenses/cc_by-nc_4.0.txt",
                },
                {
                    // id: 3
                    type: "stickerpack",
                    name: "Cat Faces",
                    avatarUrl: "mxc://t2bot.io/01e06e2489185ac5b1fc73c904e1d5f0",
                    isEnabled: true,
                    isPublic: true,
                    description: "Cute cat faces",
                    authorType: "twitter",
                    authorReference: "https://twitter.com/mxyamada",
                    authorName: "Fabi Yamada",
                    license: "CC BY-NC 4.0",
                    licensePath: "/licenses/cc_by-nc_4.0.txt",
                },
            ]))
            .then(() => queryInterface.bulkInsert("dimension_stickers", [
                {
                    packId: 1,
                    name: "Happy",
                    description: "A very happy husky",
                    imageMxc: "mxc://t2bot.io/b4636e93388542f3cad8fcbb825adf36",
                    thumbnailMxc: "mxc://t2bot.io/920b7a90c8d66f0de0bc2e4e7f1b3d90",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 1,
                    name: "Laughing",
                    description: "A husky laughs at something presumably funny",
                    imageMxc: "mxc://t2bot.io/12e39b87ce8099ff5951b9c37405bac5",
                    thumbnailMxc: "mxc://t2bot.io/cf2a8f9179bdb59ec3dfdc15a71eb12d",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 1,
                    name: "Sad",
                    description: "This husky is sad :(",
                    imageMxc: "mxc://t2bot.io/96777697c144918fe80fca92c90e3208",
                    thumbnailMxc: "mxc://t2bot.io/afbaad67303a70da9e5af39c6d55ab7e",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 1,
                    name: "Heart Eyes",
                    description: "This husky loves what he sees",
                    imageMxc: "mxc://t2bot.io/193408b58f5e1eb72d9bea13f23914e6",
                    thumbnailMxc: "mxc://t2bot.io/27038b035508f695eb0bfa99cc567cd9",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 1,
                    name: "Sleeping",
                    description: "Zzz",
                    imageMxc: "mxc://t2bot.io/e3b518c8aa9f91efd7aaa2195a4662b0",
                    thumbnailMxc: "mxc://t2bot.io/c7c89ac2f8edba4ca9fbe50a547c3d0c",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 1,
                    name: "Dancing",
                    description: "Either this husky is starting a dance party, or one is underway",
                    imageMxc: "mxc://t2bot.io/f96cc6fcc48ec85dd9a160be18fa30c0",
                    thumbnailMxc: "mxc://t2bot.io/a548fe46c6a979bd7de5fe1fee7b35b0",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },

                {
                    packId: 2,
                    name: "Winking",
                    description: "A winking cat",
                    imageMxc: "mxc://t2bot.io/ccecfeed9e27d1180865ae27a08e2b7a",
                    thumbnailMxc: "mxc://t2bot.io/ccecfeed9e27d1180865ae27a08e2b7a",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Heart Eyes",
                    description: "This cat loves what it sees",
                    imageMxc: "mxc://t2bot.io/0fc5a6aab879b64243f6018167b54216",
                    thumbnailMxc: "mxc://t2bot.io/0fc5a6aab879b64243f6018167b54216",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Brown and Pink",
                    description: "A cute brown and pink cat",
                    imageMxc: "mxc://t2bot.io/ebcf532e183df1e8c7d983af2bbcfffc",
                    thumbnailMxc: "mxc://t2bot.io/ebcf532e183df1e8c7d983af2bbcfffc",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Blushing",
                    description: "Something embarrassing must have happened",
                    imageMxc: "mxc://t2bot.io/017516e6a96b5bb7b9b8bb9302c51548",
                    thumbnailMxc: "mxc://t2bot.io/017516e6a96b5bb7b9b8bb9302c51548",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Angry",
                    description: "This cat is not happy",
                    imageMxc: "mxc://t2bot.io/33761e2e7c39bc347c128b02715d28fd",
                    thumbnailMxc: "mxc://t2bot.io/33761e2e7c39bc347c128b02715d28fd",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Disappointed",
                    description: "This cat is disappointed",
                    imageMxc: "mxc://t2bot.io/fae848ca3651131cc5b15bda728fb048",
                    thumbnailMxc: "mxc://t2bot.io/fae848ca3651131cc5b15bda728fb048",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Very Happy",
                    description: "A happy cat is a good cat!",
                    imageMxc: "mxc://t2bot.io/fc06e95e9d2e3c62d5c577fbc6186f25",
                    thumbnailMxc: "mxc://t2bot.io/fc06e95e9d2e3c62d5c577fbc6186f25",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Sad",
                    description: "A sad cat :(",
                    imageMxc: "mxc://t2bot.io/8be3ef58dc89fc269d37e5c978b37c2d",
                    thumbnailMxc: "mxc://t2bot.io/8be3ef58dc89fc269d37e5c978b37c2d",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Happy",
                    description: "A happy cat",
                    imageMxc: "mxc://t2bot.io/2d7be360df8fa679e8a24b89b9b32aad",
                    thumbnailMxc: "mxc://t2bot.io/2d7be360df8fa679e8a24b89b9b32aad",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Nope",
                    description: "The cat has turned away, presumably to express disapproval",
                    imageMxc: "mxc://t2bot.io/fb9cef3190b643c53c61538701763d36",
                    thumbnailMxc: "mxc://t2bot.io/fb9cef3190b643c53c61538701763d36",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Shocked",
                    description: "WHAT HAPPENED!?",
                    imageMxc: "mxc://t2bot.io/45f0bcabd0edcf43801623a8f5675628",
                    thumbnailMxc: "mxc://t2bot.io/45f0bcabd0edcf43801623a8f5675628",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Blue Eyed Wink",
                    description: "A cute blue-eyed cat is winking",
                    imageMxc: "mxc://t2bot.io/1e2c36ce0d191c47e74f60b45c377f3d",
                    thumbnailMxc: "mxc://t2bot.io/1e2c36ce0d191c47e74f60b45c377f3d",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Sad",
                    description: "A sad cat :(",
                    imageMxc: "mxc://t2bot.io/f2d2c5490097d6542e96d295e415cb6f",
                    thumbnailMxc: "mxc://t2bot.io/f2d2c5490097d6542e96d295e415cb6f",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Disappointed",
                    description: "This cat is disappointed",
                    imageMxc: "mxc://t2bot.io/00f8d2832087a4cbcd98f090864f3357",
                    thumbnailMxc: "mxc://t2bot.io/00f8d2832087a4cbcd98f090864f3357",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 2,
                    name: "Happy",
                    description: "A happy cat",
                    imageMxc: "mxc://t2bot.io/8c88a05eb8e5a555830c8fffa36043f5",
                    thumbnailMxc: "mxc://t2bot.io/8c88a05eb8e5a555830c8fffa36043f5",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },

                {
                    packId: 3,
                    name: "Winking",
                    description: "A winking cat",
                    imageMxc: "mxc://t2bot.io/7a947ba45c90a96e35edfd8873acb9e6",
                    thumbnailMxc: "mxc://t2bot.io/7a947ba45c90a96e35edfd8873acb9e6",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Heart Eyes",
                    description: "This cat loves what it sees",
                    imageMxc: "mxc://t2bot.io/a60555fd09e42be02119a4a75db993e7",
                    thumbnailMxc: "mxc://t2bot.io/a60555fd09e42be02119a4a75db993e7",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Brown and Pink",
                    description: "A cute brown and pink cat",
                    imageMxc: "mxc://t2bot.io/936279aba6da2672a92005df5218a4be",
                    thumbnailMxc: "mxc://t2bot.io/936279aba6da2672a92005df5218a4be",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Blushing",
                    description: "Something embarrassing must have happened",
                    imageMxc: "mxc://t2bot.io/63cac43a98ed00e294fdf741688cb495",
                    thumbnailMxc: "mxc://t2bot.io/63cac43a98ed00e294fdf741688cb495",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Angry",
                    description: "This cat is not happy",
                    imageMxc: "mxc://t2bot.io/25b956c807a97cf9530abd29b886159b",
                    thumbnailMxc: "mxc://t2bot.io/25b956c807a97cf9530abd29b886159b",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Disappointed",
                    description: "This cat is disappointed",
                    imageMxc: "mxc://t2bot.io/079440f60dd90b363773cd544422c19f",
                    thumbnailMxc: "mxc://t2bot.io/079440f60dd90b363773cd544422c19f",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Very Happy",
                    description: "A happy cat is a good cat!",
                    imageMxc: "mxc://t2bot.io/cb803dbff4fb2cbf7b1306a4a1baf81d",
                    thumbnailMxc: "mxc://t2bot.io/cb803dbff4fb2cbf7b1306a4a1baf81d",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Sad",
                    description: "A sad cat :(",
                    imageMxc: "mxc://t2bot.io/de5e985f346eecd4eb43eb942303759a",
                    thumbnailMxc: "mxc://t2bot.io/de5e985f346eecd4eb43eb942303759a",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Happy",
                    description: "A happy cat",
                    imageMxc: "mxc://t2bot.io/01e06e2489185ac5b1fc73c904e1d5f0",
                    thumbnailMxc: "mxc://t2bot.io/01e06e2489185ac5b1fc73c904e1d5f0",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Nope",
                    description: "The cat has turned away, presumably to express disapproval",
                    imageMxc: "mxc://t2bot.io/022d86b55f623505667e5fb5fcc49cff",
                    thumbnailMxc: "mxc://t2bot.io/022d86b55f623505667e5fb5fcc49cff",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Shocked",
                    description: "WHAT HAPPENED!?",
                    imageMxc: "mxc://t2bot.io/1413113b209a869ec42a52fbc0a8fa49",
                    thumbnailMxc: "mxc://t2bot.io/1413113b209a869ec42a52fbc0a8fa49",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Blue Eyed Wink",
                    description: "A cute blue-eyed cat is winking",
                    imageMxc: "mxc://t2bot.io/9beee7587cb9db56e6fabf01b0a8d168",
                    thumbnailMxc: "mxc://t2bot.io/9beee7587cb9db56e6fabf01b0a8d168",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Sad",
                    description: "A sad cat :(",
                    imageMxc: "mxc://t2bot.io/3bbf2d94865298661af30816ce4a7a75",
                    thumbnailMxc: "mxc://t2bot.io/3bbf2d94865298661af30816ce4a7a75",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Disappointed",
                    description: "This cat is disappointed",
                    imageMxc: "mxc://t2bot.io/45a1b772d51ddbc374768940b4a80f3c",
                    thumbnailMxc: "mxc://t2bot.io/45a1b772d51ddbc374768940b4a80f3c",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
                {
                    packId: 3,
                    name: "Happy",
                    description: "A happy cat",
                    imageMxc: "mxc://t2bot.io/106b63dbb114ca121d09765971a8b093",
                    thumbnailMxc: "mxc://t2bot.io/106b63dbb114ca121d09765971a8b093",
                    mimetype: "image/png",
                    thumbnailWidth: 512,
                    thumbnailHeight: 512
                },
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_stickers"))
            .then(() => queryInterface.dropTable("dimension_sticker_packs"));
    }
}