//################################
// PARAMETERS
// Contains Parameters to change the playstile of the bot. Usually no need to change anything.
//################################

/* PERFORMANCE MODE
* Range 0 to 4. Decrease calculation time at the cost of efficiency (2 equals the time of ai version 1.2.1 and before).
* 4 = Highest Precision and Calculation Time. 0 = Lowest Precision and Calculation Time.
* Note: The bot will automatically decrease the performance mode when it approaches the time limit.
* Note 2: Firefox is usually able to run the script faster than Chrome.
*/
var PERFORMANCE_MODE = 3;

//HAND EVALUATION CONSTANTS
var EFFICIENCY = 1.0; // Lower: Slower and more expensive hands. Higher: Faster and cheaper hands. Default: 1.0, Minimum: 0
var SAFETY = 1.0; // Lower: The bot will not pay much attention to safety. Higher: The bot will try to play safer. Default: 1.0, Minimum: 0
var SAKIGIRI = 1.0; //Lower: Don't place much importance on Sakigiri. Higher: Try to Sakigiri more often. Default: 1.0, Minimum: 0

//CALL CONSTANTS
var CALL_PON_CHI = 1.0; //Lower: Call Pon/Chi less often. Higher: Call Pon/Chi more often. Default: 1.0, Minimum: 0
var CALL_KAN = 1.0; //Lower: Call Kan less often. Higher: Call Kan more often. Default: 1.0, Minimum: 0

//STRATEGY CONSTANTS
var RIICHI = 1.0; //Lower: Call Riichi less often. Higher: Call Riichi more often. Default: 1.0, Minimum: 0
var CHIITOITSU = 5; //Number of Pairs in Hand to go for chiitoitsu. Default: 5
var THIRTEEN_ORPHANS = 10; //Number of Honor/Terminals in hand to go for 13 orphans. Default: 10
var KEEP_SAFETILE = false; //If set to true the bot will keep 1 safetile

//MISC
var MARK_TSUMOGIRI = false; // Mark the tsumogiri tiles of opponents with grey color
var CHANGE_RECOMMEND_TILE_COLOR = true; // change recommended tile color in help mode
var USE_EMOJI = true; //use EMOJI to show tile
var LOG_AMOUNT = 3; //Amount of Messages to log for Tile Priorities
var DEBUG_BUTTON = false; //Display a Debug Button in the GUI
var THREE_PLAYER_PROFILE = true; //Use small strategy adjustments in 3 player games
var THREE_PLAYER_SAFETY_FACTOR = 1.08; //3 player hands tend to be higher value, so defend slightly earlier
var THREE_PLAYER_CALL_FACTOR = 1.10; //3 player rewards fast/value calls slightly more
var THREE_PLAYER_RIICHI_FACTOR = 1.05; //3 player riichi pressure is slightly stronger
var PLACEMENT_STRATEGY = true; //Adjust push/fold by current placement
var LATE_GAME_TENPAI = true; //Push a bit harder for tenpai late in the hand when danger is low



//### GLOBAL VARIABLES DO NOT CHANGE ###
var run = false; //Is the bot running
var threadIsRunning = false;
const AIMODE = { //ENUM of AI mode
	AUTO: 0,
	HELP: 1,
}
const AIMODE_NAME = [ //Name of AI mode
	"自动",
	"辅助",
]
const STRATEGIES = { //ENUM of strategies
	GENERAL: 'General',
	CHIITOITSU: 'Chiitoitsu',
	FOLD: 'Fold',
	THIRTEEN_ORPHANS: 'Thirteen_Orphans'
}
var strategy = STRATEGIES.GENERAL; //Current strategy
var strategyAllowsCalls = true; //Does the current strategy allow calls?
var isClosed = true; //Is own hand closed?
var dora = []; //Array of Tiles (index, type, dora)
var ownHand = []; //index, type, dora
var discards = []; //Later: Change to array for each player
var calls = []; //Calls/Melds of each player
var availableTiles = []; //Tiles that are available
var seatWind = 1; //1: East,... 4: North
var roundWind = 1; //1: East,... 4: North
var tilesLeft = 0; //tileCounter
var visibleTiles = []; //Tiles that are visible
var errorCounter = 0; //Counter to check if bot is working
var lastTilesLeft = 0; //Counter to check if bot is working
var isConsideringCall = false;
var riichiTiles = [null, null, null, null]; // Track players discarded tiles on riichi
var functionsExtended = false;
var playerDiscardSafetyList = [[], [], [], []];
var totalPossibleWaits = {};
var timeSave = 0;
var showingStrategy = false; //Current in own turn?
var lastDecisionDetails = ""; //Detailed message for help mode.
var decisionHistory = [];
var strategyLog = [];
var matchHistory = [];
var lastRecordedEndscreenKey = "";
var endscreenRecordActive = false;
const DECISION_HISTORY_LIMIT = 20;
const STRATEGY_LOG_LIMIT = 500;
const MATCH_HISTORY_LIMIT = 50;
const STRATEGY_NAME_CN = {
	General: "常规",
	Chiitoitsu: "七对子",
	Fold: "弃和防守",
	Thirteen_Orphans: "国士无双"
}

