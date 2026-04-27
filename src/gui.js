//################################
// GUI
// Adds elements like buttons to control the bot
//################################

var guiDiv = document.createElement("div");
var guiSpan = document.createElement("span");
var launcherButton = document.createElement("button");
var startButton = document.createElement("button");
var aimodeCombobox = document.createElement("select");
var autorunCheckbox = document.createElement("input");
var roomCombobox = document.createElement("select");
var currentActionOutput = document.createElement("input");
var compatibilityButton = document.createElement("button");
var settingsButton = document.createElement("button");
var historyButton = document.createElement("button");
var boardInfoButton = document.createElement("button");
var debugButton = document.createElement("button");
var settingsDiv = document.createElement("div");
var historyDiv = document.createElement("div");
var historyText = document.createElement("textarea");
var boardInfoDiv = document.createElement("div");
var boardInfoText = document.createElement("textarea");
var guiDrag = {
	dragging: false,
	moved: false,
	startX: 0,
	startY: 0,
	left: 0,
	top: 0
};
var panelDrag = {
	dragging: false,
	panel: null,
	key: "",
	startX: 0,
	startY: 0,
	left: 0,
	top: 0
};

function initGui() {
	if (getRooms() == null) { // Wait for minimal loading to be done
		setTimeout(initGui, 1000);
		return;
	}

	guiDiv.style.position = "fixed";
	guiDiv.style.zIndex = "100001"; //On top of the game
	guiDiv.style.left = getStoredGuiPosition("left", 14) + "px";
	guiDiv.style.top = getStoredGuiPosition("top", 140) + "px";
	guiDiv.style.width = "320px";
	guiDiv.style.maxWidth = "calc(100% - 24px)";
	guiDiv.style.textAlign = "left";
	guiDiv.style.fontSize = "13px";
	guiDiv.style.fontFamily = "Arial, sans-serif";

	launcherButton.innerHTML = "AJ";
	launcherButton.title = "AlphaJong";
	launcherButton.style.width = "46px";
	launcherButton.style.height = "46px";
	launcherButton.style.borderRadius = "8px";
	launcherButton.style.border = "1px solid rgba(0,0,0,0.35)";
	launcherButton.style.backgroundColor = "rgba(255,255,255,0.9)";
	launcherButton.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
	launcherButton.style.fontWeight = "bold";
	launcherButton.style.fontSize = "15px";
	launcherButton.style.cursor = "move";
	launcherButton.onmousedown = startGuiDrag;
	launcherButton.ontouchstart = startGuiDrag;
	launcherButton.onclick = function () {
		if (guiDrag.moved) {
			guiDrag.moved = false;
			return;
		}
		toggleGui();
	};
	guiDiv.appendChild(launcherButton);

	guiSpan.style.display = "none";
	guiSpan.style.marginTop = "6px";
	guiSpan.style.backgroundColor = "rgba(255,255,255,0.92)";
	guiSpan.style.border = "1px solid rgba(0,0,0,0.32)";
	guiSpan.style.borderRadius = "8px";
	guiSpan.style.boxShadow = "0 2px 10px rgba(0,0,0,0.25)";
	guiSpan.style.padding = "8px";
	guiSpan.style.width = "100%";
	guiSpan.style.boxSizing = "border-box";

	var header = document.createElement("div");
	header.style.display = "flex";
	header.style.alignItems = "center";
	header.style.justifyContent = "space-between";
	header.style.marginBottom = "8px";
	header.style.cursor = "move";
	header.onmousedown = startGuiDrag;
	header.ontouchstart = startGuiDrag;
	var title = document.createElement("span");
	title.innerHTML = "AlphaJong · 拖动移动";
	title.style.fontWeight = "bold";
	header.appendChild(title);
	var compactButton = document.createElement("button");
	compactButton.innerHTML = "收起";
	compactButton.onclick = function () {
		collapseGui();
	};
	header.appendChild(compactButton);
	guiSpan.appendChild(header);

	var controlRow = document.createElement("div");
	controlRow.style.display = "grid";
	controlRow.style.gridTemplateColumns = "repeat(3, 1fr)";
	controlRow.style.gap = "6px";

	startButton.innerHTML = "启动";
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		startButton.innerHTML = "暂停";
	}
	startButton.onclick = function () {
		toggleRun();
	};
	controlRow.appendChild(startButton);

	refreshAIMode();
	aimodeCombobox.onchange = function() {
		aiModeChange();
	};
	controlRow.appendChild(aimodeCombobox);

	compatibilityButton.innerHTML = "检查";
	compatibilityButton.onclick = function () {
		clearCrtStrategyMsg();
		showCrtActionMsg(getCompatibilitySummary());
	};
	controlRow.appendChild(compatibilityButton);

	settingsButton.innerHTML = "设置";
	settingsButton.onclick = function () {
		toggleSettings();
	};
	controlRow.appendChild(settingsButton);

	historyButton.innerHTML = "记录";
	historyButton.onclick = function () {
		toggleHistoryPanel();
	};
	controlRow.appendChild(historyButton);

	boardInfoButton.innerHTML = "牌局";
	boardInfoButton.onclick = function () {
		toggleBoardInfoPanel();
	};
	controlRow.appendChild(boardInfoButton);

	if (DEBUG_BUTTON) {
		debugButton.innerHTML = "调试";
		debugButton.onclick = function () {
			showDebugString();
		};
		controlRow.appendChild(debugButton);
	}
	guiSpan.appendChild(controlRow);

	var autorunRow = document.createElement("label");
	autorunRow.style.display = "flex";
	autorunRow.style.alignItems = "center";
	autorunRow.style.gap = "6px";
	autorunRow.style.marginTop = "8px";
	autorunCheckbox.type = "checkbox";
	autorunCheckbox.id = "autorun";
	autorunCheckbox.onclick = function () {
		autorunCheckboxClick();
	};
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		autorunCheckbox.checked = true;
	}
	autorunRow.appendChild(autorunCheckbox);
	autorunRow.appendChild(document.createTextNode("自动开局"));
	guiSpan.appendChild(autorunRow);

	refreshRoomSelection();

	roomCombobox.style.width = "100%";
	roomCombobox.style.marginTop = "6px";
	roomCombobox.onchange = function () {
		roomChange();
	};

	if (window.localStorage.getItem("alphajongAutorun") != "true") {
		roomCombobox.disabled = true;
	}
	guiSpan.appendChild(roomCombobox);

	currentActionOutput.readOnly = "true";
	currentActionOutput.size = "28";
	currentActionOutput.style.width = "100%";
	currentActionOutput.style.boxSizing = "border-box";
	currentActionOutput.style.marginTop = "6px";
	currentActionOutput.style.fontSize = "12px";
	showCrtActionMsg("脚本未运行。");
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		showCrtActionMsg("脚本已启动。");
	}
	guiSpan.appendChild(currentActionOutput);

	guiDiv.appendChild(guiSpan);
	buildSettingsPanel();
	guiDiv.appendChild(settingsDiv);
	buildHistoryPanel();
	buildBoardInfoPanel();
	document.body.appendChild(historyDiv);
	document.body.appendChild(boardInfoDiv);
	document.body.appendChild(guiDiv);
	clampGuiPosition();
	collapseGui();
	updateLauncherState();
}

