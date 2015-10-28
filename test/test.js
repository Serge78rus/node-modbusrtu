/**
 * http://usejsdoc.org/
 */

var Modbus = require("modbus").Modbus;

modbus = new Modbus("/dev/ttyUSB0", {}, function(err) {
	if (!err) {
		modbus.readCoils(1, 0, 1, function(err, data) {
			if (!err)
				console.log("modbus.readCoils() ok, data: " + data.toString("hex"));
			else
				console.error("modbus.readCoils() error: " + err);
		});
	} else
		console.error("Modbus constructor error: " + err);
});

