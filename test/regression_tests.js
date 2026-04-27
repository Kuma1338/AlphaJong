const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

function loadContext() {
	const ctx = {
		window: {
			localStorage: {
				getItem() { return null; },
				setItem() {},
				removeItem() {}
			}
		},
		document: { body: { innerHTML: "" } },
		console,
		setTimeout() {},
		DEBUG: true
	};
	vm.createContext(ctx);

	[
		"src/parameters.js",
		"test/test_api.js",
		"src/ai_offense.js",
		"src/ai_defense.js",
		"src/utils.js",
		"src/yaku.js",
		"src/logging.js",
		"test/test_utils.js"
	].forEach(file => vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: file }));

	return ctx;
}

function runInContext(ctx, source) {
	return vm.runInContext(source, ctx);
}

function testOpenHandDiscardUsesTilesLeft() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		updateAvailableTiles();
		isClosed = false;
		tilesLeft = 3;
		var candidate = {
			tile: { index: 1, type: 1, dora: false, valid: true },
			valid: true,
			yaku: { open: 0 },
			danger: 0,
			score: { open: 1000, riichi: 1000 },
			waits: 0,
			shape: 0,
			shanten: 2,
			efficiency: 0
		};
		getTileName(getDiscardTile([candidate]));
	`);

	assert.strictEqual(result, "1m");
}

function testYakuhaiDangerUsesTileIndexTypeOrder() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		visibleTiles = [];
		var tile = { index: 5, type: 3, dora: false };
		var availableWithCorrectOrder = getNumberOfTilesAvailable(tile.index, tile.type);
		var availableWithOldOrder = getNumberOfTilesAvailable(tile.type, tile.index);
		availableWithCorrectOrder > 2 && availableWithOldOrder === 0;
	`);

	assert.strictEqual(result, true);
}

function testRiichiUsesGlobalDoraIndicators() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		dora = [
			{ index: 1, type: 0, dora: false },
			{ index: 2, type: 0, dora: false },
			{ index: 3, type: 0, dora: false }
		];
		tilesLeft = 20;
		seatWind = 2;
		var tilePrio = {
			waits: 1,
			dora: 0,
			shape: 1,
			score: { riichi: 3500, closed: 0 },
			yaku: { closed: 0 }
		};
		shouldRiichi(tilePrio);
	`);

	assert.strictEqual(result, true);
}

function testNoInfinityWhenNoPossibleWaits() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		visibleTiles = [];
		for (var type = 0; type <= 3; type++) {
			for (var index = 1; index <= 9; index++) {
				if (type == 3 && index > 7) {
					break;
				}
				for (var copy = 0; copy < 4; copy++) {
					visibleTiles.push({ index: index, type: type, dora: false });
				}
			}
		}
		availableTiles = [];
		var chance = getDealInChanceForTileAndPlayer(1, { index: 5, type: 0, dora: false });
		Number.isFinite(chance) && chance === 0;
	`);

	assert.strictEqual(result, true);
}

function testExpectedDoraHandlesEmptyWall() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		availableTiles = [];
		var expectedDora = getExpectedDoraInHand(1);
		Number.isFinite(expectedDora);
	`);

	assert.strictEqual(result, true);
}

function testHandValuesStayFiniteWithTinyWall() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		ownHand = getTilesFromString("123456789m12344p");
		availableTiles = [{ index: 1, type: 0, dora: false, doraValue: 0 }];
		var value = getHandValues(ownHand.slice(1), ownHand[0]);
		Number.isFinite(value.priority) && Number.isFinite(value.efficiency);
	`);

	assert.strictEqual(result, true);
}

async function testCallTripleDeclinesEmptyCombinations() {
	const ctx = loadContext();
	const result = await runInContext(ctx, `
		(async function () {
			resetGlobals();
			testCallTile = { index: 5, type: 0, dora: false, doraValue: 0 };
			ownHand = getTilesFromString("123456789m12344p");
			updateAvailableTiles();
			return await callTriple([], 3);
		})()
	`);

	assert.strictEqual(result, false);
}

