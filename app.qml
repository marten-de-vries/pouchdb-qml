import QtQuick 2.0
import "pouchdb-qml.js" as PouchDB

Rectangle {
	id: page
	width: 500
	height: 200
	color: "darkblue"

	Text {
		id: helloText
		text: "Hello world!"
		color: "white"
		wrapMode: Text.Wrap
		width: 500
	}

	Component.onCompleted: {
		function log(err, resp) {
			helloText.text = JSON.stringify(err ? err : resp);
		}
		var db = new PouchDB.PouchDB('test');
		db.post({}, function () {
			log.apply(0, arguments);
			db.replicate.to('testb').then(log);
		})
	}
}