function getStoredGuiPosition(axis, fallback) {
	var value = parseInt(window.localStorage.getItem("alphajongGui" + axis));
	return isNaN(value) ? fallback : value;
}

function getPointerPosition(event) {
	var pointer = event.touches && event.touches.length > 0 ? event.touches[0] : event;
	return { x: pointer.clientX, y: pointer.clientY };
}

function startGuiDrag(event) {
	if (event.button != null && event.button !== 0) {
		return;
	}
	var pointer = getPointerPosition(event);
	guiDrag.dragging = true;
	guiDrag.moved = false;
	guiDrag.startX = pointer.x;
	guiDrag.startY = pointer.y;
	guiDrag.left = parseInt(guiDiv.style.left) || 0;
	guiDrag.top = parseInt(guiDiv.style.top) || 0;
	document.addEventListener("mousemove", moveGuiDrag);
	document.addEventListener("mouseup", endGuiDrag);
	document.addEventListener("touchmove", moveGuiDrag, { passive: false });
	document.addEventListener("touchend", endGuiDrag);
	event.stopPropagation();
}

function moveGuiDrag(event) {
	if (!guiDrag.dragging) {
		return;
	}
	var pointer = getPointerPosition(event);
	var deltaX = pointer.x - guiDrag.startX;
	var deltaY = pointer.y - guiDrag.startY;
	if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
		guiDrag.moved = true;
	}
	guiDiv.style.left = (guiDrag.left + deltaX) + "px";
	guiDiv.style.top = (guiDrag.top + deltaY) + "px";
	clampGuiPosition();
	event.preventDefault();
	event.stopPropagation();
}

