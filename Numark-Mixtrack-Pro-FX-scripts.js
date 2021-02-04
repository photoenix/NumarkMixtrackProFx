var MixtrackProFX = {};

MixtrackProFX.pitchRanges = [0.08, 0.16, 1];

MixtrackProFX.shifted = false;

// initialization
MixtrackProFX.init = function(id, debug) {
	MixtrackProFX.effect = new components.ComponentContainer();
	MixtrackProFX.effect[1] = new MixtrackProFX.EffectUnit(1);
	MixtrackProFX.effect[2] = new MixtrackProFX.EffectUnit(2);

	MixtrackProFX.deck = new components.ComponentContainer();
	MixtrackProFX.deck[1] = new MixtrackProFX.Deck(1, 0, MixtrackProFX.effect[1]);
	MixtrackProFX.deck[2] = new MixtrackProFX.Deck(2, 1, MixtrackProFX.effect[2]);

	MixtrackProFX.browse = new MixtrackProFX.Browse();
	MixtrackProFX.headGain = new MixtrackProFX.HeadGain();

	var exitDemoSysex = [0xF0, 0x7E, 0x00, 0x06, 0x01, 0xF7];
	midi.sendSysexMsg(exitDemoSysex, exitDemoSysex.length);

	var statusSysex = [0xF0, 0x00, 0x20, 0x7F, 0x03, 0x01, 0xF7];
	midi.sendSysexMsg(statusSysex, statusSysex.length);

	// initialize channel leds
	for(var i = 0; i < 2; i++) {
		midi.sendShortMsg(0x90 + i, 0x00, 0x01); // play
		midi.sendShortMsg(0x90 + i, 0x01, 0x01); // cue
		midi.sendShortMsg(0x90 + i, 0x02, 0x01); // sync
		midi.sendShortMsg(0x90 + i, 0x07, 0x7f); // scratch
		midi.sendShortMsg(0x90 + i, 0x1B, 0x01); // pfl

		midi.sendShortMsg(0x94 + i, 0x00, 0x01); // cue
		midi.sendShortMsg(0x94 + i, 0x0D, 0x01); // auto
		midi.sendShortMsg(0x94 + i, 0x07, 0x01); // fader
		midi.sendShortMsg(0x94 + i, 0x0B, 0x01); // sample

		midi.sendShortMsg(0x94 + i, 0x34, 0x01); // half
		midi.sendShortMsg(0x94 + i, 0x35, 0x01); // double
		midi.sendShortMsg(0x94 + i, 0x40, 0x01); // loop

		// pads
		for (var j = 0; j < 8; j++)
			midi.sendShortMsg(0x94 + i, 0x14 + j, 0x01);
	}

	midi.sendShortMsg(0x88, 0x09, 0x01); // tap led

	// effect leds
	midi.sendShortMsg(0x88, 0x00, 0x01); // hpf
	midi.sendShortMsg(0x88, 0x01, 0x01); // lpf
	midi.sendShortMsg(0x88, 0x02, 0x01); // flanger
	midi.sendShortMsg(0x89, 0x03, 0x01); // echo
	midi.sendShortMsg(0x89, 0x04, 0x01); // reverb
	midi.sendShortMsg(0x89, 0x05, 0x01); // phaser

	// vumeters leds (off)
	midi.sendShortMsg(0xB0, 0x1F, 0x00);
	midi.sendShortMsg(0xB1, 0x1F, 0x00);

	engine.makeConnection("[Channel1]", "VuMeter", MixtrackProFX.vuCallback);
	engine.makeConnection("[Channel2]", "VuMeter", MixtrackProFX.vuCallback);
};

// shutdown
MixtrackProFX.shutdown = function() {
	var shutdownSysex = [0xF0, 0x00, 0x20, 0x7F, 0x02, 0xF7];
	midi.sendSysexMsg(shutdownSysex, shutdownSysex.length);
};

// effect
MixtrackProFX.EffectUnit = function(unitNumber) {
	var eu = this;
	this.unitNumber = unitNumber;
	this.group = "[EffectRack1_EffectUnit" + unitNumber + "]";

	/*this.setCurrentUnit = function(newNumber) {
		this.currentUnitNumber = newNumber;
		this.group = "[EffectRack1_EffectUnit" + newNumber + "]";

		this.reconnectComponents(function(component) {
			var unitMatch = component.group.match(script.effectUnitRegEx);
			if (unitMatch !== null) {
				component.group = eu.group;
			} else {
				var effectMatch = component.group.match(script.individualEffectRegEx);
				if (effectMatch !== null) {
					component.group = "[EffectRack1_EffectUnit" +
					eu.currentUnitNumber +
					"_Effect" + effectMatch[2] + "]";
				}
			}
		});
	};

	this.setCurrentUnit(unitNumber);*/

	this.enableButton = new components.Button({
		input: function(channel, control, value, status, group) {
			if (value == 2) value = 1;
			engine.setValue(group, "enabled", value);
		}
	});

	this.dryWetKnob = new components.Pot({
		group: this.group,
		inKey: "mix"
	});

	this.tap = new components.Button({
		group: "[Channel" + this.unitNumber + "]",
		inKey: "bpm_tap"
	});

	this.effectParam = new components.Encoder({
		group: "[EffectRack1_EffectUnit" + unitNumber + "_Effect1]",
		inKey: "parameter1",
		shift: function() {
			this.inKey = "parameter2";
		},
		unshift: function() {
			this.inKey = "parameter1";
		},
		input: function (channel, control, value, status, group) {
			if (value == 0x01)
				this.inSetParameter(this.inGetParameter() + 0.05);
			else if (value == 0x7F)
				this.inSetParameter(this.inGetParameter() - 0.05);
		}
	});
};

