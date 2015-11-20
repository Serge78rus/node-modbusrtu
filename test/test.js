/**
 * http://usejsdoc.org/
 */

var Modbus = require("../lib/modbus").Modbus;

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
  {func: "writeCoils",    pars: [1, 0, [true, false, true, false, true, false, true, false, true, false]]},
  {func: "readCoils",     pars: [1, 0, 10]},
  {func: "writeCoils",    pars: [1, 0, [false, true, false, true, false, true, false, true, false, true]]},
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


