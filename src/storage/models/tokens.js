module.exports = function (sequelize, DataTypes) {
    return sequelize.define('tokens', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'id'
        },
        matrixUserId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'matrixUserId'
        },
        matrixServerName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'matrixServerName'
        },
        matrixAccessToken: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'matrixAccessToken'
        },
        scalarToken: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'scalarToken'
        },
        upstreamToken: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'upstreamToken'
        },
        expires: {
            type: DataTypes.TIME,
            allowNull: false,
            field: 'expires'
        }
    }, {
        tableName: 'tokens',
        underscored: false,
        timestamps: false
    });
};
