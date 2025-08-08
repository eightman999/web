# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website project featuring:
- A retro 90s/2000s Japanese web aesthetic with HTML4/CSS styling
- Multiple UI templates (Windows 7, Windows ME, Windows XP, Windows Vista, Google, Amazon, Yahoo, Bing styles)
- Interactive features including BBS, blog, omikuji (fortune telling), and poetry sections
- A custom music programming language compiler called "Uzume" written in JavaScript

## Architecture

### Main Site Structure
- `index.html` - Main homepage with retro styling and visitor counter
- `styles.css` - Global styles with Windows 98-inspired design system
- `script.js` - Main JavaScript functionality for daily quotes and general site features

### Core Features
- **Template System**: Directory `template/` contains various OS/brand-themed UI templates
- **Uzume Compiler**: `uzume.js` contains a complete music programming language compiler that generates audio using Web Audio API
- **Interactive Pages**: Various HTML pages for different sections (blog, BBS, poetry, library, etc.)

### Template Structure
Each template in `template/` follows the same pattern:
- `index.html` - Template-specific HTML
- `style.css` - Template-specific styling
- `script.js` - Template-specific JavaScript

## Development Commands

This project uses no build system - it's pure HTML/CSS/JavaScript that runs directly in browsers. For development:

- Serve files locally using any web server (e.g., `python -m http.server` or `live-server`)
- No compilation, bundling, or package management required
- Files can be opened directly in browsers for testing

## Key Technologies

- **Frontend**: Pure HTML4/CSS/JavaScript (no frameworks)
- **Audio**: Web Audio API for the Uzume music compiler
- **Styling**: Custom CSS with retro/vintage design patterns
- **Character Encoding**: UTF-8 with Japanese language support

## Uzume Music Language

The `uzume.js` file contains a complete domain-specific language for music composition:
- Custom AST nodes and parser for musical notation
- Web Audio API integration for sound generation
- Support for notes, chords, measures, loops, and musical expressions
- Follows the specification documented in `README_uzume.md`

## File Conventions

- HTML files use HTML4 DOCTYPE for retro compatibility
- CSS follows Windows 98/classic web styling patterns
- JavaScript uses vanilla ES6+ features
- Japanese text encoding properly handled throughout
- Consistent indentation and commenting style

## Important Notes

- No package.json, build tools, or dependencies - this is intentionally a simple static site
- Focus is on retro web aesthetics and functionality
- The Uzume compiler is a sophisticated music programming system embedded within the site
- All templates maintain consistent visual themes while providing different UI experiences