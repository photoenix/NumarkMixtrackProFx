An unofficial mapping for the [Numark Mixtrack Pro FX](https://www.numark.com/product/mixtrack-pro-fx) for [Mixxx](https://mixxx.org/) 2.2.4, based on the mapping by bad1dea5.

![Pro FX photo](https://www.numark.com/images/product_large/Numark_MixtrackProFX_ortho_web.jpg)
Image: Numark

## Working
* Buttons
  * Play/pause
  * Cue
  * Sync
  * Load track
  * Library knob press - switch between tree and track list
  * Scratch toggle
  * Bleep
  * PFL/headphone cue
  * Loop toggle
  * Reloop
  * Loop half/double
  * Loop in/out
  * Pitch bend up/down
  * Tap BPM
  * Key lock
  * Pitch range (ranges configurable in first lines of the script, by default: 8%, 16%, 100%)
* Pads
  * Hotcues + delete hotcues
  * Auto loop
  * Fader cuts
  * Sampler
* Knobs
  * Master gain
  * Mic gain
  * Cue mix
  * Cue/PFL level
  * Pre-fader Level
  * EQ (high/mid/low)
  * Filter
  * FX dry/wet
  * Browse/scroll
  * FX param
* Sliders
  * Channel fader
  * Crossfader
  * Pitch fader
* Master VU meter
* Jogwheel (pitch/scratch/seek)
* FX on/off

## Not working
* Reset BPM (shift + tap)

## FX select buttons
6 FX buttons act differently than in Serato/VDJ/etc. I don't know how to set a specific effect in Mixxx API, but you can scroll through effect list on both decks. Seems good enough. That leaves two buttons in the middle - they have some bonus functions.
| ~HPF~ deck 1 FX down | ~LPF~ adjust beatgrid    | ~Flanger~ deck 2 FX down |
|----------------------|--------------------------|--------------------------|
| ~Echo~ deck 1 FX up  | ~Reverb~ quantize toggle | ~Phaser~ deck 2 FX up    |

## Bonus functions
* Shift + browse knob scroll = zoom in/out wave display
* Shift + browse knob press = select item (collapse/extend tree or load track)
* Shift + FX param knob = FX param2
* Shift + load = load track to preview deck
* Shift + sample = stop sample playback
* Shift + play = stutter
* Shift + cue = stop and go to track start

## Known bugs
* Pressing shift will disable all lights on a deck.
* Fader cuts button's light in active state is a little darker than other buttons. This is because the whole fader cuts function is somehow burned into the hardware, and pressing this button causes some very strange things to happen. If you try setting this button's light to 0x7F, nearby buttons (cue and auto loop) will also get brighter for some reason. If the light is darker, this doesn't happen.
