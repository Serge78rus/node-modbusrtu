# node-modbusrtu

The `modbusrtu` package is Node.js module to communicate with devices, that support the Modbus RTU protocol.

It requires [Node.js](http://nodejs.org/) to run and [npm](https://www.npmjs.org/) to be installed.

This project on the early development stage.

## Installing

[![(npm package version)](https://nodei.co/npm/modbusrtu.png?downloads=true&downloadRank=true)](https://npmjs.org/package/modbusrtu) [![(a histogram of downloads)](https://nodei.co/npm-dl/modbusrtu.png?months=3&height=3)](https://npmjs.org/package/modbusrtu)

* Latest packaged version: `npm install modbusrtu`

* Latest version on GitHub: `npm install https://github.com/Serge78rus/node-modbusrtu/tarball/master`

## Usage

Example of usage in `test.js`
```javascript
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
```

## License

MIT license (see the `LICENSE` file).