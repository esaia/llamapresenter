/**
 * The use cases, and everything each page is made of.
 *
 * One row per page: the card that links to it, the metadata, and the copy.
 * They are written rather than generated — a page that says nothing a church
 * could not have guessed is worth less than no page at all — but they share a
 * shape, so `use-cases/[slug]` renders every one of them.
 */

export type UseCaseIcon =
  | 'languages'
  | 'book'
  | 'lyrics'
  | 'stream'
  | 'stage'
  | 'timer'
  | 'lower3rd'
  | 'plant'
  | 'team';

export type UseCase = {
  /** The path segment, and what the whole row is keyed by. */
  slug: string;
  /** On the card, in the related list, and in the breadcrumb. */
  name: string;
  /** The card's one line. */
  card: string;
  icon: UseCaseIcon;
  title: string;
  description: string;
  /** The headline, split where the yellow stroke starts. */
  headline: [string, string];
  lede: string;
  art: { src: string; alt: string };
  /** What the church gets, in three or four cards. */
  points: { title: string; body: string }[];
  /** The same thing again as a running order, because that is how it is used. */
  steps: string[];
  faq: { q: string; a: string }[];
  /** Slugs of the two or three pages a reader of this one wants next. */
  related: string[];
};

const LANGUAGES_ART = {
  src: '/images/features/languages.png',
  alt: 'A slide carrying the same verse in Georgian and English, beside the panel that arms each language',
};

const OUTPUTS_ART = {
  src: '/images/features/outputs.png',
  alt: 'One session feeding a stage display, a projector slide and a transparent stream overlay, each at its own link',
};

const TIMER_ART = {
  src: '/images/features/stage-timer.png',
  alt: 'A stage view carrying the current slide, what is next, the clock and a countdown',
};

const TEMPLATE_ART = {
  src: '/images/features/template-editor.png',
  alt: 'The template editor, with a verse laid out over a background',
};

const REMOTE_ART = {
  src: '/images/features/remote-phone.webp',
  alt: 'The same session open on a laptop and on a phone, the same card selected on both',
};

