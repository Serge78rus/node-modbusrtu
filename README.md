# node-modbusrtu

The `modbusrtu` package is Node.js module to communicate with devices, that support the Modbus RTU protocol. Written in native JavaScript

It requires [Node.js](http://nodejs.org/) to run and [npm](https://www.npmjs.org/) to be installed.

This project now supported only GNU/Linux environment and following Modbus functions:
* `0x01` - read coils
* `0x02` - read discrete inputs
* `0x03` - read holding registers
* `0x04` - read input registers
* `0x05` - write single coil
* `0x06` - write single register
* `0x0f` - write multiple coils
* `0x10` - write multiple registers

# Installing

[![NPM](https://nodei.co/npm/modbusrtu.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/modbusrtu/)
[![NPM](https://nodei.co/npm-dl/modbusrtu.png?months=3&height=3)](https://nodei.co/npm/modbusrtu/)

* Latest packaged version: `npm install modbusrtu`

* Latest version on GitHub: `npm install https://github.com/Serge78rus/node-modbusrtu/tarball/master`

# Usage

## Simple example of usage

Create Modbus object:
```javascript
var Modbus = require("modbus").Modbus;

var modbus = new Modbus(
		"/dev/ttyUSB1", //communication serial device 
		{},             //communication options (default: 9600, 8N2)
		function(err) {
	if (!err) {
		/* Code for using modbus object	*/
	} else
		console.error("Modbus constructor error: " + err);
});
```

Read coils:
```javascript
modbus.readCoils(
		1, //slave address 
		0, //first coil address
		10, //number of coils to read 
		function(err, data) {
	if (!err) {
  	/* Code for using boolean array "data", contains coils status */
  } else {
    console.error("readCoils() error: " + err);
  }
});
```

Read discrete inputs:
```javascript
modbus.readDiscrInps(
		1, //slave addres 
		0, //first discrete input address
		10, //number of inputs to read
		function(err, data) {
  if (!err) {
  	/* Code for using boolean array "data", contains inputs status */
  } else {
    console.error("readDiscrInps() error: " + err);
  }
});
```

Read holding registers:
```javascript
modbus.readHoldRegs(
		1, //slave addres 
		0, //first holding register address
		10, //number of registers to read
		function(err, data) {
  if (!err) {
  	/* Code for using unsigned integer array "data", contains holding registers values */
  } else {
    console.error("readHoldRegs() error: " + err);
  }
});
```

Read input registers:
```javascript
modbus.readInpRegs(
		1, //slave addres 
		0, //first input register address
		10, //number of registers to read
		function(err, data) {
  if (!err) {
  	/* Code for using unsigned integer array "data", contains input registers values */
  } else {
    console.error("readInpRegs() error: " + err);
  }
});
```

## More complex example of usage in `test/test.js`
```javascript
//var Modbus = require("../lib/modbus").Modbus; //relative path from test directory 
var Modbus = require("modbus").Modbus; //if module installed to default location

var tests = [
  {func: "readCoils",     pars: [1, 0, 10]},
  {func: "readDiscrInps", pars: [1, 0, 10]},
  {func: "readHoldRegs",  pars: [1, 0, 10]},
  {func: "readInpRegs",   pars: [1, 0, 10]},
  {func: "writeCoil",     pars: [1, 0, true]},
  {func: "readCoils",     pars: [1, 0, 1]},
  {func: "writeCoil",     pars: [1, 0, false]},
  {func: "readCoils",     pars: [1, 0, 1]},
  {func: "writeReg",      pars: [1, 0, 123]},
  {func: "readHoldRegs",  pars: [1, 0, 1]},
  {func: "writeReg",      pars: [1, 0, 321]},
  {func: "readHoldRegs",  pars: [1, 0, 1]},
  {func: "writeCoils",    pars: [1, 0, [true, false, true, false, true, 
                                        false, true, false, true, false]]},
  {func: "readCoils",     pars: [1, 0, 10]},
  {func: "writeCoils",    pars: [1, 0, [false, true, false, true, false, 
                                        true, false, true, false, true]]},
  {func: "readCoils",     pars: [1, 0, 10]},
  {func: "writeRegs",     pars: [1, 0, [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]]},
  {func: "readHoldRegs",  pars: [1, 0, 10]},
  {func: "writeRegs",     pars: [1, 0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]]},
  {func: "readHoldRegs",  pars: [1, 0, 10]}
];

var modbus = new Modbus("/dev/ttyUSB1", {}, function(err) {
	if (!err) {
		(function test(i) {
			if (tests[i]) {
				var f = "function: " + tests[i].func + 
						"() pars: " + tests[i].pars + 
						" \tresult: "; 
				modbus[tests[i].func].apply(modbus, 
						tests[i].pars.concat(function(err, data) {
					if (!err)
						console.log(f + "OK" + (data ? ", data: " + data : ""));
					else 
						console.log(f + err);
					test(++i);
				}));
			} else
				console.log("end tests");
		})(0);
	} else
		console.error("Modbus constructor error: " + err);
});
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

Function for reading coils (Modbus function 0x01)
* `slave` - slave device Id
* `addr` - first coil address
* `cnt` - number of coils to read
* `done` - callback function

Function `done` take two arguments: 
```javascript
done(err, data)
```
where `err` is `null` if success or Error object if an error occurred, `data` - array of boolean values of results

## readDiscrInps(slave, addr, cnt, done)

Function for reading discrete inputs (Modbus function 0x02)
* `slave` - slave device Id
* `addr` - first input address
* `cnt` - number of inputs to read
* `done` - callback function

Function `done` take two arguments: 
```javascript
done(err, data)
```
where `err` is `null` if success or Error object if an error occurred, `data` - array of boolean values of results

## readHoldRegs(slave, addr, cnt, done)

Function for reading holding registers (Modbus function 0x03)
* `slave` - slave device Id
* `addr` - first register address
* `cnt` - number of registers to read
* `done` - callback function

Function `done` take two arguments: 
```javascript
done(err, data)
```
where `err` is `null` if success or Error object if an error occurred, `data` - array of unsigned integer values of results

## readInpRegs(slave, addr, cnt, done)

Function for reading input registers (Modbus function 0x04)
* `slave` - slave device Id
* `addr` - first register address
* `cnt` - number of registers to read
* `done` - callback function

Function `done` take two arguments: 
```javascript
done(err, data)
```
where `err` is `null` if success or Error object if an error occurred, `data` - array of unsigned integer values of results

## writeCoil(slave, addr, val, done) 

Function for writing single coil (Modbus function 0x05)
* `slave` - slave device Id
* `addr` - coil address
* `val` - value to write
* `done` - callback function

Function `done` take one argument: 
```javascript
done(err)
```
where `err` is `null` if success or Error object if an error occurred

## writeReg(slave, addr, val, done)

Function for writing single register (Modbus function 0x06)
* `slave` - slave device Id
* `addr` - register address
* `val` - value to write
* `done` - callback function

Function `done` take one argument: 
```javascript
done(err)
```
where `err` is `null` if success or Error object if an error occurred

## writeCoils(slave, addr, vals, done)

Function for writing multiple coils (Modbus function 0x0f)
* `slave` - slave device Id
* `addr` - first coil address
* `vals` - array of boolean values to write
* `done` - callback function

Function `done` take one argument: 
```javascript
done(err)
```
where `err` is `null` if success or Error object if an error occurred

## writeRegs(slave, addr, vals, done)

Function for writing multiple registers (Modbus function 0x10)
* `slave` - slave device Id
* `addr` - first coil address
* `vals` - array of unsigned integer values to write
* `done` - callback function

Function `done` take one argument: 
```javascript
done(err)
```
where `err` is `null` if success or Error object if an error occurred

# License

MIT license (see the `LICENSE` file).