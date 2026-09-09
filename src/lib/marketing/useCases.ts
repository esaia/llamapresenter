import type { CardIcon } from '@/components/marketing/LinkCard';

import { LANGUAGES_ART, type MarketingArt, OUTPUTS_ART, REMOTE_ART, TEMPLATE_ART, TIMER_ART } from './art';

/**
 * The use cases, and everything each page is made of.
 *
 * One row per page: the card that links to it, the metadata, and the copy.
 * They are written rather than generated — a page that says nothing a church
 * could not have guessed is worth less than no page at all — but they share a
 * shape, so `use-cases/[slug]` renders every one of them.
 */

export type UseCase = {
  /** The path segment, and what the whole row is keyed by. */
  slug: string;
  /** On the card, in the related list, and in the breadcrumb. */
  name: string;
  /** The card's one line. */
  card: string;
  icon: CardIcon;
  title: string;
  description: string;
  /** The headline, split where the yellow stroke starts. */
  headline: [string, string];
  lede: string;
  art: MarketingArt;
  /** What the church gets, in three or four cards. */
  points: { title: string; body: string }[];
  /** The same thing again as a running order, because that is how it is used. */
  steps: string[];
  faq: { q: string; a: string }[];
  /** Slugs of the two or three pages a reader of this one wants next. */
  related: string[];
};