function endGuiDrag(event) {
	if (!guiDrag.dragging) {
		return;
	}
	guiDrag.dragging = false;
	document.removeEventListener("mousemove", moveGuiDrag);
	document.removeEventListener("mouseup", endGuiDrag);
	document.removeEventListener("touchmove", moveGuiDrag);
	document.removeEventListener("touchend", endGuiDrag);
	saveGuiPosition();
	if (event != null) {
		event.stopPropagation();
	}
}

function clampGuiPosition() {
	var maxLeft = Math.max(0, window.innerWidth - Math.min(guiDiv.offsetWidth || 320, window.innerWidth));
	var maxTop = Math.max(0, window.innerHeight - (launcherButton.offsetHeight || 46));
	var left = Math.min(Math.max(parseInt(guiDiv.style.left) || 0, 0), maxLeft);
	var top = Math.min(Math.max(parseInt(guiDiv.style.top) || 0, 0), maxTop);
	guiDiv.style.left = left + "px";
	guiDiv.style.top = top + "px";
}

function saveGuiPosition() {
	window.localStorage.setItem("alphajongGuileft", parseInt(guiDiv.style.left) || 0);
	window.localStorage.setItem("alphajongGuitop", parseInt(guiDiv.style.top) || 0);
}

function toggleGui() {
	if (guiSpan.style.display == "block") {
		collapseGui();
	}
	else {
		expandGui();
	}
}

function expandGui() {
	guiSpan.style.display = "block";
	launcherButton.style.display = "none";
}

function collapseGui() {
	guiSpan.style.display = "none";
	launcherButton.style.display = "block";
	settingsDiv.style.display = "none";
	historyDiv.style.display = "none";
	boardInfoDiv.style.display = "none";
}

function updateLauncherState() {
	launcherButton.style.borderColor = run ? "rgba(31,130,76,0.9)" : "rgba(0,0,0,0.35)";
	launcherButton.style.color = run ? "#136f3a" : "#222";
	launcherButton.title = run ? "AlphaJong 正在运行" : "AlphaJong 已暂停";
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
	if (settingsDiv.style.display == "block") {
		settingsDiv.style.display = "none";
		return;
	}
	settingsDiv.style.maxHeight = getSettingsPanelMaxHeight() + "px";
	settingsDiv.style.display = "block";
}

function buildSettingsPanel(keepOpen = false) {
	var wasOpen = settingsDiv.style.display == "block";
	settingsDiv.innerHTML = "";
	settingsDiv.style.display = keepOpen || wasOpen ? "block" : "none";
	settingsDiv.style.margin = "6px 0 0 0";
	settingsDiv.style.padding = "6px";
	settingsDiv.style.width = "100%";
	settingsDiv.style.backgroundColor = "rgba(255,255,255,0.75)";
	settingsDiv.style.fontSize = "14px";
	settingsDiv.style.textAlign = "left";
	settingsDiv.style.boxSizing = "border-box";
	settingsDiv.style.maxHeight = getSettingsPanelMaxHeight() + "px";
	settingsDiv.style.overflowY = "auto";
	settingsDiv.style.overflowX = "hidden";

	var presetTitle = document.createElement("div");
	presetTitle.innerHTML = "参数预设";
	presetTitle.style.fontWeight = "bold";
	presetTitle.style.marginBottom = "6px";
	settingsDiv.appendChild(presetTitle);

	var presetGrid = document.createElement("div");
	presetGrid.style.display = "grid";
	presetGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
	presetGrid.style.gap = "6px";
	presetGrid.style.marginBottom = "8px";

	for (let preset of CONFIG_PRESETS) {
		presetGrid.appendChild(createPresetButton(preset));
	}
	settingsDiv.appendChild(presetGrid);

	var grid = document.createElement("div");
	grid.style.display = "grid";
	grid.style.gridTemplateColumns = "1fr";
	grid.style.gap = "6px";

	for (let field of CONFIG_FIELDS) {
		grid.appendChild(createConfigControl(field));
	}
	settingsDiv.appendChild(grid);

	var resetButton = document.createElement("button");
	resetButton.innerHTML = "恢复默认";
	resetButton.style.marginTop = "8px";
	resetButton.onclick = function () {
		resetStoredConfig();
		buildSettingsPanel(true);
		showCrtActionMsg("设置已恢复默认。");
	};
	settingsDiv.appendChild(resetButton);
}

