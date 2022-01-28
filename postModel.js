let mongoose = require('mongoose');
  
var postSchema = new mongoose.Schema({
    details: String,
  
    },{
        timestamps:true
    }
);

module.exports = new mongoose.model('Post', postSchema);