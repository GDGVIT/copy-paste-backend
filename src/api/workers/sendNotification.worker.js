const { join } = require('path')
const admin = require('firebase-admin');
const serviceAccount = require(join(__dirname, '..', '..', 'config', 'firebasekey.json'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://copy-paste-15ef0-default-rtdb.firebaseio.com'
});
const sendNotification = async (device, title, body, image) => {
    try {
        // ! to test
        
        let payload = {
            notification: {
                title: title,
                body: body
            }
        };
        if (image) {
            payload.notification.image = image
        }
        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };
        const response = await admin.messaging().sendToDevice(device, payload, options);
        console.log("Successfully sent message:", response);
        return response;
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = sendNotification;