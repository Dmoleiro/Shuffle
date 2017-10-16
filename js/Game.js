'use strict';
/*global PIXI*/
/*global Subject*/
/*global Table*/
/*global PairedSubject*/
/*global PairedTable*/
/*global Utils*/

var app = new PIXI.Application(600, 600, {backgroundColor: 0x000000});
document.body.appendChild(app.view);

var background = PIXI.Sprite.fromImage('images/backgr.png');
background.width = app.renderer.width;
background.height = app.renderer.height;
app.stage.addChild(background);

var text = new PIXI.Text('', {font: '35px Arial', fill: 'white'});
text.anchor.set(0.5);
text.x = app.renderer.width / 2;
text.y = 40;
app.stage.addChild(text);

// if full screen is required...
/*window.onresize = function(event) {
	var w = window.innerWidth;
	var h = window.innerHeight;    //this part resizes the canvas but keeps ratio the same
	app.renderer.view.style.width = w + 'px';
	app.renderer.view.style.height = h + 'px';    //this part adjusts the ratio:
	app.renderer.resize(w, h);
};*/

var loader = PIXI.loader;
var initialData;
var shufflingSits = false;
var utils = new Utils();
var originalSubjects;
var originlTables;
var subjects = [];
var tables = [];
var finalSubjects = [];
var tablePairs = [];
var start;
var lastTick;
var shuffleIdx;
var elapsedShuffleTime;
var tickTime;
var shuffleTime = 100;
var btShuffle;
var btSave;
var shuffleIterations;
var tickTack = new Audio('/audio/tick_tack.mp3');
tickTack.loop = true;

function initialize(receivedData) {
	initialData = receivedData;
	originalSubjects = initialData.Subjects.Subject;
	originlTables = initialData.Tables.Table;
	// add the subject images to the loader
	for (let i = 0; i < originalSubjects.length; i++) {
		loader.add(originalSubjects[i].id, originalSubjects[i].image);
	}

	// add the table images to the loader
	for (let i = 0; i < originlTables.length; i++) {
		loader.add(originlTables[i].id, originlTables[i].image);
	}

	// add graphics for the buttons
	loader.add('shuff', 'images/shuffle.png');
	loader.add('save', 'images/save.png');

	loader.load(function(loader, resources) {
		for (let i = 0; i < originlTables.length; i++) {
			let tablAux = new Table(app,
				originlTables[i].id,
				originlTables[i].pair1,
				originlTables[i].pair2,
				originlTables[i].Position.x,
				originlTables[i].Position.y);
			tables.push(tablAux);
		}

		// subjects
		for (let i = 0; i < originalSubjects.length; i++) {
			let tableAux = utils.getTableById(originalSubjects[i].currentTable, tables);
			let spriteAux = new PIXI.Sprite(resources[originalSubjects[i].id].texture);

			spriteAux.x = parseInt(tableAux.x);
			spriteAux.y = parseInt(tableAux.y);
			spriteAux.anchor.set(0.5);

			app.stage.addChild(spriteAux);

			var subjAux = new Subject(originalSubjects[i].id,
				originalSubjects[i].pair,
				spriteAux,
				originalSubjects[i].currentTable,
				originalSubjects[i].fixedTable
				);
			subjects.push(subjAux);
		}

		// sort the subjects array so that the ones with fixed tables go on top
		subjects.sort(function(a, b) {
			if ((typeof a.fixedTable !== 'undefined' && a.fixedTable !== '') && (typeof b.fixedTable === 'undefined' || b.fixedTable === '')) {
				return -1;
			}else if ((typeof b.fixedTable !== 'undefined' && b.fixedTable !== '') && (typeof a.fixedTable === 'undefined' || a.fixedTable === '')) {
				return 1;
			}else {
				return 0;
			}
		});

		btShuffle = new PIXI.Sprite(resources.shuff.texture);
		btShuffle.x = 300;
		btShuffle.y = app.renderer.height - 100;
		btShuffle.anchor.set(0.5);

		btShuffle.interactive = true;
		btShuffle.buttonMode = true;
		btShuffle.on('pointerup', startShuffle);

		app.stage.addChild(btShuffle);

		btSave = new PIXI.Sprite(resources.save.texture);
		btSave.x = 400;
		btSave.y = app.renderer.height - 100;
		btSave.anchor.set(0.5);

		btSave.interactive = true;
		btSave.buttonMode = true;
		btSave.on('pointerup', updateInitialDataAndSave);

		app.stage.addChild(btSave);

		// create table pair list
		for (let i = 0; i < tables.length; i++) {
			if (typeof tables[i].pair1 !== 'undefined' && tables[i].pair1 !== '') {
				if (typeof tables[i].pair2 !== 'undefined' && tables[i].pair2 !== '') {
					let tabPair1 = new PairedTable(tables[i],utils.getTableById(tables[i].pair1, tables));
					if (!utils.existsTablePair(tabPair1, tablePairs)) {
						tablePairs.push(tabPair1);
					}
					let tabPair2 = new PairedTable(tables[i],utils.getTableById(tables[i].pair2, tables));
					if (!utils.existsTablePair(tabPair2, tablePairs)) {
						tablePairs.push(tabPair2);
					}
				}else {
					let tabPair = new PairedTable(tables[i],utils.getTableById(tables[i].pair1, tables));
					if (!utils.existsTablePair(tabPair, tablePairs)) {
						tablePairs.push(tabPair);
					}
				}
			}
		}
	});
}

