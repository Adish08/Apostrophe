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

    const fetchLatestRelease = async (repo, keyword, buttonId, fallbackUrl, btnPrefix = 'Download') => {
        const btn = document.getElementById(buttonId);
        if (!btn) return;

        try {
            const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            const assets = data.assets || [];

            const targetAsset = assets.find(asset => {
                const name = asset.name.toLowerCase();
                return keyword.every(k => name.includes(k.toLowerCase()));
            });

            if (targetAsset) {
                btn.href = targetAsset.browser_download_url;
                btn.removeAttribute('target');

                const versionMatch = targetAsset.name.match(/v(\d+(\.\d+)+)/);
                let appVersion = '';
                if (versionMatch) {
                    appVersion = versionMatch[0];
                }

                if (appVersion) {
                    btn.querySelector('span').textContent = `${btnPrefix} ${appVersion}`;
                } else {
                    btn.querySelector('span').textContent = `${btnPrefix} ${data.tag_name}`;
                }

                const cardContent = btn.closest('.card-content');
                const desc = cardContent.querySelector('.card-desc');

                if (desc && !desc.getAttribute('data-patch-added')) {
                    const tagLink = `<a href="${data.html_url}" target="_blank" class="patch-link">(${data.tag_name})</a>`;
                    desc.innerHTML += tagLink;
                    desc.setAttribute('data-patch-added', 'true');
                }
            } else {
                btn.href = data.html_url;
                btn.querySelector('span').textContent = 'View Latest Release';
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
        'krvstek/uni-apks',
        ['youtube', 'morphe', '.apk'],
        'btn-yt-morphe',
        'https://github.com/krvstek/uni-apks/releases/latest'
    );

    fetchLatestRelease(
        'krvstek/uni-apks',
        ['music', 'morphe', 'arm64', '.apk'],
        'btn-ytm-arm64',
        'https://github.com/krvstek/uni-apks/releases/latest',
        'Arm64'
    );

    fetchLatestRelease(
        'krvstek/uni-apks',
        ['music', 'morphe', 'v7a', '.apk'],
        'btn-ytm-armv7',
        'https://github.com/krvstek/uni-apks/releases/latest',
        'Armv7'
    );

    fetchLatestRelease(
        'mamiiblt/instafel',
        ['uc', '.apk'],
        'btn-instafel',
        'https://github.com/mamiiblt/instafel/releases/latest'
    );

    fetchLatestRelease(
        'krvstek/uni-apks',
        ['reddit', 'morphe', '.apk'],
        'btn-reddit',
        'https://github.com/krvstek/uni-apks/releases/download/26.01.31-morphe/reddit-morphe-v2026.03.0-all.apk'
    );

    fetchLatestRelease(
        'crimera/twitter-apk',
        ['x-piko-v', '.apk'],
        'btn-twitter',
        'https://github.com/crimera/twitter-apk/releases/latest'
    );

    fetchLatestRelease(
        'mentalblank/GPhotos-Revanced',
        ['arm64', '.apk'],
        'btn-gphotos-arm64',
        'https://github.com/mentalblank/GPhotos-Revanced/releases/latest',
        'Arm64'
    );

    fetchLatestRelease(
        'mentalblank/GPhotos-Revanced',
        ['arm-v7a', '.apk'],
        'btn-gphotos-armv7',
        'https://github.com/mentalblank/GPhotos-Revanced/releases/latest',
        'Armv7'
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
        await fetch('/api/visit');
    } catch (e) {
    }
})();