// Display
var tileEmojiList = [
	["red🀝", "🀙", "🀚", "🀛", "🀜", "🀝", "🀞", "🀟", "🀠", "🀡"],
	["red🀋", "🀇", "🀈", "🀉", "🀊", "🀋", "🀌", "🀍", "🀎", "🀏"],
	["red🀔", "🀐", "🀑", "🀒", "🀓", "🀔", "🀕", "🀖", "🀗", "🀘"],
	["", "🀀", "🀁", "🀂", "🀃", "🀆", "🀅", "🀄"]];


//LOCAL STORAGE
var AUTORUN = window.localStorage.getItem("alphajongAutorun") == "true";
var ROOM = window.localStorage.getItem("alphajongRoom");

ROOM = ROOM == null ? 2 : ROOM

var MODE = window.localStorage.getItem("alphajongAIMode")
MODE = MODE == null ? AIMODE.AUTO : parseInt(MODE);

const CONFIG_FIELDS = [
	{ key: "PERFORMANCE_MODE", label: "计算精度", type: "number", min: 0, max: 4, step: 1, defaultValue: 3 },
	{ key: "EFFICIENCY", label: "进攻效率", type: "number", min: 0, max: 2, step: 0.01, defaultValue: 1.0, precision: 2 },
	{ key: "SAFETY", label: "防守权重", type: "number", min: 0, max: 2, step: 0.01, defaultValue: 1.0, precision: 2 },
	{ key: "SAKIGIRI", label: "先切权重", type: "number", min: 0, max: 2, step: 0.01, defaultValue: 1.0, precision: 2 },
	{ key: "CALL_PON_CHI", label: "鸣牌倾向", type: "number", min: 0, max: 2, step: 0.01, defaultValue: 1.0, precision: 2 },
	{ key: "CALL_KAN", label: "杠牌倾向", type: "number", min: 0, max: 2, step: 0.01, defaultValue: 1.0, precision: 2 },
	{ key: "RIICHI", label: "立直倾向", type: "number", min: 0, max: 2, step: 0.01, defaultValue: 1.0, precision: 2 },
	{ key: "KEEP_SAFETILE", label: "保留安牌", type: "boolean", defaultValue: false },
	{ key: "MARK_TSUMOGIRI", label: "标记摸切", type: "boolean", defaultValue: false },
	{ key: "CHANGE_RECOMMEND_TILE_COLOR", label: "辅助高亮推荐牌", type: "boolean", defaultValue: true },
	{ key: "THREE_PLAYER_PROFILE", label: "三麻策略微调", type: "boolean", defaultValue: true },
	{ key: "PLACEMENT_STRATEGY", label: "名次策略", type: "boolean", defaultValue: true },
	{ key: "LATE_GAME_TENPAI", label: "末盘追听牌", type: "boolean", defaultValue: true }
];

