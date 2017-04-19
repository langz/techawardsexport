var json2csv = require('json2csv');
var fs = require('fs');

readJSON();

function start(techawardsData) {
    var fields = ['category', 'nominee', 'nominations', 'votes', 'description'];
    var document = [];
    for (var category in techawardsData.nominees) {
        for (var nominee in techawardsData.nominees[category]) {
            var descriptions = [];
            for (var nominationby in techawardsData.nominees[category][nominee].nominations) {
                descriptions.push(techawardsData.nominees[category][nominee].nominations[nominationby].description);
            }
            var data = {
                "category": category,
                "nominee": getNominationName(nominee, techawardsData, category),
                "nominations": Object.keys(techawardsData.nominees[category][nominee].nominations).length,
                "votes": getVotes(nominee, category, techawardsData),
                "description": descriptions.join(" 2. "),
            };
            document.push(data);
        }
    }
    generateCSV(document, fields);
}

function getNominationName(nominee, techawardsData, category) {
    if (techawardsData.users.hasOwnProperty(nominee)) {
        return techawardsData.users[nominee].firstname + ' ' + techawardsData.users[nominee].lastname;
    } else {
        var teamNominee = [];
        for (var nominationby in techawardsData.nominees[category][nominee].nominations) {
            teamNominee.push(techawardsData.nominees[category][nominee].nominations[nominationby].team);
        }
        return teamNominee.join(" / ");
    }
}

function getVotes(nominee, category, techawardsData) {
    // console.log(Object.keys(techawardsData.votes).length);
    if (techawardsData.results[category]) {
        return Object.keys(techawardsData.results[category].nominees[nominee].votes).length;
    } else {
        return 0;
    }
}

function generateCSV(data, fields) {
    var csv = json2csv({
        data: data,
        fields: fields
    });
    saveCSV(csv);
}

function saveCSV(csv) {
    fs.writeFile('techawards_results.csv', csv, function (err) {
        if (err) throw err;
        console.log('file saved');
        // "sep=,"
        // unicode ellns
    });
}

function readJSON() {
    fs.readFile('./techawards.json', 'utf8', function (err, data) {
        if (err) throw err; // we'll not consider error handling for now
        var obj = JSON.parse(data);
        start(obj);
    });
}