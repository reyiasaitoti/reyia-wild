(function () {
  const actions = document.querySelector('.header-actions');
  if (!actions) {
    console.error('Language selector could not be added: header actions were not found.');
    return;
  }

  const languages = [
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'zh-CN', flag: '🇨🇳', name: '中文' },
    { code: 'es', flag: '🇪🇸', name: 'Español' },
    { code: 'it', flag: '🇮🇹', name: 'Italiano' },
    { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
    { code: 'de', flag: '🇩🇪', name: 'Deutsch' }
  ];
  const languageCodes = languages.map(function (language) {
    return language.code;
  });
  const currentUrl = new URL(window.location.href);
  const isTranslatedPage = currentUrl.hostname.endsWith('.translate.goog');
  const isLocalDevelopment = !isTranslatedPage && (
    currentUrl.hostname === 'localhost' ||
    currentUrl.hostname.endsWith('.localhost') ||
    currentUrl.hostname === '::1' ||
    currentUrl.hostname.endsWith('.local') ||
    /^127(?:\.\d{1,3}){3}$/.test(currentUrl.hostname) ||
    /^10(?:\.\d{1,3}){3}$/.test(currentUrl.hostname) ||
    /^192\.168(?:\.\d{1,3}){2}$/.test(currentUrl.hostname) ||
    /^172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}$/.test(currentUrl.hostname)
  );
  const translatedLanguage = isTranslatedPage
    ? currentUrl.searchParams.get('_x_tr_tl')
    : null;

  let savedLanguage = 'en';
  try {
    savedLanguage = localStorage.getItem('samara-language') || 'en';
  } catch (error) {
    console.warn('Saved language preference could not be read.', error);
  }

  const initialLanguage = languageCodes.includes(translatedLanguage)
    ? translatedLanguage
    : languageCodes.includes(savedLanguage)
      ? savedLanguage
      : 'en';

  const picker = document.createElement('div');
  picker.className = 'language-picker';

  const select = document.createElement('select');
  select.className = 'language-picker-select';
  select.setAttribute('aria-label', 'Select language');

  languages.forEach(function (language) {
    const option = document.createElement('option');
    option.value = language.code;
    option.textContent = language.flag + ' ' + language.name;
    select.appendChild(option);
  });
  select.value = initialLanguage;

  const credit = document.createElement('a');
  credit.className = 'language-picker-credit';
  credit.href = 'https://translate.google.com/';
  credit.target = '_blank';
  credit.rel = 'noopener noreferrer';
  credit.textContent = 'Translation by Google';

  const localNotice = document.createElement('span');
  localNotice.className = 'language-picker-notice';
  localNotice.setAttribute('role', 'status');
  localNotice.setAttribute('aria-live', 'polite');
  localNotice.hidden = true;

  picker.appendChild(select);
  picker.appendChild(credit);
  picker.appendChild(localNotice);
  actions.insertBefore(picker, actions.firstChild);

  function showLocalNotice() {
    localNotice.textContent = 'Language preview works after publishing to a public website.';
    localNotice.hidden = false;
  }

  function getSourcePageUrl() {
    if (!isTranslatedPage) return new URL(window.location.href);

    const canonical = document.querySelector('link[rel="canonical"]');
    const base = document.querySelector('base[href]');
    const sourceUrl = new URL(
      (canonical && canonical.href) || (base && base.href) || 'https://samarawild.com/'
    );

    sourceUrl.hash = currentUrl.hash;
    Array.from(currentUrl.searchParams.entries()).forEach(function (entry) {
      if (!entry[0].startsWith('_x_tr_')) {
        sourceUrl.searchParams.set(entry[0], entry[1]);
      }
    });
    return sourceUrl;
  }

  function openLanguage(languageCode) {
    try {
      localStorage.setItem('samara-language', languageCode);
    } catch (error) {
      console.warn('Language preference could not be saved.', error);
    }

    if (isLocalDevelopment) {
      if (languageCode === 'en') {
        localNotice.hidden = true;
      } else {
        showLocalNotice();
      }
      return;
    }

    const sourceUrl = getSourcePageUrl();
    if (languageCode === 'en') {
      window.location.assign(sourceUrl.href);
      return;
    }

    const translateUrl = new URL('https://translate.google.com/translate');
    translateUrl.searchParams.set('sl', 'en');
    translateUrl.searchParams.set('tl', languageCode);
    translateUrl.searchParams.set('u', sourceUrl.href);
    window.location.assign(translateUrl.href);
  }

  select.addEventListener('change', function () {
    openLanguage(select.value);
  });

  if (!isTranslatedPage && initialLanguage !== 'en') {
    openLanguage(initialLanguage);
  }
})();
