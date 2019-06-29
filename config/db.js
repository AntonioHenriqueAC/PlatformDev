const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURL');

const connectDB = async () => {
   try {
      await mongoose.connect(db, {
         useNewUrlParser: true,
         useCreateIndex: true,
         useFindAndModify: false
      });

      console.log('MongoDB connected...!!!  =))')
   } catch (err) {
      console.error(err.message);

      // exit process with failure
      process.exit(1);

      console.log('MongoDB NOT connected...! =((')

   }
}

module.exports = connectDB;