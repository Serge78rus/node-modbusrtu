// Modbus RTU

var fs = require("fs"); 

var crc = require("./crc16");
var serial = require("./serial");

exports.Modbus = Modbus;

Modbus.prototype.options = { //default options value
	baud: 9600, //communication speed
	fmt: "8n2", //data bits, parity and stop bits
	timeout: 1000, //response timeout
	pause: 200, //pause between response and next request
	retry: 3 //retry counts
}

function Modbus(dev, opt, done) {
	this.opt = {};
	for (var key in this.options)
		this.opt[key] = opt[key] !== undefined ? opt[key] : this.options[key];
	var self = this;
	serial.open(dev, this.opt.baud, this.opt.fmt, function(err, fd) {
		self.fd = err ? null : fd;
		done(err);
	});
}

Modbus.prototype.readCoils = function(slave, addr, cnt, done) { //function 0x01
	var sbuff = makeRequest(slave, 0x01, addr, cnt), 
			rbuff = new Buffer((cnt % 8 ? 6 : 5) + Math.floor(cnt / 8));
	this._sndrcv(sbuff, rbuff, function(err, buff) {
		done(err, err || extractBits(buff, cnt));
	});
};

Modbus.prototype.readDiscrInps = function(slave, addr, cnt, done) { //function 0x02
	var sbuff = makeRequest(slave, 0x02, addr, cnt), 
			rbuff = new Buffer((cnt % 8 ? 6 : 5) + Math.floor(cnt / 8));
	this._sndrcv(sbuff, rbuff, function(err, buff) {
		done(err, err || extractBits(buff, cnt));
	});
};

Modbus.prototype.readHoldRegs = function(slave, addr, cnt, done) { //function 0x03
	var sbuff = makeRequest(slave, 0x03, addr, cnt), 
			rbuff = new Buffer(5 + cnt * 2);
	this._sndrcv(sbuff, rbuff, function(err, buff) {
		done(err, err || extractWords(buff, cnt));
	});
};

Modbus.prototype.readInpRegs = function(slave, addr, cnt, done) { //function 0x04
	var sbuff = makeRequest(slave, 0x04, addr, cnt), 
			rbuff = new Buffer(5 + cnt * 2);
	this._sndrcv(sbuff, rbuff, function(err, buff) {
		done(err, err || extractWords(buff, cnt));
	});
};

Modbus.prototype.writeCoil = function(slave, addr, val, done) { //function 0x05
	var sbuff = makeRequest(slave, 0x05, addr, val ? 0xff00 : 0x0000), 
			rbuff = slave ? new Buffer(8) : null;
	this._sndrcv(sbuff, rbuff, function(err) {
		done(err);
	});
};

Modbus.prototype.writeReg = function(slave, addr, val, done) { //function 0x06
	var sbuff = makeRequest(slave, 0x06, addr, val), 
			rbuff = slave ? new Buffer(8) : null;
	this._sndrcv(sbuff, rbuff, function(err) {
		done(err);
	});
};

Modbus.prototype.writeCoils = function(slave, addr, vals, done) { //function 0x0f
	var sbuff = makeRequest(slave, 0x0f, addr, vals.length, 'b', vals), 
			rbuff = slave ? new Buffer(8) : null;
	this._sndrcv(sbuff, rbuff, function(err) {
		done(err);
	});
};

Modbus.prototype.writeRegs = function(slave, addr, vals, done) { //function 0x10
	var sbuff = makeRequest(slave, 0x10, addr, vals.length, 'w', vals), 
			rbuff = slave ? new Buffer(8) : null;
	this._sndrcv(sbuff, rbuff, function(err) {
		done(err);
	});
};

Modbus.prototype._sndrcv = function(sbuff, rbuff, done) {
	var self = this, rc = this.opt.retry;
	(function readwrite() {
		if (self.pause) {
			//wait pause after previous answer
			var delay = self.pause - new Date().getTime();
			self.pause = 0;
			if (delay > 0) {
				setTimeout(function() {
					readwrite();
				}, delay);
				return;
			}
		}
		fs.write(self.fd, sbuff, 0, sbuff.length, null, function(err, cnt, string) {
			if (!err) {
				if (sbuff[0]) { //not broadcast, wait answer
					var to = setTimeout(function() {
						to = null;
						if (--rc)
							readwrite();
						else
							done(new Error("read timeout"));
					}, self.opt.timeout);
					(function read() {
						fs.read(self.fd, rbuff, 0, rbuff.length, null, function(err, cnt, buff) {
							if (to) {
								if (!err) {
									if (cnt) {
										clearTimeout(to);
										buff = buff.slice(0, cnt);
										if (self.opt.pause) {
											//set pause after answer
											self.pause = new Date().getTime() + self.opt.pause;
											setTimeout(function() {
												self.pause = 0;
											}, self.opt.pause);
										}
										if (crc.check(buff)) {
											if (sbuff[0] == buff[0]) {
												if (sbuff[1] == buff[1]) {
													done(null, buff);
												} else {
													if (--rc)
														readwrite();
													else {
														if (sbuff[1] | 80 == buff[1]) {
															switch (buff[2]) {
																case 1:
																	done(new Error("slave exception: illegal function"));
																	break;
																case 2:
																	done(new Error("slave exception: illegal address"));
																	break;
																case 3:
																	done(new Error("slave exception: illegal value"));
																	break;
																default:
																	done(new Error("unknown slave exception: " + buff[2]));
															}
														} else
															done(new Error("invalid func in answer"));
													}
												}
											} else {
												if (--rc)
													readwrite();
												else
													done(new Error("invalid slave in answer"));
											}
										} else {
											if (--rc)
												readwrite();
											else
												done(new Error("crc16 error"));
										}
									} else
										read();
								} else {
									clearTimeout(to);
									if (--rc)
										readwrite();
									else 
										done(new Error("read error"));
								}
							}
						});
					})();
				} else { //broadcast request, no wait answer
					if (self.opt.pause) {
						//set pause after broadcast request
						self.pause = new Date().getTime() + self.opt.pause;
						setTimeout(function() {
							self.pause = 0;
						}, self.opt.pause);
					}
					done();
				}
			} else {
				if (--rc)
					readwrite();
				else
					done(new Error("write error"));
			}
		});
	})();
};

function makeRequest(slave, func, addr, b45, type, data) {
	switch (type) {
		case 'b':
			var bytes = b45 >> 3;
			if (b45 & 0x07)
				++bytes;
			break;
		case 'w':
			var bytes = b45 * 2;
			break;
	}
	var buff = new Buffer(bytes ? 9 + bytes : 8);
	buff[0] = slave;
	buff[1] = func;
	buff.writeUInt16BE(addr, 2);
	buff.writeUInt16BE(b45, 4);
	if (bytes)
		buff[6] = bytes;
	switch (type) {
		case 'b':
			for (var i = 0; i < b45; ++i) {
				var idx = 7 + (i >> 3);
				if (!(i & 0x07))
					buff[idx] = 0;
				if (data[i])
					buff[idx] |= 1 << (i & 0x07);
			}
			break;
		case 'w':
			for (var i = 0; i < b45; ++i)
				buff.writeUInt16BE(data[i], 7 + i * 2);
			break;
	}
	crc.add(buff);
	return buff;
}

function extractBits(buff, cnt) {
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

