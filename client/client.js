Template.selectHouse.helpers({
	houseNameId: function houseNameId() {
		return Houses.find({}, {fields: {name: 1, _id: 1} });
	},
	isSelected: function isSelected() {
		return Session.equals('selectedHouse', this._id) ? 'selected' : '';
	}
});

Template.selectHouse.events({
	'change #selectHouse': function selectedHouseChange(evt) {
		Session.set("selectedHouse", evt.currentTarget.value);
	}
});

Template.showHouse.helpers({
	house: function house() {
		return Houses.findOne({_id: Session.get("selectedHouse")});
	}
});

Template.showHouse.events({
		'click button#delete': function deleteButtonClick(evt) {
		var house = this;
		var deleteConfirmation = confirm("Really delete this house?");
		if (deleteConfirmation) {
			Houses.remove(house._id);
		}
	}
});

Template.plantDetails.events({
	'click button.water': function waterButtonClicked(evt) {
		var plantId = $(evt.currentTarget).attr('data-id');
		Session.set(plantId, true);

		var lastVisit = new Date();
		Houses.update({_id: Session.get("selectedHouse")}, {$set: {lastVisit: lastVisit }});
	}
});

Template.plantDetails.helpers({
	isWatered: function isWatered() {
		var plantId = Session.get("selectedHouse") + '-' + this.color;
		return Session.get(plantId) ? 'disabled' : '';
	}
});

Template.houseForm.events({
	'click button#saveHouse': function saveHouseClick(evt) {
		evt.preventDefault();
		var houseName = $("input[id=house-name]").val();
		var plantColor = $("input[id=plant-color]").val();
		var plantInstructions = $("input[id=instructions]").val();

		Session.set("selectedHouse", Houses.insert({
				name: houseName, 
				plants: [{color: plantColor, instructions: plantInstructions}]
			}
		));
	}
});

Tracker.autorun(function logConsole() {
	console.log("The selectedHouse ID is: " + Session.get("selectedHouse"));
});