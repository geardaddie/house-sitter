Template.selectHouse.helpers({
	houseNameId: function houseNameId() {
		return Houses.find({}, {});
	},
	isSelected: function isSelected() {
		return Session.equals('selectedHouse', this._id) ? 'selected' : '';
	}
});

Template.selectHouse.events = {
	'change #selectedHouse': function selectedHouseChange(evt) {
		Session.set("selectedHouse", evt.currentTarget.value);
	}
};