function getSettingsPanelMaxHeight() {
	var top = parseInt(guiDiv.style.top) || 0;
	var measuredHeight = guiSpan.offsetHeight || 0;
	var mainPanelHeight = guiSpan.style.display == "block" ? Math.max(220, measuredHeight) : 120;
	return Math.max(240, window.innerHeight - top - mainPanelHeight - 24);
}

function createPresetButton(preset) {
	var button = document.createElement("button");
	button.innerHTML = preset.name;
	button.title = preset.description;
	button.style.minHeight = "32px";
	button.onclick = function () {
		applyConfigPreset(preset);
		buildSettingsPanel(true);
		showCrtActionMsg("已应用预设: " + preset.name);
	};
	return button;
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
			saveConfigValue(field.key, checkbox.checked);
			showCrtActionMsg(field.label + ": " + (checkbox.checked ? "开启" : "关闭"));
		};
		wrapper.appendChild(checkbox);
		return wrapper;
	}

	var inputWrapper = document.createElement("div");
	inputWrapper.style.display = "flex";
	inputWrapper.style.alignItems = "center";
	inputWrapper.style.gap = "6px";
	inputWrapper.style.flex = "1";

	var slider = document.createElement("input");
	slider.type = "range";
	slider.min = field.min;
	slider.max = field.max;
	slider.step = field.step;
	slider.value = formatConfigValue(field, getConfigValue(field.key));
	slider.style.flex = "1";

	var numberInput = document.createElement("input");
	numberInput.type = "number";
	numberInput.min = field.min;
	numberInput.max = field.max;
	numberInput.step = field.step;
	numberInput.value = formatConfigValue(field, getConfigValue(field.key));
	numberInput.style.width = "58px";
	numberInput.style.boxSizing = "border-box";
	numberInput.title = "可手动输入，范围 " + field.min + " - " + field.max;

	slider.oninput = function () {
		numberInput.value = formatConfigValue(field, slider.value);
	};
	slider.onchange = function () {
		var value = saveConfigValue(field.key, slider.value);
		numberInput.value = formatConfigValue(field, value);
		showCrtActionMsg(field.label + ": " + formatConfigValue(field, value));
	};

	numberInput.onchange = function () {
		var value = saveConfigValue(field.key, numberInput.value);
		numberInput.value = formatConfigValue(field, value);
		slider.value = numberInput.value;
		showCrtActionMsg(field.label + ": " + numberInput.value);
	};

	inputWrapper.appendChild(slider);
	inputWrapper.appendChild(numberInput);
	wrapper.appendChild(inputWrapper);
	return wrapper;
}

function buildHistoryPanel() {
	historyDiv.innerHTML = "";
	historyDiv.style.display = "none";
	historyDiv.style.position = "fixed";
	historyDiv.style.zIndex = "100002";
	historyDiv.style.left = getStoredPanelPosition("history", "left", Math.max(10, window.innerWidth - 540)) + "px";
	historyDiv.style.top = getStoredPanelPosition("history", "top", 64) + "px";
	historyDiv.style.width = "520px";
	historyDiv.style.maxWidth = "94%";
	historyDiv.style.backgroundColor = "rgba(255,255,255,0.92)";
	historyDiv.style.border = "1px solid rgba(0,0,0,0.35)";
	historyDiv.style.padding = "8px";
	historyDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
	historyDiv.style.fontSize = "14px";
	historyDiv.style.textAlign = "left";

	historyDiv.appendChild(createFloatingPanelHeader("策略记录", historyDiv, "history"));

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
	buttonRow.appendChild(createHistoryPanelButton("导出完整日志", function () {
		exportJson("alphajong_full_strategy_log", getStrategyLogExportData());
	}));
	buttonRow.appendChild(createHistoryPanelButton("导出对局结果", function () {
		exportJson("alphajong_match_results", getMatchHistoryExportData());
	}));
	buttonRow.appendChild(createHistoryPanelButton("导出BUG数据", function () {
		exportJson("alphajong_bug_report", getBugReportExportData());
	}));
	buttonRow.appendChild(createHistoryPanelButton("清空", function () {
		clearDecisionHistory();
		clearStrategyLog();
		refreshHistoryPanel();
		showCrtActionMsg("策略记录和日志已清空。");
	}));
	buttonRow.appendChild(createHistoryPanelButton("清空对局", function () {
		clearMatchHistory();
		refreshHistoryPanel();
		showCrtActionMsg("对局结果已清空。");
	}));

	historyDiv.appendChild(buttonRow);
	refreshHistoryPanel();
}

