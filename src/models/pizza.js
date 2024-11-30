"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const { mongoose } = require('../configs/dbConnection')
/* ------------------------------------------------------- */

const PizzaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            set: (name) => name.toUpperCase()
      },

        // image: {
        //     type: String,
        //     trim: true,
        // },
        image: String,

        price: {
            type: Number,
            required: true,
        },

        toppingIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Topping",
            },
        ],
    },
    {
        collection: "pizzas",
        timestamps: true,
    },
);

// Model:
module.exports = mongoose.model("Pizza", PizzaSchema);