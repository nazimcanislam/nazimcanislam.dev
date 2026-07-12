---
title: "gphotos-fixer: Bir Kişisel İhtiyaçtan Reddit'te #1 Olan Açık Kaynak Araca"
description: "Google Photos Takeout export'larını organize etmek için yazdığım Python aracının hikâyesi — sorun, çözüm ve r/googlephotos'ta #1 olma süreci."
pubDate: 2026-06-03
tags: ["python", "open-source", "google-photos", "cli"]
draft: false
---

Bazı projeler planlanarak değil, sinir bozan bir problemi çözmeye çalışırken doğar. gphotos-fixer da öyle başladı.

## Sorun

Google Photos'tan Takeout ile fotoğraflarımı dışa aktardığımda karşılaştığım manzara tam bir kaos: fotoğraflar ve onlara ait metadata (çekim tarihi, konum, açıklama) ayrı JSON dosyalarında geliyor, dosya adları eşleşmiyor, EXIF verileri eksik ya da yanlış, ve klasör yapısı hiçbir standart dosya sistemine veya fotoğraf uygulamasına uygun değil. Elle düzeltmeye çalışmak binlerce dosya için gerçekçi değildi.

## Yaklaşım

Python ile bir komut satırı aracı yazmaya karar verdim. Temel mantık şuydu:

1. Her medya dosyasını, Takeout'un ürettiği eşlik eden `.json` dosyasıyla eşleştir
2. JSON'daki metadata'yı (çekim zamanı, GPS koordinatları) dosyanın kendi EXIF/XMP alanlarına geri yaz
3. Dosya adı çakışmalarını ve Google'ın eklediği `(1)`, `(2)` gibi son ekleri temizle
4. Sonucu, herhangi bir fotoğraf yönetim uygulamasının (Immich, PhotoPrism, hatta işletim sisteminin kendi galerisi) doğru okuyabileceği bir klasör yapısında düzenle

Amaç, "Google'a özel" bir formattan çıkıp standart, taşınabilir bir arşive dönüşmekti — bu da projenin ruhuyla örtüşüyordu: platform bağımsızlığı ve vendor lock-in'den kaçınmak.

## Açık kaynağa açma kararı

Aracı kendim için yazmıştım ama aynı sorunu yaşayan çok sayıda insan olduğunu tahmin ediyordum. GitHub'a koyup açık kaynak yaptım, README'yi gerçek kullanım senaryolarıyla detaylandırdım ve GitHub Sponsors'u ekledim — hem projeye katkı sağlamak isteyenler için hem de sürdürülebilirlik açısından.

## Reddit'teki karşılama

[r/googlephotos'ta](https://www.reddit.com/r/googlephotos/comments/1tvj8kx/i_built_an_open_source_tool_to_fix_google_photos/) paylaştığımda beklemediğim bir tepki aldı: gönderi **subreddit'te #1 oldu**  ve kısa sürede binlerce görüntülenmeye ulaştı. Bu, projenin çözdüğü sorunun ne kadar yaygın olduğunu gösteren güzel bir doğrulamaydı — Google Photos'tan veri taşımak/yedeklemek isteyen ama Takeout'un dağınık çıktısıyla baş edemeyen epey insan varmış.

## Çıkarımlar

Bu proje bana şunu hatırlattı: en değerli açık kaynak araçlar genelde "büyük bir vizyon" ile değil, gerçek ve somut bir can sıkıntısını çözme isteğiyle başlıyor. Kendi ihtiyacın için yazdığın bir script, biraz temizlik ve dokümantasyonla başkalarının da işine yarayan bir araca dönüşebiliyor.

Projeye göz atmak istersen: [github.com/nazimcanislam/gphotos-fixer](https://github.com/nazimcanislam/gphotos-fixer)
