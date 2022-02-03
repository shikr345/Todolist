//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Shiv:Test123@cluster0.jwgbi.mongodb.net/todolistDB");

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({ name: "Welcome to your todolist!" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "Hit checkboxes to delete an item." });

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function (err, item) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({ name: itemName });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, found) {
      found.items.push(item);
      found.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const deletedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.deleteOne({ _id: deletedItemId }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted successfully");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deletedItemId}}}, function(err, doc) {
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, found) {
    if (err) {
      console.log(err);
    } else {
      if (!found) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: customListName,
          newListItems: found.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

const post = process.env.PORT;
if(port == null || port =="") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started successfully!");
});
