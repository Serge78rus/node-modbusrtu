// Modbus RTU

var fs = require("fs"); 

var crc = require("./crc16");
var serial = require("./serial");

exports.Modbus = Modbus;

Modbus.prototype.options = {
	baud: 9600,
	fmt: "8n2",
	timeout: 1000,
	pause: 200,
	retry: 3
}

function Modbus(dev, opt, done) {
	this.opt = {};
	for (var key in this.options)
		this.opt[key] = opt[key] !== undefined ? opt[key] : this.options[key];
	var self = this;
	return serial.open(dev, this.opt.baud, this.opt.fmt, function(err, fd) {
		if (!err) {
			self.fd = fd;
			done(null);
		} else {
			console.error("Modbus() error: " + err);
			done(err);
		}
	});
}

Modbus.prototype.readCoils = function(slave, addr, cnt, done) { //function 1
	var sbuff = makeRequest(slave, 1, addr, cnt), 
			rbuff = new Buffer((cnt % 8 ? 6 : 5) + Math.floor(cnt / 8));
	this._sndrcv(sbuff, rbuff, function(err, buff) {
		if (!err) {
			done(null, extractBites(buff, cnt));
		} else {
			console.error("Modbus.readCoils() error: " + err);
			done(err);
		}
	});
};

Modbus.prototype.readDiscrInp = function(slave, addr, cnt, done) { //function 2
	var sbuff = makeRequest(slave, 2, addr, cnt), 
			rbuff = new Buffer((cnt % 8 ? 6 : 5) + Math.floor(cnt / 8));
	this._sndrcv(sbuff, rbuff, function(err, buff) {
		if (!err) {
			done(null, extractBites(buff, cnt));
		} else {
			console.error("Modbus.readDiscrInp() error: " + err);
			done(err);
		}
	});
};

Modbus.prototype.readHoldReg = function(slave, addr, cnt, done) { //function 3
	var sbuff = makeRequest(slave, 3, addr, cnt), 
			rbuff = new Buffer(5 + cnt * 2);
	this._sndrcv(sbuff, rbuff, function(err, buff) {
		if (!err) {
			done(null, extractWords(buff, cnt));
		} else {
			console.error("Modbus.readHoldReg() error: " + err);
			done(err);
		}
	});
};

Modbus.prototype.readInpReg = function(slave, addr, cnt, done) { //function 4
	var sbuff = makeRequest(slave, 4, addr, cnt), 
			rbuff = new Buffer(5 + cnt * 2);
	this._sndrcv(sbuff, rbuff, function(err, buff) {
		if (!err) {
			done(null, extractWords(buff, cnt));
		} else {
			console.error("Modbus.readInpReg() error: " + err);
			done(err);
		}
	});
};

Modbus.prototype._sndrcv = function(sbuff, rbuff, done) {
	var self = this, rc = this.opt.retry;
	(function readwrite() {
		//wait lock!!!!!
		fs.write(self.fd, sbuff, 0, sbuff.length, null, function(err, cnt, string) {
			if (!err) {
				var to = setTimeout(function() {
					to = null;
					if (--rc)
						readwrite();
					else {
						console.error("read timeout");
						done(new Error("read timeout"));
					}
				}, self.opt.timeout);
				(function read() {
					fs.read(self.fd, rbuff, 0, rbuff.length, null, function(err, cnt, buff) {
						if (to) {
							if (!err) {
								if (cnt) {
									clearTimeout(to);
									buff = buff.slice(0, cnt);
									if (crc.check(buff)) {
										//console.log("read ok, cnt: " + cnt + " buff: " + buff.toString("hex"));
										done(null, buff);
									} else {
										if (--rc)
											readwrite();
										else {
											console.error("crc16 error");
											done(new Error("crc16 error"));
										}
									}
									//set lock!!!!!
								} else
									read();
							} else {
								clearTimeout(to);
								if (--rc)
									readwrite();
								else {
									console.error("read error");
									done(new Error("read error"));
								}
							}
						}
					});
				})();
			} else {
				if (--rc)
					readwrite();
				else {
					console.error("write error");
					done(new Error("write error"));
				}
			}
		});
	})();
};

function makeRequest(slave, func, addr, cnt/*, data*/) {
	var buff = new Buffer(8);
	buff[0] = slave;
	buff[1] = func;
	buff.writeUInt16BE(addr, 2);
	buff.writeUInt16BE(cnt, 4);
	crc.add(buff);
	return buff;
}

function extractBites(buff, cnt) {
	var data = [];
	for (var i = 0; i < cnt; ++i)
		data.push(buff[3 + Math.floor(i / 8)] & (1 << (i % 8)) ? true : false);
	return data;
}

function extractWords(buff, cnt) {
	var data = [];
	for (var i = 0; i < cnt; ++i)
		data.push(buff.readUInt16BE(3 + i * 2));
	return data;
}