export const USE_CASES: UseCase[] = [
  {
    slug: 'multilingual-church-services',
    name: 'Multilingual services',
    card: 'Two or more languages on the same slide, and each screen showing the ones it needs.',
    icon: 'languages',
    title: 'Dual Language Bible Verse Display Software | LlamaPresenter',
    description:
      'Dual language Bible verse display software for bilingual churches: two or more translations side by side '
      + 'on one slide, songs in every language they are sung in, and a different pair on each screen.',
    headline: ['Dual language Bible verses,', 'on the same slide'],
    lede:
      'A bilingual church usually pays for it twice: once when somebody types the second language into every '
      + 'slide, and again on Sunday when the two sets drift apart. This is side by side scripture on the '
      + 'projector without a second set of slides — a language is something you arm, not something you type.',
    art: LANGUAGES_ART,
    points: [
      {
        title: 'Side by side scripture on the projector',
        body: 'Send a verse and it is drawn in each language you have on, in the order you set. Nothing is pasted '
          + 'and nothing is duplicated.',
      },
      {
        title: 'Each screen chooses',
        body: 'The congregation can read two while the stage carries one and the stream carries the other. It is '
          + 'the same verse, drawn for each screen.',
      },
      {
        title: 'Songs work the same way',
        body: 'A song holds the languages it is sung in. They stack on the big screen, and the stage and the lower '
          + 'third each carry one of them.',
      },
      {
        title: 'Your language is not a special case',
        body: 'Pick a translation from a public archive inside the console — over a thousand of them — or upload a '
          + 'file of your own.',
      },
    ],
    steps: [
      'Add the languages your congregation reads, in the order they should appear.',
      'Choose which of them each output carries — projector, stage, lower third.',
      'Search a passage once. Every armed language comes out on the slide together.',
      'Turn a language on or off mid-service with one click, without touching the slides.',
    ],
    faq: [
      {
        q: 'Is this dual language Bible verse display software?',
        a: 'Yes. Two or more translations are drawn on the same slide from one passage read once, which is the '
          + 'part a church usually does by hand in other presentation software.',
      },
      {
        q: 'How many languages can one slide carry?',
        a: 'As many as your plan allows and the screen can hold legibly. Two is the common case, and three is '
          + 'workable on a wide projector.',
      },
      {
        q: 'Can the stream show a different language from the projector?',
        a: 'Yes. Each output picks the languages it carries, so the room can read two while the stream carries the '
          + 'one your online congregation needs.',
      },
      {
        q: 'What if our translation is not in the list?',
        a: 'Browse the public archives from inside the console, or upload the file yourself. It then reads exactly '
          + 'like the translations we ship, side by side with them.',
      },
    ],
    related: ['bible-verses-on-screen', 'worship-song-lyrics', 'church-livestream-graphics'],
  },
  {
    slug: 'bible-verses-on-screen',
    name: 'Bible verses on screen',
    card: 'Search a passage, send it to the wall, and step through it a verse at a time.',
    icon: 'book',
    title: 'Put Bible Verses on the Screen at Church | LlamaPresenter',
    description:
      'Search a passage and send it to the projector, the stage and the stream in seconds. Multiple '
      + 'translations, your own layout, and nothing to install.',
    headline: ['Bible verses on the screen,', 'in seconds'],
    lede:
      'The reading is announced and the passage has to be up before the second sentence. That is the whole job, '
      + 'and everything here is built around doing it in one search box.',
    art: LANGUAGES_ART,
    points: [
      {
        title: 'One box, any reference',
        body: 'Type the reference or a phrase from it. The chapter opens as cards, and the card you click is what '
          + 'the room sees.',
      },
      {
        title: 'Verse by verse, or the whole passage',
        body: 'Step through a reading a card at a time, or group verses so a long passage arrives in readable '
          + 'pieces.',
      },
      {
        title: 'Your own layout',
        body: 'Set the typeface, the size and the background once, in the template editor, and every verse comes '
          + 'out in it.',
      },
      {
        title: 'It comes from our own copy',
        body: 'Scripture is read out of our database rather than fetched from somebody else mid-service, so a slow '
          + 'third party can never hold up a reading.',
      },
    ],
    steps: [
      'Search the reference in the console.',
      'Click the verse to put it on the screens.',
      'Use the arrows, or your phone, to walk through the passage.',
      'Clear the slide when the reading ends.',
    ],
    faq: [
      {
        q: 'Which translations are included?',
        a: 'The catalogue in the console lists what we hold, and you can add your own from a public archive or '
          + 'from a file. Everything is served from our own database.',
      },
      {
        q: 'Can I show two translations at once?',
        a: 'Yes. Arm both languages and the verse comes out in each of them on the same slide.',
      },
      {
        q: 'Is the Bible part of the free plan?',
        a: 'Yes. The Bible, both outputs and the stage display are never gated. Pro raises the limits around them.',
      },
    ],
    related: ['multilingual-church-services', 'worship-song-lyrics', 'stage-display'],
  },
  {
    slug: 'worship-song-lyrics',
    name: 'Worship song lyrics',
    card: 'Your library, your running order, and the words on the wall a beat before they are sung.',
    icon: 'lyrics',
    title: 'Worship Song Lyrics Software for Churches | LlamaPresenter',
    description:
      'Keep your song library online, build the running order for Sunday, and send lyrics to the projector, the '
      + 'stage and the stream. Import an existing ProPresenter library.',
    headline: ['Worship song lyrics,', 'up before the first line is sung'],
    lede:
      'A song is a running order of its own, and the person on the keys is not the person on the laptop. The '
      + 'library, the order and the blocks are built during the week so Sunday is arrows and nothing else.',
    art: TEMPLATE_ART,
    points: [
      {
        title: 'Bring the library you have',
        body: 'Drop a ProPresenter export on the console and we read the lyrics out of it, song by song. It is the '
          + 'words we take; the look comes from your template here.',
      },
      {
        title: 'Blocks, not slides',
        body: 'Verses and choruses are blocks you can join, split or reorder, so a repeat is a move rather than a '
          + 'copy of the same slide.',
      },
      {
        title: 'Sung in two languages',
        body: 'A song carries the languages it is sung in. They stack on the big screen, and the stage and the '
          + 'lower third each take one.',
      },
      {
        title: 'Music beside the words',
        body: 'Your own tracks play from the console, so the pre-service bed and the words are run from one place.',
      },
    ],
    steps: [
      'Import or write the songs into your library.',
      'Build Sunday’s running order in the rail.',
      'Send the first block and walk through it with the arrows or your phone.',
      'Jump to a repeat without hunting for a duplicate slide.',
    ],
    faq: [
      {
        q: 'Can I import songs from ProPresenter?',
        a: 'Yes. A ProPresenter 7 document or bundle is read for its lyrics, slide by slide, and turned into songs '
          + 'here.',
      },
      {
        q: 'Do you provide the songs themselves?',
        a: 'No. You bring your own lyrics, and your CCLI reporting stays with you as it always did.',
      },
      {
        q: 'Can the stage screen show something different from the wall?',
        a: 'Yes. The stage carries the current block and what is next, and can carry a different language from the '
          + 'projector.',
      },
    ],
    related: ['multilingual-church-services', 'stage-display', 'lower-thirds'],
  },
  {
    slug: 'church-livestream-graphics',
    name: 'Livestream graphics',
    card: 'A transparent browser source for OBS: verses, lyrics and name cards over your stream.',
    icon: 'stream',
    title: 'Church Livestream Graphics for OBS | LlamaPresenter',
    description:
      'Put Bible verses, song lyrics and lower thirds over your church livestream with a transparent browser '
      + 'source. No capture card, no NDI, nothing to install on the streaming machine.',
    headline: ['Church livestream graphics,', 'without a broadcast rig'],
    lede:
      'The stream needs its own version of the slide: smaller, lower, and often in a different language from the '
      + 'wall. It is a link you paste into OBS once, and it stays right for the rest of the service.',
    art: OUTPUTS_ART,
    points: [
      {
        title: 'A browser source, not hardware',
        body: 'Paste the stream link into OBS or vMix as a browser source. There is no capture card and no video '
          + 'feed to route around the building.',
      },
      {
        title: 'Its own look',
        body: 'The stream has its own template, so the text can sit where your camera framing wants it rather than '
          + 'where the projector wants it.',
      },
      {
        title: 'Its own language',
        body: 'Carry English online while the room reads two, from the same verse the operator just sent.',
      },
      {
        title: 'Name cards on top',
        body: 'A lower third for whoever is speaking is fired from the console and counts itself down.',
      },
    ],
    steps: [
      'Open the stream output link from the console.',
      'Add it to OBS as a browser source, sized to your canvas.',
      'Choose which languages and which template the stream carries.',
      'Run the service. What you send appears over the stream, transparent behind.',
    ],
    faq: [
      {
        q: 'Does it work with OBS?',
        a: 'Yes. It is a normal browser source with a transparent background, so anything that takes one — OBS, '
          + 'vMix, Ecamm — can take it.',
      },
      {
        q: 'Do I need a capture card or NDI?',
        a: 'No. The stream output is a web page rather than a video signal, so it travels as a link rather than as '
          + 'a feed.',
      },
      {
        q: 'Can the stream show something different from the projector?',
        a: 'Yes. The template and the languages are set per output, so the stream and the wall need not agree on '
          + 'either.',
      },
    ],
    related: ['lower-thirds', 'multilingual-church-services', 'stage-display'],
  },
  {
    slug: 'stage-display',
    name: 'Stage display',
    card: 'What is up, what is next, the clock and the timer — on the screen the platform can see.',
    icon: 'stage',
    title: 'Church Stage Display and Confidence Monitor | LlamaPresenter',
    description:
      'Multi-screen worship software: give the platform a stage view with the current slide, what is next, the '
      + 'running order, a clock and a countdown. It opens on any screen with a browser.',
    headline: ['A church stage display,', 'not just a bigger monitor'],
    lede:
      'The person preaching needs three things: what is on the wall, what is coming, and how long is left. The '
      + 'stage view is those three, on a screen that costs whatever an old laptop costs.',
    art: TIMER_ART,
    points: [
      {
        title: 'Now and next',
        body: 'The current slide and the one after it, so nobody is reading the wall over their shoulder.',
      },
      {
        title: 'The clock and the countdown',
        body: 'Wall time and the timer for this part of the service, side by side.',
      },
      {
        title: 'A screen, not a seat',
        body: 'It is a link. Open it on a smart TV, a spare laptop or a tablet — there is no cable to the booth and '
          + 'nothing installed on it.',
      },
      {
        title: 'Its own language',
        body: 'The platform can read the language they preach in while the congregation reads another.',
      },
    ],
    steps: [
      'Open the stage link on the screen at the front of the platform.',
      'Choose what it carries: languages, the agenda, the clock.',
      'Run the service from the console. The stage keeps up on its own.',
      'Start a countdown when a segment begins; the platform sees it immediately.',
    ],
    faq: [
      {
        q: 'What hardware does the stage screen need?',
        a: 'Anything with a browser: a TV stick, an old laptop, a tablet. It only has to reach the link.',
      },
      {
        q: 'Can we have more than one stage screen?',
        a: 'Yes. The link can be opened on as many screens as you like, and there is no per-screen cost.',
      },
      {
        q: 'Can the stage screen carry a countdown?',
        a: 'Yes. The church stage display countdown timer sits beside the current slide and what is next, and it '
          + 'has a link of its own for a screen that should show only the clock.',
      },
      {
        q: 'Is there a timer-only screen?',
        a: 'Yes. The timer has a link of its own for a display that should show nothing else.',
      },
    ],
    related: ['service-timing', 'worship-song-lyrics', 'lower-thirds'],
  },
  {
    slug: 'service-timing',
    name: 'Service timing',
    card: 'Countdowns, a running order and a message on the platform screen when time is tight.',
    icon: 'timer',
    title: 'Worship Stage Timer Online | Church Countdown | LlamaPresenter',
    description:
      'A worship stage timer online: countdowns, a running order and a church stage display countdown timer on a '
      + 'screen of its own — part of the same session that runs your verses, lyrics and screens.',
    headline: ['A worship stage timer,', 'that keeps the service on time'],
    lede:
      'Most churches solve timing with a separate timer in a separate tab, run by a separate person. Here the '
      + 'countdown belongs to the same service as the slides, so the person running Sunday is running all of it.',
    art: TIMER_ART,
    points: [
      {
        title: 'A running order that counts',
        body: 'Each item carries the time you gave it, so the agenda is the schedule rather than a note about it.',
      },
      {
        title: 'On the stage, or on its own',
        body: 'The church stage display countdown timer sits beside the slides, and has a link of its own for a '
          + 'screen that shows only the clock.',
      },
      {
        title: 'Adjust without restarting',
        body: 'Add or take a minute mid-segment. The platform sees the new number; nothing resets.',
      },
      {
        title: 'Every screen agrees',
        body: 'The run is described rather than ticked over the wire, so two screens never drift a second apart.',
      },
    ],
    steps: [
      'Give each part of the service the time it should take.',
      'Start the countdown when the segment starts.',
      'Add a minute, or take one, as the service moves.',
      'Watch the same number the platform is watching.',
    ],
    faq: [
      {
        q: 'Do we need a separate timer app?',
        a: 'No. The timer is part of the same session as the slides, so the operator does not switch tabs to run '
          + 'it.',
      },
      {
        q: 'Can the platform see a timer on its own screen?',
        a: 'Yes. There is a timer-only link for a display at the back of the room or under the lectern.',
      },
      {
        q: 'What happens if a screen reloads mid-count?',
        a: 'It picks the run back up where it is. The countdown is described by when it started, not by a number '
          + 'being pushed to it.',
      },
    ],
    related: ['stage-display', 'lower-thirds', 'bible-verses-on-screen'],
  },
  {
    slug: 'phone-remote-control',
    name: 'Phone remote control',
    card: 'Drive the service from the phone in your hand, with no app to install.',
    icon: 'phone',
    title: 'Mobile Remote Control for Worship Presentation | LlamaPresenter',
    description:
      'A mobile remote control worship presentation app that is not an app: open the console on any phone '
      + 'browser, signed in, and move the service from wherever you are standing.',
    headline: ['Remote control your service,', 'from your phone'],
    lede:
      'Remote control for worship presentation usually means a companion app, on the same wifi as the machine at '
      + 'the front. Here the console is a page, so a phone that can open it can run the service.',
    art: REMOTE_ART,
    points: [
      {
        title: 'No app, no pairing',
        body: 'Sign in on the phone browser and you have the console: the running order, the search box, the '
          + 'arrows. There is nothing to install and nothing to discover on the network.',
      },
      {
        title: 'From anywhere, not just the booth',
        body: 'Lead from the platform, run the reading from the second row, or fix a slide from the back of the '
          + 'hall. It is the same session either way.',
      },
      {
        title: 'Two people, one service',
        body: 'A phone and a laptop can drive the same service at once, and both see the same live slide.',
      },
      {
        title: 'Everything, not a subset',
        body: 'Verses, songs, the timer and the name cards are all there. A phone remote here is the console, not '
          + 'a next-slide button.',
      },
    ],
    steps: [
      'Open the console on your phone and sign in.',
      'Pick the service you are running.',
      'Search, send and clear from where you are standing.',
      'Hand over by handing over the phone, or let somebody else open it on theirs.',
    ],
    faq: [
      {
        q: 'Is there an app to install on the phone?',
        a: 'No. The console is a web page, so any modern phone browser is the remote. There is nothing to install '
          + 'and nothing to pair.',
      },
      {
        q: 'Does the phone have to be on the church wifi?',
        a: 'No. It signs in like any other device, so mobile data works as well as the building’s network.',
      },
      {
        q: 'Can two people control the service at once?',
        a: 'Yes. Both see the same live slide, so a hand-over mid-service is a matter of who picks up the phone.',
      },
    ],
    related: ['stage-display', 'service-timing', 'worship-song-lyrics'],
  },
  {
    slug: 'church-slide-templates',
    name: 'Slide templates',
    card: 'An online church slides editor: set the look once, and every verse and lyric comes out in it.',
    icon: 'template',
    title: 'Online Church Slides Editor and Templates | LlamaPresenter',
    description:
      'An online church slides editor for scripture and lyrics: set the typeface, the size, the background and '
      + 'the position once, and every slide the service sends comes out in your own look.',
    headline: ['Church slide templates,', 'set once and reused every week'],
    lede:
      'Most presentation software makes you design the slide and then fill it in. The online church slides editor '
      + 'here works the other way: you design the template and the service fills it, so every verse and every '
      + 'lyric arrives in the look you set, on each screen.',
    art: TEMPLATE_ART,
    points: [
      {
        title: 'Design in the browser',
        body: 'Drag the text where it belongs, set the typeface and the size, drop a background behind it. It is '
          + 'the same editor wherever you sign in.',
      },
      {
        title: 'A template per screen',
        body: 'The projector and the stream are different shapes with different problems, so each carries its own '
          + 'template rather than a scaled copy of one.',
      },
      {
        title: 'Your typeface, not ours',
        body: 'Add a Google font or a link to a woff2 and the pickers carry it. A font you added travels with the '
          + 'slide to every output.',
      },
      {
        title: 'It applies to everything',
        body: 'Verses, lyrics and name cards all come out of templates, so a change to the look is one change '
          + 'rather than a pass over every slide.',
      },
    ],
    steps: [
      'Open the template editor and lay out a verse the way you want it.',
      'Give the stream its own template, with the text where your camera framing wants it.',
      'Choose the typeface, or add your own.',
      'Run the service. Every slide arrives in that look, on the screen it belongs to.',
    ],
    faq: [
      {
        q: 'Do I design every slide?',
        a: 'No. You design the template, and the verses and lyrics you send are drawn into it. There are no slides '
          + 'to keep in step with each other.',
      },
      {
        q: 'Can the stream look different from the projector?',
        a: 'Yes. Each output carries its own template, which is usually the point: a wall and a stream want very '
          + 'different type.',
      },
      {
        q: 'Can we use our own font?',
        a: 'Yes. A Google Fonts family or a link to a woff2, woff, ttf or otf file. It travels with the slide, so '
          + 'the outputs draw it too.',
      },
    ],
    related: ['bible-verses-on-screen', 'church-livestream-graphics', 'lower-thirds'],
  },
  {
    slug: 'lower-thirds',
    name: 'Lower thirds',
    card: 'Name cards for whoever is speaking, laid over the stream and gone on their own.',
    icon: 'lower3rd',
    title: 'Church Livestream Lower Thirds Software | LlamaPresenter',
    description:
      'Church livestream lower thirds software: fire a name card over your stream from the console as an OBS '
      + 'lower third overlay. It lays over whatever is showing, holds for as long as you set, and clears itself.',
    headline: ['Church livestream lower thirds,', 'with your own look'],
    lede:
      'A name card is a small thing that looks unprofessional when it is missing and worse when it is left up. '
      + 'It is one click here, and it takes itself down.',
    art: TEMPLATE_ART,
    points: [
      {
        title: 'An output of its own',
        body: 'The lower third is its own link. The projector and the stage never see a name card.',
      },
      {
        title: 'It lays over what is showing',
        body: 'The card sits on top of whatever the stream output already has — a verse, a lyric, nothing at all.',
      },
      {
        title: 'It clears itself',
        body: 'You set the hold. Every screen counts it down for itself, so a card is never left up because a '
          + 'browser tab went quiet.',
      },
      {
        title: 'Your look',
        body: 'The card is drawn from your own template, in your own typeface, rather than a stock band across the '
          + 'bottom.',
      },
    ],
    steps: [
      'Open the lower third link and add it to your stream as a browser source.',
      'Write the name and the role in the console.',
      'Fire the card when they start speaking.',
      'Let it clear itself, or take it down early.',
    ],
    faq: [
      {
        q: 'How do I add an OBS lower third overlay for church streams?',
        a: 'Open the lower third output link and add it to OBS as a browser source, sized to your canvas. It is '
          + 'transparent behind the card, so it sits over your camera.',
      },
      {
        q: 'Does the projector show the name card too?',
        a: 'No. It goes to the lower third output alone, which is usually the stream and nothing else.',
      },
      {
        q: 'How long does a card stay up?',
        a: 'As long as you set. Each screen counts the hold down for itself rather than waiting to be told.',
      },
      {
        q: 'Can it sit over a verse?',
        a: 'Yes. It is laid over whatever that output is showing.',
      },
    ],
    related: ['church-livestream-graphics', 'worship-song-lyrics', 'stage-display'],
  },
];

/** One row by slug, for the page and its metadata. Not `useCaseOf`: a
 *  top-level function whose name starts with `use` is a hook to eslint. */
export const findUseCase = (slug: string): UseCase | undefined => USE_CASES.find(item => item.slug === slug);
