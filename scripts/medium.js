var game;
    var cur_round=0;

    function num_players_submit(){
      var num_players = parseInt(document.getElementById("num_players").value);
      console.log(num_players);

      for(var i = 0; i < num_players; ++i){
        document.getElementById("player_name_query").innerHTML += `
        <div class="input-group m-1">
        <div class="input-group-prepend">
        <span class="input-group-text">Player ` + (i+1).toString() + `</span>
        </div>
        <input type="text" class="player_name form-control" id="player_` + i + `">
        </div>
        `;
      }

      document.getElementById("player_name_query").innerHTML += `<button class="btn btn-success" id="player_name_submit">Submit</button>`
      document.getElementById("player_name_submit").addEventListener("click",
        player_name_submit);
      document.getElementById("num_players").disabled = true;
      document.getElementById("num_players_submit").disabled = true;
    }


    function player_name_submit(){
      var player_name_elems = document.getElementsByClassName("player_name");
      var player_names = [];
      for (player_name_elem of player_name_elems){
        player_name_elem.disabled = true;
        player_names.push(player_name_elem.value.toString());
      }
      document.getElementById("player_name_submit").disabled = true;
      var num_players = parseInt(document.getElementById("num_players").value);
      game = new Game(num_players, player_names);
      round_start(0);
    }

    function round_start(round_id){
      document.getElementById("round_"+round_id).innerHTML +=
      `
        <h3>Round ${round_id+1}</h3>
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">Number of failures</span>
          </div>
          <input type="number" class="form-control" id="num_fail_${round_id}">
        </div>
        <div class="container border rounded">
          <h4>Who are involved? (${game.players_of_round[round_id]} players)</h4>
          <div id="player_round_${round_id}">
          </div>
        </div>
        
      `;
      console.log(1)

      if(round_id>0&&round_id<4){
        document.getElementById("round_"+round_id).innerHTML +=
        `
        <div class="container border rounded">
          <h4>Lady of the Lake</h4>
          <div class="form-group">
            <label for="accuser_${round_id}">Who uses it:</label>
            <select class="form-control" id="accuser_${round_id}">
            </select>
          </div>
          <div class="form-group">
            <label for="accused_${round_id}">Who is tested:</label>
            <select class="form-control" id="accused_${round_id}">
            </select>
          </div>
          <div class="form-group">
            <label for="lady_outcome_${round_id}">Outcome</label>
            <select class="form-control" id="lady_outcome_${round_id}">
              <option value="G">Good</option>
              <option value="B">Bad</option>
              <option value="NU" selected>Not used</option>
            </select>
          </div>
        </div>
      `;
      }

      document.getElementById("round_"+round_id).innerHTML += `<div class="output border rounded p-2" id="output_round_${round_id}" hidden></div>`;

      var player_container = document.getElementById("player_round_" + round_id.toString());
      for(name of game.names){
        player_container.innerHTML += 
        `
        <div class="form-check">
          <label class="form-check-label">
            <input type="checkbox" class="check_${round_id} form-check-input" value="${name}">${name}
          </label>
        </div>
        `;
        console.log(name);
        if(round_id>0){
          document.getElementById("accuser_" + round_id.toString()).innerHTML += `<option value="${name}">${name}</option>`;
          document.getElementById("accused_" + round_id.toString()).innerHTML += `<option value="${name}">${name}</option>`;
        }
      }
      document.getElementById("round_"+round_id).innerHTML += `<button class="btn btn-success" id="round_${round_id}_submit">Submit</button>`;
      document.getElementById(`round_${round_id}_submit`).addEventListener("click",
        round_submit);
    }

    function round_submit(){
      var num_fail = document.getElementById("num_fail_"+cur_round).value;
      var boxes = document.getElementsByClassName("check_"+cur_round);
      var current_players = [];
      for(box of boxes){
        if(box.checked){
          current_players.push(box.value);
        }
      }
      if(current_players.length!=game.players_of_round[cur_round]
        ||num_fail>game.players_of_round[cur_round]){
        alert("The number of players entered doesn't match the current round");
        return;
      }
      for(box of boxes){
        box.disabled = true;
      }
      var verdict = "NU";
      var accused = 0;
      var accuser = 0;
      if(cur_round>0){
        verdict = document.getElementById("lady_outcome_"+cur_round).value;
        accused = document.getElementById("accused_"+cur_round).value;
        accuser = document.getElementById("accuser_"+cur_round).value;
      }
      document.getElementById("num_fail_"+cur_round).disabled = true;
      document.getElementById(`round_${cur_round}_submit`).disabled = true;
      document.getElementById("output_round_"+cur_round).removeAttribute("hidden");
      document.getElementById("output_round_"+cur_round).innerHTML += game.end_round(cur_round, num_fail, current_players, verdict, accused, accuser);

      ++cur_round;

      if(cur_round<5){
        round_start(cur_round);
      }
    }

    document.getElementById("num_players_submit").addEventListener("click",
      num_players_submit);