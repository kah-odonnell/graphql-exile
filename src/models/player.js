const player = (sequelize, DataTypes) => {
  const Player = sequelize.define('player', {
    jsonData: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
  });

  Player.associate = models => {
    Player.belongsTo(models.User);
  };
  
  return Player;
};

export default player;
