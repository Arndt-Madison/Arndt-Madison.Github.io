# Madison Arndt – Personal Website

This project is a lightweight, modular personal website designed to serve as both a professional introduction and a general-purpose profile link.

It is built to be simple, maintainable, and easily adaptable, with content driven by structured JSON and minimal dependencies.

---

## Purpose

This site serves as:

* A personal introduction for both professional and casual use
* A central hub for links, projects, and external profiles
* A clean, shareable page for platforms like LinkedIn and Instagram

---

## Structure

The site follows a modular, component-based layout:

```
/
├── index.html
├── links.html
└── assets/
    ├── css/
    ├── js/
    ├── json/
    └── html/
```

### Key Components

* **index.html**
  Main landing page with intro and overview content

* **links.html**
  Organized list of external links and resources

* **assets/js/**
  Handles rendering, layout behavior, and content injection

* **assets/json/**
  Stores all editable content (text, links, sections)

* **assets/html/**
  Shared components such as header and footer

---

## Design Philosophy

This project is built around a few core principles:

* **Modular Structure**
  Content and layout are separated, allowing easy updates without changing core logic

* **Consistency Over Complexity**
  Code structure adapts to the project rather than forcing a rigid style

* **Lightweight & Maintainable**
  No frameworks, minimal overhead, and easy to understand

* **Reusable Components**
  Sections are designed to function independently or as part of a larger system

---

## How It Works

* JSON files define all page content
* JavaScript loads and renders content dynamically
* Shared elements (header/footer) are injected across pages
* Styling is handled with simple, scoped CSS

---

## Customization

To modify content:

* Edit JSON files in:
  `assets/json/`

To modify layout or behavior:

* Update files in:
  `assets/js/`
  `assets/css/`

To modify shared UI elements:

* Edit:
  `assets/html/Header.html`
  `assets/html/Footer.html`

---

## Deployment

This site is designed to work with static hosting platforms such as:

* GitHub Pages
* Netlify
* Any static web server

---

## Notes

* Paths are case-sensitive when deployed (especially on GitHub Pages)
* Image assets should be placed in appropriate directories and referenced in JSON
* The project avoids external dependencies for simplicity and control

---

## Author

**Madison Arndt**

Developer focused on modular systems, practical tools, and adaptable code structures.

---

## License

This project is open for personal use and modification.


C:\Python\python.exe -m http.server 8000
http://localhost:8000
