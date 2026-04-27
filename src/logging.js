//################################
// LOGGING
// Contains logging functions
//################################

//Print string to HTML or console
function log(t) {
	if (isDebug()) {
		document.body.innerHTML += t + "<br>";
	}
	else {
		console.log(t);
	}
}

//Print all tiles in hand
function printHand(hand) {
	var handString = getStringForTiles(hand);
	log("Hand:" + handString);
}

//Get String for array of tiles
function getStringForTiles(tiles) {
	var tilesString = "";
	var oldType = "";
	tiles.forEach(function (tile) {
		if (getNameForType(tile.type) != oldType) {
			tilesString += oldType;
			oldType = getNameForType(tile.type);
		}
		if (tile.dora == 1) {
			tilesString += "0";
		}
		else {
			tilesString += tile.index;
		}
	});
	tilesString += oldType;
	return tilesString;
}

//Print tile name
function printTile(tile) {
	log(getTileName(tile, false));
}

//Print given tile priorities
function printTilePriority(tiles) {
	log("Overall: Value Open: <" + Number(tiles[0].score.open).toFixed(0) +
		"> Closed Value: <" + Number(tiles[0].score.closed).toFixed(0) +
		"> Riichi Value: <" + Number(tiles[0].score.riichi).toFixed(0) +
		"> Shanten: <" + Number(tiles[0].shanten).toFixed(0) + ">");
	for (var i = 0; i < tiles.length && i < LOG_AMOUNT; i++) {
		log(getTileName(tiles[i].tile, false) +
			": Priority: <" + Number(tiles[i].priority).toFixed(3) +
			"> Efficiency: <" + Number(tiles[i].efficiency).toFixed(3) +
			"> Yaku Open: <" + Number(tiles[i].yaku.open).toFixed(3) +
			"> Yaku Closed: <" + Number(tiles[i].yaku.closed).toFixed(3) +
			"> Dora: <" + Number(tiles[i].dora).toFixed(3) +
			"> Waits: <" + Number(tiles[i].waits).toFixed(3) +
			"> Danger: <" + Number(tiles[i].danger).toFixed(2) + ">");
	}
}

function getLocalizedStrategyName(strategyName) {
	return STRATEGY_NAME_CN[strategyName] || strategyName;
}

function getTilePriorityDetails(tilePrio, prefix = "弃牌") {
	if (tilePrio == null || typeof tilePrio.tile == 'undefined') {
		return "";
	}

	var score = isClosed ? tilePrio.score.closed : tilePrio.score.open;
	return prefix + ": " + getTileName(tilePrio.tile, false) +
		"; 向听 " + Number(tilePrio.shanten).toFixed(0) +
		"; 危险度 " + Number(tilePrio.danger).toFixed(1) +
		"; 听牌数 " + Number(tilePrio.waits).toFixed(1) +
		"; 预估打点 " + Number(score).toFixed(0) +
		"; 策略 " + getLocalizedStrategyName(strategy);
}

function recordDecision(detail) {
	if (detail == null || detail == "") {
		return;
	}

	var mode = "";
	var debugString = "";
	try {
		mode = getNumberOfPlayers() + "人";
		debugString = getDebugString();
	}
	catch {
		mode = "未知玩法";
	}

	decisionHistory.unshift({
		time: new Date().toLocaleTimeString(),
		mode: mode,
		detail: detail,
		debugString: debugString
	});

	if (decisionHistory.length > DECISION_HISTORY_LIMIT) {
		decisionHistory.pop();
	}
}

function getDecisionHistoryText() {
	if (decisionHistory.length == 0) {
		return "暂无决策记录。";
	}

	return decisionHistory.map(function (entry, index) {
		var debugLine = entry.debugString == "" ? "" : "\n调试: " + entry.debugString;
		return (index + 1) + ". [" + entry.time + "][" + entry.mode + "] " + entry.detail + debugLine;
	}).join("\n\n");
}

function getConfigSnapshot() {
	var config = {};
	for (let field of CONFIG_FIELDS) {
		config[field.key] = getConfigValue(field.key);
	}
	config.EFFECTIVE_SAFETY = getEffectiveSafety();
	config.EFFECTIVE_CALL_PON_CHI = getEffectiveCallPonChi();
	config.EFFECTIVE_CALL_KAN = getEffectiveCallKan();
	config.EFFECTIVE_RIICHI = getEffectiveRiichi();
	return config;
}

