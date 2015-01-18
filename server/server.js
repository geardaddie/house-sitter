Meteor.startup(function startup(){
	if (Houses.find().count() === 0) {
		var houses = [
		{
			name: 'Stephan',
			plants: [
				{color: "red", instructions: "3 pots/week"},
				{color: "white", instructions: "keep humid"}
				]
		}];

		while (houses.length > 0) {
			Houses.insert(houses.pop());
		}

		console.log("Added Test Data Fixtures");
	}
});