const mongoose = require("mongoose");

const dashboardSchema = mongoose.Schema({
    isInMaintenance: Boolean,
    status: {
       message: String,
       activity: Number,
       status: String 
    },
    disabled: {
        commands: Array,
    }
});

module.exports = mongoose.model("Administrator", dashboardSchema);