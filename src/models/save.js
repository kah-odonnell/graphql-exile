const save = (sequelize, DataTypes) => {
    const Save = sequelize.define('save', {
      jsonData: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
    });
  
    Save.associate = models => {
      Save.belongsTo(models.User);
    };
  
    return Save;
  };
  
  export default save;
  