'use strict';

class Utils {
	constructor() {

	}

	getTableById(id, tables) {
		for (let i = 0; i < tables.length; i++) {
			if (tables[i].id === id) {
				return tables[i];
			}
		}
	}

	getSubjectById(id, subjects) {
		for (let i = 0; i < subjects.length; i++) {
			if (subjects[i].id === id) {
				return subjects[i];
			}
		}
	}

	existsSubjectPair(pair, pairedSubjects) {
		for (let i = 0; i < pairedSubjects.length; i++) {
			if (pairedSubjects[i].pair1.id === pair.pair1.id && pairedSubjects[i].pair2.id === pair.pair2.id ||
			pairedSubjects[i].pair1.id === pair.pair2.id && pairedSubjects[i].pair2.id === pair.pair1.id) {
				return true;
			}
		}
		return false;
	}

	existsTablePair(pair, tablePairs) {
		for (let i = 0; i < tablePairs.length; i++) {
			if ((tablePairs[i].pair1.id === pair.pair1.id && tablePairs[i].pair2.id === pair.pair2.id) ||
			(tablePairs[i].pair1.id === pair.pair2.id && tablePairs[i].pair2.id === pair.pair1.id)) {
				return true;
			}
		}
		return false;
	}

	getPairsContainingTable(table, tablePairs) {
		var containedPairs = [];
		for (let i = 0; i < tablePairs.length; i++) {
			if (tablePairs[i].pair1.id === table.id || tablePairs[i].pair2.id === table.id) {
				containedPairs.push(tablePairs[i]);
			}
		}
		return containedPairs;
	}

	randPointOnCircle(size) {
		if (size === null) {
			size = 1;
		}
		let x = 0.0;
		let y = 0.0;
		let s = 0.0;
		do {
			x = (Math.random() - 0.5) * 2.0;
			y = (Math.random() - 0.5) * 2.0;
			s = x * x + y * y;
		} while (s > 1);

		let scale = size / Math.sqrt(s);
		return {x: x * scale, y: y * scale};
	}

	removeTablePairsWithTables(table1, table2, tablePairs) {
		let newTablePairs = [];

		if (tablePairs.length > 0) {
			for (let i = 0; i < tablePairs.length; i++) {
				if (tablePairs[i].pair1.id !== table1.id && tablePairs[i].pair1.id !== table2.id &&
					tablePairs[i].pair2.id !== table1.id && tablePairs[i].pair2.id !== table2.id) {
					newTablePairs.push(tablePairs[i]);
				}
			}
		}

		return newTablePairs;
	}
}