MixtrackProFX.EffectUnit.prototype = new components.ComponentContainer();

// deck
MixtrackProFX.Deck = function(number, channel, effect) {
	var deck = this;

	components.Deck.call(this, number);

	this.playButton = new components.PlayButton({
		midi: [0x90 + channel, 0x00],
		off: 0x01
	});

	this.playButtonStutter = new components.Button({
		inKey: "play_stutter"
	});

	this.cueButton = new components.CueButton({
		midi: [0x90 + channel, 0x01],
		off: 0x01
	});

	this.syncButton = new components.SyncButton({
		midi: [0x90 + channel, 0x02],
		off: 0x01
	});

	this.pflButton = new components.Button({
		type: components.Button.prototype.types.toggle,
		midi: [0x90 + channel, 0x1B],
		off: 0x01,
		key: "pfl"
	});

	this.loadButton = new components.Button({
		inKey: "LoadSelectedTrack",
		shift: function() {
			this.group = "[PreviewDeck" + (channel + 1) + "]";
		},
		unshift: function() {
			this.group = "[Channel" + (channel + 1) + "]";
		}
	});

	this.volume = new components.Pot({
		midi: [0xB0 + channel, 0x1C],
		group: this.currentDeck,
		inKey: "volume",
	});

	this.EqEffectKnob = function(group, inKey, fxKey, filter) {
		this.unshiftGroup = group;
		this.unshiftKey = inKey;
		this.fxKey = fxKey;

		if(filter) {
			this.shiftKey = "super1";
		}

		this.ignoreNext = null;

		components.Pot.call(this, {
			group: group,
			inKey: inKey
		});
	};

	this.EqEffectKnob.prototype = new components.Pot({
	});

	this.treble = new this.EqEffectKnob("[EqualizerRack1_" + this.currentDeck + "_Effect1]", "parameter3", "parameter3");
	this.mid = new this.EqEffectKnob("[EqualizerRack1_" + this.currentDeck + "_Effect1]", "parameter2", "parameter4");
	this.bass = new this.EqEffectKnob("[EqualizerRack1_" + this.currentDeck + "_Effect1]", "parameter1", "parameter5");

	this.filter = new this.EqEffectKnob(
		"[QuickEffectRack1_" + this.currentDeck + "]",
		"super1",
		"parameter1",
		true
	);

	this.gain = new this.EqEffectKnob(
		this.currentDeck,
		"pregain",
		"parameter2"
	);

	this.pitch = new components.Pot({
		inKey: "rate"
	});

	this.hotcueButton = new components.ComponentContainer();

	for(var i = 1; i <= 4; i++) {
		this.hotcueButton[i] = new components.HotcueButton({
			midi: [0x94 + channel, 0x14 + i - 1],
			number: i,
			group: this.currentDeck,
			off: 0x01
		});
	}

	this.shiftButton = new components.Button({
		type: components.Button.prototype.types.powerWindow,
		input: function(channel, control, value, status, group) {
			if(value == 0x7F) {
				MixtrackProFX.shifted = true;
				deck.shift();
				MixtrackProFX.browse.shift();
				MixtrackProFX.effect.shift();
			} else if (value == 0) {
				MixtrackProFX.shifted = false;
				deck.unshift();
				MixtrackProFX.browse.unshift();
				MixtrackProFX.effect.unshift();
			}
		}
	});

	this.loop = new components.Button({
		key: "loop_enabled",
		midi: [0x94 + channel, 0x40],
		off: 0x01,
		input: function(channel, control, value, status, group) {
			if (engine.getValue(group, "loop_enabled") == 0)
				script.triggerControl(group, "beatloop_activate");
			else
				script.triggerControl(group, "beatlooproll_activate");
		}
	});

	this.reloop = new components.Button({
		inKey: "loop_in_goto"
	});

	this.loopHalf = new components.Button({
		inKey: "loop_halve"
	});

	this.loopDouble = new components.Button({
		inKey: "loop_double"
	});

	this.loopIn = new components.Button({
		inKey: "loop_in"
	});

	this.loopOut = new components.Button({
		inKey: "loop_out"
	});

	this.bleep = new components.Button({
		type: components.Button.prototype.types.powerWindow,
		key: "reverseroll"
	});

	this.pitchBendUp = new components.Button({
		type: components.Button.prototype.types.powerWindow,
		key: "rate_temp_up"
	});

	this.pitchBendDown = new components.Button({
		type: components.Button.prototype.types.powerWindow,
		key: "rate_temp_down"
	});

	this.keylock = new components.Button({
		type: components.Button.prototype.types.toggle,
		inKey: "keylock"
	});

	this.pitchRange = new components.Button({
		currentRangeIdx: 0,
		input: function(channel, control, value, status, group) {
			this.currentRangeIdx = (this.currentRangeIdx + 1) % MixtrackProFX.pitchRanges.length;
			engine.setValue(group, "rateRange", MixtrackProFX.pitchRanges[this.currentRangeIdx]);
		}
	});

	this.prevEffect = new components.Button({
		group: "[EffectRack1_EffectUnit" + number + "_Effect1]",
		inKey: "prev_effect"
	});

	this.nextEffect = new components.Button({
		group: "[EffectRack1_EffectUnit" + number + "_Effect1]",
		inKey: "next_effect"
	});

	this.beatsnap = new components.Button({
		type: components.Button.prototype.types.toggle,
		inKey: "quantize"
	});

	this.setBeatgrid = new components.Button({
		inKey: "beats_translate_curpos"
	});

	this.reconnectComponents(function(component) {
		if(component.group === undefined) {
			component.group = this.currentDeck;
		}
	});
};