export const USE_CASES: UseCase[] = [
  {
    slug: 'multilingual-church-services',
    name: 'Multilingual services',
    card: 'Two or more languages on the same slide, and each screen showing the ones it needs.',
    icon: 'languages',
    title: 'Multilingual Church Presentation Software | LlamaPresenter',
    description:
      'Run a bilingual or multilingual church service: two or more Bible translations on one slide, songs in '
      + 'every language they are sung in, and a different pair on the projector, the stage and the stream.',
    headline: ['A service in two languages,', 'without two sets of slides'],
    lede:
      'A bilingual church usually pays for it twice: once when somebody types the second language into every '
      + 'slide, and again on Sunday when the two sets drift apart. Here a language is something you arm, not '
      + 'something you type.',
    art: LANGUAGES_ART,
    points: [
      {
        title: 'One passage, every language',
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
    headline: ['Scripture on the wall,', 'in seconds'],
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
    headline: ['The words on the wall,', 'a beat before they are sung'],
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
    headline: ['Verses and lyrics over', 'your livestream'],
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
      'Give the platform a stage view with the current slide, what is next, the running order, a clock and a '
      + 'countdown. It opens on any screen with a browser.',
    headline: ['The screen the platform', 'actually needs'],
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
        q: 'Is there a timer-only screen?',
        a: 'Yes. The timer has a link of its own for a display that should show nothing else.',
      },
    ],
    related: ['service-timing', 'worship-song-lyrics', 'volunteer-tech-teams'],
  },
  {
    slug: 'service-timing',
    name: 'Service timing',
    card: 'Countdowns, a running order and a message on the platform screen when time is tight.',
    icon: 'timer',
    title: 'Church Service Timer and Running Order | LlamaPresenter',
    description:
      'Keep a service on schedule with countdowns, an agenda and a timer display of its own — part of the same '
      + 'session that runs your verses, lyrics and screens.',
    headline: ['A service that ends', 'when it should'],
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
        body: 'The countdown sits on the stage view beside the slides, and has a link of its own for a screen that '
          + 'shows only the clock.',
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
    related: ['stage-display', 'volunteer-tech-teams', 'church-plants'],
  },
  {
    slug: 'lower-thirds',
    name: 'Lower thirds',
    card: 'Name cards for whoever is speaking, laid over the stream and gone on their own.',
    icon: 'lower3rd',
    title: 'Church Lower Thirds and Name Cards | LlamaPresenter',
    description:
      'Fire a name card over your livestream from the console. It lays over whatever is showing, holds for as '
      + 'long as you set, and clears itself.',
    headline: ['Who is speaking,', 'on the stream'],
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
  {
    slug: 'church-plants',
    name: 'Church plants',
    card: 'A borrowed room, a borrowed laptop, and a service on the screen anyway.',
    icon: 'plant',
    title: 'Church Presentation Software for Church Plants | LlamaPresenter',
    description:
      'Run a full service from a browser on whatever computer the room has. Free to start, nothing to install, '
      + 'and no licence to move between machines.',
    headline: ['A school hall,', 'a borrowed laptop'],
    lede:
      'A plant meets where it can, sets up in half an hour and packs away again. Presentation software that has '
      + 'to be installed and licensed on a particular machine is the wrong shape for that week.',
    art: OUTPUTS_ART,
    points: [
      {
        title: 'Whatever computer is there',
        body: 'A Chromebook, somebody’s MacBook, the machine the hall already has. Sign in and your service is '
          + 'there.',
      },
      {
        title: 'Free to start, and it stays free',
        body: 'The Bible, both outputs and the stage display are never gated. Pro is for when a church grows past '
          + 'the limits.',
      },
      {
        title: 'The screen is a link',
        body: 'The hall TV or the projector laptop opens a link. There is no second install and no second licence.',
      },
      {
        title: 'Nothing to carry',
        body: 'The service lives in your account rather than in a folder on the laptop that stayed home.',
      },
    ],
    steps: [
      'Build the service during the week, from anywhere.',
      'Sign in on whatever computer the room has on Sunday.',
      'Open the projector link on the screen, and the stage link on a second one if you have it.',
      'Pack away. Nothing was installed and nothing needs uninstalling.',
    ],
    faq: [
      {
        q: 'What does it cost to start?',
        a: 'Nothing. The free plan runs a full service, and it has no time limit — it is not a trial.',
      },
      {
        q: 'Does it work on a Chromebook?',
        a: 'Yes. Anything with a modern browser runs the console and the outputs.',
      },
      {
        q: 'What if the hall has no internet?',
        a: 'That is the honest limit today: changing what is on the screens needs a connection. Native Mac and '
          + 'Windows apps are on the way for exactly that room.',
      },
    ],
    related: ['volunteer-tech-teams', 'service-timing', 'bible-verses-on-screen'],
  },
  {
    slug: 'volunteer-tech-teams',
    name: 'Volunteer teams',
    card: 'Whoever is in the booth signs in. Nothing to install, and one version for everybody.',
    icon: 'team',
    title: 'Church Presentation Software for Volunteer Teams | LlamaPresenter',
    description:
      'A rota of volunteers can run the same service from any computer: nothing to install, one version for '
      + 'everyone, and a phone remote that needs no app.',
    headline: ['A different volunteer', 'every Sunday'],
    lede:
      'The hard part of church tech is rarely the software. It is that the person who knows it is away, and the '
      + 'person covering has never opened it on that machine.',
    art: REMOTE_ART,
    points: [
      {
        title: 'They sign in, not install',
        body: 'Whoever is covering opens the console on whatever computer is in the booth. There is no install, no '
          + 'licence and no admin password.',
      },
      {
        title: 'One version, everybody',
        body: 'Nobody is a release behind. There is no update waiting to run ten minutes before the service.',
      },
      {
        title: 'Two people, one service',
        body: 'A second person can open the same session on their own laptop or phone, and both see the same live '
          + 'slide.',
      },
      {
        title: 'The phone is the remote',
        body: 'Any phone with a browser can drive the service. Nothing to install on it, and nothing to pair.',
      },
    ],
    steps: [
      'Invite the volunteer to your church account.',
      'They sign in on the booth computer on the day.',
      'The service, the songs and the templates are already there.',
      'A second person can pick up the phone and take over mid-service.',
    ],
    faq: [
      {
        q: 'How many people can be in the account?',
        a: 'The plans have the numbers. What matters here is that a volunteer is a sign-in rather than another '
          + 'install to license.',
      },
      {
        q: 'Can two people run the service at once?',
        a: 'Yes. Both see the same live slide, so handing over mid-service is a matter of who picks up the phone.',
      },
      {
        q: 'Does the projector machine need an account?',
        a: 'No. Every output is an unguessable link. Only the person running the console signs in.',
      },
    ],
    related: ['church-plants', 'stage-display', 'service-timing'],
  },
];

/** One row by slug, for the page and its metadata. Not `useCaseOf`: a
 *  top-level function whose name starts with `use` is a hook to eslint. */
export const findUseCase = (slug: string): UseCase | undefined => USE_CASES.find(item => item.slug === slug);
