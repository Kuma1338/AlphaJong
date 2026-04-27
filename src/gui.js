//################################
// GUI
// Adds elements like buttons to control the bot
//################################

var guiDiv = document.createElement("div");
var guiSpan = document.createElement("span");
var startButton = document.createElement("button");
var aimodeCombobox = document.createElement("select");
var autorunCheckbox = document.createElement("input");
var roomCombobox = document.createElement("select");
var currentActionOutput = document.createElement("input");
var compatibilityButton = document.createElement("button");
var settingsButton = document.createElement("button");
var historyButton = document.createElement("button");
var debugButton = document.createElement("button");
var hideButton = document.createElement("button");
var settingsDiv = document.createElement("div");
var historyDiv = document.createElement("div");
var historyText = document.createElement("textarea");

function initGui() {
	if (getRooms() == null) { // Wait for minimal loading to be done
		setTimeout(initGui, 1000);
		return;
	}

	guiDiv.style.position = "absolute";
	guiDiv.style.zIndex = "100001"; //On top of the game
	guiDiv.style.left = "0px";
	guiDiv.style.top = "0px";
	guiDiv.style.width = "100%";
	guiDiv.style.textAlign = "center";
	guiDiv.style.fontSize = "20px";

	guiSpan.style.backgroundColor = "rgba(255,255,255,0.5)";
	guiSpan.style.padding = "5px";

	startButton.innerHTML = "启动";
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		startButton.innerHTML = "暂停";
	}
	startButton.style.marginRight = "15px";
	startButton.onclick = function () {
		toggleRun();
	};
	guiSpan.appendChild(startButton);

	refreshAIMode();
	aimodeCombobox.style.marginRight = "15px";
	aimodeCombobox.onchange = function() {
		aiModeChange();
	};
	guiSpan.appendChild(aimodeCombobox);

	autorunCheckbox.type = "checkbox";
	autorunCheckbox.id = "autorun";
	autorunCheckbox.onclick = function () {
		autorunCheckboxClick();
	};
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		autorunCheckbox.checked = true;
	}
	guiSpan.appendChild(autorunCheckbox);
	var checkboxLabel = document.createElement("label");
	checkboxLabel.htmlFor = "autorun";
	checkboxLabel.appendChild(document.createTextNode('自动开局'));
	checkboxLabel.style.marginRight = "15px";
	guiSpan.appendChild(checkboxLabel);

	refreshRoomSelection();

	roomCombobox.style.marginRight = "15px";
	roomCombobox.onchange = function () {
		roomChange();
	};

	if (window.localStorage.getItem("alphajongAutorun") != "true") {
		roomCombobox.disabled = true;
	}
	guiSpan.appendChild(roomCombobox);

	currentActionOutput.readOnly = "true";
	currentActionOutput.size = "72";
	currentActionOutput.style.marginRight = "15px";
	showCrtActionMsg("脚本未运行。");
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		showCrtActionMsg("脚本已启动。");
	}
	guiSpan.appendChild(currentActionOutput);

	compatibilityButton.innerHTML = "检查";
	compatibilityButton.style.marginRight = "15px";
	compatibilityButton.onclick = function () {
		clearCrtStrategyMsg();
		showCrtActionMsg(getCompatibilitySummary());
	};
	guiSpan.appendChild(compatibilityButton);

	settingsButton.innerHTML = "设置";
	settingsButton.style.marginRight = "15px";
	settingsButton.onclick = function () {
		toggleSettings();
	};
	guiSpan.appendChild(settingsButton);

	historyButton.innerHTML = "记录";
	historyButton.style.marginRight = "15px";
	historyButton.onclick = function () {
		toggleHistoryPanel();
	};
	guiSpan.appendChild(historyButton);

	debugButton.innerHTML = "调试";
	debugButton.onclick = function () {
		showDebugString();
	};
	if (DEBUG_BUTTON) {
		guiSpan.appendChild(debugButton);
	}

	hideButton.innerHTML = "隐藏";
	hideButton.onclick = function () {
		toggleGui();
	};
	guiSpan.appendChild(hideButton);

	guiDiv.appendChild(guiSpan);
	buildSettingsPanel();
	guiDiv.appendChild(settingsDiv);
	buildHistoryPanel();
	document.body.appendChild(historyDiv);
	document.body.appendChild(guiDiv);
	toggleGui();
}