function buildBoardInfoPanel() {
	boardInfoDiv.innerHTML = "";
	boardInfoDiv.style.display = "none";
	boardInfoDiv.style.position = "fixed";
	boardInfoDiv.style.zIndex = "100002";
	boardInfoDiv.style.left = getStoredPanelPosition("boardInfo", "left", Math.max(10, window.innerWidth - 580)) + "px";
	boardInfoDiv.style.top = getStoredPanelPosition("boardInfo", "top", 64) + "px";
	boardInfoDiv.style.width = "560px";
	boardInfoDiv.style.maxWidth = "94%";
	boardInfoDiv.style.backgroundColor = "rgba(255,255,255,0.92)";
	boardInfoDiv.style.border = "1px solid rgba(0,0,0,0.35)";
	boardInfoDiv.style.padding = "8px";
	boardInfoDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
	boardInfoDiv.style.fontSize = "14px";
	boardInfoDiv.style.textAlign = "left";

	boardInfoDiv.appendChild(createFloatingPanelHeader("牌局信息", boardInfoDiv, "boardInfo"));

	boardInfoText.readOnly = true;
	boardInfoText.style.width = "100%";
	boardInfoText.style.height = "330px";
	boardInfoText.style.resize = "vertical";
	boardInfoText.style.boxSizing = "border-box";
	boardInfoText.style.fontSize = "12px";
	boardInfoText.style.lineHeight = "1.35";
	boardInfoText.style.whiteSpace = "pre";
	boardInfoDiv.appendChild(boardInfoText);

	var buttonRow = document.createElement("div");
	buttonRow.style.marginTop = "8px";
	buttonRow.style.display = "flex";
	buttonRow.style.gap = "6px";
	buttonRow.style.flexWrap = "wrap";

	buttonRow.appendChild(createHistoryPanelButton("刷新", refreshBoardInfoPanel));
	buttonRow.appendChild(createHistoryPanelButton("导出牌局信息", function () {
		exportJson("alphajong_board_info", getBoardInfoExportData());
	}));

	boardInfoDiv.appendChild(buttonRow);
	refreshBoardInfoPanel();
}

function createFloatingPanelHeader(titleText, panel, storageKey) {
	var header = document.createElement("div");
	header.style.display = "flex";
	header.style.alignItems = "center";
	header.style.justifyContent = "space-between";
	header.style.gap = "8px";
	header.style.marginBottom = "6px";
	header.style.cursor = "move";
	header.onmousedown = function (event) {
		startPanelDrag(event, panel, storageKey);
	};
	header.ontouchstart = function (event) {
		startPanelDrag(event, panel, storageKey);
	};

	var title = document.createElement("span");
	title.innerHTML = titleText + " · 拖动移动";
	title.style.fontWeight = "bold";
	header.appendChild(title);

	var closeButton = document.createElement("button");
	closeButton.innerHTML = "关闭";
	closeButton.onclick = function () {
		panel.style.display = "none";
	};
	header.appendChild(closeButton);
	return header;
}

function getStoredPanelPosition(key, axis, fallback) {
	var value = parseInt(window.localStorage.getItem("alphajongPanel_" + key + "_" + axis));
	return isNaN(value) ? fallback : value;
}

