import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_widgets", [
                {
                    type: "tradingview",
                    name: "TradingView",
                    avatarUrl: "/img/avatars/tradingview.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Monitor your favourite cryptocurrencies",
                }
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_widgets", {
                type: "tradingview",
            }));
    }
}