/**
* SAVE SHUFFLED DATA
*/
function updateInitialDataAndSave() {
	if (!shufflingSits) {
		for (let i = 0; i < initialData.Subjects.Subject.length; i++) {
			for (let j = 0; j < finalSubjects.length; j++) {
				if (initialData.Subjects.Subject[i].id === finalSubjects[j].id) {
					initialData.Subjects.Subject[i].currentTable = finalSubjects[j].currentTable;
					break;
				}
			}
		}

		saveDataToServer(initialData);
	}
}

/**
* SHUFFLE SITS
*/
function startShuffle() {
	if (!shufflingSits) {
		tickTack.play();
		shuffleIterations = Math.round(Math.random() * 10 + 10); // between 10 and 20 iterations
		restartShuffle();
	}
}

function restartShuffle() {
	shuffleSits();
	start = Date.now();
	lastTick = Date.now();
	btShuffle.tint = 0xFF0000;
	shuffleIdx = finalSubjects.length - 1;
	elapsedShuffleTime = 0;
	tickTime = 0;
	shufflingSits = true;
}

function shuffleSits() {
	let remainingTables = [];
	let remainingTablePairs = [];
	let pairedSubjects = [];
	let singleSubjects = [];
	finalSubjects = [];

	remainingTables = tables.slice();
	remainingTablePairs = tablePairs.slice();

	for (let i = 0; i < subjects.length; i++) {
		if (typeof subjects[i].fixedTable !== 'undefined' && subjects[i].fixedTable !== '') {
			if (typeof subjects[i].pair !== 'undefined' && subjects[i].pair !== '') {
				let err = 'Configuration error, the Subject with the Id: ' + subjects[i].id + ' has a fixedTable so, it must not have pairs!';
				alert(err);
				throw(err);
			}

			let tablAux = utils.getTableById(subjects[i].fixedTable, tables);
			//subjects[i].sprite.tint = 0xFFFF00;
			subjects[i].currentTable = subjects[i].assignedTable;
			subjects[i].assignedTable = tablAux.id;

			finalSubjects.push(subjects[i]);

			if (remainingTables.indexOf(tablAux) >= 0) {
				remainingTables.splice(remainingTables.indexOf(tablAux), 1);
			}

			let pairsToRemove = utils.getPairsContainingTable(tablAux, tablePairs);
			for (let j = 0; j < pairsToRemove.length; j++) {
				if (remainingTablePairs.indexOf(pairsToRemove[j]) >= 0) {
					remainingTablePairs.splice(remainingTablePairs.indexOf(pairsToRemove[j]), 1);
				}
			}

		}else if (typeof subjects[i].pair !== 'undefined' && subjects[i].pair !== '') {
			let paired = utils.getSubjectById(subjects[i].pair, subjects);

			// check configuration
			if (typeof paired === 'undefined' || typeof paired.id === 'undefined' || paired.pair !== subjects[i].id) {
				let err = 'Configuration error, the Subject with the Id: ' + subjects[i].id + ' has an invalid Pair configuration!';
				alert(err);
				throw(err);
			}
			let pSubj = new PairedSubject(subjects[i],paired);

			if (!utils.existsSubjectPair(pSubj, pairedSubjects)) {
				pairedSubjects.push(pSubj);
			}
		}else {
			singleSubjects.push(subjects[i]);
		}
	}

	for (let i = 0; i < pairedSubjects.length; i++) {
		if (remainingTablePairs.length > 0) {
			let tablePairIdx;

			if (remainingTablePairs.length > 1) {
				tablePairIdx = Math.round(Math.random() * (remainingTablePairs.length - 1));
			}else {
				tablePairIdx = 0;
			}

			pairedSubjects[i].pair1.currentTable = pairedSubjects[i].pair1.assignedTable;
			pairedSubjects[i].pair1.assignedTable = remainingTablePairs[tablePairIdx].pair1.id;

			pairedSubjects[i].pair2.currentTable = pairedSubjects[i].pair2.assignedTable;
			pairedSubjects[i].pair2.assignedTable = remainingTablePairs[tablePairIdx].pair2.id;

			finalSubjects.push(pairedSubjects[i].pair1);
			finalSubjects.push(pairedSubjects[i].pair2);

			let tabl1 = remainingTablePairs[tablePairIdx].pair1;
			let tabl2 = remainingTablePairs[tablePairIdx].pair2;

			if (remainingTables.indexOf(remainingTablePairs[tablePairIdx].pair1) >= 0) {
				remainingTables.splice(remainingTables.indexOf(remainingTablePairs[tablePairIdx].pair1), 1);
			}
			if (remainingTables.indexOf(remainingTablePairs[tablePairIdx].pair2) >= 0) {
				remainingTables.splice(remainingTables.indexOf(remainingTablePairs[tablePairIdx].pair2), 1);
			}
			if (remainingTablePairs.indexOf(remainingTablePairs[tablePairIdx]) >= 0) {
				remainingTablePairs.splice(remainingTablePairs.indexOf(remainingTablePairs[tablePairIdx]), 1);
			}
			// remove any other table pairs including the assigned tables
			remainingTablePairs = utils.removeTablePairsWithTables(tabl1, tabl2, remainingTablePairs);
		}else {
			singleSubjects.push(pairedSubjects[i].pair1);
			singleSubjects.push(pairedSubjects[i].pair2);

			finalSubjects.push(pairedSubjects[i].pair1);
			finalSubjects.push(pairedSubjects[i].pair2);
		}
	}

	for (let i = 0; i < singleSubjects.length; i++) {
		if (remainingTables.length > 0) {
            let tableIdx = Math.round(Math.random() * (remainingTables.length - 1));
            singleSubjects[i].currentTable = singleSubjects[i].assignedTable;
            singleSubjects[i].assignedTable = remainingTables[tableIdx].id;

            finalSubjects.push(singleSubjects[i]);

            remainingTables.splice(remainingTables.indexOf(remainingTables[tableIdx]), 1);
        }
	}
}

