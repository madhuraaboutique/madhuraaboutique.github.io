/* ShopAdmin — Standalone Catalog Generator */
const ShopAdmin = {

    // Preview shop locally — writes data to localStorage so shop.html can read it instantly
    async previewLocal() {
        let previewWindow = window.open('about:blank', '_blank');
        if (!previewWindow) {
            Utils.toast('Popup blocked. Please allow popups for this site.', 'error');
            return;
        }
        previewWindow.document.write('<body style="background:#0a0e1a; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;"><h2>Loading StyleLoop Premium Engine...</h2></body>');
        previewWindow.document.close();

        try {
            Utils.toast('⌛ Preparing shop preview...', 'info');
            const products = await DB.getAll('products');
            const categories = await DB.getAll('categories');
            const settings = await App.loadSettings();

            const pub = products
                .filter(p => p.status === 'active' || !p.status)
                .map(p => ({
                    id: p.id, name: p.name, productNumber: p.productNumber || '',
                    status: 'active', categoryId: p.categoryId || '', categoryName: p.categoryName || '',
                    description: p.description || '', tags: p.tags || '',
                    videoLink: p.videoLink || '',
                    photos: (p.photos||[]).map(ph => ({ data: ph.data||'', color: ph.color||'' })),
                    variants: (p.variants||[]).map(v => ({
                        color: v.color||'',
                        sizes: (v.sizes||[]).map(s => ({ 
                            size: s.size||'', 
                            sellPrice: s.sellingPrice||0, 
                            mrp: s.mrp||0,
                            stock: s.stock||0 
                        }))
                    }))
                }));

            const shopData = {
                shopName: settings.shopName || 'StyleLoop',
                tagline: settings.tagline || '',
                lastUpdated: new Date().toISOString(),
                settings: {
                    phone: settings.phone || '',
                    whatsappNumber: settings.whatsappNumber || '',
                    instagramHandle: settings.instagramHandle || '',
                    themeBg: settings.shopThemeBg || 'dark',
                    shopLogo: settings.shopLogo || '',
                    shopTestimonials: settings.shopTestimonials || '[]',
                    shopBadges: settings.shopBadges || '[]',
                    shopLayout: settings.shopLayout || '[]',
                    shopHeroTitle: settings.shopHeroTitle || '',
                    shopHeroAuto: settings.shopHeroAuto || 'false',
                    enableGradient: settings.enableGradient || 'false',
                    colorBg: settings.colorBg || '#0a0e1a',
                    colorBg2: settings.colorBg2 || '#4c1d95',
                    colorCard: settings.colorCard || '#161e2e',
                    colorAccent: settings.colorAccent || '#f4c341',
                    colorText: settings.colorText || '#f8fafc',
                    colorTextMute: settings.colorTextMute || '#94a3b8',
                    shopAnnText: settings.shopAnnText || '',
                    shopAnnBg: settings.shopAnnBg || '#db2777',
                    shopAnnColor: settings.shopAnnColor || '#ffffff',
                    shopAnnSpeed: settings.shopAnnSpeed || '20',
                    shopAnnEffect: settings.shopAnnEffect || 'none',
                    shopFont: settings.shopFont || "'Outfit', sans-serif",
                    shopHeadingFont: settings.shopHeadingFont || "'Outfit', sans-serif",
                    shopRadius: settings.shopRadius || '12px',
                    shopButtonRadius: settings.shopButtonRadius || '30px',
                    shopLogoSize: settings.shopLogoSize || '40',
                    shopNavPadding: settings.shopNavPadding || '15',
                    shopHeroHeight: settings.shopHeroHeight || '400',
                    shopGridGap: settings.shopGridGap || '20',
                    shopGridCols: settings.shopGridCols || '5',
                    shopGridRows: settings.shopGridRows || '3',
                    shopGlass: settings.shopGlass || 'false',
                    shopGlow: settings.shopGlow || 'false',
                    shopModalTheme: settings.shopModalTheme || 'split',
                    shopModalWidth: settings.shopModalWidth || '1000',
                    shopModalWaBtn: settings.shopModalWaBtn || 'true',
                    shopAnimsEnabled: settings.shopAnimsEnabled || 'true',
                    shopHeroAlign: settings.shopHeroAlign || 'flex-start',
                    sidebarWidth: settings.sidebarWidth || '320px',
                    shopGap: settings.shopGap || '60px',
                    shopMaxWidth: settings.shopMaxWidth || '1600px',
                    shopHeroEnabled: settings.shopHeroEnabled || 'true',
                    shopAnnText: settings.shopAnnText || '',
                    shopAddress: `${settings.address1 || ''} ${settings.address2 || ''}, ${settings.city || ''} - ${settings.pincode || ''}`.replace(/, - $/, '').trim(),
                    shopPhone: settings.phone || '',
                    shopInsta: settings.instagramHandle || '',
                    shopYoutube: settings.shopYoutube || ''
                },
                categories: categories.map(c => ({ 
                    id: c.id, 
                    name: c.name, 
                    emoji: c.emoji||'💎',
                    discount: c.defaultDiscount || 0
                })),
                products: pub
            };

            // Write to localStorage — shop.html will read this immediately
            localStorage.setItem('bq_shop_preview', JSON.stringify(shopData));
            Utils.toast(`✅ Preview ready — ${pub.length} products loaded!`, 'success');

            // Open shop.html with Edit mode enabled
            previewWindow.location.href = 'shop.html?edit=1';
        } catch(e) {
            if (previewWindow) previewWindow.close();
            Utils.toast('Error preparing preview: ' + e.message, 'error');
        }
    },

    async setTemplate(type) {
        // Theme switching retired — Shop now follows dashboard colors
    },

    async init() {
        // Dynamic Theme active
    },

    async downloadShopHTML() {
        try {
            if (!window.SHOP_HTML_TEMPLATE) {
                const scriptPath = 'js/shop-template.js';
                Utils.toast('⌛ Loading Boutique engine...', 'info');
                
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = scriptPath + '?v=' + Date.now();
                    script.onload = resolve;
                    script.onerror = () => reject(new Error(`Failed to load ${scriptPath}`));
                    document.head.appendChild(script);
                });
            }

            if (!window.SHOP_HTML_TEMPLATE) {
                Utils.toast('❌ Error: Could not load shop template.', 'error');
                return;
            }
            const blob = new Blob([window.SHOP_HTML_TEMPLATE], { type: 'text/html' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'index.html';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            Utils.toast('✅ index.html downloaded! Upload it to your GitHub root folder.', 'success');
        } catch(e) {
            Utils.toast('Unable to download automatically. Simply copy your existing shop.html file to GitHub and rename it to index.html!', 'error', 6000);
        }
    },

    async publish() {
        const st = document.getElementById('shop-publish-status');
        const pubBtn = document.querySelector('.btn-primary[onclick="ShopAdmin.publish()"]');
        const oldText = pubBtn ? pubBtn.innerText : 'Publish Catalog';
        try {
            if (pubBtn) { pubBtn.disabled = true; pubBtn.innerText = '⌛ Generating Chunks...'; }
            st.className = 'alert alert-info';
            st.innerHTML = '⌛ Preparing catalog data...';
            await new Promise(r => setTimeout(r, 80));

            const products = await DB.getAll('products');
            const categories = await DB.getAll('categories');
            const settings = await App.loadSettings();

            // Privacy: Filter active and strip internal 'stock' data
            const pub = products
                .filter(p => p.status === 'active' || !p.status)
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    productNumber: p.productNumber || '',
                    status: 'active',
                    categoryId: p.categoryId || '',
                    categoryName: p.categoryName || '',
                    description: p.description || '',
                    tags: p.tags || '',
                    videoLink: p.videoLink || '',
                    photos: (p.photos||[]).map(ph => ({ data: ph.data||'', color: ph.color||'' })),
                    variants: (p.variants||[]).map(v => ({
                        color: v.color||'',
                        sizes: (v.sizes||[]).map(s => ({ 
                            size: s.size||'', 
                            sellPrice: s.sellingPrice||0, 
                            mrp: s.mrp||0
                            // stock removed for privacy
                        }))
                    }))
                }));

            // Split into chunks of 15 products
            const chunkSize = 15;
            const chunks = [];
            for (let i = 0; i < pub.length; i += chunkSize) {
                chunks.push(pub.slice(i, i + chunkSize));
            }

            // Create Manifest (products.json)
            const manifest = {
                shopName: settings.shopName || 'StyleLoop',
                tagline: settings.tagline || '',
                lastUpdated: new Date().toISOString(),
                totalPages: chunks.length,
                totalProducts: pub.length,
                settings: {
                    phone: settings.phone || '',
                    whatsappNumber: settings.whatsappNumber || '',
                    instagramHandle: settings.instagramHandle || '',
                    shopLogo: settings.shopLogo || '',
                    shopTestimonials: settings.shopTestimonials || '[]',
                    shopBadges: settings.shopBadges || '[]',
                    shopLayout: settings.shopLayout || '[]',
                    shopHeroTitle: settings.shopHeroTitle || '',
                    shopHeroAuto: settings.shopHeroAuto || 'false',
                    enableGradient: settings.enableGradient || 'false',
                    colorBg: settings.colorBg || '#0a0e1a',
                    colorBg2: settings.colorBg2 || '#4c1d95',
                    colorCard: settings.colorCard || '#161e2e',
                    colorAccent: settings.colorAccent || '#f4c341',
                    colorText: settings.colorText || '#f8fafc',
                    colorTextMute: settings.colorTextMute || '#94a3b8',
                    shopAnnText: settings.shopAnnText || '',
                    shopAnnBg: settings.shopAnnBg || '#db2777',
                    shopAnnColor: settings.shopAnnColor || '#ffffff',
                    shopAnnSpeed: settings.shopAnnSpeed || '20',
                    shopAnnEffect: settings.shopAnnEffect || 'none',
                    shopFont: settings.shopFont || "'Outfit', sans-serif",
                    shopHeadingFont: settings.shopHeadingFont || "'Outfit', sans-serif",
                    shopRadius: settings.shopRadius || '12px',
                    shopButtonRadius: settings.shopButtonRadius || '30px',
                    shopLogoSize: settings.shopLogoSize || '40',
                    shopNavPadding: settings.shopNavPadding || '15',
                    shopHeroHeight: settings.shopHeroHeight || '400',
                    shopGridGap: settings.shopGridGap || '20',
                    shopGlass: settings.shopGlass || 'false',
                    shopGridCols: settings.shopGridCols || '5',
                    shopGridRows: settings.shopGridRows || '3',
                    shopGlow: settings.shopGlow || 'false',
                    shopModalTheme: settings.shopModalTheme || 'split',
                    shopModalWidth: settings.shopModalWidth || '1000',
                    shopModalWaBtn: settings.shopModalWaBtn || 'true',
                    shopAnimsEnabled: settings.shopAnimsEnabled || 'true',
                    shopHeroAlign: settings.shopHeroAlign || 'flex-start',
                    sidebarWidth: settings.sidebarWidth || '320px',
                    shopGap: settings.shopGap || '60px',
                    shopMaxWidth: settings.shopMaxWidth || '1600px',
                    shopHeroEnabled: settings.shopHeroEnabled || 'true',
                    shopHeroPlacement: settings.shopHeroPlacement || 'standard',
                    shopAddress: `${settings.address1 || ''} ${settings.address2 || ''}, ${settings.city || ''} - ${settings.pincode || ''}`.replace(/, - $/, '').trim(),
                    shopPhone: settings.phone || '',
                    shopInsta: settings.instagramHandle || '',
                    shopYoutube: settings.shopYoutube || ''
                },
                categories: categories.map(c => ({ 
                    id: c.id, 
                    name: c.name, 
                    emoji: c.emoji||'💎',
                    discount: c.defaultDiscount || 0
                }))
            };

            // Memory-safe storage for downloads
            ShopAdmin._chunks = [manifest, ...chunks];

            // Status UI for downloads
            st.className = 'alert alert-info';
            let dlHtml = '<strong>📦 Scalable Export Ready (' + pub.length + ' products)</strong><br><br>';
            
            // Manifest Button
            dlHtml += '<button class="btn btn-sm btn-dark mb-2" onclick="ShopAdmin.downloadChunk(0, \'products.json\')">⬇️ Download Manifest (products.json)</button><br>';
            
            // Page Buttons
            chunks.forEach((chunk, idx) => {
                const fileName = 'p' + (idx + 1) + '.json';
                dlHtml += '<button class="btn btn-sm btn-outline-primary m-1" onclick="ShopAdmin.downloadChunk(' + (idx + 1) + ', \'' + fileName + '\')">📄 Page ' + (idx+1) + '</button> ';
            });

            dlHtml += '<br><br><div class="small text-muted">Please download ALL files above and upload them to your <code>data/</code> folder on GitHub.</div>';
            
            st.innerHTML = dlHtml;
            
            if(pubBtn) { pubBtn.disabled = false; pubBtn.innerText = oldText; }
            Utils.toast('✅ Export generated! Click buttons to download each page.', 'success');

        } catch (e) {
            console.error(e);
            st.className = 'alert alert-danger';
            st.textContent = '❌ Error: ' + e.message;
            if(pubBtn) { pubBtn.disabled = false; pubBtn.innerText = oldText; }
            Utils.toast('Error: ' + e.message, 'error');
        }
    },

    downloadChunk(idx, filename) {
        if (!ShopAdmin._chunks || !ShopAdmin._chunks[idx]) return;
        const content = JSON.stringify(ShopAdmin._chunks[idx], null, 2);
        ShopAdmin._dl(content, filename, 'application/json');
    },

    _dl(content, filename, type) {
        const blob = new Blob([content], { type });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    buildHTML(d) {
        // This function is kept for legacy compatibility but the heavy lifting 
        // is now done by window.SHOP_HTML_TEMPLATE which is a fully static standalone build.
        // We inject the data as a global variable.
        const dataTag = `<script>window.__D__=${JSON.stringify(d)};<\/script>`;
        let template = window.SHOP_HTML_TEMPLATE || "";
        
        if (template) {
            // Precise injection after title
            return template.replace('</title>', `</title>\n${dataTag}`);
        }
        
        return `<!-- Error: Shop Template Not Loaded -->`;
    }
};

