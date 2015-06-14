Meals = new Mongo.Collection('meals');

if (Meteor.isClient) {
    Meteor.subscribe('meals');

    Template.body.helpers({
        meals: function () {
            var meals = Meals.find({});
            return meals;
        }
    });

    Template.body.events({
        'submit #new-meal': function(e) {
            e.preventDefault();

            var name = e.target.mealName.value;
            var ingredient = e.target.mealIngredient.value;

            Meteor.call('addMeal', name, ingredient);

            e.target.mealName.value = '';
            e.target.mealIngredient.value = '';

            document.querySelector('#mealName').focus();
        },

        'click .delete-meal': function(e) {
            e.preventDefault();

            Meteor.call('deleteMeal', this._id);
        },

        'click .reorder-meals': function(e) {
            e.preventDefault();

            var meals = [];

            $('.meal').each(function() {
                meals.push(
                    this
                )
            });

            for (var i = meals.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = meals[i];
                meals[i] = meals[j];
                meals[j] = temp;
            }

            meals.forEach(function(v) {
                $('.meals').prepend(v);
            })
        }
    });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        if (Meteor.isServer) {
            Meteor.publish('meals', function() {
                return Meals.find({
                    $or: [
                        {owner: this.userId}
                    ]
                });
            })
        }
    });
}

Meteor.methods({
    addMeal: function(name, ingredient) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Meals.insert({
            name: name,
            ingredient: ingredient,
            owner: Meteor.userId(),
            username: Meteor.user().username,
            createdAt: new Date()
        });
    },

    deleteMeal: function(mealId) {
        var meal = Meals.findOne(mealId);
        if (meal.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Meals.remove(mealId);
    }
});