MixtrackProFX.Deck.prototype = new components.Deck();

// browse
MixtrackProFX.Browse = function() {
	this.knob = new components.Encoder({
		group: "[Library]",
		inKey: "Move",
		input: function (channel, control, value, status, group) {
			if (value === 1)
				engine.setParameter(this.group, this.inKey + "Down", 1);
			else if (value === 127)
				engine.setParameter(this.group, this.inKey + "Up", 1);
		}
	});

	this.knobShift = new components.Encoder({
		group: "[Channel1]", // if it's stupid and works, then it's not stupid
		input: function (channel, control, value, status, group) {
			if (value === 1)
				engine.setParameter(this.group, "waveform_zoom_up", 1);
			else if (value === 127)
				engine.setParameter(this.group, "waveform_zoom_down", 1);
		}
	});

	this.button = new components.Button({
		group: "[Library]",
		inKey: "MoveFocusForward"
	});

	this.buttonShift = new components.Button({
		group: "[Library]",
		inKey: "GoToItem"
	});
};

MixtrackProFX.Browse.prototype = new components.ComponentContainer();

MixtrackProFX.HeadGain = function() {
	components.Pot.call(this);
};

MixtrackProFX.HeadGain.prototype = new components.Pot({
	group: "[Master]",
	inKey: "headGain"
});

MixtrackProFX.scratching = [false, false];
MixtrackProFX.scratchModeEnabled = [true, true];

MixtrackProFX.scratchToggle = function(channel, control, value, status, group) {
	MixtrackProFX.scratchModeEnabled[channel] = !MixtrackProFX.scratchModeEnabled[channel];
	midi.sendShortMsg(0x90 | channel, 0x07, MixtrackProFX.scratchModeEnabled[channel] ? 0x7F : 0x01);
};

MixtrackProFX.wheelTouch = function (channel, control, value, status, group) {
	var deckNumber = channel + 1;

	if (MixtrackProFX.shifted)
		return; // seeking

	if (MixtrackProFX.scratchModeEnabled[channel] && value == 0x7F) {
		// touch start
		var alpha = 1.0/8;
		var beta = alpha/32;

		engine.scratchEnable(deckNumber, 2048, 33+1/3, alpha, beta);
		MixtrackProFX.scratching[channel] = true;
	} else if (value == 0) {
		// touch end
		engine.scratchDisable(deckNumber);
		MixtrackProFX.scratching[channel] = false;
	}
}

MixtrackProFX.wheelTurn = function (channel, control, value, status, group) {
	var deckNumber = channel + 1;

	var newValue = value;
	var backwards = false;

	if (value >= 64)
	{
		newValue -= 128;
		backwards = true;
	}

	if (MixtrackProFX.shifted)
	{
		// seek
		if (backwards)
			engine.setParameter(group, "beatjump_1_backward", 1);
		else
			engine.setParameter(group, "beatjump_1_forward", 1);
	} else if (MixtrackProFX.scratchModeEnabled[channel] && engine.isScratching(deckNumber)) {
		engine.scratchTick(deckNumber, newValue); // scratch
	} else {
		engine.setValue(group, "jog", newValue); // pitch bend
	}
}

MixtrackProFX.vuCallback = function(value, group, control) {
	var level = value * 90;

	if(engine.getValue("[Channel1]", "pfl")
		|| engine.getValue("[Channel2]", "pfl"))
	{
		if (group == "[Channel1]") {
			midi.sendShortMsg(0xB0, 0x1F, level);
		}
		else if (group == "[Channel2]") {
			midi.sendShortMsg(0xB1, 0x1F, level);
		}
	}
	else if (group == "[Channel1]") {
		midi.sendShortMsg(0xB0, 0x1F, level);
	}
	else if (group == "[Channel2]") {
		midi.sendShortMsg(0xB1, 0x1F, level);
	}
};
