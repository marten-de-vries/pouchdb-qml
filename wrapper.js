.pragma library
.import QtQuick.LocalStorage 2.0 as Sql

var PouchDB = (function () {
  //mock environment
  var window = {};
  var navigator = window.navigator = {};
  navigator.userAgent = "";

  var btoa = window.btoa = Qt.btoa
  var atob = window.atob = Qt.atob

  var _Timer = Qt.createComponent("timer.qml")
  var setTimeout = window.setTimeout = function (func, timeout) {
    var timer = _Timer.createObject();
    timer.interval = timeout || 0;
    timer.onTriggered.connect(function () {
      func();
      clearTimeout(timer);
    });
    timer.start();

    return timer;
  };

  var clearTimeout = window.clearTimeout = function (timer) {
      timer.destroy();
  }

  function _callLater(func) {
    if (func) {
      var args = Array.prototype.slice.call(arguments, 1);
      setTimeout(function () {
        func.apply(null, args);
      }, 0);
    }
  };

  var openDatabase = window.openDatabase = function () {
    function createTransaction(func) {
      return function (callback, onTxError, onTxSuccess) {
        return func.call(db, function (tx) {
          var customTx = {
            executeSql: function (statement, values, onSuccess, onError) {
              values = values || [];
              var resp;
              try {
                resp = tx.executeSql(statement, values || []);
              } catch (err) {
              _callLater(onError, customTx, err);
                throw err;
              }
              _callLater(onSuccess, customTx, resp);
            }
          };
          try {
            callback(customTx);
          } catch (err) {
            _callLater(onTxError, err);
            //need to rethrow for rollback.
            throw err;
          }
          _callLater(onTxSuccess);
        });
      }
    }

    var db = Sql.LocalStorage.openDatabaseSync.apply(this, arguments);

    return {
      transaction: createTransaction(db.transaction),
      readTransaction: createTransaction(db.readTransaction),
    }
  }

  /*---a PouchDB build is auto-inserted here---*/

  return window.PouchDB;
}());
