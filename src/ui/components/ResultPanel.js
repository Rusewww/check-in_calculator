// @ts-check
/**
 * The answer: when check-in opens (airport time and the user's time), live status,
 * daylight-saving notices, and "add to calendar" actions.
 * @module ui/components/ResultPanel
 */
import { h } from '../dom.js';
import { t } from '../strings.js';
import { computeCheckIn, statusAt } from '../../core/checkin.js';
import { parseDepartureString } from '../../core/urlState.js';
import {
  EVENT_DURATION_MS,
  buildIcs,
  googleCalendarUrl,
  icsFileName,
} from '../../core/calendar.js';
import { describeAirport } from '../../core/airports.js';
import { effectiveUserZone } from '../state.js';
import {
  formatAgo,
  formatCountdown,
  formatDateTime,
  formatIsoInZone,
  formatMinutesDiff,
  formatPeriodText,
  formatTimeOnly,
  formatZoneLabel,
} from '../format.js';

/**
 * @param {HTMLElement} container
 * @param {object} ctx
 * @param {import('../store.js').Store<import('../state.js').AppState>} ctx.store
 * @param {string} ctx.deviceZone
 * @param {string} [ctx.locale]
 * @param {() => string} ctx.getShareUrl
 * @returns {() => void} dispose
 */