function toggleGui() {
	if (guiDiv.style.display == "block") {
		guiDiv.style.display = "none";
		historyDiv.style.display = "none";
	}
	else {
		guiDiv.style.display = "block";
	}
}

function showDebugString() {
	if (isInGame()) {
		setData();
		showCrtActionMsg(getDebugString());
	}
	else {
		showCrtActionMsg("调试串需要在对局中生成。");
	}
}

function toggleSettings() {
	settingsDiv.style.display = settingsDiv.style.display == "block" ? "none" : "block";
}

function buildSettingsPanel() {
	settingsDiv.innerHTML = "";
	settingsDiv.style.display = "none";
	settingsDiv.style.margin = "6px auto 0 auto";
	settingsDiv.style.padding = "6px";
	settingsDiv.style.width = "780px";
	settingsDiv.style.maxWidth = "96%";
	settingsDiv.style.backgroundColor = "rgba(255,255,255,0.75)";
	settingsDiv.style.fontSize = "14px";
	settingsDiv.style.textAlign = "left";

	var grid = document.createElement("div");
	grid.style.display = "grid";
	grid.style.gridTemplateColumns = "repeat(2, minmax(260px, 1fr))";
	grid.style.gap = "6px 16px";

	for (let field of CONFIG_FIELDS) {
		grid.appendChild(createConfigControl(field));
	}
	settingsDiv.appendChild(grid);

	var resetButton = document.createElement("button");
	resetButton.innerHTML = "恢复默认";
	resetButton.style.marginTop = "8px";
	resetButton.onclick = function () {
		resetStoredConfig();
		buildSettingsPanel();
		showCrtActionMsg("设置已恢复默认。");
	};
	settingsDiv.appendChild(resetButton);
}

function createConfigControl(field) {
	var wrapper = document.createElement("label");
	wrapper.style.display = "flex";
	wrapper.style.alignItems = "center";
	wrapper.style.justifyContent = "space-between";
	wrapper.style.gap = "8px";

	var label = document.createElement("span");
	label.innerHTML = field.label;
	label.style.minWidth = "110px";
	wrapper.appendChild(label);

	if (field.type == "boolean") {
		var checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.checked = getConfigValue(field.key);
		checkbox.onchange = function () {
			setConfigValue(field.key, checkbox.checked);
			window.localStorage.setItem("alphajongConfig_" + field.key, checkbox.checked);
			showCrtActionMsg(field.label + ": " + (checkbox.checked ? "开启" : "关闭"));
		};
		wrapper.appendChild(checkbox);
		return wrapper;
	}

	var slider = document.createElement("input");
	slider.type = "range";
	slider.min = field.min;
	slider.max = field.max;
	slider.step = field.step;
	slider.value = getConfigValue(field.key);
	slider.style.flex = "1";

	var valueLabel = document.createElement("span");
	valueLabel.innerHTML = slider.value;
	valueLabel.style.width = "34px";
	valueLabel.style.textAlign = "right";

	slider.oninput = function () {
		valueLabel.innerHTML = slider.value;
	};
	slider.onchange = function () {
		setConfigValue(field.key, slider.value);
		window.localStorage.setItem("alphajongConfig_" + field.key, slider.value);
		showCrtActionMsg(field.label + ": " + slider.value);
	};

	wrapper.appendChild(slider);
	wrapper.appendChild(valueLabel);
	return wrapper;
}

function buildHistoryPanel() {
	historyDiv.innerHTML = "";
	historyDiv.style.display = "none";
	historyDiv.style.position = "fixed";
	historyDiv.style.zIndex = "100002";
	historyDiv.style.right = "10px";
	historyDiv.style.top = "54px";
	historyDiv.style.width = "520px";
	historyDiv.style.maxWidth = "94%";
	historyDiv.style.backgroundColor = "rgba(255,255,255,0.92)";
	historyDiv.style.border = "1px solid rgba(0,0,0,0.35)";
	historyDiv.style.padding = "8px";
	historyDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
	historyDiv.style.fontSize = "14px";
	historyDiv.style.textAlign = "left";

	var title = document.createElement("div");
	title.innerHTML = "策略记录";
	title.style.fontWeight = "bold";
	title.style.marginBottom = "6px";
	historyDiv.appendChild(title);

	historyText.readOnly = true;
	historyText.style.width = "100%";
	historyText.style.height = "260px";
	historyText.style.resize = "vertical";
	historyText.style.boxSizing = "border-box";
	historyText.style.fontSize = "12px";
	historyText.style.lineHeight = "1.35";
	historyDiv.appendChild(historyText);

	var buttonRow = document.createElement("div");
	buttonRow.style.marginTop = "8px";
	buttonRow.style.display = "flex";
	buttonRow.style.gap = "6px";
	buttonRow.style.flexWrap = "wrap";

	buttonRow.appendChild(createHistoryPanelButton("刷新", refreshHistoryPanel));
	buttonRow.appendChild(createHistoryPanelButton("导出策略记录", function () {
		exportJson("alphajong_strategy_log", getDecisionHistoryExportData());
	}));
	buttonRow.appendChild(createHistoryPanelButton("导出BUG数据", function () {
		exportJson("alphajong_bug_report", getBugReportExportData());
	}));
	buttonRow.appendChild(createHistoryPanelButton("清空", function () {
		clearDecisionHistory();
		refreshHistoryPanel();
		showCrtActionMsg("策略记录已清空。");
	}));
	buttonRow.appendChild(createHistoryPanelButton("关闭", function () {
		historyDiv.style.display = "none";
	}));

	historyDiv.appendChild(buttonRow);
	refreshHistoryPanel();
}

