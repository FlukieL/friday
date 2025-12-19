# Friday Saga Website

A website dedicated to presenting the Friday Saga video series, featuring embedded YouTube videos and Wikipedia-style documentation of characters, themes, and recurring jokes.

## Features

- **Video Gallery**: Chronologically ordered YouTube video embeds supporting both 4:3 and 16:9 aspect ratios
- **Character Profiles**: Wikipedia-style character documentation
- **Themes Section**: Documentation of recurring themes throughout the series
- **Recurring Jokes**: Catalogue of running gags and comedic elements
- **Responsive Design**: Fully optimised for desktop, tablet, and mobile devices
- **Smooth Animations**: Professional transitions and fade effects
- **Modular Architecture**: Clean, maintainable JavaScript code structure

## Project Structure

```
friday/
├── index.html              # Main page with tabbed interface
├── styles.css              # Styling and animations
├── js/
│   ├── main.js             # Application entry point
│   ├── modules/
│   │   ├── TabManager.js   # Tab navigation and switching
│   │   ├── VideoLoader.js  # Video data loading and rendering
│   │   ├── YouTubeEmbed.js # YouTube embed handling and oEmbed API
│   │   ├── ContentRenderer.js # Wikipedia-style content rendering
│   │   ├── DataLoader.js   # JSON data fetching and parsing
│   │   └── Animations.js   # Animation utilities and helpers
├── data/
│   ├── videos.json         # Video data (URLs, titles, aspect ratios)
│   ├── characters.json     # Character information
│   ├── themes.json         # Theme descriptions
│   └── jokes.json          # Recurring jokes documentation
└── README.md               # This file
```

## Setup

### Local Development

Due to browser CORS restrictions with ES6 modules, you'll need to run a local server. Here are a few options:

#### Option 1: Python (if installed)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option 2: Node.js (if installed)
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```

#### Option 3: VS Code Live Server
If you're using Visual Studio Code, install the "Live Server" extension and use it to serve the project.

### Accessing the Site

Once the server is running, open your browser and navigate to:
```
http://localhost:8000
```

## Updating Content

### Adding Videos

Edit `data/videos.json` and add a new video object:

```json
{
  "id": "VIDEO_ID",
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "title": "Video Title (optional - will be fetched automatically)",
  "aspectRatio": "16:9"
}
```

**Note**: If you leave `title` empty, the website will automatically fetch the title from YouTube's oEmbed API. You can also manually set the title if preferred.

**Aspect Ratios**:
- `"16:9"` - Standard widescreen (default)
- `"4:3"` - Traditional aspect ratio

### Adding Characters

Edit `data/characters.json` and add a new character:

```json
{
  "name": "Character Name",
  "source": "Source/Origin",
  "description": "Character description...",
  "firstAppearance": "Episode or video reference",
  "details": [
    "Additional detail point 1",
    "Additional detail point 2"
  ]
}
```

### Adding Themes

Edit `data/themes.json` and add a new theme:

```json
{
  "name": "Theme Name",
  "description": "Theme description...",
  "examples": [
    "Example 1",
    "Example 2"
  ]
}
```

### Adding Recurring Jokes

Edit `data/jokes.json` and add a new joke:

```json
{
  "name": "Joke Name",
  "description": "Description of the recurring joke...",
  "occurrences": [
    "Occurrence 1",
    "Occurrence 2"
  ],
  "context": "Additional context about the joke"
}
```

## Technical Details

### Video Embedding

The website uses YouTube's iframe embed API with responsive containers that maintain proper aspect ratios. Videos are embedded with lazy loading for better performance.

### Title Extraction

Video titles are automatically fetched from YouTube's oEmbed API when not provided in the JSON. The API endpoint used is:
```
https://www.youtube.com/oembed?url={video_url}&format=json
```

### Responsive Breakpoints

- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

### Browser Support

The website uses modern JavaScript (ES6 modules) and CSS features. It is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Accessibility

- Semantic HTML structure
- ARIA labels for tab navigation
- Keyboard navigation support
- Respects `prefers-reduced-motion` for animations
- Touch-friendly targets (minimum 44x44px)

## Module Architecture

The JavaScript is organised into modular ES6 classes:

- **DataLoader**: Handles JSON data fetching and caching
- **YouTubeEmbed**: Manages YouTube URL parsing, embed generation, and oEmbed API
- **VideoLoader**: Renders video grid and manages video cards
- **TabManager**: Controls tab navigation and switching
- **ContentRenderer**: Renders Wikipedia-style content sections
- **Animations**: Provides reusable animation utilities

## Troubleshooting

### Videos Not Loading

1. Check that video URLs in `data/videos.json` are valid
2. Ensure video IDs are correctly extracted
3. Check browser console for CORS or network errors

### Content Not Displaying

1. Verify JSON files are valid (use a JSON validator)
2. Check browser console for JavaScript errors
3. Ensure you're running a local server (not opening files directly)

### Titles Not Fetching

If titles aren't being fetched automatically:
1. Check your internet connection
2. YouTube's oEmbed API may be rate-limited
3. Manually add titles to the JSON files as a fallback

## License

This project is for personal/educational use.




