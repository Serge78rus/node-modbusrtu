/**
 * http://usejsdoc.org/
 */

var Modbus = require("../lib/modbus").Modbus;

var modbus = new Modbus("/dev/ttyUSB0", {}, function(err) {
	if (!err) {
		testFn1(function(err) {
			testFn2(function(err) {
				testFn3(function(err) {
					testFn4(function(err) {
						console.log("End tests");
					});
				});
			});
		});
	} else
		console.error("Modbus constructor error: " + err);
});

function testFn1(done) {
	modbus.readCoils(1, 0, 1, function(err, data) {
		if (!err) {
			console.log("readCoils() ok, data: [" + data + "]");
		} else {
			console.error("readCoils() error: " + err);
		}
		done(err);
	});
}

function testFn2(done) {
	modbus.readDiscrInp(1, 0, 16, function(err, data) {
		if (!err) {
			console.log("readDiscrInp() ok, data: [" + data + "]");
		} else {
			console.error("readDiscrInp() error: " + err);
		}
		done(err);
	});
}

function testFn3(done) {
	modbus.readHoldReg(1, 0, 3, function(err, data) {
		if (!err) {
			console.log("readHoldReg() ok, data: [" + data + "]");
		} else {
			console.error("readHoldReg() error: " + err);
		}
		done(err);
	});
}

function testFn4(done) {
	modbus.readInpReg(1, 0, 13, function(err, data) {
		if (!err) {
			console.log("readInpReg() ok, data: [" + data + "]");
		} else {
			console.error("readInpReg() error: " + err);
		}
		done(err);
	});
}

