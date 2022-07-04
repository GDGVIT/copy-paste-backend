require('dotenv').config()
const { join } = require('path')
const multer = require('multer')
const Data = require(join(__dirname, '..', 'models', 'Data.model'))
const sendNotification = require(join(__dirname, '..', 'workers', 'sendNotification.worker'))
const s3Upload = require(join(__dirname, '..', 'workers', 's3Upload.worker'))

/* 
    @route   POST api/v1/data/upload
    @desc    Upload a file
    @access  Public
*/

exports.uploadImage = async (req, res) => { 
    multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    }).single('image')(req, res, async (err) => {
        'use strict'
        try {
            if (err) return res.status(400).json({ error: err.message })
        const { email } = req.user
        const { deviceToken } = req.body 
        const { originalname, buffer } = req.file
        // upload image to s3
        const data = await s3Upload(email, buffer, originalname)
        if (!data) return res.status(400).json({ error: 'Error uploading image' })
        const message = {
            title: `${originalname} uploaded`,
            location: data.Location
        }
        console.log(data)
        // send notification to device token
        // const success = await sendNotification(deviceToken, message)
        // if (!success) return res.status(400).json({ error: 'Error sending notification' })
        return res.status(200).json({ message: 'Notification Send Successfully', message })
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ error: 'Some Error Occurred'})
        }
    })
}

/*
*/


exports.sendMessage = async (req, res) => { 
    try {
        const { deviceToken, message } = req.body
        const success = await sendNotification(deviceToken, message)
        if (!success) return res.status(400).json({ error: 'Error sending notification' })
        return res.status(200).json({ message: 'Notification Send Successfully' })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Some Error Occurred'})
    }
}





// exports.someCode = async (req, res) => {
//     multer({
//         storage: multer.memoryStorage(),
//         limits: {
//             fileSize: 5 * 1024 * 1024
//         }
//     }).single('image')(req, res, async (err) => {
//         'use strict'
//         if (err) {
//             return res.status(400).json({ message: 'File too large' })
//         }
//         const { email } = req.user 
//         const { originalname, buffer } = req.file
//         const fileType = originalname.split('.').pop()
//         const fileName = `${Date.now()}.${fileType}`
//         const s3 = new AWS.S3({
//             accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//             secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//         })
//         const params = {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: fileName,
//             Body: buffer
//         }
//         const data = await s3.upload(params).promise()
//         return res.status(200).json({ message: 'File uploaded', location: data.Location })        
//     }
// }