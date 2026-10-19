# Eşik

Türkiye'den Almanya'ya üniversite danışmanlığı sitesi. Bağımlılık yok: düz HTML, CSS ve JavaScript, üzerine küçük bir Node derleme betiği.

## Çalıştırma

```sh
node build.mjs                          # dist/ klasörünü üretir (Node 22+)
python3 -m http.server 8000 -d dist     # http://localhost:8000
```

## Yapı

| Yol | İçerik |
| --- | --- |
| `site.config.json` | Site adı, adres, e-posta, Instagram. **Yayından önce doldur.** |
| `src/pages/*.html` | Sayfalar. Baştaki `---` bloğu başlık, açıklama ve aktif menü öğesini (`nav`) belirler. |
| `src/partials/` | Tüm sayfalarda ortak `<head>`, üst menü ve alt bilgi. |
| `assets/css/site.css` | Tüm stiller; renkler `:root` değişkenlerinde, karanlık mod dahil. |
| `assets/js/main.js` | Tarih sayacı, yol bulucu, üniversite gezgini, iletişim formu. |
| `assets/fonts/` | Kendi sunucumuzda barındırılan fontlar (OFL). Google Fonts'a bağlantı yok. |
| `build.mjs` | Sayfaları birleştirir, `{{yer tutucuları}}` doldurur, `sitemap.xml` ve `robots.txt` yazar. |

Sayfalar: ana sayfa (paketler, yol bulucu, süreç), `sinavlar`, `almanya`, `vize`, `sss`, `iletisim`, `impressum`, `datenschutz`, `404`.

## Yayından önce

- [ ] `site.config.json`: `url`, `email`, `instagram`
- [ ] `src/pages/impressum.html` ve `datenschutz.html`: kırmızı işaretli alanlar (ad, adres; Almanya'da yasal zorunluluk). Taslaktır, hukuki kontrol önerilir.
- [ ] Bilgiler Ekim 2026 itibarıyladır (bloke hesap, harçlar, sigorta). Yıllık güncelle; `dataAsOf` değerini değiştir.

## Yayın (GitHub Pages)

`.github/workflows/pages.yml`, `main` dalına her push'ta siteyi derleyip yayınlar. Bir kereliğine: repo **Settings → Pages → Source: GitHub Actions**. Kendi alan adın için aynı sayfadan Custom domain ekle ve `site.config.json` içindeki `url`'yi güncelle.

İletişim formu bir sunucuya veri göndermez; ziyaretçinin e-posta uygulamasında hazır bir mesaj açar. Sunucu taraflı form istenirse (ör. Formspree) `datenschutz.html` de güncellenmeli.
