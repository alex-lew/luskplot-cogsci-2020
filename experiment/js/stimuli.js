

var costs = {
  low: [3, 5, 8, 10, 13, 18, 20],
  medium: [40, 50, 60, 70, 80, 90, 100],
  high: [250, 300, 400, 500, 600, 750, 1000]
}

var weights = {
  low: [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
  medium: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  high: [40, 45, 50, 55, 60, 65, 70, 85, 90]
}

var uniformDraw = function(lst){
  return lst[Math.floor(Math.random()*lst.length)];
}


var locations = ["kitchen", "bathroom", "study", "bedroom", "living room", "basement"]
var cost_properties = [
  {verb: "costs", general_amount: "low"}, // 5, 10, 20
  {verb: "costs", general_amount: "medium"}, // 30, 50, 100
  {verb: "costs", general_amount: "high"} // 250, 500, 1000
]

var weight_properties = [
  {verb: "weighs",  general_amount: "low"},
  {verb: "weighs", general_amount: "medium"},
  {verb: "weighs", general_amount: "high"},
  false
]

var simple_stimuli = []

for (loc=0;loc<locations.length; loc++) {
  for (c=0; c<cost_properties.length; c++) {
    for (w=0;w<weight_properties.length; w++) {
      // console.log(w)
      cost_amount = uniformDraw(costs[cost_properties[c].general_amount])
      // console.log(cost_amount)
      props = [ {verb: cost_properties[c].verb,
        general_amount: cost_properties[c].general_amount,
        amount: "$"+cost_amount} ]

      // console.log(props[0].amount)
      weight_amount = weight_properties[w] ? uniformDraw(weights[weight_properties[w].general_amount]) : null
      // console.log(weight_amount)
      weight_properties[w] ? props.push({verb: weight_properties[w].verb,
        general_amount: weight_properties[w].general_amount,
        amount: weight_amount + " pounds"}): null

      simple_stimuli.push(
        {
          location: locations[loc],
          query: ["objectID"],
          properties: props,
          type: "simple"
        }
      )


    }
  }
}

console.log(simple_stimuli.map(function(x){return x.properties[0].amount}))
// debugger;

// var conditioning_stimuli = [
//   {
//     location: "kitchen",
//     properties: [
//       {verb: "costs", amount: "$20"}
//     ],
//     query: ["objectID"]
//   },
//   {
//     location: "kitchen",
//     properties: [
//       {verb: "costs", amount: "$50"}
//     ],
//     query: ["objectID"]
//   },
//   {
//     location: "bathroom",
//     properties: [
//       {verb: "costs", amount: "$20"},
//       {verb: "weighs", amount: "5 pounds"}
//     ],
//     query: ["objectID"]
//   },
//   {
//     location: "study",
//     properties: [
//       {verb: "costs", amount: "$20"},
//       {verb: "weighs", amount: "5 pounds"}
//     ],
//     query: ["objectID"]
//   }
// ]

// var store_locations = ["same", "different"]
// var objectIDs = ["book", "table", "watch"]
// var object_counts = [1, 2, 3]
// var total_prices = ["$50", "$100", "$200"]
//
// var complex_stimuli = []
// for (i=0;i<store_locations.length; i++){
//   loc = store_locations[i]
//   for (j=0;j<unique_complex_stimuli.length; j++) {
//
//   }
// }


var complex_stimuli = [
  [
    {
      location: "same",
      objects: [
        {
          number: 2,
          objectIDs: ["table"],
          price: "$100"
        },
        {
          number: 1,
          price: "$10",
          objectIDs: []
        }
      ],
      item_name: "change_object",
      type: "complex",
      query: ["store", "objectID"]
    },
    {
      location: "same",
      objects: [
        {
          number: 2,
          objectIDs: ["bottle of wine"],
          price: "$100"
        },
        {
          number: 1,
          price: "$10",
          objectIDs: []
        }
      ],
      item_name: "change_object",
      type: "complex",
      query: ["store", "objectID"]
    }
  ],
  [
    {
      location: "same",
      objects: [
        {
          number: 2,
          objectIDs: ["socks"],
          price: "$10"
        },
        {
          number: 1,
          price: "$20",
          objectIDs: []
        }
      ],
      item_name: "change_price_unknownPerson",
      type: "complex",
      query: ["store", "objectID"]
    },
    {
      location: "same",
      objects: [
        {
          number: 2,
          objectIDs: ["socks"],
          price: "$10"
        },
        {
          number: 1,
          price: "$2000",
          objectIDs: []
        }
      ],
      item_name: "change_price_unknownPerson",
      type: "complex",
      query: ["store", "objectID"]
    }
  ],
  [
    {
      location: "different",
      objects: [
        {
          number: 2,
          objectIDs: ["hat"],
          price: "$100"
        },
        {
          number: 2,
          price: "$30",
          objectIDs: ["socks"]
        }
      ],
      item_name: "same_different",
      type: "complex",
      query: ["store", "objectID"]
    },
    {
      location: "same",
      objects: [
        {
          number: 2,
          objectIDs: ["hat"],
          price: "$100"
        },
        {
          number: 2,
          price: "$30",
          objectIDs: ["socks"]
        }
      ],
      item_name: "same_different",
      type: "complex",
      query: ["store", "objectID"]
    }
  ],
  [
    {
      location: "different",
      objects: [
        {
          number: 3,
          objectIDs: ["suitcase"],
          price: "$100"
        },
        {
          number: 2,
          price: "$30",
          objectIDs: ["spatula"]
        }
      ],
      item_name: "change_price_knownPerson",
      type: "complex",
      query: ["store", "objectID"]
    },
    {
      location: "different",
      objects: [
        {
          number: 3,
          objectIDs: ["suitcase"],
          price: "$500"
        },
        {
          number: 2,
          price: "$30",
          objectIDs: ["spatula"]
        }
      ],
      item_name: "change_price_knownPerson",
      type: "complex",
      query: ["store", "objectID"]
    }
  ],
  [
    {
      location: "different",
      objects: [
        {
          number: 2,
          objectIDs: ["magazine"],
          price: "$30"
        },
        {
          number: 2,
          price: "$200",
          objectIDs: ["shotgun"]
        }
      ],
      item_name: "same_different_2",
      type: "complex",
      query: ["store", "objectID"]
    },
    {
      location: "same",
      objects: [
        {
          number: 2,
          objectIDs: ["magazine"],
          price: "$30"
        },
        {
          number: 2,
          price: "$200",
          objectIDs: ["shotgun"]
        }
      ],
      item_name: "same_different_2",
      type: "complex",
      query: ["store", "objectID"]
    }
  ],
  [
    {
      location: "same",
      objects: [
        {
          number: 1,
          objectIDs: [],
          price: "$50"
        },
        {
          number: 3,
          price: "$30",
          objectIDs: ["pair of sandals"]
        }
      ],
      item_name: "change_nObjects",
      type: "complex",
      query: ["store", "objectID"]
    },
    {
      location: "same",
      objects: [
        {
          number: 1,
          objectIDs: [],
          price: "$50"
        },
        {
          number: 1,
          price: "$30",
          objectIDs: ["pair of sandals"]
        }
      ],
      item_name: "change_nObjects",
      type: "complex",
      query: ["store", "objectID"]
    }
  ]
]

// console.log(sampled_compled_stims)
// var single_box_stimuli = [
//   {
//     num_objects: 3,
//     contents_information: {type: ["books", 2]},
//     box_information: {price: "$20"},
//     query: "price",
//     question: "What is the price of the 3rd object?",
//     n_boxes: 1,
//   },
//   {
//     num_objects: 3,
//     contents_information: {type: ["books", 2]},
//     box_information: {price: "$50"},
//     query: "price",
//     question: "What is the price of the 3rd object?",
//     n_boxes: 1,
//   },
//   {
//     num_objects: 3,
//     contents_information: {type: ["books", 2]},
//     box_information: {price: "$20"},
//     query: "weight",
//     question: "How much does the box weigh?",
//     n_boxes: 1,
//   },
//   {
//     num_objects: 4,
//     contents_information: {type: ["books", 2]},
//     box_information: {price: "$30"},
//     query: "price",
//     question: "How much do the other two things cost in total?",
//     n_boxes: 1,
//   },
//   {
//     num_objects: 2,
//     contents_information: "Box A has a book and something else in it",
//     box_information: "Box A weighs more than Box B, which has a TV and a water bottle",
//     query: "weight",
//     question: "How much does Box A weigh?",
//     n_boxes: 2,
//   }
// ]
