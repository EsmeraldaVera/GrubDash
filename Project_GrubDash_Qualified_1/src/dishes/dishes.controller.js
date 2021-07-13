const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

const list = (req, res, next) => {
  res.json({ data: dishes });
};

const create = (req, res, next) => {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const data = req.body.data || {};
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };

  dishes.push(newDish);

  res.status(201).json({ data: newDish });
};

const read = (req, res, next) => {
  res.json({ data: res.locals.dish });
};

const update = (req, res, next) => {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const updateDish = {
    ...res.locals.dish,
    name,
    description,
    price,
    image_url,
  };
  res.json({ data: updateDish });
};

function findDish(req, res, next) {
  const { dishId } = req.params;
  const matchedDish = dishes.find((dish) => dish.id === dishId);
  if (matchedDish) {
    res.locals.dish = matchedDish;
    return next();
  }
  next({ status: 404, message: ` No matching dish found` });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const matchedDish = dishes.find((dish) => dish.id === dishId);
  if (matchedDish) {
    res.locals.dish = matchedDish;
    return next();
  }
  next({ status: 404, message: ` Dish does not exist: ${dishId}` });
}

function matchId(req, res, next) {
  const dishId = req.params.dishId;
  const {
    data: { id },
  } = req.body;
  if (id) {
    if (dishId !== id) {
      next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
    }
  }
  next();
}

function priceCheck(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (typeof price !== "number" || price < 1) {
    return res.status(400).json({ error: "price must be a number" });
  }
  if (price < 0) {
    return res
      .status(400)
      .json({ error: "price must be a number greater than zero" });
  }
  next();
}

function hasRequiredFields(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const requiredFields = ["name", "description", "price", "image_url"];
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      next({ status: 400, message: `A '${field}' property is required.` });
    }
  }
  next();
}

module.exports = {
  list,
  create: [hasRequiredFields, priceCheck, create],
  read: [findDish, read],
  update: [dishExists, matchId, priceCheck, hasRequiredFields, update],
};
