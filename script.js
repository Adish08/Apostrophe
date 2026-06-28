document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.app-section');
    sections.forEach(section => {
        observer.observe(section);
    });

    const header = document.querySelector('.glass-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const cards = document.querySelectorAll('.glass-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    const repoPromises = {};

    const fetchLatestRelease = async (repo, keyword, buttonId, fallbackUrl, btnPrefix = 'Download') => {
        const btn = document.getElementById(buttonId);
        if (!btn) return;

        try {
            let releases = null;
            const cachedKey = `releases_cache_${repo}`;
            const cachedItem = sessionStorage.getItem(cachedKey);

            if (cachedItem) {
                try {
                    const parsed = JSON.parse(cachedItem);
                    if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 600000) {
                        releases = parsed.data;
                    }
                } catch (e) {}
            }

            if (!releases) {
                if (!repoPromises[repo]) {
                    repoPromises[repo] = (async () => {
                        const response = await fetch(`https://api.github.com/repos/${repo}/releases`);
                        if (!response.ok) throw new Error('Network response was not ok');
                        const data = await response.json();
                        try {
                            sessionStorage.setItem(cachedKey, JSON.stringify({
                                timestamp: Date.now(),
                                data: data
                            }));
                        } catch (e) {}
                        return data;
                    })();
                }
                releases = await repoPromises[repo];
            }

            let targetAsset = null;
            let matchingRelease = null;

            for (const release of releases) {
                const assets = release.assets || [];
                targetAsset = assets.find(asset => {
                    const name = asset.name.toLowerCase();
                    const matchesKeywords = keyword.every(k => name.includes(k.toLowerCase()));
                    const isExperimentalRequested = keyword.some(k => k.toLowerCase().includes('experimental'));
                    if (matchesKeywords && !isExperimentalRequested && name.includes('experimental')) {
                        return false;
                    }
                    return matchesKeywords;
                });
                if (targetAsset) {
                    matchingRelease = release;
                    break;
                }
            }

            if (targetAsset && matchingRelease) {
                btn.href = targetAsset.browser_download_url;
                btn.removeAttribute('target');

                let appVersion = '';
                const versionMatch = targetAsset.name.match(/v(\d+(\.\d+)+)/);
                if (versionMatch) {
                    appVersion = versionMatch[0];
                } else if (matchingRelease.body) {
                    const bodyLines = matchingRelease.body.split(/\r?\n/);
                    const isYoutube = keyword.some(k => k.toLowerCase().includes('youtube'));
                    const isMusic = keyword.some(k => k.toLowerCase().includes('music'));
                    
                    let targetLine = null;
                    if (isYoutube) {
                        targetLine = bodyLines.find(line => {
                            const l = line.toLowerCase();
                            return l.includes('youtube') && !l.includes('music');
                        });
                    } else if (isMusic) {
                        targetLine = bodyLines.find(line => {
                            const l = line.toLowerCase();
                            return l.includes('music') || l.includes('yt-music');
                        });
                    }
                    
                    if (targetLine) {
                        const verMatch = targetLine.match(/v?(\d+(\.\d+)+)/);
                        if (verMatch) {
                            appVersion = verMatch[0].startsWith('v') ? verMatch[0] : 'v' + verMatch[0];
                        }
                    }
                }

                if (appVersion) {
                    btn.querySelector('span').textContent = `${btnPrefix} ${appVersion}`;
                } else {
                    btn.querySelector('span').textContent = `${btnPrefix} ${matchingRelease.tag_name}`;
                }


            } else {
                if (releases.length > 0) {
                    btn.href = releases[0].html_url;
                    btn.querySelector('span').textContent = 'View Releases';
                } else {
                    throw new Error('No releases found');
                }
            }

        } catch (error) {
            if (fallbackUrl) {
                btn.href = fallbackUrl;
                btn.querySelector('span').textContent = 'Download (Fallback)';
            } else {
                btn.querySelector('span').textContent = 'View Releases';
            }
        }
    };

    fetchLatestRelease(
        'MorpheApp/MicroG-RE',
        ['.apk'],
        'btn-microg',
        'https://github.com/MorpheApp/MicroG-RE/releases/latest'
    );

    fetchLatestRelease(
        'ngbangg/builder-for-morphe',
        ['youtube', 'morphe', '.apk'],
        'btn-yt-morphe',
        'https://github.com/ngbangg/builder-for-morphe/releases'
    );

    fetchLatestRelease(
        'Ravi-Kishor/Revanced-Extended',
        ['youtube', '.apk'],
        'btn-yt-experimental',
        'https://github.com/Ravi-Kishor/Revanced-Extended/releases'
    );

    fetchLatestRelease(
        'ngbangg/builder-for-morphe',
        ['music', 'morphe', 'arm64', '.apk'],
        'btn-ytm-arm64',
        'https://github.com/ngbangg/builder-for-morphe/releases',
        'Arm64'
    );

    fetchLatestRelease(
        'ngbangg/builder-for-morphe',
        ['music', 'morphe', 'v7a', '.apk'],
        'btn-ytm-armv7',
        'https://github.com/ngbangg/builder-for-morphe/releases',
        'Armv7'
    );

    fetchLatestRelease(
        'Ravi-Kishor/Revanced-Extended',
        ['music', '.apk'],
        'btn-ytm-experimental',
        'https://github.com/Ravi-Kishor/Revanced-Extended/releases'
    );

    fetchLatestRelease(
        'ngbangg/builder-for-morphe',
        ['instagram', 'piko', '.apk'],
        'btn-instagram',
        'https://github.com/ngbangg/builder-for-morphe/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['threads', 'de-vanced', '.apk'],
        'btn-threads',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'ngbangg/builder-for-morphe',
        ['facebook', 'de-vanced', '.apk'],
        'btn-facebook',
        'https://github.com/ngbangg/builder-for-morphe/releases'
    );

    fetchLatestRelease(
        'ngbangg/builder-for-morphe',
        ['reddit', 'morphe', '.apk'],
        'btn-reddit',
        'https://github.com/ngbangg/builder-for-morphe/releases'
    );

    fetchLatestRelease(
        'ngbangg/builder-for-morphe',
        ['twitter', 'piko', '.apk'],
        'btn-twitter',
        'https://github.com/ngbangg/builder-for-morphe/releases'
    );

    fetchLatestRelease(
        'ngbangg/builder-for-morphe',
        ['telegram', 'paresh', '.apk'],
        'btn-telegram',
        'https://github.com/ngbangg/builder-for-morphe/releases'
    );

    fetchLatestRelease(
        'ngbangg/builder-for-morphe',
        ['google-photos', 'de-vanced', '.apk'],
        'btn-gphotos',
        'https://github.com/ngbangg/builder-for-morphe/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['inshorts', 'de-vanced', '.apk'],
        'btn-inshorts',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'ngbangg/builder-for-morphe',
        ['truecaller', 'paresh', '.apk'],
        'btn-truecaller',
        'https://github.com/ngbangg/builder-for-morphe/releases'
    );

    fetchLatestRelease(
        'ngbangg/builder-for-morphe',
        ['vn', 'paresh', '.apk'],
        'btn-vn',
        'https://github.com/ngbangg/builder-for-morphe/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['windscribe-vpn', 'rushi', '.apk'],
        'btn-windscribe',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['terabox', 'rushi', '.apk'],
        'btn-terabox',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['speedtest-by-ookla', 'rushi', '.apk'],
        'btn-speedtest',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['accuweather', 'rushi', '.apk'],
        'btn-accuweather',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['1.1.1.1', 'rushi', '.apk'],
        'btn-warp',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['ticktick', 'paresh', '.apk'],
        'btn-ticktick',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['macrodroid', 'paresh', '.apk'],
        'btn-macrodroid',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['xodo', 'hoo-dles', '.apk'],
        'btn-xodo',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['wps-office', 'hoo-dles', '.apk'],
        'btn-wpsoffice',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['windy', 'hoo-dles', '.apk'],
        'btn-windy',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['smart-launcher-6', 'hoo-dles', '.apk'],
        'btn-smartlauncher',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['sleep-as-android', 'hoo-dles', '.apk'],
        'btn-sleep',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['nova-launcher', 'hoo-dles', '.apk'],
        'btn-novalauncher',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['niagara-launcher', 'hoo-dles', '.apk'],
        'btn-niagara',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['ibis-paint-x', 'hoo-dles', '.apk'],
        'btn-ibispaint',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['duolingo', 'hoo-dles', '.apk'],
        'btn-duolingo',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    fetchLatestRelease(
        'builder-for-morphe/builder-for-morphe.github.io',
        ['busuu', 'hoo-dles', '.apk'],
        'btn-busuu',
        'https://github.com/builder-for-morphe/builder-for-morphe.github.io/releases'
    );

    const popup = document.getElementById('disclaimerPopup');
    const closeBtn = document.getElementById('closePopupBtn');
    const STORAGE_KEY = 'apostrophe_disclaimer_accepted_v1';

    if (popup && closeBtn) {
        if (!localStorage.getItem(STORAGE_KEY)) {
            setTimeout(() => {
                popup.classList.add('active');
                document.body.style.overflow = 'hidden';
            }, 500);
        }

        closeBtn.addEventListener('click', () => {
            popup.classList.remove('active');
            document.body.style.overflow = '';
            localStorage.setItem(STORAGE_KEY, 'true');
        });
    }
});

(async () => {
    try {
        const lastVisit = localStorage.getItem('apostrophe_last_visit');
        const now = Date.now();
        // 24 hours rate-limiting for the tracking endpoint
        if (!lastVisit || now - parseInt(lastVisit, 10) > 86400000) {
            await fetch('/api/visit');
            localStorage.setItem('apostrophe_last_visit', now.toString());
        }
    } catch (e) {
    }
})();