function createHistoryPanelButton(text, callback) {
	var button = document.createElement("button");
	button.innerHTML = text;
	button.onclick = callback;
	return button;
}

function toggleHistoryPanel() {
	if (historyDiv.style.display == "block") {
		historyDiv.style.display = "none";
		return;
	}
	refreshHistoryPanel();
	historyDiv.style.display = "block";
}

function refreshHistoryPanel() {
	historyText.value = getDecisionHistoryText();
}

function exportJson(prefix, data) {
	var text = JSON.stringify(data, null, 2);
	var filename = prefix + "_" + new Date().toISOString().replace(/[:.]/g, "-") + ".json";

	if (typeof Blob == 'undefined' || typeof URL == 'undefined' || typeof URL.createObjectURL != 'function') {
		showCrtActionMsg("当前浏览器不支持导出。");
		return;
	}

	var blob = new Blob([text], { type: "application/json;charset=utf-8" });
	var url = URL.createObjectURL(blob);
	var link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(function () {
		URL.revokeObjectURL(url);
	}, 1000);
	showCrtActionMsg("已导出: " + filename);
}

function aiModeChange() {
	window.localStorage.setItem("alphajongAIMode", aimodeCombobox.value);
	MODE = parseInt(aimodeCombobox.value);

	setAutoCallWin(MODE === AIMODE.AUTO);
}

function roomChange() {
	window.localStorage.setItem("alphajongRoom", roomCombobox.value);
	ROOM = roomCombobox.value;
}

function hideButtonClick() {
	guiDiv.style.display = "none";
}

function autorunCheckboxClick() {
	if (autorunCheckbox.checked) {
		roomCombobox.disabled = false;
		window.localStorage.setItem("alphajongAutorun", "true");
		AUTORUN = true;
	}
	else {
		roomCombobox.disabled = true;
		window.localStorage.setItem("alphajongAutorun", "false");
		AUTORUN = false;
	}
}

// Refresh the AI mode
function refreshAIMode() {
	aimodeCombobox.innerHTML = AIMODE_NAME[MODE];
	for (let i = 0; i < AIMODE_NAME.length; i++) {
		var option = document.createElement("option");
		option.text = AIMODE_NAME[i];
		option.value = i;
		aimodeCombobox.appendChild(option);
	}
	aimodeCombobox.value = MODE;
}

// Refresh the contents of the Room Selection Combobox with values appropiate for the rank
function refreshRoomSelection() {
	roomCombobox.innerHTML = ""; // Clear old entries
	getRooms().forEach(function (room) {
		if (isInRank(room.id) && room.mode != 0) { // Rooms with mode = 0 are 1 Game only, not sure why they are in the code but not selectable in the UI...
			var option = document.createElement("option");
			option.text = getRoomName(room);
			option.value = room.id;
			roomCombobox.appendChild(option);
		}
	});
	roomCombobox.value = ROOM;
}

// Show msg to currentActionOutput
function showCrtActionMsg(msg) {
	if (!showingStrategy) {
		currentActionOutput.value =  msg;
	}
}

// Apend msg to currentActionOutput
function showCrtStrategyMsg(msg) {
	showingStrategy = true;
	currentActionOutput.value = msg;
}

function clearCrtStrategyMsg() {
	showingStrategy = false;
	currentActionOutput.value = "";
}
