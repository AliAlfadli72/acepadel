<script setup>
import { Link } from '@inertiajs/vue3'

const lang = 'en'

const links = [
  { path: '/', label: { ar: 'الرئيسية', en: 'Home' } },
  { path: '/services', label: { ar: 'الخدمات', en: 'Services' } },
  { path: '/booking', label: { ar: 'الحجز', en: 'Booking' } },
]
</script>

<template>
  <footer class="bg-primary text-white mt-10">

    <!-- CTA -->
    <div class="bg-accent p-8 text-center">
      <h2 class="text-2xl font-bold">
        {{ lang === 'ar' ? 'جاهز للعب؟' : 'Ready to Play?' }}
      </h2>
      <Link href="/booking" class="mt-4 inline-block bg-primary px-6 py-3 rounded">
        {{ lang === 'ar' ? 'احجز الآن' : 'Book Now' }}
      </Link>
    </div>

    <!-- MAIN -->
    <div class="max-w-7xl mx-auto p-10 grid md:grid-cols-3 gap-10">

      <!-- Brand -->
      <div>
        <h3 class="text-xl font-bold">ACE PADEL</h3>
        <p class="text-white/60 mt-3 text-sm">
          Premium padel experience.
        </p>
      </div>

      <!-- Links -->
      <div>
        <h4 class="font-bold mb-4">Links</h4>
        <ul class="space-y-2">
          <li v-for="link in links" :key="link.path">
            <Link :href="link.path" class="text-white/60 hover:text-accent">
              {{ lang === 'ar' ? link.label.ar : link.label.en }}
            </Link>
          </li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h4 class="font-bold mb-4">Contact</h4>
        <p class="text-white/60 text-sm">Damascus</p>
        <p class="text-white/60 text-sm">0945 000 365</p>
      </div>

    </div>

    <!-- Bottom -->
    <div class="border-t border-white/10 text-center p-4 text-xs text-white/40">
      © 2026 ACE PADEL
    </div>

  </footer>
</template>