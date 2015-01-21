var emptyHouse = {name: "", plants: []};
var editObject;
var reactiveHouseObject = new ReactiveVar(emptyHouse);

var storeReactiveHouseObject = function (obj) {
  obj.edited = true;
  reactiveHouseObject.set(obj);
};

Template.selectHouse.helpers({
	houseNameId: function () { // This should be pluralized as it returns ALL the name & ids for a house
		return Houses.find({}, {fields: {name: 1, _id: 1} });
	},
	isSelected: function () {
		// returns "selected" to modify the HTML if the given item (in data context) matches the session's selected house
		return Session.equals('selectedHouse', this._id) ? 'selected' : '';
	}
});

Template.selectHouse.events({
	'change #selectHouse': function (evt) {
		Session.set("selectedHouse", evt.currentTarget.value);
		reactiveHouseObject.set(Houses.findOne({_id: Session.get('selectedHouse')}) || emptyHouse);

	}
});

Template.showHouse.events({
		'click button#delete': function (evt) {
		var id = $(evt.currentTarget).attr('data-id');
		var deleteConfirmation = confirm("Really delete this house?");
		if (deleteConfirmation) {
			Houses.remove(id);
      reactiveHouseObject.set(emptyHouse);
		}
	}
});

Template.plantFieldset.events({
  'click button.removePlant': function (evt) {
    evt.preventDefault();
    var thisPlantIndex = $(evt.currentTarget).parent().attr("id").split('-')[1];
    editObject = reactiveHouseObject.get();
    editObject.plants.splice(thisPlantIndex, 1);
    storeReactiveHouseObject(editObject);
  },
  'keyup input.color, keyup input.instructions': function (evt) {
    var thisPlantIndex = $(evt.currentTarget).attr("data-index");
    console.log("Index: ", thisPlantIndex);
    var fieldName = $(evt.currentTarget).attr("class");
    editObject = reactiveHouseObject.get();
    editObject.plants[thisPlantIndex][fieldName] = $(evt.currentTarget).val();
    storeReactiveHouseObject(editObject);

    if (fieldName == 'color') {
      var currentColor = editObject.plants[thisPlantIndex]['color'];
      var plantsArray = reactiveHouseObject.get().plants;
      var colorCount = 0;
      for (i in plantsArray) {
        if (plantsArray[i]['color'] === currentColor) {
          colorCount++;
        }
      }
      if (colorCount !== 1) {
        $(evt.currentTarget).css("background-color", "red");
        $("button#saveHouse").attr("disabled", "disabled");
      } else {
        $(evt.currentTarget).css("background-color", "");
        $("button#saveHouse").removeAttr("disabled", "disabled");
      }
    }
  }
});

Template.plantDetails.events({
	'click button.water': function (evt) {
		var plantId = $(evt.currentTarget).attr('data-id');
		Session.set(plantId, true);

		var lastVisit = new Date();
		Houses.update({_id: Session.get("selectedHouse")}, {$set: {lastVisit: lastVisit }});
    editObject = reactiveHouseObject.get();
    editObject.lastVisit = lastVisit;
    reactiveHouseObject.set(editObject);
	}
});

Template.plantDetails.helpers({
	isWatered: function () {
		var plantId = Session.get("selectedHouse") + '-' + this.color;
		return Session.get(plantId) ? 'disabled' : '';
	}
});

Template.houseForm.events({
	'click button#saveHouse': function (evt) {
		evt.preventDefault();
    editObject = reactiveHouseObject.get();
    delete editObject.edited;
    editObject._id = Houses.upsert({_id: reactiveHouseObject.get()._id}, 
      reactiveHouseObject.get()).insertedId || reactiveHouseObject.get()._id;    
		
    Session.set("selectedHouse", editObject._id);
    reactiveHouseObject.set(editObject);
	},

  'click button.addPlant': function (evt) {
    evt.preventDefault();
    editObject = reactiveHouseObject.get();
    editObject.plants.push({color: '', instructions: ''});
    storeReactiveHouseObject(editObject);
  },

  'keyup input.name': function (evt) {
    editObject = reactiveHouseObject.get();
    editObject.name = $(evt.currentTarget).val();
    storeReactiveHouseObject(editObject);
  }
});

Template.registerHelper('selectedHouse', function() {
	return reactiveHouseObject.get();
});

// adds the index position in the array as a property to the underlying object
Template.registerHelper('withIndex', function (list) {
	var withIndex = _.map(list, function (v, i) {
		v.index = i;
		return v;
	});

	return withIndex;
});

Tracker.autorun(function logConsole() {
	console.log("The selectedHouse ID is: " + Session.get("selectedHouse"));
});