function getDecisionHistoryExportData() {
	return {
		exportedAt: new Date().toISOString(),
		version: typeof GM_info != 'undefined' && GM_info.script ? GM_info.script.version : "unknown",
		config: getConfigSnapshot(),
		decisions: decisionHistory.slice()
	};
}

function getBugReportExportData() {
	var data = {
		exportedAt: new Date().toISOString(),
		version: typeof GM_info != 'undefined' && GM_info.script ? GM_info.script.version : "unknown",
		config: getConfigSnapshot(),
		lastDecisionDetails: lastDecisionDetails,
		decisions: decisionHistory.slice()
	};

	try {
		data.compatibility = checkCompatibility();
		data.runtimeSummary = getRuntimeSummary();
	}
	catch {
		data.compatibility = [];
		data.runtimeSummary = "无法读取运行状态";
	}

	try {
		data.debugString = isInGame() ? getDebugString() : "";
	}
	catch {
		data.debugString = "";
	}

	return data;
}

function clearDecisionHistory() {
	decisionHistory = [];
}

//Input string to get an array of tiles (e.g. "123m456p789s1z")
function getTilesFromString(inputString) {
	var numbers = [];
	var tiles = [];
	for (let input of inputString) {
		var type = 4;
		switch (input) {
			case "p":
				type = 0;
				break;
			case "m":
				type = 1;
				break;
			case "s":
				type = 2;
				break;
			case "z":
				type = 3;
				break;
			default:
				numbers.push(input);
				break;
		}
		if (type != "4") {
			for (let number of numbers) {
				if (parseInt(number) == 0) {
					tiles.push({ index: 5, type: type, dora: true, doraValue: 1, valid: true });
				}
				else {
					tiles.push({ index: parseInt(number), type: type, dora: false, doraValue: 0, valid: true });
				}
			}
			numbers = [];
		}
	}
	return tiles;
}

//Input string to get a tiles (e.g. "1m")
function getTileFromString(inputString) {
	var type = 4;
	var dr = false;
	switch (inputString[1]) {
		case "p":
			type = 0;
			break;
		case "m":
			type = 1;
			break;
		case "s":
			type = 2;
			break;
		case "z":
			type = 3;
			break;
	}
	var index = inputString[0];
	if (inputString[0] == "0") {
		index = "5";
		dr = true;
	}
	if (type != "4") {
		var tile = { index: parseInt(index), type: type, dora: dr, valid: true };
		tile.doraValue = getTileDoraValue(tile);
		return tile;
	}
	return null;
}

//Returns the name for a tile
function getTileName(tile, useRaw = true) {
	let name = "";
	if (tile.dora == true) {
		name = "0" + getNameForType(tile.type);
	} else {
		name = tile.index + getNameForType(tile.type);
	}

	if (!useRaw && USE_EMOJI) {
		return `${getTileEmoji(tile.type, tile.index, tile.dora)}: ${name}`;
	} else {
		return name;
	}
}

//Returns the corresponding char for a type
function getNameForType(type) {
	switch (type) {
		case 0:
			return "p";
		case 1:
			return "m";
		case 2:
			return "s";
		case 3:
			return "z";
		default:
			return "?";
	}
}

//returns a string for the current state of the game
function getDebugString() {
	var debugString = "";
	debugString += getStringForTiles(dora) + "|";
	debugString += getStringForTiles(ownHand) + "|";
	debugString += getStringForTiles(calls[0]) + "|";
	debugString += getStringForTiles(calls[1]) + "|";
	debugString += getStringForTiles(calls[2]) + "|";
	if (getNumberOfPlayers() == 4) {
		debugString += getStringForTiles(calls[3]) + "|";
	}
	debugString += getStringForTiles(discards[0]) + "|";
	debugString += getStringForTiles(discards[1]) + "|";
	debugString += getStringForTiles(discards[2]) + "|";
	if (getNumberOfPlayers() == 4) {
		debugString += getStringForTiles(discards[3]) + "|";
	}
	if (getNumberOfPlayers() == 4) {
		debugString += (isPlayerRiichi(0) * 1) + "," + (isPlayerRiichi(1) * 1) + "," + (isPlayerRiichi(2) * 1) + "," + (isPlayerRiichi(3) * 1) + "|";
	}
	else {
		debugString += (isPlayerRiichi(0) * 1) + "," + (isPlayerRiichi(1) * 1) + "," + (isPlayerRiichi(2) * 1) + "|";
	}
	debugString += seatWind + "|";
	debugString += roundWind + "|";
	debugString += tilesLeft;
	return debugString;
}
