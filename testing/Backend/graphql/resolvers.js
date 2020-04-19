const bcrypt = require('bcryptjs');

const User = require('../models/user');

module.exports = {
    hello: function() {
        return "Hello from GraphQL";
    },
    createUser: async function({ userInput }, req) {
        const existingUser = await User.findOne({ email: userInput.email });
        if(existingUser) {
            const error = new Error('A user with this email already exists, please try another email');
            throw error;
        }

        const hashedPassword = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            name: userInput.name,
            email: userInput.email,
            password: hashedPassword
        });

        const createdUser = await user.save();
        
        return { ...createdUser._doc, _id: createdUser._doc._id.toString() };
    }
};
