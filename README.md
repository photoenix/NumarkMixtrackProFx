An unofficial mapping for the [Numark Mixtrack Pro FX](https://www.numark.com/product/mixtrack-pro-fx) for [Mixxx](https://mixxx.org/) 2.2.4, based on the mapping by bad1dea5.

![Pro FX photo](https://www.numark.com/images/product_large/Numark_MixtrackProFX_ortho_web.jpg)
Image: Numark

## Working
* Buttons
  * Play/pause
  * Stutter
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
  * Hotcues
  * Delete hotcues
  * Samples
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
* Auto loop
* Fader cuts
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

## Notes
Please note that the Pro FX is my first controller and I'm very new to DJing, so I may not know how some advanced controller features are supposed to work like. I'm just trying to replicate the controller's behaviour inside VirtualDJ. Also, I don't know if it's just me, but I find the Mixxx scripting API extremely confusing, so there might be some stupid mistakes in code.