export function mountResultPanel(container, { store, deviceZone, locale, getShareUrl }) {
  const placeholder = h('p', { class: 'placeholder' }, t('resultPlaceholder'));
  const panel = h('section', {
    class: 'card result',
    'aria-labelledby': 'result-title',
    hidden: true,
  });
  container.append(placeholder, panel);

  /** @type {import('../../core/checkin.js').CheckInResult | null} */
  let current = null;
  /** @type {HTMLElement | null} */
  let statusEl = null;
  /** @type {ReturnType<typeof setInterval> | null} */
  let timer = null;

  function stopTimer() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function renderStatus() {
    if (!current || !statusEl) return;
    const s = statusAt(Date.now(), current.opens.epochMs, current.departure.epochMs);
    statusEl.className = `status status-${s.status}`;
    if (s.status === 'before-open') {
      statusEl.replaceChildren(
        `${t('statusBefore')} `,
        h('span', { class: 'countdown' }, formatCountdown(s.msUntilOpen)),
      );
    } else if (s.status === 'open') {
      statusEl.textContent = `${t('statusOpen')} · ${t('statusOpenedAgo', { ago: formatAgo(-s.msUntilOpen) })}`;
    } else {
      statusEl.textContent = t('statusDeparted');
      stopTimer();
    }
  }

  /**
   * @param {import('../state.js').AppState} state
   * @param {import('../../core/checkin.js').CheckInResult} result
   * @param {string} userZone
   */
  function buildEvent(state, result, userZone) {
    const airport = /** @type {import('../../core/airports.js').Airport} */ (state.airport);
    const link = getShareUrl();
    const lines = [
      t('calendarIntro', {
        iata: airport.iata,
        airport: describeAirport(airport),
        period: formatPeriodText(state.period, 'accusative'),
      }),
      '',
      t('calendarOpens', {
        when: formatDateTime(result.opens.epochMs, airport.tz, locale),
        zone: formatZoneLabel(airport.tz, result.opens.airport.offsetMinutes),
      }),
    ];
    if (userZone !== airport.tz) {
      lines.push(
        t('calendarOpensUser', {
          when: formatDateTime(result.opens.epochMs, userZone, locale),
          zone: formatZoneLabel(userZone, result.opens.user.offsetMinutes),
        }),
      );
    }
    lines.push(
      t('calendarDeparture', {
        when: formatDateTime(result.departure.epochMs, airport.tz, locale),
        zone: formatZoneLabel(airport.tz, result.departure.airport.offsetMinutes),
      }),
      '',
      t('calendarLink', { link }),
    );
    return {
      title: t('calendarTitle', { iata: airport.iata }),
      description: lines.join('\n'),
      location: describeAirport(airport),
      startMs: result.opens.epochMs,
      endMs: result.opens.epochMs + EVENT_DURATION_MS,
      url: link,
    };
  }

  /**
   * @param {import('../../core/calendar.js').CalendarEvent} event
   * @param {string} iata
   */
  function downloadIcs(event, iata) {
    const ics = buildIcs(event, {
      uid: `${event.startMs}-${iata}@check-in-calculator`,
      dtstampMs: Date.now(),
      alarmMinutesBefore: 10,
      alarmText: t('calendarAlarm'),
    });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = h('a', { href: url, download: icsFileName(iata, event.startMs), hidden: true });
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  /** @param {import('../state.js').AppState} state */
  function render(state) {
    const departure = state.departure ? parseDepartureString(state.departure) : null;
    if (!state.airport || !departure || state.periodError) {
      current = null;
      statusEl = null;
      stopTimer();
      panel.replaceChildren();
      panel.hidden = true;
      placeholder.hidden = false;
      return;
    }

    const airport = state.airport;
    const userZone = effectiveUserZone(state, deviceZone);
    const result = computeCheckIn({
      departure,
      airportZone: airport.tz,
      userZone,
      period: state.period,
      nowMs: Date.now(),
    });
    current = result;

    const sameZone = userZone === airport.tz;
    const airportBlock = h(
      'div',
      { class: 'time-block' },
      h(
        'span',
        { class: 'time-label' },
        sameZone
          ? t('localTime', {
              iata: airport.iata,
              zone: formatZoneLabel(airport.tz, result.opens.airport.offsetMinutes),
            })
          : t('airportTime', {
              zone: formatZoneLabel(airport.tz, result.opens.airport.offsetMinutes),
            }),
      ),
      h(
        'time',
        { class: 'time-value', datetime: formatIsoInZone(result.opens.airport) },
        formatDateTime(result.opens.epochMs, airport.tz, locale),
      ),
    );
    const userBlock = sameZone
      ? null
      : h(
          'div',
          { class: 'time-block' },
          h(
            'span',
            { class: 'time-label' },
            t('yourTime', { zone: formatZoneLabel(userZone, result.opens.user.offsetMinutes) }),
          ),
          h(
            'time',
            { class: 'time-value', datetime: formatIsoInZone(result.opens.user) },
            formatDateTime(result.opens.epochMs, userZone, locale),
          ),
        );

    statusEl = h('p', { class: 'status' });

    /** @type {HTMLElement[]} */
    const notes = [];
    if (!sameZone) {
      const diff = result.zoneDifference.atOpenMinutes;
      const key = diff > 0 ? 'diffAhead' : diff < 0 ? 'diffBehind' : 'diffSame';
      notes.push(h('p', { class: 'meta-line' }, t(key, { diff: formatMinutesDiff(diff) })));
      if (result.zoneDifference.changes) {
        const at = result.zoneDifference.atDepartureMinutes;
        const sign = at > 0 ? '+' : at < 0 ? '−' : '';
        notes.push(
          h(
            'p',
            { class: 'notice' },
            t('diffChanges', { diff: `${sign}${formatMinutesDiff(at)}` }),
          ),
        );
      }
    }
    if (result.departure.resolution === 'gap') {
      notes.push(
        h(
          'p',
          { class: 'notice' },
          t('noticeDepartureGap', {
            time: formatTimeOnly(result.departure.epochMs, airport.tz, locale),
          }),
        ),
      );
    } else if (result.departure.resolution === 'overlap') {
      notes.push(h('p', { class: 'notice' }, t('noticeDepartureOverlap')));
    }
    if (result.opens.resolution === 'gap') {
      notes.push(h('p', { class: 'notice' }, t('noticeOpensGap')));
    } else if (result.opens.resolution === 'overlap') {
      notes.push(h('p', { class: 'notice' }, t('noticeOpensOverlap')));
    }

    const departureLine = h(
      'p',
      { class: 'meta-line' },
      t('departureLine', {
        when: formatDateTime(result.departure.epochMs, airport.tz, locale),
        zone: formatZoneLabel(airport.tz, result.departure.airport.offsetMinutes),
      }),
      sameZone
        ? ''
        : ` · ${t('departureLineUser', { when: formatDateTime(result.departure.epochMs, userZone, locale) })}`,
    );
    const windowLine = h(
      'p',
      { class: 'meta-line' },
      t('windowLine', { period: formatPeriodText(state.period, 'accusative') }),
    );

    const event = buildEvent(state, result, userZone);
    const googleLink = h(
      'a',
      {
        class: 'btn btn-primary',
        href: googleCalendarUrl(event, { displayZone: userZone }),
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      t('addToGoogle'),
    );
    const icsButton = h(
      'button',
      {
        type: 'button',
        class: 'btn',
        title: t('downloadIcsTitle'),
        onclick: () => downloadIcs(event, airport.iata),
      },
      t('downloadIcs'),
    );
    const copyButton = h('button', { type: 'button', class: 'btn' }, t('copyLink'));
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(getShareUrl());
        copyButton.textContent = t('linkCopied');
      } catch {
        copyButton.textContent = t('copyFailed');
      }
      setTimeout(() => {
        copyButton.textContent = t('copyLink');
      }, 2500);
    });

    panel.replaceChildren(
      h('h2', { id: 'result-title', class: 'result-title' }, t('resultTitle')),
      h('div', { class: 'times' }, airportBlock, userBlock),
      statusEl,
      ...notes,
      departureLine,
      windowLine,
      h('div', { class: 'actions' }, googleLink, icsButton, copyButton),
    );
    panel.hidden = false;
    placeholder.hidden = true;

    renderStatus();
    stopTimer();
    timer = setInterval(renderStatus, 1000);
  }

  const unsubscribe = store.subscribe(render);
  render(store.get());
  return () => {
    unsubscribe();
    stopTimer();
  };
}