function testSujiTerminalIsSaferThanNoSuji() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		updateAvailableTiles();
		var onePin = { index: 1, type: 0, dora: false };
		var dangerWithoutSuji = getTileDangerForPlayer(onePin, 1);
		discards[1] = [{ index: 4, type: 0, dora: false }];
		totalPossibleWaits = {};
		var dangerWithSuji = getTileDangerForPlayer(onePin, 1);
		dangerWithSuji < dangerWithoutSuji;
	`);

	assert.strictEqual(result, true);
}

function testCountsRiichiOpponents() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		testPlayerRiichi = [0, 1, 0, 1];
		getNumberOfRiichiOpponents();
	`);

	assert.strictEqual(result, 2);
}

function testThreePlayerProfileAdjustsEffectiveWeights() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		THREE_PLAYER_PROFILE = true;
		PLACEMENT_STRATEGY = false;
		doesPlayerExist = function(player) { return player < 3; };
		Math.abs(getEffectiveSafety() - (SAFETY * THREE_PLAYER_SAFETY_FACTOR)) < 0.0001 &&
			Math.abs(getEffectiveCallPonChi() - (CALL_PON_CHI * THREE_PLAYER_CALL_FACTOR)) < 0.0001 &&
			Math.abs(getEffectiveRiichi() - (RIICHI * THREE_PLAYER_RIICHI_FACTOR)) < 0.0001;
	`);

	assert.strictEqual(result, true);
}

function testPlacementStrategyAdjustsEffectiveWeights() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		PLACEMENT_STRATEGY = true;
		THREE_PLAYER_PROFILE = false;
		getPlayerScore = function(player) { return [18000, 32000, 26000, 24000][player]; };
		var lastPlacePush = getEffectiveEfficiency() > EFFICIENCY &&
			getEffectiveCallPonChi() > CALL_PON_CHI &&
			getEffectiveSafety() < SAFETY;
		getPlayerScore = function(player) { return [36000, 25000, 21000, 18000][player]; };
		var firstPlaceProtect = getEffectiveSafety() > SAFETY &&
			getEffectiveCallKan() < CALL_KAN &&
			getEffectiveRiichi() < RIICHI;
		lastPlacePush && firstPlaceProtect;
	`);

	assert.strictEqual(result, true);
}

function testLateTenpaiBonusRewardsTenpaiWhenSafe() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		LATE_GAME_TENPAI = true;
		tilesLeft = 6;
		discards = [[], [], [], []];
		calls = [[], [], [], []];
		var tenpaiBonus = getLateGameTenpaiBonus(0, 4);
		var twoShantenBonus = getLateGameTenpaiBonus(2, 0);
		tenpaiBonus > 0 && twoShantenBonus === 0;
	`);

	assert.strictEqual(result, true);
}

function testLateNoTenPushAvoidsAutomaticFoldWhenSafe() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		LATE_GAME_TENPAI = true;
		tilesLeft = 6;
		discards = [[], [], [], []];
		calls = [[], [], [], []];
		shouldPushLateNoTen({ shanten: 2, danger: 100 });
	`);

	assert.strictEqual(result, true);
}

function testConfigValuesClampAndKeepPrecision() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		saveConfigValue("SAFETY", 1.35);
		var precise = SAFETY === 1.35 && formatConfigValue(getConfigField("SAFETY"), SAFETY) === "1.35";
		saveConfigValue("CALL_KAN", 9);
		var clampedHigh = CALL_KAN === 2;
		saveConfigValue("RIICHI", -1);
		var clampedLow = RIICHI === 0;
		precise && clampedHigh && clampedLow;
	`);

	assert.strictEqual(result, true);
}

function testConfigPresetAppliesExpectedValues() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		var preset = CONFIG_PRESETS.find(p => p.name == "避四少放铳");
		applyConfigPreset(preset);
		SAFETY === 1.35 && CALL_KAN === 0.20 && KEEP_SAFETILE === true &&
			RIICHI === 0.90 && PLACEMENT_STRATEGY === true && LATE_GAME_TENPAI === true;
	`);

	assert.strictEqual(result, true);
}

