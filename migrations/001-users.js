module.exports = {
  async up(db, client) {
    if (db.collection('users')) {
      console.log(db.collection('users'))

    }
  
   return db.collection('users').insertMany([
      {
        email: 'amira.reda@pharaohsoft.com',
        password: '$2a$10$X5zdctP746BLpBCcNFmyAO.O5uiCZtM.GaytSpARMmW7oXsHpvFuG',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        active: true,
        phoneNumber: '+201000000',
        profilePicture : 'https://cauris.s3.eu-west-3.amazonaws.com//assets/9ba256e4-27a2-438d-b4d7-ed006e6821db.jpeg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    await db.collection('users').deleteOne({email: 'amiraatalla63@gmail.com'} );
  }
};
