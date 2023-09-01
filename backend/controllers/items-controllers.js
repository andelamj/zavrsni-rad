const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Item = require('../models/item');
const User = require('../models/user');

const getItemById = async (req, res, next) => {
  const itemId = req.params.pid;

  let item;
  try {
    item = await Item.findById(itemId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a item.',
      500
    );
    return next(error);
  }

  if (!item) {
    const error = new HttpError(
      'Could not find item for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ item: item.toObject({ getters: true }) });
};

const getItemsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let items;
  let userWithItems;
  try {
    userWithItems = await User.findById(userId).populate('items');
  } catch (err) {
    const error = new HttpError(
      'Fetching items failed, please try again later.' + err,
      500
    );
    return next(error);
  }

  // if (!items || items.length === 0) {
  if (!userWithItems || userWithItems.items.length === 0) {
    return next(
      new HttpError('Could not find items.', 404)
    );
  }

  res.json({
    items: userWithItems.items.map(item =>
      item.toObject({ getters: true })
    )
  });
};

const createItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, price, creator } = req.body;

  const createdItem = new Item({
    title,
    description,
    price,
    image: req.file.path,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      'Creating item failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdItem.save({ session: sess });
    user.items.push(createdItem);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating item failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ item: createdItem });
};

const updateItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, price } = req.body;
  const itemId = req.params.pid;

  let item;
  try {
    item = await Item.findById(itemId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update item.',
      500
    );
    return next(error);
  }

  item.title = title;
  item.description = description;
  item.price = price;

  try {
    await item.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update item.' +err,
      500
    );
    return next(error);
  }

  res.status(200).json({ item: item.toObject({ getters: true }) });
};

const deleteItem = async (req, res, next) => {
  const itemId = req.params.pid;

  let item;
  try {
    item = await Item.findById(itemId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete item.',
      500
    );
    return next(error);
  }

  if (!item) {
    const error = new HttpError('Could not find item for this id.', 404);
    return next(error);
  }

  const imagePath = item.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await item.deleteOne({ session: sess });
    item.creator.items.pull(item);
    await item.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete item.',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted item.' });
};

exports.getItemById = getItemById;
exports.getItemsByUserId = getItemsByUserId;
exports.createItem = createItem;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;