function testDecisionHistoryTrimsAndFormats() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		for (var i = 0; i < DECISION_HISTORY_LIMIT + 2; i++) {
			recordDecision("弃牌: " + i);
		}
		decisionHistory.length == DECISION_HISTORY_LIMIT &&
			getDecisionHistoryText().includes("弃牌: " + (DECISION_HISTORY_LIMIT + 1));
	`);

	assert.strictEqual(result, true);
}

function testExportDataAndClearDecisionHistory() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		recordDecision("弃牌: 1m");
		var exported = getDecisionHistoryExportData();
		var bugReport = getBugReportExportData();
		clearDecisionHistory();
		exported.decisions.length == 1 &&
			exported.config.SAFETY == SAFETY &&
			exported.strategyLog.length >= 1 &&
			bugReport.decisions.length == 1 &&
			bugReport.strategyLog.length >= 1 &&
			decisionHistory.length == 0;
	`);

	assert.strictEqual(result, true);
}

function testMatchResultRecordsRankAndPersists() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		var stored = {};
		window.localStorage.setItem = function(key, value) { stored[key] = value; };
		var endscreenShown = true;
		var scores = [18000, 32000, 26000, 24000];
		isEndscreenShown = function() { return endscreenShown; };
		getPlayerScore = function(player) { return scores[player]; };
		var didRecord = recordMatchResultIfNeeded();
		scores = [12000, 36000, 28000, 24000];
		var duplicate = recordMatchResultIfNeeded();
		endscreenShown = false;
		recordMatchResultIfNeeded();
		endscreenShown = true;
		var nextGame = recordMatchResultIfNeeded();
		didRecord === true &&
			duplicate === false &&
			nextGame === true &&
			matchHistory.length === 2 &&
			matchHistory[1].ownRank === 4 &&
			stored.alphajongMatchHistory != null;
	`);

	assert.strictEqual(result, true);
}

function testMatchResultSnapshotRanksPlayers() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		getPlayerScore = function(player) { return [18000, 32000, 26000, 24000][player]; };
		var snapshot = getMatchResultSnapshot();
		snapshot.ownRank === 4 &&
			snapshot.ownScore === 18000 &&
			snapshot.players.length === 4 &&
			snapshot.players.find(player => player.localPosition == 1).rank === 1;
	`);

	assert.strictEqual(result, true);
}

function testStrategyLogExportIncludesLogsAndMatches() {
	const ctx = loadContext();
	const result = runInContext(ctx, `
		resetGlobals();
		recordStrategyLog("测试", "策略日志");
		matchHistory.unshift({ ownRank: 2, ownScore: 26000, players: [] });
		var exported = getStrategyLogExportData();
		exported.logs.length >= 1 && exported.matchHistory.length == 1;
	`);

	assert.strictEqual(result, true);
}

async function main() {
	testOpenHandDiscardUsesTilesLeft();
	testYakuhaiDangerUsesTileIndexTypeOrder();
	testRiichiUsesGlobalDoraIndicators();
	testNoInfinityWhenNoPossibleWaits();
	testExpectedDoraHandlesEmptyWall();
	testHandValuesStayFiniteWithTinyWall();
	await testCallTripleDeclinesEmptyCombinations();
	testSujiTerminalIsSaferThanNoSuji();
	testCountsRiichiOpponents();
	testThreePlayerProfileAdjustsEffectiveWeights();
	testPlacementStrategyAdjustsEffectiveWeights();
	testLateTenpaiBonusRewardsTenpaiWhenSafe();
	testLateNoTenPushAvoidsAutomaticFoldWhenSafe();
	testConfigValuesClampAndKeepPrecision();
	testConfigPresetAppliesExpectedValues();
	testDecisionHistoryTrimsAndFormats();
	testExportDataAndClearDecisionHistory();
	testMatchResultRecordsRankAndPersists();
	testMatchResultSnapshotRanksPlayers();
	testStrategyLogExportIncludesLogsAndMatches();
	console.log("Regression tests passed.");
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
