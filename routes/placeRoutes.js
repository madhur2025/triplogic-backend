const express = require('express')
const router = express.Router()

const {getAllPlaces, createPlace, getPlace, updatePlace, deletePlace, filteredPlaces } = require('../controllers/placeControllers')

router.get('/',getAllPlaces)
router.post('/create', createPlace)
router.get('/get/:id', getPlace)
router.put('/update/:id', updatePlace)
router.delete('/del/:id', deletePlace)
router.get('/filter', filteredPlaces)

module.exports = router