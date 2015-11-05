# node-modbusrtu

The `modbusrtu` package is Node.js module to communicate with devices, that support the Modbus RTU protocol.

It requires [Node.js](http://nodejs.org/) to run and [npm](https://www.npmjs.org/) to be installed.

This project on the early development stage, and now supported only GNU/Linux environment and Modbus functions 1...4  

# Installing

[![NPM](https://nodei.co/npm/modbusrtu.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/modbusrtu/)
[![NPM](https://nodei.co/npm-dl/modbusrtu.png?months=3&height=3)](https://nodei.co/npm/modbusrtu/)

* Latest packaged version: `npm install modbusrtu`

* Latest version on GitHub: `npm install https://github.com/Serge78rus/node-modbusrtu/tarball/master`

# Usage

Example of usage in `test.js`
```javascript
//var Modbus = require("../lib/modbus").Modbus; //relative path from test directory 
var Modbus = require("modbus").Modbus; //if module installed to default location

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
# API

## Modbus(dev, opt, done)

Constructor of modbus object
* `dev` - communication device name (for example: /dev/ttyUSB0)
* `opt` - communication options
* `done` - callback function
 
Object `opt` may contain some of the following fields:
```javascript
{
	baud: 9600, //communication speed
	fmt: "8n2", //data bits, parity and stop bits
	timeout: 1000, //response timeout
	pause: 200, //pause between response and next request
	retry: 3 //retry counts
}
```
If some fields are omitted, they take default values as described above

Function `done` take one argument: 
```javascript
done(err)
```
where `err` is `null` if success or Error object if an error occurred

## readCoils(slave, addr, cnt, done)

Function for reading coils (Modbus function 1)
* `slave` - slave device Id
* `addr` - first coil address
* `cnt` - number of coils to read
* `done` - callback function

Function `done` take two argument: 
```javascript
done(err, data)
```
where `err` is `null` if success or Error object if an error occurred, `data` - array of boolean values of results

## readDiscrInp(slave, addr, cnt, done)

Function for reading discrete inputs (Modbus function 2)
* `slave` - slave device Id
* `addr` - first input address
* `cnt` - number of inputs to read
* `done` - callback function

Function `done` take two argument: 
```javascript
done(err, data)
```
where `err` is `null` if success or Error object if an error occurred, `data` - array of boolean values of results

## readHoldReg(slave, addr, cnt, done)

Function for reading holding registers (Modbus function 3)
* `slave` - slave device Id
* `addr` - first register address
* `cnt` - number of registers to read
* `done` - callback function

Function `done` take two argument: 
```javascript
done(err, data)
```
where `err` is `null` if success or Error object if an error occurred, `data` - array of unsigned integer values of results

## readInpReg(slave, addr, cnt, done)

Function for reading input registers (Modbus function 4)
* `slave` - slave device Id
* `addr` - first register address
* `cnt` - number of registers to read
* `done` - callback function

Function `done` take two argument: 
```javascript
done(err, data)
```
where `err` is `null` if success or Error object if an error occurred, `data` - array of unsigned integer values of results

# License

MIT license (see the `LICENSE` file).