/**
*	render the sprites movement
*/
app.ticker.add(function(delta) {
	if (shufflingSits) {
		tickTime = Date.now() - lastTick;
		lastTick = Date.now();
		elapsedShuffleTime = (lastTick - start);

		text.text = shuffleIterations + ' - Shuffle iteration(s) left!';

		if (shuffleIdx >= 0) {
			app.stage.addChild(finalSubjects[shuffleIdx].sprite);
			if (elapsedShuffleTime > shuffleTime) {
				finalSubjects[shuffleIdx].sprite.x = utils.getTableById(finalSubjects[shuffleIdx].assignedTable, tables).x;
				finalSubjects[shuffleIdx].sprite.y = utils.getTableById(finalSubjects[shuffleIdx].assignedTable, tables).y;
				finalSubjects[shuffleIdx].currentTable = finalSubjects[shuffleIdx].assignedTable;

				shuffleIdx--;
				elapsedShuffleTime = 0;
				start = Date.now();
			}else {
				let oldTable = utils.getTableById(finalSubjects[shuffleIdx].currentTable, tables);
				let newTable = utils.getTableById(finalSubjects[shuffleIdx].assignedTable, tables);

				let xTotalDistance = (newTable.x - oldTable.x);
				let yTotalDistance = (newTable.y - oldTable.y);

				if (xTotalDistance === 0 && yTotalDistance === 0) {
					shuffleIdx--;
				}else {
					if (xTotalDistance !== 0) {
						finalSubjects[shuffleIdx].sprite.x += ((xTotalDistance / shuffleTime) * tickTime);
					}
					if (yTotalDistance !== 0) {
						finalSubjects[shuffleIdx].sprite.y += ((yTotalDistance / shuffleTime) * tickTime);
					}
				}
			}
		}else {
			if (shuffleIterations > 0) {
				shuffleIterations--;
				restartShuffle();
			}else {
				shufflingSits = false;
				btShuffle.tint = 0xFFFFFF;
				text.text = '';
				let audio = new Audio('/audio/celebration.mp3');
				tickTack.pause();
				audio.play();
			}
		}
	}
});