function startPanelDrag(event, panel, key) {
	if (event.button != null && event.button !== 0) {
		return;
	}
	var pointer = getPointerPosition(event);
	var rect = typeof panel.getBoundingClientRect == 'function' ? panel.getBoundingClientRect() : null;
	panelDrag.dragging = true;
	panelDrag.panel = panel;
	panelDrag.key = key;
	panelDrag.startX = pointer.x;
	panelDrag.startY = pointer.y;
	panelDrag.left = rect == null ? (parseInt(panel.style.left) || 0) : rect.left;
	panelDrag.top = rect == null ? (parseInt(panel.style.top) || 0) : rect.top;
	panel.style.right = "auto";
	document.addEventListener("mousemove", movePanelDrag);
	document.addEventListener("mouseup", endPanelDrag);
	document.addEventListener("touchmove", movePanelDrag, { passive: false });
	document.addEventListener("touchend", endPanelDrag);
	event.stopPropagation();
}

function movePanelDrag(event) {
	if (!panelDrag.dragging || panelDrag.panel == null) {
		return;
	}
	var pointer = getPointerPosition(event);
	var deltaX = pointer.x - panelDrag.startX;
	var deltaY = pointer.y - panelDrag.startY;
	panelDrag.panel.style.left = (panelDrag.left + deltaX) + "px";
	panelDrag.panel.style.top = (panelDrag.top + deltaY) + "px";
	clampFloatingPanel(panelDrag.panel);
	event.preventDefault();
	event.stopPropagation();
}

function endPanelDrag(event) {
	if (!panelDrag.dragging || panelDrag.panel == null) {
		return;
	}
	panelDrag.dragging = false;
	document.removeEventListener("mousemove", movePanelDrag);
	document.removeEventListener("mouseup", endPanelDrag);
	document.removeEventListener("touchmove", movePanelDrag);
	document.removeEventListener("touchend", endPanelDrag);
	clampFloatingPanel(panelDrag.panel);
	savePanelPosition(panelDrag.panel, panelDrag.key);
	panelDrag.panel = null;
	panelDrag.key = "";
	if (event != null) {
		event.stopPropagation();
	}
}

function clampFloatingPanel(panel) {
	var width = panel.offsetWidth || parseInt(panel.style.width) || 520;
	var height = panel.offsetHeight || 260;
	var maxLeft = Math.max(0, window.innerWidth - Math.min(width, window.innerWidth));
	var maxTop = Math.max(0, window.innerHeight - Math.min(80, height));
	var left = Math.min(Math.max(parseInt(panel.style.left) || 0, 0), maxLeft);
	var top = Math.min(Math.max(parseInt(panel.style.top) || 0, 0), maxTop);
	panel.style.left = left + "px";
	panel.style.top = top + "px";
}

