function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
      $("#n_trials").html(exp.n_trials + 6)
      $("#estimate_duration").html(15)
     }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.simple_instructions = slide({
    name : "simple_instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.complex_instructions = slide({
    name : "complex_instructions",
    start: function(){
      exp.slides.one_slider.present = _.shuffle(exp.complex_stimuli)
    },
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.debrief = slide({
    name: "debrief",
    start: function() {
      $(".err").hide();
    },
    button : function() {
      response = $("#text_response").val();
      if (response.length == 0) {
        $(".err").show();
      } else {
        exp.catch_trials.push({
          "trial_type" : "debrief",
          "response" : response
        });
        exp.go(); //make sure this is at the *end*, after you log your data
      }
    },
  });

  slides.one_slider = slide({
    name : "one_slider",
    trial_num: 1,

    /* trial information for this block
     (the variable 'stim' will change between each of these values,
      and for each of these, present_handle will be run.) */
    present : exp.stimuli,

    //this gets run only at the beginning of the block
    present_handle : function(stim) {
      // stim.query = "objectID"
      $(".err").hide();
      $(".multiword_error").hide();
      $(".needmultiword").hide();

      $("#weight_container").hide()
      $("#price_container").hide()
      // $("#object_container").hide()
      $("#slider_table").hide()
      $("#box_img2").hide()
      $("#price_response").val('')
      $("#weight_response").val('')
      $("#objectID_response").val('')
      $("#objectID_instructions").hide();

      $("#speaker_box").html(
        stim.type == "complex" ?
          '<img src="_shared/images/cubert.png" alt="cubert" id="cubert_img"  height="150"></img>' :
          '<img src="_shared/images/Bear_straight.png" alt="bear" id="bear_img" height="150"></img>'
        )

      this.stim = stim;


      switch (stim.query) {
        case "price":
          $("#price_container").show();
          break;
        case "weight":
          $("#weight_container").show();
          break;
        case "objectID":
          $("#object_container").show();
          $("#objectID_instructions").show();
          break;
        case "slider":
          this.init_sliders();
          exp.sliderPost = null;
          break;
      }

      var prompt = ""

      switch (stim.type){
        case "simple":
          if (stim.location) {
            prompt+="I've been told to look for something in the <strong>" + stim.location + "</strong>.<br>";
          }
          prompt+="I've been told that "
          prompt+=stim.properties.map(function(p){ return "it " + p.verb + " <strong>" + p.amount + "</strong>"}).join(" and that ")
          prompt+=",<br> but I don't know anything else about it."
          $("#object_container").html('<input type="text" pattern="[a-z]*" id="objectID_response"></input>')
          stim.question = "What do you think it could be?"
          $(".query").html(stim.question);
          break;
        case "complex":
          this.expected_responses_0 =  this.stim.objects[0].number - this.stim.objects[0].objectIDs.length
          this.expected_responses_1 = this.stim.objects[1].number - this.stim.objects[1].objectIDs.length
          this.expecting_responses_0 = this.expected_responses_0 > 0
          this.expecting_responses_1 = this.expected_responses_1 > 0
          $(".query").html("");
          prompt+="<small>My friend and I found some receipts but we can't remember what we bought.</small><br>";
          prompt+="I know that we went shopping at " + (stim.location == "same" ? "the <strong>same</strong> store" : "<strong>different</strong> stores") + "."
          prompt+="<br>I spent <strong>" + stim.objects[0].price + "</strong> and got <strong>" + stim.objects[0].number + "</strong> " + (stim.objects[0].number > 1 ? "things" : "thing") + "."
          prompt+="<br>My friend spent <strong>" + stim.objects[1].price + "</strong> and got <strong>" + stim.objects[1].number + "</strong> " + (stim.objects[1].number > 1 ? "things" : "thing") + "."
          hasObjects = stim.objects.map(function(x){return x.objectIDs.length > 0 })
          prompt+="<br>"+(hasObjects[0] ? "I can see that I bought a <strong>" +
            stim.objects[0].objectIDs.join("</strong> and a <strong>") +
            (this.expecting_responses_0 ?  "</strong> but I don't know what my other item(s) were." : ".")
            : "")
          prompt+="<br>"+(hasObjects[1] ? "I can see that my friend bought a <strong>" +
            stim.objects[1].objectIDs.join("</strong> and a <strong>") +
            (this.expecting_responses_1 ? "</strong> but I don't know what their other item(s) were." : ".")
             : "")

          for (i=0; i<stim.query.length; i++){
            switch(stim.query[i]){
              case "store":
                store_question = "<em>" + (stim.location == "same" ? "What kind of store did they go to?" : "What kind of stores did they go to?") + "</em><br>"

                $("#store_container").html(
                  store_question + (stim.location == "same" ?
                  'Cubert and his friend went to a/an <input type="text" pattern="[a-z]*" id="store_response1"></input> store.' :
                  'Cubert went to a/an <input type="text" pattern="[a-z]*" id="store_response1"></input> store and their friend went to a/an <input type="text" pattern="[a-z]*" id="store_response2"></input> store.'
                  )
                )
              break;
              case "objectID":
                object_question = (this.expecting_responses_0 && this.expecting_responses_1) ?
                  "<br><em>What did each of them buy?</em><br>" :
                  this.expecting_responses_0 ? "<br><em>What did Cubert buy?</em><br>"  :
                  this.expecting_responses_1 ? "<br><em>What did Cubert's friend buy?</em><br>" : ""

                $("#object_container").html(
                  object_question +
                  (
                    this.expecting_responses_0 ?
                    (hasObjects[0] ? "Apart from the " + stim.objects[0].objectIDs.join(" and the ") + ", " : "") +
                    "Cubert bought: " + '<input type="text" id="object_response1"></input> <br>' +
                    (
                      (stim.objects[0].number > stim.objects[0].objectIDs.length + 1) ?
                    '<small><em>(Please enter a comma separated list of one-word responses.)</em></small>' : ''
                    ) +  '<br>'
                  : ""
                ) +
                  (this.expecting_responses_1 ?
                    (hasObjects[1] ? "Apart from the " + stim.objects[1].objectIDs.join(" and the ") + ", " : "") +
                    "Cubert's friend bought: " + '<input type="text" id="object_response2"></input>' +  ((stim.objects[1].number > stim.objects[1].objectIDs.length + 1) ? '<small><em>(Please enter a comma separated list of one-word responses.)</em></small>' : '')
                   : "")
                )
              break;
            }
          }

          break;
      }

      $(".prompt").html(prompt);

    },

    // CHECK SPACES ON STORE RESPONSES
    // CHECK NUMBER OF ITEMS ON LIST RESPONSES
    button : function() {
      multi_word_response = false
      hyphen_response = false
      no_response = false
      correct_n_responses = true
      for (i=0; i<this.stim.query.length; i++){

        switch(this.stim.query[i]){
          case "price":
            response = $("#price_response").val()
            break;
          case "weight":
            response = $("#weight_response").val()
            break;
          case "objectID":
            // debugger;
            if (this.stim.type == "complex") {
              // debugger;
              response = [$("#object_response1").val(), $("#object_response2").val()]
              expected_responses_0 =  this.stim.objects[0].number - this.stim.objects[0].objectIDs.length
              expected_responses_1 = this.stim.objects[1].number - this.stim.objects[1].objectIDs.length
              n_response_0 = expected_responses_0 ? response[0].split(',').length : 0
              n_response_1 = expected_responses_1 ? response[1].split(',').length : 0
              correct_n_responses = (n_response_0 == expected_responses_0) && (n_response_1 == expected_responses_1)
              // multi_word_response = !correct_n_responses
              // debugger;
            } else {
              response = [$("#objectID_response").val()]
            }
            multi_word_response = multi_word_response || response.some(function(r){ return r ? r.split(' ').length > 1 : false })
            // FIX ME: be sensitive to whether or not we are expecting multiple responses in a text box
            // response = this.stim.type == "simple" ? [$("#objectID_response").val()]: [$("#object_response1").val(), $("#object_response2").val()]
            no_response = no_response || response.some(function(r){ return r == "" })
            // multi_word_response = response.some(function(r){ return r.split(' ').length > 1 })
            hyphen_response = hyphen_response || response.some(function(r){ return  r ? r.includes('-') : false})
            break;
          case "store":
            // debugger;
            response = this.stim.location == "same" ? [$("#store_response1").val()] : [$("#store_response1").val(), $("#store_response2").val()]
            no_response = no_response || response.some(function(r){ return r == "" })
            multi_word_response = multi_word_response || response.some(function(r){ return r.split(' ').length > 1 })
            // console.log(multi_word_response)
            hyphen_response = hyphen_response || response.some(function(r){ return r.includes('-') })
            // debugger;
            // multi_word_response = multi_word_response.sum()
            // hyphen_response = multi_word_response.some()
            break;
          }
        }

      // console.log(response)
      // debugger;

      if (no_response) {
        $(".err").show();
      } else if (multi_word_response || hyphen_response) {
        // console.log('multiword error')
        $(".err").hide();
        $(".multiword_error").show();
      } else if (!correct_n_responses) {
        $(".multiword_error").hide();
        $(".needmultiword").show();
      } else {
        this.log_responses();

        /* use _stream.apply(this); if and only if there is
        "present" data. (and only *after* responses are logged) */
        _stream.apply(this);
      }
    },

    log_responses : function() {
      // console.log('log responses')
      // debugger;
      propertiesPairs = []
      if (this.stim.properties){
        for(i=0;i<this.stim.properties.length;i++){
          propertiesPairs.push(["verb_"+ i, this.stim.properties[i].verb])
          propertiesPairs.push(["generalAmount_"+ i, this.stim.properties[i].general_amount])
          propertiesPairs.push(["amount_"+ i, this.stim.properties[i].amount])
        }
      }
      objectInformation = []
      if (this.stim.objects){
        for(i=0;i<this.stim.objects.length;i++){
          objectInformation.push(["number_"+ i, this.stim.objects[i].number])
          objectInformation.push(["price_"+ i, this.stim.objects[i].price])
          for (j=0; j<this.stim.objects[i].objectIDs.length; j++){
            objectInformation.push(["objectID_"+ i + "_" +j, this.stim.objects[i].objectIDs[j]])
          }
        }
      }
      responses = []
      for(i=0;i<this.stim.query.length;i++){
        switch(this.stim.query[i]){
          case "store":
            if (this.stim.location == "same") {
              responses.push(["store_0", $("#store_response1").val()])
            }  else {
              responses.push(["store_0", $("#store_response1").val()])
              responses.push(["store_1", $("#store_response2").val()])
            }
           break;
          case "objectID":
             if (this.stim.type == "simple") {
               responses.push(["object_0", $("#objectID_response").val()])
             }  else {
               responses.push(["object_0", $("#object_response1").val()])
               responses.push(["object_1", $("#object_response2").val()])
             }
           break;
        }
      }
      // debugger;
      exp.data_trials.push(_.extend({
        "trial_type" : this.stim.type,
        "trial_num": this.trial_num,
        "location" : this.stim.location,
      }, _.object(propertiesPairs.concat(objectInformation).concat(responses))));
      this.trial_num++
    }
  });

  slides.multi_slider = slide({
    name : "multi_slider",
    present : _.shuffle([
      {"critter":"Wugs", "property":"fur"},
      {"critter":"Blicks", "property":"fur"}
    ]),
    present_handle : function(stim) {
      $(".err").hide();
      this.stim = stim; //FRED: allows you to access stim in helpers

      this.sentence_types = _.shuffle(["generic", "negation", "always", "sometimes", "usually"]);
      var sentences = {
        "generic": stim.critter + " have " + stim.property + ".",
        "negation": stim.critter + " do not have " + stim.property + ".",
        "always": stim.critter + " always have " + stim.property + ".",
        "sometimes": stim.critter + " sometimes have " + stim.property + ".",
        "usually": stim.critter + " usually have " + stim.property + "."
      };

      this.n_sliders = this.sentence_types.length;
      $(".slider_row").remove();
      for (var i=0; i<this.n_sliders; i++) {
        var sentence_type = this.sentence_types[i];
        var sentence = sentences[sentence_type];
        $("#multi_slider_table").append('<tr class="slider_row"><td class="slider_target" id="sentence' + i + '">' + sentence + '</td><td colspan="2"><div id="slider' + i + '" class="slider">-------[ ]--------</div></td></tr>');
        utils.match_row_height("#multi_slider_table", ".slider_target");
      }

      this.init_sliders(this.sentence_types);
      exp.sliderPost = [];
    },

    button : function() {
      if (exp.sliderPost.length < this.n_sliders) {
        $(".err").show();
      } else {
        this.log_responses();
        _stream.apply(this); //use _stream.apply(this); if and only if there is "present" data.
      }
    },

    init_sliders : function(sentence_types) {
      for (var i=0; i<sentence_types.length; i++) {
        var sentence_type = sentence_types[i];
        utils.make_slider("#slider" + i, this.make_slider_callback(i));
      }
    },
    make_slider_callback : function(i) {
      return function(event, ui) {
        exp.sliderPost[i] = ui.value;
      };
    },
    log_responses : function() {
      for (var i=0; i<this.sentence_types.length; i++) {
        var sentence_type = this.sentence_types[i];
        exp.data_trials.push({
          "trial_type" : "multi_slider",
          "sentence_type" : sentence_type,
          "response" : exp.sliderPost[i]
        });
      }
    },
  });

  slides.vertical_sliders = slide({
    name : "vertical_sliders",
    present : _.shuffle([
      {
        "bins" : [
          {
            "min" : 0,
            "max" : 10
          },
          {
            "min" : 10,
            "max" : 20
          },
          {
            "min" : 20,
            "max" : 30
          },
          {
            "min" : 30,
            "max" : 40
          },
          {
            "min" : 40,
            "max" : 50
          },
          {
            "min" : 50,
            "max" : 60
          }
        ],
        "question": "How tall is tall?"
      }
    ]),
    present_handle : function(stim) {
      $(".err").hide();
      this.stim = stim;

      $("#vertical_question").html(stim.question);

      $("#sliders").empty();
      $("#bin_labels").empty();

      $("#sliders").append('<td> \
            <div id="slider_endpoint_labels"> \
              <div class="top">likely</div> \
              <div class="bottom">unlikely</div>\
            </div>\
          </td>')
      $("#bin_labels").append('<td></td>')

      this.n_sliders = stim.bins.length;
      for (var i=0; i<stim.bins.length; i++) {
        $("#sliders").append("<td><div id='vslider" + i + "' class='vertical_slider'>|</div></td>");
        $("#bin_labels").append("<td class='bin_label'>" + stim.bins[i].min + " - " + stim.bins[i].max + "</td>");
      }

      this.init_sliders(stim);
      exp.sliderPost = [];
    },

    button : function() {
      if (exp.sliderPost.length < this.n_sliders) {
        $(".err").show();
      } else {
        this.log_responses();
        _stream.apply(this); //use _stream.apply(this); if and only if there is "present" data.
      }
    },

    init_sliders : function(stim) {
      for (var i=0; i<stim.bins.length; i++) {
        utils.make_slider("#vslider" + i, this.make_slider_callback(i), "vertical");
      }
    },
    make_slider_callback : function(i) {
      return function(event, ui) {
        exp.sliderPost[i] = ui.value;
      };
    },
    log_responses : function() {
      for (var i=0; i<this.stim.bins.length; i++) {
        exp.data_trials.push({
          "trial_type" : "vertical_slider",
          "question" : this.stim.question,
          "response" : exp.sliderPost[i],
          "min" : this.stim.bins[i].min,
          "max" : this.stim.bins[i].max
        });
      }
    },
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        comments : $("#comments").val(),
        problems: $("#problems").val(),
        fairprice: $("#fairprice").val()
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          "condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {
  exp.trials = [];
  exp.catch_trials = [];

  repeatWorker = false;
  (function(){
      var ut_id = "mht-amz-20200131";
      if (UTWorkerLimitReached(ut_id)) {
        $('.slide').empty();
        repeatWorker = true;
        alert("You have already completed the maximum number of HITs allowed by this requester. Please click 'Return HIT' to avoid any impact on your approval rating.");
      }
  })();

  exp.complex_stimuli = complex_stimuli.map(uniformDraw)

  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };

  exp.n_trials = 24
  // console.log(simple_stimuli)
  exp.stimuli = _.shuffle(simple_stimuli).slice(0, exp.n_trials)
  // exp.stimuli = _.shuffle(conditioning_stimuli.map(function(x){ return _.extend(x, {type: "simple"})}))
  exp.estimate_duration = exp.n_trials * 0.75
  //blocks of the experiment:
  exp.structure=[
    "i0",
    "instructions",
    "simple_instructions",
    "one_slider",
    "complex_instructions",
    "one_slider",
    "debrief",
    'subj_info',
    'thanks'
  ];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = 36//utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  exp.go(); //show first slide
}
