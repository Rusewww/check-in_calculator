// @ts-check
/**
 * Privacy policy page: the content is static HTML (readable without JavaScript); this
 * only applies the shared stylesheet, the visitor's saved theme and the brand mark.
 */
import '../ui/styles.css';
import { applyTheme, loadSettings } from '../ui/settings.js';
import { LOGO_SVG } from '../ui/logo.js';

applyTheme(loadSettings().theme);

const mark = document.querySelector('.brand-mark');
if (mark) mark.innerHTML = LOGO_SVG; // static markup from logo.js, no user data