const CONFIG_PRESETS = [
	{
		name: "稳健防守",
		description: "适合先降低放铳率，保留一定和牌能力。",
		values: {
			PERFORMANCE_MODE: 4,
			EFFICIENCY: 1.05,
			SAFETY: 1.25,
			SAKIGIRI: 1.05,
			CALL_PON_CHI: 1.15,
			CALL_KAN: 0.35,
			RIICHI: 1.00,
			KEEP_SAFETILE: true,
			MARK_TSUMOGIRI: false,
			CHANGE_RECOMMEND_TILE_COLOR: true,
			THREE_PLAYER_PROFILE: true,
			PLACEMENT_STRATEGY: true,
			LATE_GAME_TENPAI: true
		}
	},
	{
		name: "避四少放铳",
		description: "偏防守，适合想减少三四名和大放铳。",
		values: {
			PERFORMANCE_MODE: 4,
			EFFICIENCY: 1.00,
			SAFETY: 1.35,
			SAKIGIRI: 1.10,
			CALL_PON_CHI: 1.10,
			CALL_KAN: 0.20,
			RIICHI: 0.90,
			KEEP_SAFETILE: true,
			MARK_TSUMOGIRI: false,
			CHANGE_RECOMMEND_TILE_COLOR: true,
			THREE_PLAYER_PROFILE: true,
			PLACEMENT_STRATEGY: true,
			LATE_GAME_TENPAI: true
		}
	},
	{
		name: "快速和牌",
		description: "提高鸣牌和速度，适合东风局减少流局。",
		values: {
			PERFORMANCE_MODE: 4,
			EFFICIENCY: 1.15,
			SAFETY: 1.15,
			SAKIGIRI: 1.00,
			CALL_PON_CHI: 1.25,
			CALL_KAN: 0.30,
			RIICHI: 1.00,
			KEEP_SAFETILE: true,
			MARK_TSUMOGIRI: false,
			CHANGE_RECOMMEND_TILE_COLOR: true,
			THREE_PLAYER_PROFILE: true,
			PLACEMENT_STRATEGY: true,
			LATE_GAME_TENPAI: true
		}
	},
	{
		name: "三麻进攻",
		description: "三麻偏快节奏，保留防守同时提高进攻和立直。",
		values: {
			PERFORMANCE_MODE: 4,
			EFFICIENCY: 1.15,
			SAFETY: 1.20,
			SAKIGIRI: 1.00,
			CALL_PON_CHI: 1.25,
			CALL_KAN: 0.30,
			RIICHI: 1.10,
			KEEP_SAFETILE: true,
			MARK_TSUMOGIRI: false,
			CHANGE_RECOMMEND_TILE_COLOR: true,
			THREE_PLAYER_PROFILE: true,
			PLACEMENT_STRATEGY: true,
			LATE_GAME_TENPAI: true
		}
	}
];

function getConfigField(key) {
	return CONFIG_FIELDS.find(field => field.key == key);
}

function getConfigPrecision(field) {
	if (field.type != "number") {
		return 0;
	}
	if (field.precision != null) {
		return field.precision;
	}
	return field.step >= 1 ? 0 : 2;
}

function normalizeConfigValue(field, value) {
	if (field.type == "boolean") {
		return value === true || value == "true";
	}

	var number = parseFloat(value);
	if (isNaN(number)) {
		number = field.defaultValue;
	}
	number = Math.min(Math.max(number, field.min), field.max);

	if (field.step >= 1) {
		return parseInt(Math.round(number));
	}

	var precision = getConfigPrecision(field);
	return parseFloat(number.toFixed(precision));
}

function formatConfigValue(field, value) {
	if (field.type == "boolean") {
		return value ? "开启" : "关闭";
	}
	var normalized = normalizeConfigValue(field, value);
	if (field.step >= 1) {
		return String(normalized);
	}
	return normalized.toFixed(getConfigPrecision(field));
}

function getConfigValue(key) {
	switch (key) {
		case "PERFORMANCE_MODE": return PERFORMANCE_MODE;
		case "EFFICIENCY": return EFFICIENCY;
		case "SAFETY": return SAFETY;
		case "SAKIGIRI": return SAKIGIRI;
		case "CALL_PON_CHI": return CALL_PON_CHI;
		case "CALL_KAN": return CALL_KAN;
		case "RIICHI": return RIICHI;
		case "KEEP_SAFETILE": return KEEP_SAFETILE;
		case "MARK_TSUMOGIRI": return MARK_TSUMOGIRI;
		case "CHANGE_RECOMMEND_TILE_COLOR": return CHANGE_RECOMMEND_TILE_COLOR;
		case "THREE_PLAYER_PROFILE": return THREE_PLAYER_PROFILE;
		case "PLACEMENT_STRATEGY": return PLACEMENT_STRATEGY;
		case "LATE_GAME_TENPAI": return LATE_GAME_TENPAI;
		default: return null;
	}
}

function setConfigValue(key, value) {
	var field = getConfigField(key);
	if (field != null) {
		value = normalizeConfigValue(field, value);
	}
	switch (key) {
		case "PERFORMANCE_MODE": PERFORMANCE_MODE = parseInt(value); break;
		case "EFFICIENCY": EFFICIENCY = parseFloat(value); break;
		case "SAFETY": SAFETY = parseFloat(value); break;
		case "SAKIGIRI": SAKIGIRI = parseFloat(value); break;
		case "CALL_PON_CHI": CALL_PON_CHI = parseFloat(value); break;
		case "CALL_KAN": CALL_KAN = parseFloat(value); break;
		case "RIICHI": RIICHI = parseFloat(value); break;
		case "KEEP_SAFETILE": KEEP_SAFETILE = value === true || value == "true"; break;
		case "MARK_TSUMOGIRI": MARK_TSUMOGIRI = value === true || value == "true"; break;
		case "CHANGE_RECOMMEND_TILE_COLOR": CHANGE_RECOMMEND_TILE_COLOR = value === true || value == "true"; break;
		case "THREE_PLAYER_PROFILE": THREE_PLAYER_PROFILE = value === true || value == "true"; break;
		case "PLACEMENT_STRATEGY": PLACEMENT_STRATEGY = value === true || value == "true"; break;
		case "LATE_GAME_TENPAI": LATE_GAME_TENPAI = value === true || value == "true"; break;
	}
}

