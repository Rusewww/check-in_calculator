// @ts-check
/**
 * Gear button that opens a modal dialog for theme and language.
 * @module ui/components/SettingsDialog
 */
import { h } from '../dom.js';
import { LANGUAGES, t } from '../strings.js';
import { THEMES } from '../settings.js';

/** @type {Record<import('../settings.js').Theme, import('../strings.js').StringKey>} */
const THEME_LABEL = { system: 'themeSystem', light: 'themeLight', dark: 'themeDark' };

const GEAR_ICON =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="12" cy="12" r="3"/>' +
  '<path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>' +
  '</svg>';

/**
 * @param {HTMLElement} container
 * @param {object} ctx
 * @param {import('../settings.js').Settings} ctx.settings
 * @param {(settings: import('../settings.js').Settings) => void} ctx.onChange
 * @param {boolean} [ctx.open]  open the dialog immediately (used after a language change)
 * @returns {() => void} dispose
 */
export function mountSettingsButton(container, { settings, onChange, open = false }) {
  let current = { ...settings };
  /** @param {import('../settings.js').Settings} next */
  const emit = (next) => {
    current = next;
    onChange(next);
  };

  const icon = h('span', { class: 'icon', 'aria-hidden': 'true' });
  icon.innerHTML = GEAR_ICON;
  const button = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-icon',
      'aria-label': t('settingsButton'),
      title: t('settingsButton'),
      'aria-haspopup': 'dialog',
    },
    icon,
  );

  const themeInputs = THEMES.map((theme) =>
    h('input', {
      type: 'radio',
      name: 'theme',
      value: theme,
      checked: settings.theme === theme,
      onchange: () => emit({ ...current, theme }),
    }),
  );
  const languageSelect = /** @type {HTMLSelectElement} */ (
    h(
      'select',
      { id: 'settings-language', class: 'input' },
      ...LANGUAGES.map((language) =>
        h(
          'option',
          {
            value: language.code,
            lang: language.code,
            selected: settings.language === language.code,
          },
          language.label,
        ),
      ),
    )
  );
  languageSelect.addEventListener('change', () => {
    const code = languageSelect.value;
    const language = LANGUAGES.find((entry) => entry.code === code);
    if (language) emit({ ...current, language: language.code });
  });

  const dialog = /** @type {HTMLDialogElement} */ (
    h(
      'dialog',
      { class: 'settings-dialog', 'aria-labelledby': 'settings-title' },
      h(
        'form',
        { method: 'dialog', class: 'settings-form' },
        h('h2', { id: 'settings-title', class: 'settings-title' }, t('settingsTitle')),
        h(
          'fieldset',
          { class: 'settings-group' },
          h('legend', {}, t('settingsTheme')),
          ...THEMES.map((theme, i) =>
            h('label', { class: 'radio-row' }, themeInputs[i], t(THEME_LABEL[theme])),
          ),
        ),
        h(
          'div',
          { class: 'settings-group' },
          h('label', { class: 'label', for: 'settings-language' }, t('settingsLanguage')),
          languageSelect,
        ),
        h(
          'div',
          { class: 'dialog-actions' },
          h('button', { type: 'submit', class: 'btn btn-primary' }, t('settingsClose')),
        ),
      ),
    )
  );
  // A click on the backdrop lands on the dialog element itself.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  button.addEventListener('click', () => dialog.showModal());

  container.append(button, dialog);
  if (open) {
    dialog.showModal();
    languageSelect.focus();
  }

  return () => {
    if (dialog.open) dialog.close();
    button.remove();
    dialog.remove();
  };
}
