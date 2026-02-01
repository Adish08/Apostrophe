document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Sections Fade-in
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.app-section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // 2. Header Scroll Effect
    const header = document.querySelector('.glass-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. 3D Tilt Effect for Cards (Subtle)
    const cards = document.querySelectorAll('.glass-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation based on cursor position relative to center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg
            const rotateY = ((x - centerX) / centerX) * 5; // Max 5deg

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

            // Optional: Moving shine effect ??
            // We can just rely on the CSS hover for now to keep it clean, 
            // but the transform override here replaces the css hover transform.
            // Let's ensure smooth transition is maintained in CSS.
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // 4. GitHub API Fetch for Latest Releases
    const fetchLatestRelease = async (repo, keyword, buttonId, fallbackUrl, btnPrefix = 'Download') => {
        const btn = document.getElementById(buttonId);
        if (!btn) return;

        try {
            const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            const assets = data.assets || [];

            // Find asset that matches keywords (case insensitive)
            const targetAsset = assets.find(asset => {
                const name = asset.name.toLowerCase();
                return keyword.every(k => name.includes(k.toLowerCase()));
            });

            if (targetAsset) {
                btn.href = targetAsset.browser_download_url;
                btn.removeAttribute('target');

                // Extract App Version from filename (e.g. v20.40.45)
                const versionMatch = targetAsset.name.match(/v(\d+(\.\d+)+)/);
                let appVersion = '';
                if (versionMatch) {
                    appVersion = versionMatch[0]; // e.g. "v20.40.45"
                }

                // Button Text: Show Prefix + App Version if found, else fallback to Release Tag
                if (appVersion) {
                    btn.querySelector('span').textContent = `${btnPrefix} ${appVersion}`;
                } else {
                    btn.querySelector('span').textContent = `${btnPrefix} ${data.tag_name}`;
                }

                // Description: Show Morphe/Release Tag as a link
                const cardContent = btn.closest('.card-content');
                const desc = cardContent.querySelector('.card-desc');

                // Avoid duplicating if already added
                if (desc && !desc.getAttribute('data-patch-added')) {
                    const tagLink = `<a href="${data.html_url}" target="_blank" class="patch-link">(${data.tag_name})</a>`;
                    desc.innerHTML += tagLink;
                    desc.setAttribute('data-patch-added', 'true');
                }
            } else {
                // If specific asset not found, point to release page
                console.warn(`Asset with keywords ${keyword} not found in ${repo} ${data.tag_name}`);
                btn.href = data.html_url;
                btn.querySelector('span').textContent = 'View Latest Release';
            }

        } catch (error) {
            console.error('Error fetching release:', error);
            // Fallback
            if (fallbackUrl) {
                btn.href = fallbackUrl;
                btn.querySelector('span').textContent = 'Download (Fallback)';
            } else {
                btn.querySelector('span').textContent = 'View Releases';
            }
        }
    };

    // Initialize Searches
    // MicroG: All architectures
    fetchLatestRelease(
        'MorpheApp/MicroG-RE',
        ['.apk'],
        'btn-microg',
        'https://github.com/MorpheApp/MicroG-RE/releases/latest'
    );

    // YouTube Morphe: Look for 'youtube', 'morphe', '.apk'
    fetchLatestRelease(
        'krvstek/uni-apks',
        ['youtube', 'morphe', '.apk'],
        'btn-yt-morphe',
        'https://github.com/krvstek/uni-apks/releases/latest'
    );

    // YouTube Music Morphe (Arm64): Look for 'music', 'morphe', 'arm64', '.apk'
    fetchLatestRelease(
        'krvstek/uni-apks',
        ['music', 'morphe', 'arm64', '.apk'],
        'btn-ytm-arm64',
        'https://github.com/krvstek/uni-apks/releases/latest',
        'Arm64'
    );

    // YouTube Music Morphe (Arm-v7a): Look for 'music', 'morphe', 'v7a', '.apk'
    fetchLatestRelease(
        'krvstek/uni-apks',
        ['music', 'morphe', 'v7a', '.apk'],
        'btn-ytm-armv7',
        'https://github.com/krvstek/uni-apks/releases/latest',
        'Armv7'
    );

    // Instafel: Look for 'uc' (unclone) and 'apk' in 'mamiiblt/instafel'
    fetchLatestRelease(
        'mamiiblt/instafel',
        ['uc', '.apk'],
        'btn-instafel',
        'https://github.com/mamiiblt/instafel/releases/latest'
    );

    // Reddit: Look for 'reddit', 'morphe', '.apk' in 'krvstek/uni-apks'
    fetchLatestRelease(
        'krvstek/uni-apks',
        ['reddit', 'morphe', '.apk'],
        'btn-reddit',
        'https://github.com/krvstek/uni-apks/releases/download/26.01.31-morphe/reddit-morphe-v2026.03.0-all.apk'
    );

    // X (Twitter): Look for 'x-piko-v', '.apk' in 'crimera/twitter-apk'
    fetchLatestRelease(
        'crimera/twitter-apk',
        ['x-piko-v', '.apk'],
        'btn-twitter',
        'https://github.com/crimera/twitter-apk/releases/latest'
    );

    // Google Photos: Look for 'arm64', '.apk' in 'mentalblank/GPhotos-Revanced'
    fetchLatestRelease(
        'mentalblank/GPhotos-Revanced',
        ['arm64', '.apk'],
        'btn-gphotos-arm64',
        'https://github.com/mentalblank/GPhotos-Revanced/releases/latest',
        'Arm64'
    );

    // Google Photos: Look for 'arm-v7a', '.apk' in 'mentalblank/GPhotos-Revanced'
    fetchLatestRelease(
        'mentalblank/GPhotos-Revanced',
        ['arm-v7a', '.apk'],
        'btn-gphotos-armv7',
        'https://github.com/mentalblank/GPhotos-Revanced/releases/latest',
        'Armv7'
    );
});
