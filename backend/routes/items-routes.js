const express = require('express');
const { check } = require('express-validator');

const itemsControllers = require('../controllers/items-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/:pid', itemsControllers.getItemById);

router.get('/user/:uid', itemsControllers.getItemsByUserId);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('price')
      .not()
      .isEmpty()
  ],
  itemsControllers.createItem
);

router.patch(
  '/:pid',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  itemsControllers.updateItem
);

router.delete('/:pid', itemsControllers.deleteItem);

module.exports = router;
