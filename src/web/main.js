// @ts-check
import '../ui/styles.css';
import { mountApp } from '../ui/app.js';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app root element');

const base = import.meta.env.BASE_URL; // "/" locally, "/<repo>/" on GitHub Pages
mountApp(root, {
  dataUrl: `${base}data/airports.json`,
  metaUrl: `${base}data/airports.meta.json`,
  repoUrl: 'https://github.com/Rusewww/check-in_calculator',
  privacyUrl: `${base}privacy.html`,
});