function savePanelPosition(panel, key) {
	window.localStorage.setItem("alphajongPanel_" + key + "_left", parseInt(panel.style.left) || 0);
	window.localStorage.setItem("alphajongPanel_" + key + "_top", parseInt(panel.style.top) || 0);
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

function toggleBoardInfoPanel() {
	if (boardInfoDiv.style.display == "block") {
		boardInfoDiv.style.display = "none";
		return;
	}
	refreshBoardInfoPanel();
	boardInfoDiv.style.display = "block";
}

function refreshBoardInfoPanel() {
	boardInfoText.value = getBoardInfoText();
}

function getBoardInfoText() {
	var data = getBoardInfoSnapshot();
	if (!data.inGame) {
		return "当前不在对局中，进入牌局后可查看全局牌局信息。";
	}

	var lines = [];
	lines.push("基础信息");
	lines.push("玩法: " + data.mode + "    剩余牌山: " + data.tilesLeft + "    当前名次: " + data.ownPlacement + "/" + data.players.length);
	lines.push("场风/自风: " + data.roundWind + " / " + data.seatWind + "    宝牌: " + data.dora);
	lines.push("");
	lines.push("分数与状态");
	for (let player of data.players) {
		lines.push(player.name + "  第" + player.rank + "名  " + player.score + "点" +
			(player.riichi ? "  立直" : "") +
			(player.calls == "" ? "" : "  副露:" + player.calls));
	}
	lines.push("");
	lines.push("各家弃牌");
	for (let player of data.players) {
		lines.push(player.name + ": " + (player.discards == "" ? "无" : player.discards));
	}
	lines.push("");
	lines.push("剩余枚数");
	for (let row of data.remainingRows) {
		lines.push(row);
	}
	lines.push("");
	lines.push("危险牌概览");
	lines.push("最高危险: " + (data.dangerTiles.length == 0 ? "暂无" : data.dangerTiles.map(t => t.tile + "(" + t.danger + ")").join("  ")));
	lines.push("相对安全: " + (data.safeTiles.length == 0 ? "暂无" : data.safeTiles.map(t => t.tile + "(" + t.danger + ")").join("  ")));
	return lines.join("\n");
}

function getBoardInfoSnapshot() {
	var data = {
		exportedAt: new Date().toISOString(),
		inGame: false,
		version: typeof GM_info != 'undefined' && GM_info.script ? GM_info.script.version : "unknown"
	};

	try {
		if (!isInGame()) {
			return data;
		}

		setData(false);
		data.inGame = true;
		data.mode = getNumberOfPlayers() + "人";
		data.tilesLeft = tilesLeft;
		data.roundWind = getWindName(roundWind);
		data.seatWind = getWindName(seatWind);
		data.dora = getStringForTiles(dora);
		data.ownPlacement = getOwnPlacement();
		data.players = getBoardPlayersSnapshot();
		data.remainingTiles = getRemainingTileSnapshot();
		data.remainingRows = getRemainingTileRows(data.remainingTiles);
		data.dangerTiles = getDangerTileSnapshot(false).slice(0, 10);
		data.safeTiles = getDangerTileSnapshot(true).slice(0, 10);
		data.debugString = getDebugString();
	}
	catch (error) {
		data.error = String(error);
	}

	return data;
}

function getBoardInfoExportData() {
	return {
		board: getBoardInfoSnapshot(),
		config: getConfigSnapshot(),
		decisions: decisionHistory.slice(),
		strategyLog: strategyLog.slice(0, 120)
	};
}

function getBoardPlayersSnapshot() {
	var players = getPlayerScoresSnapshot();
	var names = ["自家", "下家", "对面", "上家"];
	for (let player of players) {
		player.name = names[player.localPosition] || ("玩家" + player.localPosition);
		player.calls = player.calls == "" ? "" : player.calls;
		player.discards = player.discards == "" ? "" : player.discards;
	}
	return players;
}

function getRemainingTileSnapshot() {
	var rows = [];
	for (var type = 0; type <= 3; type++) {
		var maxIndex = type == 3 ? 7 : 9;
		for (var index = 1; index <= maxIndex; index++) {
			if (getNumberOfPlayers() == 3 && type == 1 && index > 1 && index < 9) {
				continue;
			}
			var tile = { index: index, type: type, dora: false, doraValue: 0 };
			rows.push({
				tile: getTileName(tile, false),
				count: getNumberOfTilesAvailable(index, type)
			});
		}
	}
	return rows;
}

function getRemainingTileRows(tiles) {
	var rows = [];
	for (var type = 0; type <= 3; type++) {
		var typeName = getNameForType(type);
		var rowTiles = tiles.filter(tile => tile.tile.indexOf(typeName) >= 0);
		if (rowTiles.length > 0) {
			rows.push(typeName + ": " + rowTiles.map(tile => tile.tile + "=" + tile.count).join("  "));
		}
	}
	return rows;
}

function getDangerTileSnapshot(ascending) {
	var unique = [];
	for (let tile of availableTiles) {
		if (unique.some(other => isSameTile(other, tile))) {
			continue;
		}
		var danger = getTileDanger(tile);
		unique.push({
			tile: getTileName(tile, false),
			danger: Number(danger).toFixed(1),
			remaining: getNumberOfTilesAvailable(tile.index, tile.type)
		});
	}
	unique.sort(function (a, b) {
		return ascending ? parseFloat(a.danger) - parseFloat(b.danger) : parseFloat(b.danger) - parseFloat(a.danger);
	});
	return unique;
}

function getWindName(index) {
	switch (parseInt(index)) {
		case 1: return "东";
		case 2: return "南";
		case 3: return "西";
		case 4: return "北";
		default: return index;
	}
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
		currentActionOutput.title = msg;
	}
}

// Apend msg to currentActionOutput
function showCrtStrategyMsg(msg) {
	showingStrategy = true;
	currentActionOutput.value = msg;
	currentActionOutput.title = msg;
}

function clearCrtStrategyMsg() {
	showingStrategy = false;
	currentActionOutput.value = "";
}