function saveConfigValue(key, value) {
	var field = getConfigField(key);
	if (field == null) {
		return null;
	}
	var normalized = normalizeConfigValue(field, value);
	setConfigValue(key, normalized);
	window.localStorage.setItem("alphajongConfig_" + key, normalized);
	return normalized;
}

function applyConfigPreset(preset) {
	for (let key in preset.values) {
		saveConfigValue(key, preset.values[key]);
	}
}

function loadStoredConfig() {
	for (let field of CONFIG_FIELDS) {
		var storedValue = window.localStorage.getItem("alphajongConfig_" + field.key);
		if (storedValue != null) {
			setConfigValue(field.key, normalizeConfigValue(field, storedValue));
		}
	}
}

function resetStoredConfig() {
	for (let field of CONFIG_FIELDS) {
		setConfigValue(field.key, field.defaultValue);
		if (typeof window.localStorage.removeItem == 'function') {
			window.localStorage.removeItem("alphajongConfig_" + field.key);
		}
	}
}

function isThreePlayerProfileActive() {
	try {
		return THREE_PLAYER_PROFILE && getNumberOfPlayers() == 3;
	}
	catch {
		return false;
	}
}

function getEffectiveSafety() {
	var factor = isThreePlayerProfileActive() ? THREE_PLAYER_SAFETY_FACTOR : 1;
	if (isPlacementStrategyActive()) {
		if (getOwnPlacement() == 1) {
			factor *= 1.15;
		}
		else if (getOwnPlacement() == getNumberOfPlayers()) {
			factor *= isLastGame() ? 0.90 : 0.96;
		}
		else if (getDistanceToLast() < -8000) {
			factor *= 1.05;
		}
	}
	return SAFETY * factor;
}

function getEffectiveEfficiency() {
	var factor = 1;
	if (isPlacementStrategyActive()) {
		if (getOwnPlacement() == getNumberOfPlayers()) {
			factor *= isLastGame() ? 1.12 : 1.07;
		}
		else if (getOwnPlacement() == 1 && getDistanceToFirst() < -8000) {
			factor *= 0.95;
		}
	}
	return EFFICIENCY * factor;
}

function getEffectiveCallPonChi() {
	var factor = isThreePlayerProfileActive() ? THREE_PLAYER_CALL_FACTOR : 1;
	if (isPlacementStrategyActive()) {
		if (getOwnPlacement() == getNumberOfPlayers()) {
			factor *= isLastGame() ? 1.12 : 1.07;
		}
		else if (getOwnPlacement() == 1 && getDistanceToFirst() < -6000) {
			factor *= 0.92;
		}
	}
	return CALL_PON_CHI * factor;
}

function getEffectiveCallKan() {
	var factor = isThreePlayerProfileActive() ? THREE_PLAYER_CALL_FACTOR : 1;
	if (isPlacementStrategyActive()) {
		if (getOwnPlacement() == 1 || getNumberOfRiichiOpponents() > 0) {
			factor *= 0.65;
		}
		else if (getOwnPlacement() == getNumberOfPlayers()) {
			factor *= 0.85;
		}
	}
	return CALL_KAN * factor;
}

function getEffectiveRiichi() {
	var factor = isThreePlayerProfileActive() ? THREE_PLAYER_RIICHI_FACTOR : 1;
	if (isPlacementStrategyActive()) {
		if (getOwnPlacement() == getNumberOfPlayers()) {
			factor *= 1.08;
		}
		else if (getOwnPlacement() == 1 && getDistanceToFirst() < -6000) {
			factor *= 0.92;
		}
	}
	return RIICHI * factor;
}

function isPlacementStrategyActive() {
	try {
		return PLACEMENT_STRATEGY && typeof getPlayerScore == 'function' && getNumberOfPlayers() >= 3;
	}
	catch {
		return false;
	}
}

function getOwnPlacement() {
	try {
		var ownScore = getPlayerScore(0);
		var placement = 1;
		for (var player = 1; player < getNumberOfPlayers(); player++) {
			if (getPlayerScore(player) > ownScore) {
				placement++;
			}
		}
		return placement;
	}
	catch {
		return 2;
	}
}

loadStoredConfig();
