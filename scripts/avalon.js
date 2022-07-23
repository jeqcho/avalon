class Constraint{
    constructor(suspects, num_fail){
        this.suspects = suspects
        this.fails = num_fail
    }
}

function str(s){
    return s.toString();
}


class Accusation{
    constructor(accuser, accused, verdict){
        this.accuser = accuser
        this.accused = accused
        this.verdict = verdict
    }
}


function get_combo_id(evil_list){
    combo_id = ""
    for(var evil of evil_list){
        combo_id += str(evil)
    }
    return combo_id
}


class Game{
    num_players = 0
    constraints = []
    names = []
    name_to_id = {}
    quest_layout = {
        5: [2, 3, 2, 3, 3],
        6: [2, 3, 4, 3, 4],
        7: [2, 3, 3, 4, 4],
        8: [3, 4, 4, 5, 5],
        9: [3, 4, 4, 5, 5],
        10: [3, 4, 4, 5, 5]

    }
    evil_cnt = {
        5: 2,
        6: 2,
        7: 3,
        8: 3,
        9: 3,
        10: 4
    }
    combo = {}
    combo_sz = 0
    accusations = []
    bad = []
    failed = false;

    constructor(num_players, player_names){
        this.num_players = num_players
        if(this.num_players > 10 || this.num_players < 5){
            alert("This program can only handle 5 to 10 players. You entered " + str(this.num_players) + " players.")
            this.failed = true
            return
        }
        this.num_evil = this.evil_cnt[this.num_players]
        this.players_of_round = this.quest_layout[this.num_players]
        alert("Number of evil characters is " + str(this.num_evil))
        this.names = player_names;

        for(var i = 0; i<num_players; ++i){
            this.name_to_id[this.names[i]] = i;
        }
    }

    end_round(round_num, num_fail, current_players, accuser=0, accused=0, verdict="NU"){
        var returnText = "";
        returnText += "Round " + str(round_num + 1) + '\n';
        var num_mate = this.players_of_round[round_num]

        var players_id = []
        for(var player of current_players){
            players_id.push(this.name_to_id[player])
        }

        if(round_num > 0){
            if(verdict != "NU"){
                this.accusations.push(new Accusation(accuser, accused, verdict));
            }
        }

        this.add_constraint(players_id, num_fail)
        this.combo = {}
        this.combo_sz = 0
        this.bad = Array(this.num_players).fill(0)
        this.recur(0, [])
        if(this.combo_sz > 0){
            var ranking = [];
            returnText += "Probability of being an evil character" + '\n';
            for(var player = 0; player < this.num_players; ++player){
                ranking.push([this.names[player], this.bad[player]]);
                this.bad[player] /= this.combo_sz
                this.bad[player] *= 100
                this.bad[player] = (this.bad[player]).toFixed(2);
            }

            ranking.sort(function(a,b){
                return b[1]-a[1];
            });
            for(var i = 0; i < ranking.length; ++i){
                returnText += ranking[i][0] + ": " + str(ranking[i][1]) + "%" + '\n';
            }

            var most_prob_combo_val = -1;
            var most_prob_combo;
            for(var combo of Object.keys(this.combo)){
                var val = this.combo[combo];
                if(val > most_prob_combo_val){
                    most_prob_combo_val = val;
                    most_prob_combo = combo;
                }
            }

            var combo_sorted = [];
            for (var combo in this.combo) {
                combo_sorted.push([combo, this.combo[combo]]);
            }

            combo_sorted.sort(function(a, b) {
                return b[1] - a[1];
            });


            returnText +=  "Most probable combinations of evil characters:"+ '\n';
            for(var i=0; i<Math.min(5,combo_sorted.length); ++i){
                var combo_prob = (combo_sorted[i][1] / this.combo_sz * 100).toFixed(2);
                returnText +=  this.id_to_str(combo_sorted[i][0]) + str(combo_prob) + "%"+ '\n';
            }
        } else {
            returnText +=  "The program failed because some good guy put failure or lied"+ '\n';
        }
        return returnText
    }

    // # use recursion for dynamic loops
    recur(current, evil_list){
        if(evil_list.length == this.num_evil){
            this.process_combo(evil_list)
            return
        }
        if(current >= this.num_players){
            return
        }
        this.recur(current + 1, evil_list)
        var new_list = [...evil_list];
        new_list.push(current)
        this.recur(current + 1, new_list)
    }

    process_combo(evil_list){
        if(this.validate(evil_list)){
            var combo_id = get_combo_id(evil_list)
            if(combo_id in this.combo){
                this.combo[combo_id] += 1
            } else {
                this.combo[combo_id] = 1
            }
            this.combo_sz += 1
            for(var evil of evil_list){
                this.bad[evil] += 1
            }
        }
    }

    add_constraint(players_id, num_fail){
        this.constraints.push(new Constraint(players_id, num_fail))
    }

    validate(evil_list){
        for(var constraint of this.constraints){
            var num_fail = constraint.fails
            for(var suspect of constraint.suspects){
                if(evil_list.includes(suspect)){
                    num_fail -= 1
                }
            }
            if(num_fail > 0){
                return false
            }
        }
        for(var accusation of this.accusations){
            if(!evil_list.includes(accusation.accuser)){
                var is_evil = evil_list.includes(accusation.accused);
                var said_evil = accusation.verdict == "B"
                if(is_evil != said_evil){
                    return false
                }
            }
        }
        return true
    }

    id_to_str(most_prob_combo){
        var names = ""
        for(var char of most_prob_combo){
            names += this.names[parseInt(char)] + ' '
        }
        return names
    }

}