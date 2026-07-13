<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- Global SEO Meta Tags -->
        <meta name="description" content="نادي آيس بادل (Ace Padel Club) هو أول نادي رياضي احترافي لملاعب البادل في دمشق، سوريا. احجز ملعبك الآن واستمتع بأفضل تجربة رياضية، تدريب بادل، واستوديو بيلاتس صحي.">
        <meta name="keywords" content="بادل سوريا, بادل دمشق, ملاعب بادل دمشق, نادي آيس بادل, حجز ملاعب بادل, رياضة البادل سوريا, Ace Padel Club, Ace Padel Damascus, Mezzeh padel, Pilates Damascus, بيلاتس دمشق">
        <meta name="robots" content="index, follow">
        <meta name="author" content="Ace Padel Club">

        <!-- OpenGraph Meta Tags (Facebook, WhatsApp, etc) -->
        <meta property="og:title" content="نادي آيس بادل دمشق | Ace Padel Club Syria">
        <meta property="og:description" content="أول نادي وملاعب بادل بمواصفات دولية في دمشق، سوريا. احجز ملعبك، تدرب مع محترفين، واستمتع بتيراس وصالة صحية متكاملة.">
        <meta property="og:image" content="{{ asset('hero-court.webp') }}">
        <meta property="og:url" content="https://acepadelsy.com">
        <meta property="og:type" content="website">

        <!-- Twitter Card Meta Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="نادي آيس بادل دمشق | Ace Padel Club Syria">
        <meta name="twitter:description" content="أول نادي وملاعب بادل بمواصفات دولية في دمشق، سوريا. احجز ملعبك، تدرب مع محترفين، واستمتع بتيراس وصالة صحية متكاملة.">
        <meta name="twitter:image" content="{{ asset('hero-court.webp') }}">

        <title inertia>{{ config('app.name', 'Ace Padel Club') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="{{ asset('icon.png') }}" />

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Local Business JSON-LD Schema Markup -->
        <script type="application/ld+json">
        {
          "@@context": "https://schema.org",
          "@@type": "SportsClub",
          "name": "Ace Padel Club",
          "alternateName": "نادي آيس بادل",
          "description": "أول نادي ملاعب بادل معتمد في دمشق، سوريا. ملاعب بادل احترافية بمواصفات دولية، تدريب بادل، استوديو بيلاتس، وركن اجتماعي وتيراس.",
          "url": "https://acepadelsy.com",
          "logo": "https://acepadelsy.com/logo.png",
          "image": "https://acepadelsy.com/hero-court.webp",
          "address": {
            "@@type": "PostalAddress",
            "streetAddress": "أوتوستراد المزة - نادي الوحدة الرياضي",
            "addressLocality": "دمشق",
            "addressRegion": "دمشق",
            "addressCountry": "SY"
          },
          "telephone": "+963945000365",
          "priceRange": "$$",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "07:00",
              "closes": "02:00"
            }
          ]
        }
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
