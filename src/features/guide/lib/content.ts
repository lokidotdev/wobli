// Everything the guide says, kept apart from how it is laid out. The worked example is Card Tap, idea 5 of the idea bank.

/** Step 1: the idea as one row. */
export const BRIEF = [
  ['Name', 'Payment Card Tap'],
  ['Category', 'Payments'],
  ['In one line', 'Card taps terminal, waves, success check, receipt.'],
] as const

/** Step 1: what every general description has to hold to. */
export const RULES = [
  ['One hero object', 'A single icon or device, like a folder, a phone or a card. No rooms, no scenery.'],
  ['One clear story', 'One product moment, such as receiving, uploading, syncing or paying, that reads within a second.'],
  ['A seamless loop', 'Two to four seconds that end on the pose they started from, so it can autoplay or play on hover.'],
  ['Brand neutral', 'Generic UI, no real logos. Colours stay swappable: one accent plus neutrals to begin with.'],
] as const

/** Step 1: the general description every illustration is made under, word for word. It goes to the agent with each idea. */
export const GENERAL = `Every idea is a single UI object or device performing one product action on a loop. They're built for landing page heroes, feature sections, empty states and onboarding screens.

- One hero object. Use a single isometric icon or device, like a folder, phone or card, on a transparent or soft-shadow base. No full rooms or scenery.
- One clear story. Each loop shows one product moment, like receiving, uploading, syncing or paying, and reads within 1 second.
- Seamless loop. The animation follows a fixed beat (rest, action, settle, reset to rest), 2–4 seconds long, so it can autoplay or play on hover.
- Brand-neutral. Use generic UI cards, with no real app logos or brand marks. Keep colors swappable, starting from a default of one accent color plus neutrals.
- Exportable. Keep the shapes simple enough to ship as Lottie, SVG or a small GIF or WebM.
- Morph, don't swap. When one element replaces another, like a "$" becoming a checkmark, a progress ring becoming a tick or a button becoming a badge, the first shape morphs into the second along a shared outline. Nothing vanishes and pops back in as something new, and there are no hard cuts or plain crossfades.
- Clean, minimal, modern parts. Build every part from a few flat geometric shapes with soft rounded corners, one consistent stroke weight and gentle shading on the isometric faces. Skip textures, heavy gradients and extra detail. If a part doesn't help tell the story, leave it out.`

/** Step 2: the animation description, as written. */
export const STORY =
  'An isometric credit card hovers above a card terminal. The card tilts down and taps the terminal, and contactless waves ripple out. The terminal screen morphs from “$” into a green checkmark, and a small receipt paper slides out and curls slightly. The card lifts back to its start position and the receipt retracts. Loop: 3s. Palette: purple gradient card, dark terminal, green success.'

export const BEATS = [
  ['Rest', 'The card hovers above the terminal.'],
  ['Action', 'It tilts down and taps; waves ripple out.'],
  ['Settle', '“$” morphs into a check; the receipt slides out.'],
  ['Reset', 'The card lifts back, the receipt retracts.'],
] as const

/** Step 3: the two skills, and what each one brings. */
export const SKILLS = [
  {
    name: 'fun-isometric',
    job: 'Draws It',
    text: 'The drawing style and the motion library. It knows how a sticker is built and which moves exist, so the agent composes instead of inventing.',
    gives: ['Flat fills, one thick outline, an extruded slab side', 'Motion presets written as real animation keyframes', 'Colour as roles, so any palette fits', 'A check and a frame renderer'],
    href: 'https://www.designeng.tools/resources/fun-isometric-kelvinkn17-skills',
    link: 'By Kelvin Adithya',
  },
  {
    name: 'apple-design',
    job: 'Moves It',
    text: 'The taste for how things should move. It decides what earns a spring, what must not overshoot, and when to hold still.',
    gives: ['Feedback lands on the frame of its cause', 'Only things with momentum bounce', 'Followers lag a few frames, never lockstep', 'Restraint: one or two sparkles, a long hold'],
    href: 'https://www.designeng.tools/resources/emilkowalski-apple-design',
    link: 'By Emil Kowalski',
  },
] as const

export const PROMPT = `/fun-isometric a credit card tapping a card terminal, facing top right

Use the apple-design skill for the motion.

General description:
${GENERAL}

The idea:
Payment Card Tap. Card taps terminal, waves, success check, receipt.

Animation description:
${STORY}`

export const FILES = `packages/wobli/src/icons/card-tap.ts        the drawing: layers, shapes and keyframes
packages/wobli/src/icons/card-tap.meta.ts   its title, description, category and tags

// card-tap.ts, in short
const cardTap: Icon = {
  name: 'card-tap',
  frames: 180,   // 3 seconds at 60 fps
  still: 92,     // the frame that reads whole
  layers: [/* the card, the reader, the receipt, a sparkle */],
}`

/** Step 4. */
export const RUN = `pnpm --filter wobli check card-tap
pnpm --filter wobli poster card-tap`

export const CHECKS = [
  'Every colour is a role, not a hex code',
  'Nothing touches the canvas edge on any frame',
  'Shapes that morph have matching points',
  'The last frame meets the first, so the loop has no jump',
] as const

/** Step 5: every way an illustration leaves the site, the same list as the editor's Export panel. */
export const FORMATS = [
  ['PNG', '512, 1024 or 2048 px. Transparent, or on your background.'],
  ['SVG', 'Editable vectors. Save the file or paste it straight into Figma.'],
  ['MP4', 'H.264 video at 480, 720 or 1080p, one to three loops. Plays everywhere.'],
  ['WebM', 'VP9 video with a transparent background, for the web.'],
  ['React', 'A component from the wobli package, for React and Next.js.'],
  ['Embed', 'A hosted player in an iframe, for any site.'],
] as const

/**
 * The closer: what to change for a different look. Three kinds of change, two of each; `from` is what we use today and
 * `tries` are short enough to read as chips.
 */
export const SWAPS = [
  {
    kind: 'Swap a skill',
    note: 'Biggest change. Same descriptions, different hands.',
    items: [
      { change: 'The drawing skill', from: 'fun-isometric', how: 'It is why these are slab stickers. Another style skill draws the same idea its own way.', tries: ['Flat line art', 'Clay 3D', 'Pixel art', 'Your brand guide'] },
      { change: 'The motion skill', from: 'apple-design', how: 'It gives calm, physical motion with long holds. Another one changes the personality, not the drawing.', tries: ['Bouncy cartoon', 'Squash and stretch', 'Strict, no overshoot'] },
    ],
  },
  {
    kind: 'Rewrite a description',
    note: 'Plain words in, so plain words change it.',
    items: [
      { change: 'The general description', from: 'One object, one story', how: 'Those are our rules, not the method’s. Loosen them and the ideas change shape.', tries: ['A small scene', 'A character', 'A full device screen'] },
      { change: 'The animation description', from: 'Four beats, 3s loop', how: 'Whatever you write for the beats, the length and the palette is what gets animated.', tries: ['A 6 second loop', 'One-shot entrance', 'Hard cuts, no morphs'] },
    ],
  },
  {
    kind: 'Change a setting',
    note: 'Smallest change. No redraw needed.',
    items: [
      { change: 'The palette', from: 'System', how: 'Colours are roles, so a new palette is new values for the same roles.', tries: ['Two brand colours', 'One hue, six shades', 'A built-in set'] },
      { change: 'The house rules', from: '5px outline, 180 frames', how: 'Outline weight, facing, canvas size and frame count live in one guide the agent follows.', tries: ['No outline', 'Front-on view', '120 frames'] },
    ],
  },
] as const
