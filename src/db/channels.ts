import mongoose from "mongoose";

const channelLogSchema = new mongoose.Schema({
    serverName: {
        type: String,
        required: true
    },
    channelName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique : true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const channelLog = mongoose.model("ChannelLog", channelLogSchema);

export default channelLog;
